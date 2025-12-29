import { ManagementClient } from 'auth0';
import { getDbClient } from '../data/database/mongodb';
import { logger } from '../lib/logger';

interface Auth0User {
  user_id: string;
  email: string;
  name?: string;
  picture?: string;
  logins_count?: number;
  last_login?: string;
}

const isDryRun = process.argv.includes('--dry-run');

const auth0ManagementClient = new ManagementClient({
  domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '',
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
});

async function syncAuth0LoginData() {
  try {
    if (isDryRun) {
      logger.info('🔍 DRY RUN MODE - No changes will be made to the database');
    }
    logger.info('Starting Auth0 login data sync...');

    if (!process.env.AUTH0_ISSUER_BASE_URL) {
      throw new Error('AUTH0_ISSUER_BASE_URL not set');
    }
    if (!process.env.AUTH0_MANAGEMENT_CLIENT_ID) {
      throw new Error('AUTH0_MANAGEMENT_CLIENT_ID not set');
    }
    if (!process.env.AUTH0_MANAGEMENT_CLIENT_SECRET) {
      throw new Error('AUTH0_MANAGEMENT_CLIENT_SECRET not set');
    }

    const { db } = await getDbClient();
    const usersCollection = db.collection('users');

    let page = 0;
    const perPage = 100;
    let hasMore = true;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    while (hasMore) {
      logger.info(`Fetching Auth0 users page ${page}...`);

      const response = await auth0ManagementClient.users.getAll({
        page,
        per_page: perPage,
        include_totals: false,
      });

      const auth0Users: Auth0User[] = Array.isArray(response)
        ? response
        : response.data || [];

      if (!auth0Users || auth0Users.length === 0) {
        hasMore = false;
        break;
      }

      logger.info(`Processing ${auth0Users.length} users from Auth0...`);

      for (const auth0User of auth0Users) {
        totalProcessed++;

        const auth0Id = auth0User.user_id;
        const loginCount = auth0User.logins_count || 0;
        const lastLoginDate = auth0User.last_login
          ? new Date(auth0User.last_login)
          : undefined;

        const existingUser = await usersCollection.findOne({ auth0Id });

        if (!existingUser) {
          logger.info(
            `User ${auth0User.email} (${auth0Id}) not found in database, skipping...`,
          );
          totalSkipped++;
          continue;
        }

        const currentLoginCount = existingUser.loginCount || 0;
        const currentLastLogin = existingUser.lastLoginDate;

        const needsUpdate =
          loginCount !== currentLoginCount ||
          (lastLoginDate &&
            (!currentLastLogin ||
              lastLoginDate.getTime() !== currentLastLogin.getTime()));

        if (needsUpdate) {
          if (isDryRun) {
            logger.info(
              `[DRY RUN] Would update ${auth0User.email}: loginCount ${currentLoginCount} -> ${loginCount}, lastLogin: ${lastLoginDate?.toISOString() || 'N/A'}`,
            );
          } else {
            await usersCollection.updateOne(
              { auth0Id },
              {
                $set: {
                  loginCount,
                  ...(lastLoginDate && { lastLoginDate }),
                },
              },
            );

            logger.info(
              `✅ Updated ${auth0User.email}: loginCount ${currentLoginCount} -> ${loginCount}, lastLogin: ${lastLoginDate?.toISOString() || 'N/A'}`,
            );
          }
          totalUpdated++;
        }
      }

      page++;

      if (auth0Users.length < perPage) {
        hasMore = false;
      }
    }

    logger.info('========================================');
    logger.info('Auth0 login data sync completed!');
    logger.info(`Total users processed: ${totalProcessed}`);
    logger.info(
      `Total users ${isDryRun ? 'that would be updated' : 'updated'}: ${totalUpdated}`,
    );
    logger.info(`Total users skipped (not in database): ${totalSkipped}`);
    if (isDryRun) {
      logger.info(
        '\n⚠️  This was a DRY RUN. To apply changes, run without --dry-run flag',
      );
    }
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('Error syncing Auth0 login data', error);
    process.exit(1);
  }
}

syncAuth0LoginData();
