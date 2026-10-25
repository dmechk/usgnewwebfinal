'use strict';

const { StatusCodes } = require('http-status-codes');
const Inquiry = require('../models/Inquiry');
const AppError = require('../utils/appError');
const { logAudit } = require('../services/audit.service');

const INITIAL_SEED_INQUIRIES = [
  {
    name: 'Jean Damascene Uwimana',
    email: 'damascene.uwimana@gmail.com',
    phone: '0788345210',
    subject: 'Agri-Loan & Coffee Washing Station Working Capital',
    message: 'Hello, our coffee cooperative in Rushashi is preparing for the cherry harvest season. We would like to apply for seasonal agricultural input credit under the SACCO cooperative discount rate. Can an officer visit our station?',
    sector: 'Rushashi',
    status: 'pending',
    priority: 'high',
    source: 'website',
    notes: 'Urgent harvest financing request. Forwarded details to Loan Officer.',
  },
  {
    name: 'Marie Claire Mukamana',
    email: 'claire.muka@yahoo.com',
    phone: '0782190844',
    subject: 'USSD *541# Mobile Banking Setup',
    message: 'Muraho neza. I registered my SACCO account at Nemba outpost last month. I tried dialing *541# but my MTN MoMo number says pending verification. How can I complete authorization?',
    sector: 'Nemba',
    status: 'in_review',
    priority: 'medium',
    source: 'website',
    notes: 'Checked telecom API logs. KYC phone matches account ID 042-889. Pending MoMo float sync.',
  },
  {
    name: 'Emmanuel Nsengiyumva',
    email: 'emmanuel.nsengi@gmail.com',
    phone: '0785661122',
    subject: 'Commercial Micro-Business Loan Extension',
    message: 'Good morning. I run a hardware store in Gakenke town center. I have completed 80% repayment on my 2-year SME facility and would like to inquire about loan top-up eligibility for importing solar equipment.',
    sector: 'Gakenke',
    status: 'resolved',
    priority: 'high',
    source: 'walk_in',
    notes: 'Manager reviewed credit score. 100% on-time repayment history. Approved for top-up application.',
    resolvedAt: new Date(),
    adminReply: 'Called member directly on phone and invited to Gakenke branch with last 6 months turnover statements.',
  },
  {
    name: 'Claudine Nyirabagenzi',
    email: 'claudine.nyira@gmail.com',
    phone: '0787320019',
    subject: 'Fixed Deposit Term Rates & Interest Inquiries',
    message: 'Nifuzaga kumenya inyungu mutanga ku mafaranga azigamiwe igihe kirekire (Fixed Term Deposit) mu gihe cy amezi 12 kuri Miliyoni 5 z amafaranga y u Rwanda.',
    sector: 'Kivuruga',
    status: 'pending',
    priority: 'low',
    source: 'website',
  },
  {
    name: 'Vedaste Hakizimana',
    email: 'hakizi.vedaste@gmail.com',
    phone: '0781298455',
    subject: 'Motorcycle Taxi (Motari) Asset Financing',
    message: 'Greetings. Our local youth transport association has 6 registered drivers who want to acquire new motorbikes through cooperative asset financing. What are the deposit terms and guarantor rules?',
    sector: 'Rushashi',
    status: 'in_review',
    priority: 'medium',
    source: 'phone',
    notes: 'Association has registered with RCA. Requested copy of cooperative registration certificate.',
  },
];

/**
 * List all inquiries with filtering, search, and pagination
 */
async function listInquiries(req, res, next) {
  try {
    const { status, priority, source, sector, search, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (source && source !== 'all') filter.source = source;
    if (sector && sector !== 'all') filter.sector = sector;

    if (search && String(search).trim()) {
      const q = String(search).trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { subject: regex },
        { message: regex },
        { notes: regex },
        { sector: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * limitNum;

    // Auto-seed initial inquiries if collection is totally empty
    const countTotal = await Inquiry.countDocuments();
    if (countTotal === 0) {
      await Inquiry.insertMany(INITIAL_SEED_INQUIRIES);
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate('assignedTo', 'firstName lastName email role')
        .populate('feedbacks.sentBy', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Inquiry.countDocuments(filter),
    ]);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        inquiries,
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

/**
 * Get single inquiry by ID
 */
async function getInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('feedbacks.sentBy', 'firstName lastName email role');

    if (!inquiry) {
      throw new AppError('Inquiry not found', StatusCodes.NOT_FOUND, {
        code: 'INQUIRY_NOT_FOUND',
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: { inquiry },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Create a new inquiry (Public website form or internal admin log)
 */
async function createInquiry(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      sector = 'Gakenke',
      status = 'pending',
      priority = 'medium',
      source = 'website',
      notes = '',
    } = req.body;

    if (!name || !String(name).trim()) {
      throw new AppError('Sender name is required', StatusCodes.BAD_REQUEST);
    }
    if (!phone || !String(phone).trim()) {
      throw new AppError('Telephone contact number is required', StatusCodes.BAD_REQUEST);
    }
    if (!subject || !String(subject).trim()) {
      throw new AppError('Inquiry subject is required', StatusCodes.BAD_REQUEST);
    }
    if (!message || !String(message).trim()) {
      throw new AppError('Message is required', StatusCodes.BAD_REQUEST);
    }

    const newInquiry = new Inquiry({
      name: String(name).trim(),
      email: email ? String(email).trim().toLowerCase() : '',
      phone: String(phone).trim(),
      subject: String(subject).trim(),
      message: String(message).trim(),
      sector: String(sector).trim(),
      status,
      priority,
      source,
      notes: String(notes).trim(),
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });

    await newInquiry.save();

    if (req.user) {
      await logAudit({
        actor: req.user,
        action: 'INQUIRY_CREATED',
        resourceType: 'Inquiry',
        resourceId: newInquiry.id,
        details: { subject: newInquiry.subject, sender: newInquiry.name },
        req,
      });
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { inquiry: newInquiry },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Update inquiry fields (status, priority, notes, etc.)
 */
async function updateInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', StatusCodes.NOT_FOUND, {
        code: 'INQUIRY_NOT_FOUND',
      });
    }

    const {
      name,
      email,
      phone,
      subject,
      message,
      sector,
      status,
      priority,
      source,
      notes,
      adminReply,
      assignedTo,
    } = req.body;

    if (name !== undefined) inquiry.name = String(name).trim();
    if (email !== undefined) inquiry.email = String(email).trim().toLowerCase();
    if (phone !== undefined) inquiry.phone = String(phone).trim();
    if (subject !== undefined) inquiry.subject = String(subject).trim();
    if (message !== undefined) inquiry.message = String(message).trim();
    if (sector !== undefined) inquiry.sector = String(sector).trim();
    if (priority !== undefined) inquiry.priority = priority;
    if (source !== undefined) inquiry.source = source;
    if (notes !== undefined) inquiry.notes = String(notes).trim();
    if (adminReply !== undefined) inquiry.adminReply = String(adminReply).trim();
    if (assignedTo !== undefined) inquiry.assignedTo = assignedTo || null;

    if (status !== undefined) {
      inquiry.status = status;
      if (status === 'resolved' && !inquiry.resolvedAt) {
        inquiry.resolvedAt = new Date();
      }
    }

    await inquiry.save();

    if (req.user) {
      await logAudit({
        actor: req.user,
        action: 'INQUIRY_UPDATED',
        resourceType: 'Inquiry',
        resourceId: inquiry.id,
        details: { status: inquiry.status, priority: inquiry.priority },
        req,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: { inquiry },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete an inquiry
 */
async function deleteInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', StatusCodes.NOT_FOUND, {
        code: 'INQUIRY_NOT_FOUND',
      });
    }

    await inquiry.deleteOne();

    if (req.user) {
      await logAudit({
        actor: req.user,
        action: 'INQUIRY_DELETED',
        resourceType: 'Inquiry',
        resourceId: req.params.id,
        details: { subject: inquiry.subject, sender: inquiry.name },
        req,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Inquiry deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Send official feedback / reply to an inquiry
 * Records the sender's user info, role, timestamp, and message in MongoDB
 */
async function sendFeedback(req, res, next) {
  try {
    const { message, newStatus, internalNotes } = req.body;

    if (!message || !String(message).trim()) {
      throw new AppError('Feedback message is required', StatusCodes.BAD_REQUEST, {
        code: 'FEEDBACK_REQUIRED',
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', StatusCodes.NOT_FOUND, {
        code: 'INQUIRY_NOT_FOUND',
      });
    }

    const user = req.user || {};
    const senderName =
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      'SACCO Representative';
    const senderRole = user.role || 'ADMIN';
    const senderEmail = user.email || 'ubumwesaccogakenke@gmail.com';

    const feedbackItem = {
      senderName,
      senderEmail,
      senderRole,
      sentBy: user.id || user._id || null,
      message: String(message).trim(),
      createdAt: new Date(),
    };

    inquiry.feedbacks.push(feedbackItem);
    inquiry.adminReply = String(message).trim();

    // Auto-update status if requested or promote pending to in_review / resolved
    if (newStatus) {
      inquiry.status = newStatus;
      if (newStatus === 'resolved') {
        inquiry.resolvedAt = new Date();
      }
    } else if (inquiry.status === 'pending') {
      inquiry.status = 'in_review';
    }

    if (internalNotes) {
      inquiry.notes = inquiry.notes
        ? `${inquiry.notes}\n[${new Date().toLocaleDateString()}] ${internalNotes}`
        : internalNotes;
    }

    await inquiry.save();

    await logAudit({
      actor: req.user,
      action: 'INQUIRY_FEEDBACK_SENT',
      resourceType: 'Inquiry',
      resourceId: inquiry.id,
      details: {
        recipient: inquiry.email || inquiry.phone,
        status: inquiry.status,
        senderRole,
      },
      req,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Official feedback registered and saved to SACCO database successfully',
      data: {
        inquiry,
        feedback: feedbackItem,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  sendFeedback,
};
