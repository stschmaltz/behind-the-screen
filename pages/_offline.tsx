import { NextPage } from 'next';

const OfflinePage: NextPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="max-w-md text-base-content/70">
        Encounter Manager needs an internet connection right now. Reconnect and
        this page will be ready to go.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        Try again
      </button>
    </div>
  );
};

export default OfflinePage;
