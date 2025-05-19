import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import { getDbClient } from '../../data/database/mongodb';
import { logger } from '../../lib/logger';

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
