import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getDbClient } from '../../../data/database/mongodb';
import { logger } from '../../../lib/logger';

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);
  const user = session?.user;
  if (!user || user.email !== 'stschmaltz@gmail.com') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { db } = await getDbClient();
    const feedback = await db
      .collection('feedback')
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    res.status(200).json({ feedback });
  } catch (error) {
    logger.error('Failed to fetch feedback', { error });
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});
