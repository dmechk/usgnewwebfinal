'use strict';

const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  } else {
    // When SMTP credentials are not configured, use json/stream transporter for safe non-crashing simulation
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
}

/**
 * Standard branded HTML email layout for Ubumwe SACCO
 */
function createEmailLayout({ title, subtitle, contentHtml, callToAction }) {
  const replyNotice = env.EMAIL_REPLY_TO
    ? `Replies sent directly to this address cannot be monitored. For official inquiries and assistance, please reach out directly to our verified support team at <a href="mailto:${env.EMAIL_REPLY_TO}" style="color: #047857; font-weight: bold; text-decoration: underline;">${env.EMAIL_REPLY_TO}</a> or call our headquarters.`
    : `This is an automated administrative notification. Direct email replies to this address are not monitored.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          <!-- Top Accent Ribbon -->
          <tr>
            <td style="background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%); height: 8px;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; background-color: #0f172a; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #34d399; text-transform: uppercase;">UBUMWE SACCO GAKENKE</span>
                    <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff;">${title}</h1>
                    ${subtitle ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">${subtitle}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px; font-size: 14px; line-height: 1.6; color: #334155;">
              ${contentHtml}

              ${
                callToAction
                  ? `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 16px 0;">
                  <tr>
                    <td align="center">
                      <a href="${callToAction.url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%); color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 6px rgba(29, 78, 216, 0.3);">${callToAction.text}</a>
                    </td>
                  </tr>
                </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Official Security Notice Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; line-height: 1.5; color: #64748b;">
              <p style="margin: 0 0 10px 0; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Official System Notification</p>
              <p style="margin: 0 0 10px 0;">${replyNotice}</p>
              <p style="margin: 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} UBUMWE SACCO Gakenke &middot; Cooperative Licensed &amp; Supervised by BNR &amp; RCA. Gakenke District, Northern Province, Rwanda.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends a generic formatted email with safe failure handling
 */
async function sendMail({ to, subject, html, text }) {
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    return {
      success: false,
      error: 'Invalid recipient email address',
    };
  }

  const mailOptions = {
    from: env.EMAIL_FROM,
    to: to.trim().toLowerCase(),
    replyTo: env.EMAIL_REPLY_TO,
    subject: `UBUMWE SACCO - ${subject}`,
    text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    html,
  };

  try {
    const client = getTransporter();
    const info = await client.sendMail(mailOptions);

    if (!env.SMTP_HOST && env.NODE_ENV !== 'test') {
      console.log(`[Email Service Simulated] Sent to ${to}: ${subject}`);
    }

    return {
      success: true,
      messageId: info.messageId || 'simulated-id',
    };
  } catch (err) {
    console.error(`[Email Service Failure] Could not send email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * 1. Job Application Confirmation Email
 */
async function sendJobApplicationConfirmation({
  to,
  applicantName,
  positionTitle,
  referenceNumber,
  submissionDate,
}) {
  const contentHtml = `
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>Thank you for your interest in joining <strong>Ubumwe SACCO</strong>. We confirm that your employment application has been received and logged into our recruitment database.</p>

    <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Application Reference Number:</strong> <code style="background-color: #e2e8f0; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${referenceNumber}</code></p>
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Position Applied For:</strong> ${positionTitle}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Submission Date:</strong> ${submissionDate}</p>
    </div>

    <p style="margin-top: 16px;"><strong>Next Steps:</strong></p>
    <p>Our Human Resources Evaluation Committee reviews candidate dossiers in accordance with our competitive recruitment regulations. Please note that this confirmation acknowledges receipt of your dossier and does not guarantee shortlisting or employment.</p>
    <p>Should your qualifications match our current operational requirements, our recruitment team will reach out to you using your verified contact details.</p>
    <p>Please keep your reference number (<code>${referenceNumber}</code>) for any future communication regarding this application.</p>
  `;

  return sendMail({
    to,
    subject: `Application Confirmation: ${positionTitle} [${referenceNumber}]`,
    html: createEmailLayout({
      title: 'Job Application Received',
      subtitle: `Reference: ${referenceNumber}`,
      contentHtml,
    }),
  });
}

/**
 * 2. Customer Inquiry Acknowledgment Email
 */
async function sendInquiryAcknowledgment({
  to,
  clientName,
  subject,
  referenceNumber,
  submissionDate,
}) {
  const contentHtml = `
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Thank you for contacting <strong>Ubumwe SACCO</strong>. We have received your inquiry regarding "<em>${subject}</em>" and a support record has been created in our member service system.</p>

    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Inquiry Reference Number:</strong> <code style="background-color: #e2e8f0; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${referenceNumber}</code></p>
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 0; font-size: 13px;"><strong>Logged Date:</strong> ${submissionDate}</p>
    </div>

    <p style="margin-top: 16px;"><strong>Next Steps:</strong></p>
    <p>Your request has been routed to the appropriate unit at Ubumwe SACCO. An authorized officer will review your message and provide official feedback.</p>
    <p>If your matter requires immediate assistance, you are also welcome to visit your nearest SACCO outpost or branch in Gakenke District during official working hours (Monday &ndash; Friday: 8:00 AM &ndash; 5:00 PM).</p>
  `;

  return sendMail({
    to,
    subject: `Inquiry Receipt: ${subject} [${referenceNumber}]`,
    html: createEmailLayout({
      title: 'Customer Inquiry Acknowledgment',
      subtitle: `Ticket #${referenceNumber}`,
      contentHtml,
    }),
  });
}

/**
 * 3. Authorized Staff Response to Customer Inquiry
 */
async function sendInquiryReply({
  to,
  clientName,
  inquirySubject,
  referenceNumber,
  staffName,
  staffRole,
  replyMessage,
}) {
  const contentHtml = `
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>In reference to your inquiry regarding <strong>"${inquirySubject}"</strong> (Ticket: <code>${referenceNumber}</code>), please find the official response from Ubumwe SACCO management below:</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 18px 20px; margin: 22px 0; border-radius: 8px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase;">Official Staff Response</p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #14532d; white-space: pre-wrap;">${replyMessage}</p>
      <div style="margin-top: 14px; pt-2; border-top: 1px dashed #86efac; font-size: 12px; color: #15803d;">
        Responded by: <strong>${staffName}</strong> &middot; ${staffRole}
      </div>
    </div>

    <p>If you have any further questions or require additional clarification, please refer to Ticket <code>${referenceNumber}</code> when visiting any Ubumwe SACCO branch or communicating through our official contact channels.</p>
  `;

  return sendMail({
    to,
    subject: `Response to Inquiry: ${inquirySubject} [${referenceNumber}]`,
    html: createEmailLayout({
      title: 'Official SACCO Response',
      subtitle: `Reference: ${referenceNumber}`,
      contentHtml,
    }),
  });
}

/**
 * 4. Staff Onboarding & Account Activation Email
 */
async function sendStaffOnboardingEmail({
  to,
  staffName,
  username,
  role,
  department,
  activationUrl,
  expiresHours = 48,
}) {
  const contentHtml = `
    <p>Dear <strong>${staffName}</strong>,</p>
    <p>Welcome to <strong>Ubumwe SACCO</strong>. An official staff user account has been provisioned for you on the Ubumwe SACCO Management Portal.</p>

    <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Login Email:</strong> <code style="background-color: #e2e8f0; color: #0f172a; padding: 2px 6px; border-radius: 4px;">${username}</code></p>
      <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Assigned Role:</strong> <span style="color: #4338ca; font-weight: 700;">${role}</span></p>
      ${department ? `<p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Department:</strong> ${department}</p>` : ''}
      <p style="margin: 0; font-size: 13px;"><strong>Activation Window:</strong> Valid for ${expiresHours} hours</p>
    </div>

    <p><strong>Initial Password Security:</strong></p>
    <p>In accordance with Ubumwe SACCO IT Security Policy, passwords are never sent over email. To activate your account and establish your confidential password, please click the secure button below:</p>

    <div style="margin: 24px 0; text-align: center;">
      <a href="${activationUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">Activate Staff Account &amp; Set Password</a>
    </div>

    <p style="font-size: 12px; color: #64748b;">Or copy and paste this link into your browser:<br><a href="${activationUrl}" style="color: #2563eb; word-break: break-all;">${activationUrl}</a></p>

    <p style="margin-top: 18px; font-size: 12px; color: #dc2626; font-weight: 600;">Security Reminder: Never share your login credentials or activation link with anyone. SACCO IT will never ask for your password.</p>
  `;

  return sendMail({
    to,
    subject: `Staff Account Activation & Portal Access`,
    html: createEmailLayout({
      title: 'Welcome to Ubumwe SACCO',
      subtitle: 'Staff Onboarding & Secure Portal Access',
      contentHtml,
    }),
  });
}

/**
 * 5. Job Application Status Update Notification Email
 */
async function sendApplicantStatusUpdateEmail({
  to,
  applicantName,
  positionTitle,
  referenceNumber,
  newStatus,
  notes,
}) {
  const normalized = String(newStatus || '').toLowerCase();
  
  let statusBadgeColor = '#3b82f6';
  let statusBg = '#eff6ff';
  let statusBorder = '#bfdbfe';
  let statusText = 'Under Review';
  let statusMessage = 'Your application dossier is currently undergoing administrative review.';

  if (normalized === 'shortlisted') {
    statusBadgeColor = '#2563eb';
    statusBg = '#eff6ff';
    statusBorder = '#93c5fd';
    statusText = 'Shortlisted';
    statusMessage = 'Congratulations! Your qualifications have met our competitive criteria and your dossier has been shortlisted for the next evaluation phase.';
  } else if (normalized === 'interview') {
    statusBadgeColor = '#7c3aed';
    statusBg = '#faf5ff';
    statusBorder = '#d8b4fe';
    statusText = 'Invited for Interview';
    statusMessage = 'You have been selected for an official interview with our Evaluation Committee. Our Human Resources team will contact you shortly with the exact schedule, location, and preparation details.';
  } else if (normalized === 'accepted' || normalized === 'offer' || normalized === 'hired') {
    statusBadgeColor = '#059669';
    statusBg = '#ecfdf5';
    statusBorder = '#a7f3d0';
    statusText = 'Application Accepted';
    statusMessage = 'Congratulations! We are pleased to inform you that your application for employment at Ubumwe SACCO has been accepted. Our Human Resources division will reach out with the onboarding documentation.';
  } else if (normalized === 'rejected' || normalized === 'not_shortlisted') {
    statusBadgeColor = '#dc2626';
    statusBg = '#fef2f2';
    statusBorder = '#fecaca';
    statusText = 'Not Selected';
    statusMessage = 'Thank you for taking the time to participate in our recruitment process. Following careful review of all dossiers against our current operational profiles, we regret to inform you that we are unable to advance your application at this time. We wish you continued success in your professional career.';
  } else if (normalized === 'waitlisted') {
    statusBadgeColor = '#d97706';
    statusBg = '#fffbeb';
    statusBorder = '#fde68a';
    statusText = 'Waitlisted / Talent Pool';
    statusMessage = 'Your dossier has been evaluated favorably and placed on our active reserve talent pool for future opportunities aligned with your background.';
  }

  const contentHtml = `
    <p>Dear <strong>${applicantName}</strong>,</p>
    <p>We are writing to inform you of an official status update regarding your employment application at <strong>Ubumwe SACCO</strong>.</p>

    <div style="background-color: ${statusBg}; border: 1px solid ${statusBorder}; border-left: 5px solid ${statusBadgeColor}; padding: 16px 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${statusBadgeColor};">Updated Status: ${statusText}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.5; color: #1e293b;">${statusMessage}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
        <strong>Position:</strong> ${positionTitle || 'Employment Application'} &middot;
        <strong>Reference:</strong> <code style="background-color: #e2e8f0; color: #0f172a; padding: 2px 6px; border-radius: 4px;">${referenceNumber || 'N/A'}</code>
      </p>
    </div>

    ${
      notes && String(notes).trim()
        ? `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">HR Committee Notes</p>
        <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">${String(notes).trim()}</p>
      </div>
    `
        : ''
    }

    <p style="font-size: 13px; color: #475569; margin-top: 16px;">
      If you have questions regarding your application, please retain reference code <strong>${referenceNumber}</strong> and contact our Human Resources team via our official email <a href="mailto:${env.OFFICIAL_CONTACT_EMAIL}" style="color: #047857; font-weight: 600;">${env.OFFICIAL_CONTACT_EMAIL}</a>.
    </p>
  `;

  return sendMail({
    to,
    subject: `Application Update: ${positionTitle} [${statusText}] - ${referenceNumber || ''}`,
    html: createEmailLayout({
      title: 'Application Status Update',
      subtitle: `Reference: ${referenceNumber || 'Recruitment Dossier'}`,
      contentHtml,
    }),
  });
}

/**
 * 6. Verify SMTP Transport Connection without sending an email
 */
async function verifySmtpConnection() {
  const client = getTransporter();
  return client.verify();
}

module.exports = {
  sendMail,
  sendJobApplicationConfirmation,
  sendApplicantStatusUpdateEmail,
  sendInquiryAcknowledgment,
  sendInquiryReply,
  sendStaffOnboardingEmail,
  verifySmtpConnection,
};


