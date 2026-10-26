'use strict';

const { StatusCodes } = require('http-status-codes');
const Applicant = require('../models/Applicant');
const AppError = require('../utils/appError');
const { logAudit } = require('../services/audit.service');
const { generateApplicationReference } = require('../utils/referenceNumber');
const { sendJobApplicationConfirmation } = require('../services/email.service');

async function listApplicants(req, res, next) {
  try {
    const { status, careerId, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (careerId) filter.careerId = careerId;

    if (search && String(search).trim()) {
      const regex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ fullName: regex }, { email: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [applicants, total] = await Promise.all([
      Applicant.find(filter)
        .populate('careerId', 'title department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Applicant.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        applicants,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getApplicant(req, res, next) {
  try {
    const applicant = await Applicant.findById(req.params.id).populate(
      'careerId',
      'title department location'
    );
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }
    return res.status(StatusCodes.OK).json({ success: true, data: { applicant } });
  } catch (err) {
    return next(err);
  }
}

async function createApplicant(req, res, next) {
  try {
    const {
      careerId,
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      nationalId,
      residenceSector,
      educationLevel,
      yearsExperience,
      resumeUrl,
      cvFileName,
      cvFileData,
      coverLetter,
      motivationLetterUrl,
      motivationLetterFileName,
      motivationLetterFileData,
      status,
      notes,
    } = req.body;

    const referenceNumber = await generateApplicationReference(Applicant);

    const applicant = await Applicant.create({
      referenceNumber,
      careerId: careerId || jobId || null,
      jobTitle: jobTitle || '',
      fullName,
      email,
      phone: phone || '',
      nationalId: nationalId || '',
      residenceSector: residenceSector || '',
      educationLevel: educationLevel || '',
      yearsExperience: Number(yearsExperience) || 0,
      resumeUrl: resumeUrl || cvFileData || '',
      cvFileName: cvFileName || '',
      coverLetter: coverLetter || '',
      motivationLetterUrl: motivationLetterUrl || motivationLetterFileData || '',
      motivationLetterFileName: motivationLetterFileName || '',
      status: status || 'APPLIED',
      notes: notes || '',
      emailNotification: {
        status: 'PENDING',
        sentAt: null,
        failedAt: null,
        attempts: 0,
        lastError: null,
      },
    });

    // Send confirmation email asynchronously without risking data loss
    const submissionDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    try {
      applicant.emailNotification.attempts += 1;
      const emailResult = await sendJobApplicationConfirmation({
        to: applicant.email,
        applicantName: applicant.fullName,
        positionTitle: applicant.jobTitle || 'Professional Role',
        referenceNumber: applicant.referenceNumber,
        submissionDate,
      });

      if (emailResult.success) {
        applicant.emailNotification.status = 'SENT';
        applicant.emailNotification.sentAt = new Date();
      } else {
        applicant.emailNotification.status = 'FAILED';
        applicant.emailNotification.failedAt = new Date();
        applicant.emailNotification.lastError = emailResult.error || 'Email dispatch failed';
      }
      await applicant.save();
    } catch (mailErr) {
      applicant.emailNotification.status = 'FAILED';
      applicant.emailNotification.failedAt = new Date();
      applicant.emailNotification.lastError = mailErr.message;
      await applicant.save();
    }

    await logAudit({
      actor: req.user || null,
      action: 'APPLICANT_SUBMITTED',
      resourceType: 'Applicant',
      resourceId: applicant.id,
      details: {
        email: applicant.email,
        careerId: applicant.careerId,
        referenceNumber: applicant.referenceNumber,
        emailStatus: applicant.emailNotification.status,
      },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Application submitted successfully',
      referenceNumber: applicant.referenceNumber,
      emailStatus: applicant.emailNotification.status,
      data: { applicant },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = [
      'APPLIED',
      'SCREENING',
      'INTERVIEW',
      'OFFER',
      'REJECTED',
      'HIRED',
      'pending',
      'shortlisted',
      'not_shortlisted',
      'accepted',
      'waitlisted',
    ];

    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid applicant status', StatusCodes.BAD_REQUEST, {
        code: 'INVALID_STATUS',
      });
    }

    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const previousStatus = applicant.status;
    applicant.status = status;
    await applicant.save();

    await logAudit({
      actor: req.user,
      action: 'APPLICANT_STATUS_UPDATED',
      resourceType: 'Applicant',
      resourceId: applicant.id,
      details: { previousStatus, newStatus: status },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Applicant status updated to ${status}`,
      data: { applicant },
    });
  } catch (err) {
    return next(err);
  }
}

async function addFeedback(req, res, next) {
  try {
    const { rating, comment } = req.body;
    if (!comment) {
      throw new AppError('Feedback comment is required', StatusCodes.BAD_REQUEST, {
        code: 'COMMENT_REQUIRED',
      });
    }

    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    applicant.feedbacks.push({
      authorId: req.user.id,
      authorName: req.user.name || 'HR Reviewer',
      rating: Number(rating) || 3,
      comment: String(comment).trim(),
      createdAt: new Date(),
    });

    await applicant.save();

    await logAudit({
      actor: req.user,
      action: 'APPLICANT_FEEDBACK_ADDED',
      resourceType: 'Applicant',
      resourceId: applicant.id,
      details: { rating },
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Feedback recorded successfully',
      data: { applicant },
    });
  } catch (err) {
    return next(err);
  }
}

async function listMessages(req, res, next) {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { messages: applicant.messages },
    });
  } catch (err) {
    return next(err);
  }
}

async function addMessage(req, res, next) {
  try {
    const { message } = req.body;
    if (!message) {
      throw new AppError('Message is required', StatusCodes.BAD_REQUEST, {
        code: 'MESSAGE_REQUIRED',
      });
    }

    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    applicant.messages.push({
      senderId: req.user.id,
      senderRole: req.user.role,
      message: String(message).trim(),
      sentAt: new Date(),
    });

    await applicant.save();

    await logAudit({
      actor: req.user,
      action: 'APPLICANT_MESSAGE_SENT',
      resourceType: 'Applicant',
      resourceId: applicant.id,
      req,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Message sent successfully',
      data: { messages: applicant.messages },
    });
  } catch (err) {
    return next(err);
  }
}

async function updateApplicant(req, res, next) {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    const { status, rating, notes, comment } = req.body;
    if (status) applicant.status = status;
    if (rating !== undefined) applicant.rating = Number(rating);
    if (notes !== undefined) applicant.notes = String(notes);
    if (comment) {
      applicant.feedbacks.push({
        authorId: req.user.id,
        authorName: req.user.name || 'Staff Reviewer',
        rating: Number(rating) || 3,
        comment: String(comment).trim(),
        createdAt: new Date(),
      });
    }

    await applicant.save();

    await logAudit({
      actor: req.user,
      action: 'APPLICANT_UPDATED',
      resourceType: 'Applicant',
      resourceId: applicant.id,
      details: { status: applicant.status, rating: applicant.rating },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Applicant updated successfully',
      data: { applicant },
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteApplicant(req, res, next) {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    await logAudit({
      actor: req.user,
      action: 'APPLICANT_DELETED',
      resourceType: 'Applicant',
      resourceId: req.params.id,
      details: { email: applicant.email, fullName: applicant.fullName },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Applicant record deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    return next(err);
  }
}

async function retryConfirmationEmail(req, res, next) {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) {
      throw new AppError('Applicant not found', StatusCodes.NOT_FOUND, {
        code: 'NOT_FOUND',
      });
    }

    if (!applicant.referenceNumber) {
      applicant.referenceNumber = await generateApplicationReference(Applicant);
    }

    const submissionDate = (applicant.createdAt || new Date()).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    applicant.emailNotification.attempts += 1;
    const emailResult = await sendJobApplicationConfirmation({
      to: applicant.email,
      applicantName: applicant.fullName,
      positionTitle: applicant.jobTitle || 'Professional Role',
      referenceNumber: applicant.referenceNumber,
      submissionDate,
    });

    if (emailResult.success) {
      applicant.emailNotification.status = 'SENT';
      applicant.emailNotification.sentAt = new Date();
      applicant.emailNotification.lastError = null;
    } else {
      applicant.emailNotification.status = 'FAILED';
      applicant.emailNotification.failedAt = new Date();
      applicant.emailNotification.lastError = emailResult.error || 'Retry failed';
    }

    await applicant.save();

    await logAudit({
      actor: req.user,
      action: 'APPLICANT_EMAIL_RETRIED',
      resourceType: 'Applicant',
      resourceId: applicant.id,
      details: {
        email: applicant.email,
        outcome: applicant.emailNotification.status,
      },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: emailResult.success
        ? 'Confirmation email resent successfully'
        : `Email delivery attempt failed: ${emailResult.error}`,
      data: { applicant },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listApplicants,
  getApplicant,
  createApplicant,
  updateApplicant,
  deleteApplicant,
  updateStatus,
  addFeedback,
  listMessages,
  addMessage,
  retryConfirmationEmail,
};
