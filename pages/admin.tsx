import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function AdminPage() {
  const { user, isLoading } = useUser();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.email !== 'stschmaltz@gmail.com') {
      router.replace('/404');
    }
    if (!isLoading && user && user.email === 'stschmaltz@gmail.com') {
      fetch('/api/user/count')
        .then((res) => res.json())
        .then((data) => setUserCount(data.count))
        .catch(() => setError('Failed to fetch user count'));
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && user.email !== 'stschmaltz@gmail.com')) {
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
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Admin Dashboard</h2>
          <p className="text-lg">Total Users</p>
          {error ? (
            <span className="text-error">{error}</span>
          ) : userCount === null ? (
            <span className="loading loading-spinner loading-md"></span>
          ) : (
            <span className="text-4xl font-bold">{userCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
