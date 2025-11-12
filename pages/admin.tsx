import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isFeatureEnabled } from '../lib/featureFlags';
import { asyncFetch } from '../data/graphql/graphql-fetcher';

interface Feedback {
  name: string;
  email: string;
  feedbackType: string;
  message: string;
  timestamp: string;
}

interface UserWithUsage {
  email: string;
  usageCount: number;
  limit: number;
  resetDate?: string;
  hasRequestedMoreUses?: boolean;
  loginCount?: number;
  lastLoginDate?: string;
}

const GET_ALL_USAGE_STATS_QUERY = `
  query GetAllUsageStats {
    getAllUsageStats {
      email
      usageCount
      limit
      resetDate
      hasRequestedMoreUses
      loginCount
      lastLoginDate
    }
  }
`;

function AdminPage() {
  const { user, isLoading } = useUser();
  const [usersWithUsage, setUsersWithUsage] = useState<UserWithUsage[] | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !isFeatureEnabled(user.email)) {
      router.replace('/404');
    }
    if (!isLoading && user && isFeatureEnabled(user.email)) {
      asyncFetch<{ getAllUsageStats: UserWithUsage[] }>(
        GET_ALL_USAGE_STATS_QUERY,
        {},
      )
        .then((data) => setUsersWithUsage(data.getAllUsageStats))
        .catch(() => setError('Failed to fetch users and usage stats'));
      fetch('/api/feedback/list')
        .then((res) => res.json())
        .then((data) => setFeedback(data.feedback))
        .catch(() => setError('Failed to fetch feedback'));
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && !isFeatureEnabled(user.email))) {
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4 gap-8">
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Admin Dashboard</h2>
          <p className="text-lg">
            Users & AI Usage (Weekly Limit: 25 generations)
          </p>
          {error ? (
            <span className="text-error">{error}</span>
          ) : usersWithUsage === null ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>AI Usage</th>
                    <th>AI Limit</th>
                    <th>AI Remaining</th>
                    <th>AI Reset Date</th>
                    <th>Requested More</th>
                    <th>Login Count</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {[...usersWithUsage]
                    .sort((a, b) => {
                      if (!a.lastLoginDate && !b.lastLoginDate) return 0;
                      if (!a.lastLoginDate) return 1;
                      if (!b.lastLoginDate) return -1;

                      return (
                        new Date(b.lastLoginDate).getTime() -
                        new Date(a.lastLoginDate).getTime()
                      );
                    })
                    .map((stat, i) => {
                      const remaining = stat.limit - stat.usageCount;
                      const nextResetDate = stat.resetDate
                        ? new Date(
                            new Date(stat.resetDate).getTime() +
                              7 * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString()
                        : 'Not set';

                      return (
                        <tr key={i}>
                          <td>{stat.email}</td>
                          <td>{stat.usageCount}</td>
                          <td>{stat.limit}</td>
                          <td
                            className={
                              remaining === 0 ? 'text-error font-bold' : ''
                            }
                          >
                            {remaining}
                          </td>
                          <td>{nextResetDate}</td>
                          <td>
                            {stat.hasRequestedMoreUses ? (
                              <span className="badge badge-warning">Yes</span>
                            ) : (
                              <span className="text-base-content/50">-</span>
                            )}
                          </td>
                          <td>{stat.loginCount ?? 0}</td>
                          <td>
                            {stat.lastLoginDate
                              ? new Date(stat.lastLoginDate).toLocaleString()
                              : 'Never'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Feedback</h2>
          {error ? (
            <span className="text-error">{error}</span>
          ) : feedback === null ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : feedback.length === 0 ? (
            <span>No feedback submitted yet.</span>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((f, i) => (
                    <tr key={i}>
                      <td>{f.name}</td>
                      <td>{f.email}</td>
                      <td>{f.feedbackType}</td>
                      <td className="max-w-xs whitespace-pre-wrap text-left">
                        {f.message}
                      </td>
                      <td>
                        {f.timestamp
                          ? new Date(f.timestamp).toLocaleString()
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
