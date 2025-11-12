import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { UserRepository } from '../../../repositories/user/user.repository';
import { logger } from '../../../lib/logger';
import { isFeatureEnabled } from '../../../lib/featureFlags';

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  const user = session?.user;

  if (!user || !isFeatureEnabled(user.email)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const repo = new UserRepository();
    const stats = await repo.getAiUsageStats();

    res.status(200).json({ stats });
  } catch (error) {
    logger.error('Failed to fetch AI usage stats', { error });
    res.status(500).json({ error: 'Failed to fetch AI usage stats' });
  }
});
