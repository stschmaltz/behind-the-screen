import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UserObject } from '../types/user';
import { isFeatureEnabled } from '../lib/featureFlags';

interface Feedback {
  name: string;
  email: string;
  feedbackType: string;
  message: string;
  timestamp: string;
}

function AdminPage() {
  const { user, isLoading } = useUser();
  const [users, setUsers] = useState<UserObject[] | null>(null);
  const [feedback, setFeedback] = useState<Feedback[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !isFeatureEnabled(user.email)) {
      router.replace('/404');
    }
    if (!isLoading && user && isFeatureEnabled(user.email)) {
      fetch('/api/user/list')
        .then((res) => res.json())
        .then((data) => setUsers(data.users))
        .catch(() => setError('Failed to fetch users'));
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
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl mb-8">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Admin Dashboard</h2>
          <p className="text-lg">User List</p>
          {error ? (
            <span className="text-error">{error}</span>
          ) : users === null ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
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
