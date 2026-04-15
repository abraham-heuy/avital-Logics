// Base layout wrapper – white text on dark background
const baseLayout = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0A0C10;
      margin: 0;
      padding: 20px;
      color: #FFFFFF;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #1A1D24;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 12px 24px rgba(0,0,0,0.4);
    }
    .header {
      background: #0F1117;
      padding: 28px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      font-family: 'Poppins', sans-serif;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #A7C7E7;
    }
    .content {
      padding: 32px 28px;
    }
    h1, h2, h3, h4 {
      color: #FFFFFF;
      font-weight: 600;
      margin-top: 0;
    }
    h2 {
      font-size: 22px;
      margin-bottom: 12px;
    }
    p, li, .note, .text {
      color: #FFFFFF !important;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    strong {
      color: #FFFFFF;
    }
    .button {
      background: linear-gradient(135deg, #A7C7E7, #6B7C8F);
      color: #0A0C10 !important;
      font-weight: 700;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 40px;
      display: inline-block;
      margin: 20px 0 10px;
      transition: opacity 0.2s;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      font-family: 'JetBrains Mono', monospace;
      background: #0F1117;
      padding: 16px 24px;
      border-radius: 16px;
      display: inline-block;
      letter-spacing: 6px;
      color: #A7C7E7;
      border: 1px solid rgba(167,199,231,0.3);
      margin: 16px 0;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
      margin: 24px 0;
    }
    .footer {
      font-size: 12px;
      color: #9CA3AF;
      text-align: center;
      padding: 20px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: #0F1117;
    }
    .footer a {
      color: #A7C7E7;
      text-decoration: none;
    }
    .highlight {
      color: #A7C7E7;
      font-weight: 600;
    }
    .note {
      font-size: 13px;
      background: rgba(167,199,231,0.08);
      padding: 12px 16px;
      border-radius: 12px;
      margin: 20px 0 0;
      border-left: 3px solid #A7C7E7;
      color: #FFFFFF !important;
    }
    ul {
      color: #FFFFFF;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
      color: #FFFFFF;
    }
    @media (max-width: 480px) {
      .content { padding: 24px 20px; }
      .code { font-size: 28px; letter-spacing: 4px; padding: 12px 20px; }
      h2 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">a<span>V</span>ital</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Avital — Student Tech Consultation</p>
      <p style="margin-top: 8px;">
        <a href="#">Privacy Policy</a> &nbsp;|&nbsp;
        <a href="#">Terms of Service</a> &nbsp;|&nbsp;
        <a href="#">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
// --- Specific templates (content only – no extra dark overrides) ---

export const getVerificationEmailTemplate = (code: string, name: string) => {
  const content = `
    <h2>Verify your email address</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thanks for joining Avital! Please use the verification code below to complete your registration and unlock mentorship opportunities.</p>
    <div style="text-align: center;">
      <div class="code">${code}</div>
    </div>
    <p style="font-size: 14px;">This code is valid for <strong>15 minutes</strong>. If you didn't request this, please ignore this email.</p>
    <div class="note">
      <strong>Security tip:</strong> Never share this code with anyone. Avital will never ask for it outside this email.
    </div>
  `;
  return baseLayout(content, 'Verify Your Email');
};

export const getPasswordResetEmailTemplate = (code: string, name: string) => {
  const content = `
    <h2>Reset your password</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset your password. Use the code below to set a new password.</p>
    <div style="text-align: center;">
      <div class="code">${code}</div>
    </div>
    <p style="font-size: 14px;">This code expires in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
    <div class="note">
      <strong>Not you?</strong> Your account remains safe – no changes have been made.
    </div>
  `;
  return baseLayout(content, 'Reset Your Password');
};

export const getApplicationReceivedTemplate = (ticketId: string, name: string) => {
  const content = `
    <h2>Application received ✓</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your help request has been successfully submitted to Avital. Our team will review it shortly and match you with the best consultant for your project.</p>
    <div style="background: #0F1117; border-radius: 16px; padding: 16px; margin: 20px 0; text-align: center; border: 1px solid rgba(167,199,231,0.2);">
      <p style="margin: 0 0 6px; font-size: 12px; color: #9CA3AF;">Your tracking ticket</p>
      <p style="margin: 0; font-size: 24px; font-weight: bold; font-family: monospace; color: #A7C7E7;">${ticketId}</p>
    </div>
    <p>What happens next?</p>
    <ul>
      <li>✅ Our team reviews your project details (typically within 1 hour)</li>
      <li>✅ We match you with a consultant who fits your tech stack and urgency</li>
      <li>✅ You'll receive a match notification with consultant profile</li>
      <li>✅ Once you accept, your dashboard is activated and sessions begin</li>
    </ul>
    <div class="note">
      <strong>Pro tip:</strong> You can check your application status anytime using your ticket ID on our status page.
    </div>
  `;
  return baseLayout(content, 'Application Received - Avital');
};

export const getMatchAcceptedTemplate = (applicationTitle: string, consultantName: string, consultantEmail: string, dashboardLink: string) => {
  const content = `
    <h2>Great news! You've been matched 🎉</h2>
    <p>Your project <strong>"${applicationTitle}"</strong> has been successfully matched with one of our expert consultants.</p>
    <div style="background: #0F1117; border-radius: 20px; padding: 20px; margin: 20px 0; border-left: 4px solid #A7C7E7;">
      <p style="margin: 0 0 4px; font-size: 12px; color: #A7C7E7; letter-spacing: 1px;">YOUR CONSULTANT</p>
      <p style="margin: 0; font-size: 20px; font-weight: bold; color: #FFFFFF;">${consultantName}</p>
      <p style="margin: 4px 0 0; font-size: 13px; color: #D1D5DB;">${consultantEmail}</p>
    </div>
    <p>Your consultant has been notified and will reach out to you shortly to schedule the first session. You can also start a conversation from your dashboard.</p>
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">Go to my dashboard →</a>
    </div>
    <p style="font-size: 13px; margin-top: 16px;">If you have any questions, just reply to this email or message your consultant directly through the platform.</p>
  `;
  return baseLayout(content, 'Match Confirmed - Avital');
};

export const getAdminNewApplicationTemplate = (application: {
  ticket_id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  projectTitle: string;
  projectDescription: string;
  techStack: string;
  deadline: string;
  urgency: string;
  blocker?: string;
  referralSource?: string;
  groupType?: string;
  university?: string;
  yearOfStudy?: string;
}) => {
  const content = `
    <h2>📋 New Help Request Submitted</h2>
    <p>A new application has been received and requires review.</p>

    <div style="background: #0F1117; border-radius: 16px; padding: 16px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Applicant Information</h3>
      <p><strong>Ticket ID:</strong> ${application.ticket_id}</p>
      <p><strong>Name:</strong> ${application.applicantName}</p>
      <p><strong>Email:</strong> ${application.applicantEmail}</p>
      <p><strong>Phone:</strong> ${application.applicantPhone}</p>
      ${application.university ? `<p><strong>University:</strong> ${application.university}</p>` : ''}
      ${application.yearOfStudy ? `<p><strong>Year of Study:</strong> ${application.yearOfStudy}</p>` : ''}

      <h3>Project Details</h3>
      <p><strong>Title:</strong> ${application.projectTitle}</p>
      <p><strong>Description:</strong> ${application.projectDescription}</p>
      <p><strong>Tech Stack:</strong> ${application.techStack}</p>
      <p><strong>Deadline:</strong> ${application.deadline}</p>
      <p><strong>Urgency:</strong> ${application.urgency}</p>
      <p><strong>Group Type:</strong> ${application.groupType === 'group' ? 'Group booking' : 'Solo student'}</p>
      ${application.blocker ? `<p><strong>Biggest blocker:</strong> ${application.blocker}</p>` : ''}
      ${application.referralSource ? `<p><strong>Referral source:</strong> ${application.referralSource}</p>` : ''}
    </div>

    <p>Please log in to the admin dashboard to review and assign a consultant.</p>
    <div style="text-align: center;">
      <a href="${process.env.ADMIN_DASHBOARD_URL}/admin/applications" class="button">View in Dashboard →</a>
    </div>
  `;
  return baseLayout(content, `New Application: ${application.ticket_id}`);
};