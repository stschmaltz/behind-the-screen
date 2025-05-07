import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { UserRepository } from '../../../repositories/user/user.repository';
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
    const repo = new UserRepository();
    const count = await repo.countUsers();
    res.status(200).json({ count });
  } catch (error) {
    logger.error('Failed to get user count', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ error: 'Failed to get user count' });
  }
});
