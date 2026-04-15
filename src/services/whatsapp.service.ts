import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode-terminal';
import { fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
let sock: any = null;
let isConnecting = false;

export const initWhatsApp = async () => {
  if (isConnecting) return;
  isConnecting = true;

  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log('Using WA version:', version, 'isLatest:', isLatest);
  sock = makeWASocket({
    auth: state,
    version,
    browser: ['Ubuntu', 'Chrome', '120.0.0'],
  });

  sock.ev.on('connection.update', (update: any) => {
    console.log('Connection update:', update);

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 Scan this QR code with WhatsApp:');
      QRCode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log('WhatsApp connection closed, reconnecting:', shouldReconnect);

      isConnecting = false;

      if (shouldReconnect) {
        setTimeout(() => initWhatsApp(), 3000);
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp connected successfully');
      isConnecting = false;
    }
  });

  sock.ev.on('creds.update', saveCreds);
};
export const sendWhatsAppMessage = async (to: string, message: string): Promise<boolean> => {
  if (!sock) {
    console.error('WhatsApp not initialized');
    return false;
  }
  try {
    const formattedNumber = to.replace(/\D/g, '') + '@s.whatsapp.net';
    await sock.sendMessage(formattedNumber, { text: message });
    console.log(`WhatsApp message sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
};

export const sendAdminWhatsAppNotification = async (application: {
  ticket_id: string;
  applicantName: string;
  applicantPhone: string;
  projectTitle: string;
  urgency: string;
}) => {
  const adminPhones = process.env.ADMIN_PHONES?.split(',').map(p => p.trim()) || [];
  if (adminPhones.length === 0) {
    console.error('No ADMIN_PHONES set, skipping admin WhatsApp notifications');
    return false;
  }

  const message = `🔔 NEW AVITAL APPLICATION\n\n` +
    `Ticket: ${application.ticket_id}\n` +
    `Name: ${application.applicantName}\n` +
    `Phone: ${application.applicantPhone}\n` +
    `Project: ${application.projectTitle}\n` +
    `Urgency: ${application.urgency}\n\n` +
    `Please check the admin dashboard.`;

  const results = await Promise.allSettled(
    adminPhones.map(phone => sendWhatsAppMessage(phone, message))
  );
  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`Admin WhatsApp notifications sent to ${succeeded}/${adminPhones.length} recipients`);
  return succeeded > 0;
};