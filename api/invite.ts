import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { email, inviterName } = req.body;

  if (!email || !inviterName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const inviteLink = `${process.env.APP_URL}/login`; // Can be custom

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `${inviterName} invited you to Chat App`,
      html: `
        <p>${inviterName} invited you to join the Chat App.</p>
        <p><a href="${inviteLink}">Click here to sign in</a></p>
      `,
    }),
  });

  if (response.ok) {
    res.status(200).json({ message: 'Invite sent successfully' });
  } else {
    const error = await response.json();
    res.status(500).json({ error });
  }
}
