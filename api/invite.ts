import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export default async function handler(req: Request, res: Response) {
  const allowedOrigins = ['http://localhost:5173', 'https://your-app.web.app'];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS)
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, inviterName } = req.body;

  if (!email || !inviterName) return res.status(400).json({ error: 'Missing required fields' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `${inviterName} invited you to Chat App`,
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 30px; border-radius: 10px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #4A90E2;">🎉 You're Invited to Join Chat App!</h2>
        <p style="font-size: 16px; color: #333;">
          <strong>${inviterName}</strong> has invited you to connect on <strong>Chat App</strong>.
        </p>
        <p style="font-size: 16px; color: #333;">
          Click the button below to get started and sign in:
        </p>
        <div style="margin: 30px 0;">
          <a href="${process.env.APP_URL}/login" style="background-color: #4A90E2; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
            🚀 Join Now
          </a>
        </div>
        <p style="font-size: 14px; color: #888;">
          If you didn't expect this email, you can safely ignore it.
        </p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #aaa;">
          © ${new Date().getFullYear()} Chat App • Made with 💬
        </p>
      </div>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Invite sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Email sending failed', detail: (error as any).message });
  }
}
