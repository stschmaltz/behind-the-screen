import { useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import { useCurrentUserContext } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { darkThemes, themeDisplayNames } from '../components/theme-options';

const AccountSettingsPage: NextPage = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUserContext();
  const { theme: currentTheme, setTheme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmValue, setConfirmValue] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common themes to show at the top
  const commonThemes = ['light', 'dark', 'cupcake', 'cyberpunk'];

  // All other themes
  const additionalThemes = [
    'acid',
    'autumn',
    'business',
    'dim',
    'dracula',
    'emerald',
    'fantasy',
    'garden',
    'halloween',
    'lemonade',
    'night',
    'nord',
    'pastel',
    'retro',
    'sunset',
    'synthwave',
    'valentine',
    'winter',
  ].sort((a, b) => {
    const nameA = themeDisplayNames[a]?.toLowerCase() || a;
    const nameB = themeDisplayNames[b]?.toLowerCase() || b;

    return nameA.localeCompare(nameB);
  });

  const handleOpenDeleteModal = () => {
    setShowDeleteConfirmation(true);
    setConfirmValue('');
    setError('');
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmation(false);
    setConfirmValue('');
    setError('');
  };

  const handleDeleteAccount = async () => {
    if (confirmValue.toLowerCase() !== 'delete') {
      setError('Please type "delete" to confirm');

      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      setSuccess('Account deleted successfully. Logging out...');

      setTimeout(() => {
        router.push('/api/auth/logout');
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Account Settings - DM Essentials</title>
      </Head>
      <div className="container px-4 py-8 mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Personal Information</h2>
            {currentUser && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm opacity-70">Email</span>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Appearance</h2>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Theme</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-2 mb-4">
                {commonThemes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setTheme(theme)}
                    className={`btn btn-xs font-medium items-center justify-start text-left border-2 focus:ring-2 focus:ring-primary/30 hover:ring-2 hover:ring-primary/20 transition-colors duration-100 ${
                      currentTheme === theme
                        ? 'bg-primary text-primary-content border-primary'
                        : darkThemes.has(theme)
                          ? 'bg-gray-600 text-white border-gray-500'
                          : 'bg-gray-100 text-gray-900 border-gray-200'
                    }`}
                  >
                    <span className="flex flex-row items-center gap-2">
                      {darkThemes.has(theme) ? (
                        <span title="Dark theme">🌙</span>
                      ) : (
                        <span title="Light theme">☀️</span>
                      )}
                      {themeDisplayNames[theme] || theme}
                    </span>
                  </button>
                ))}
              </div>
              <details className="collapse collapse-arrow bg-base-100">
                <summary className="collapse-title font-medium">
                  More themes
                </summary>
                <div className="collapse-content">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
                    {additionalThemes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setTheme(theme)}
                        className={`btn btn-xs font-medium items-center justify-start text-left border-2 focus:ring-2 focus:ring-primary/30 hover:ring-2 hover:ring-primary/20 transition-colors duration-100 ${
                          currentTheme === theme
                            ? 'bg-primary text-primary-content border-primary'
                            : darkThemes.has(theme)
                              ? 'bg-gray-600 text-white border-gray-500'
                              : 'bg-gray-100 text-gray-900 border-gray-200'
                        }`}
                      >
                        <span className="flex flex-row items-center gap-2">
                          {darkThemes.has(theme) ? (
                            <span title="Dark theme">🌙</span>
                          ) : (
                            <span title="Light theme">☀️</span>
                          )}
                          {themeDisplayNames[theme] || theme}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="card bg-error text-error-content shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Danger Zone</h2>
            <p className="mb-4">
              Deleting your account will permanently remove all your data from
              our systems. This action cannot be undone.
            </p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleOpenDeleteModal}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {showDeleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Delete Account</h3>
              <p className="py-4">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently removed.
              </p>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Type &quot;delete&quot; to confirm:
                  </span>
                </label>
                <input
                  type="text"
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="delete"
                />
                {error && <p className="text-error mt-2">{error}</p>}
                {success && <p className="text-success mt-2">{success}</p>}
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-outline"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleDeleteAccount}
                  disabled={
                    isDeleting || confirmValue.toLowerCase() !== 'delete'
                  }
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountSettingsPage;
