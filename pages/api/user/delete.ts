import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { ManagementClient } from 'auth0';
import { appContainer } from '../../../container/inversify.config';
import { TYPES } from '../../../container/types';
import { UserRepositoryInterface } from '../../../repositories/user/user.repository.interface';
import { getDbClient } from '../../../data/database/mongodb';
import { logger } from '../../../lib/logger';

const userRepository = appContainer.get<UserRepositoryInterface>(
  TYPES.UserRepository,
);

const auth0ManagementClient = new ManagementClient({
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '',
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
});

async function deleteUserAccount(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth0Id = session.user.sub;

    const user = await userRepository.findUserByAuth0Id(auth0Id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user._id;

    const { db } = await getDbClient();

    logger.info(`Deleting user data for user ${userId} (auth0Id: ${auth0Id})`);

    const relatedCollections = [
      'users',
      'userPreferences',
      'campaigns',
      'adventures',
      'encounters',
      'players',
    ];

    for (const collection of relatedCollections) {
      await db
        .collection(collection)
        .deleteMany({ userId: new ObjectId(userId) });
    }

    logger.info(`Successfully deleted user data for user ${userId}`);

    try {
      logger.info(`Deleting Auth0 user ${auth0Id}`);
      await auth0ManagementClient.users.delete({ id: auth0Id });
      logger.info(`Successfully deleted Auth0 user ${auth0Id}`);
    } catch (auth0Error) {
      logger.error('Error deleting user from Auth0', auth0Error);

      return res
        .status(500)
        .json({ error: 'Failed to delete Auth0 user account' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error deleting user account', error);

    return res.status(500).json({ error: 'Failed to delete user account' });
  }
}

export default withApiAuthRequired(deleteUserAccount);
