import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { UserRepository } from '../../../repositories/user/user.repository';
import { logger } from '../../../lib/logger';

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
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

    if (!usageCheck.canUse) {
      const nextResetDate = new Date(
        usageCheck.resetDate.getTime() + 7 * 24 * 60 * 60 * 1000,
      );

      return res.status(429).json({
        error: 'AI usage limit reached',
        limit: usageCheck.limit,
        remaining: 0,
        resetDate: nextResetDate,
      });
    }

    const updatedUser = await repo.incrementAiUsage(user.sub);
    const newUsageCheck = await repo.checkAiUsageLimit(user.sub);

    res.status(200).json({
      success: true,
      usage: updatedUser.aiUsageCount,
      remaining: newUsageCheck.remaining,
      limit: newUsageCheck.limit,
    });
  } catch (error) {
    logger.error('Failed to track AI usage', { error });
    res.status(500).json({ error: 'Failed to track AI usage' });
  }
});
