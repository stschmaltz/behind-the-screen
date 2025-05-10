import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import sgMail from '@sendgrid/mail';
import { getDbClient } from '../../data/database/mongodb';
import { logger } from '../../lib/logger';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const saveFeedbackToDb = async (feedbackData: {
  name: string;
  email: string;
  allowContact: boolean;
  feedbackType: string;
  message: string;
  timestamp: Date;
}): Promise<boolean> => {
  try {
    const { db } = await getDbClient();
    await db.collection('feedback').insertOne(feedbackData);
    logger.info(`Feedback saved to database`);

    return true;
  } catch (error) {
    logger.error('Error saving feedback to database:', error);

    return false;
  }
};

type FeedbackData = {
  name: string;
  allowContact: boolean;
  feedbackType: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return res
        .status(401)
        .json({ message: 'You must be logged in to submit feedback' });
    }

    const { name, allowContact, feedbackType, message } =
      req.body as FeedbackData;

    if (!name || feedbackType === undefined || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    logger.info(`New feedback received from ${name} (${userEmail})`);
    logger.info(`Contact permission: ${allowContact ? 'Yes' : 'No'}`);
    logger.info(`Type: ${feedbackType}`);
    logger.info(`Message: ${message}`);

    try {
      if (process.env.SENDGRID_API_KEY) {
        const feedbackTypeLabels = {
          feature: 'Feature Request',
          bug: 'Bug Report',
          improvement: 'Improvement Suggestion',
          other: 'Other Feedback',
        };

        const emailMsg = {
          to:
            process.env.FEEDBACK_TO_EMAIL ||
            'stschmaltz+dmessentials@gmail.com',
          from: 'feedback@encountermanager.com',
          replyTo: userEmail,
          subject: `Dungeon Master Essentials Feedback from ${name} <${userEmail}>: ${feedbackTypeLabels[feedbackType as keyof typeof feedbackTypeLabels] || feedbackType}`,
          text: `
Name: ${name}
Email: ${userEmail}
Allow Contact: ${allowContact ? 'Yes' : 'No'}
Feedback Type: ${feedbackTypeLabels[feedbackType as keyof typeof feedbackTypeLabels] || feedbackType}

Message:
${message}
          `,
          html: `
<h2>New Feedback from Dungeon Master Essentials</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
<p><strong>Can you contact them?</strong> ${allowContact ? '<span style="color: green; font-weight: bold;">Yes, they gave permission</span>' : '<span style="color: #777;">No, they did not opt-in for contact</span>'}</p>
<p><strong>Feedback Type:</strong> ${feedbackTypeLabels[feedbackType as keyof typeof feedbackTypeLabels] || feedbackType}</p>
<h3>Message:</h3>
<p>${message.replace(/\n/g, '<br>')}</p>
          `,
        };

        try {
          await sgMail.send(emailMsg);
          logger.info('Feedback email sent successfully via SendGrid');
        } catch (sendError: unknown) {
          logger.error(
            'SendGrid sending error:',
            sendError instanceof Error ? sendError.message : String(sendError),
          );
          throw sendError;
        }
      } else {
        logger.warn('SendGrid API key not set. Email not sent.');
      }
    } catch (emailError) {
      logger.error('Failed to send feedback email:', emailError);

      const feedbackData = {
        name,
        email: userEmail,
        allowContact,
        feedbackType,
        message,
        timestamp: new Date(),
      };

      await saveFeedbackToDb(feedbackData);

      return res
        .status(200)
        .json({ message: 'Feedback received successfully' });
    }

    // Always save feedback to DB regardless of email success
    const feedbackData = {
      name,
      email: userEmail,
      allowContact,
      feedbackType,
      message,
      timestamp: new Date(),
    };

    await saveFeedbackToDb(feedbackData);

    logger.info('Feedback received:', {
      name,
      email: userEmail,
      allowContact,
      feedbackType,
      message,
    });

    return res.status(200).json({ message: 'Feedback received successfully' });
  } catch (error) {
    logger.error('Error processing feedback:', error);

    return res.status(500).json({ message: 'Failed to process feedback' });
  }
}
