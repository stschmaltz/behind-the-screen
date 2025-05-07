import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
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
    const users = await repo.getAllUsers(100);
    res.status(200).json({ users });
  } catch (error) {
    logger.error('Failed to fetch users', { error });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
