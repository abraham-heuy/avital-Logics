import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getApplicationReceivedTemplate,
  getMatchAcceptedTemplate,
  getAdminNewApplicationTemplate
} from '../utils/helpers/email.templates';

interface EmailOptions {
  to: string;
  subject: string; 
  html: string;
  text?: string;
}

interface BrevoErrorResponse {
  code?: string;
  message?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('❌ BREVO_API_KEY is not set');
      return false;
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'Avital Team',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@avital.com',
        },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text || options.html.replace(/<[^>]*>/g, ''),
        replyTo: {
          email: 'support@avital.com',
          name: 'Avital Support',
        },
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error('❌ Brevo API error:', response.status, data);
      return false;
    }

    console.log(`✅ Email sent to ${options.to} | MessageId: ${data.messageId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Email send exception:', error.message);
    return false;
  }
};

// --- Specific email functions ---

export const sendVerificationCode = async (to: string, code: string, name: string) => {
  const html = getVerificationEmailTemplate(code, name);
  return sendEmail({
    to,
    subject: 'Verify your Avital account',
    html,
  });
};

export const sendPasswordResetCode = async (to: string, code: string, name: string) => {
  const html = getPasswordResetEmailTemplate(code, name);
  return sendEmail({
    to,
    subject: 'Reset your Avital password',
    html,
  });
};

export const sendApplicationReceived = async (to: string, ticketId: string, name: string) => {
  const html = getApplicationReceivedTemplate(ticketId, name);
  return sendEmail({
    to,
    subject: `Application received – Ticket ${ticketId}`,
    html,
  });
};

export const sendMatchAccepted = async (
  to: string,
  applicationTitle: string,
  consultantName: string,
  consultantEmail: string,
  dashboardLink: string
) => {
  const html = getMatchAcceptedTemplate(applicationTitle, consultantName, consultantEmail, dashboardLink);
  return sendEmail({
    to,
    subject: `You've been matched with a consultant for "${applicationTitle}"`,
    html,
  });

  
};

export const sendAdminNewApplicationNotification = async (application: {
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
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  if (adminEmails.length === 0) {
    console.error('No ADMIN_EMAILS set, skipping admin email notifications');
    return false;
  }

  const html = getAdminNewApplicationTemplate(application);
  const subject = `New Avital Application: ${application.ticket_id}`;

  const results = await Promise.allSettled(
    adminEmails.map(email => sendEmail({ to: email, subject, html }))
  );
  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`Admin email notifications sent to ${succeeded}/${adminEmails.length} recipients`);
  return succeeded > 0;
};