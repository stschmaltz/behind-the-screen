import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { UserRepository } from '../../../repositories/user/user.repository';
import { logger } from '../../../lib/logger';

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  const user = session?.user;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const repo = new UserRepository();
    const usageCheck = await repo.checkAiUsageLimit(user.sub);
    const nextResetDate = new Date(
      usageCheck.resetDate.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    res.status(200).json({
      canUse: usageCheck.canUse,
      remaining: usageCheck.remaining,
      limit: usageCheck.limit,
      resetDate: nextResetDate,
    });
  } catch (error) {
    logger.error('Failed to check AI usage', { error });
    res.status(500).json({ error: 'Failed to check AI usage' });
  }
});
