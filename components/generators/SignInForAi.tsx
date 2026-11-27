import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface SignInForAiProps {
  returnTo: string;
  isCheckingSession: boolean;
}

export const SignInForAi = ({
  returnTo,
  isCheckingSession,
}: SignInForAiProps) => {
  if (isCheckingSession) {
    return (
      <div className="flex items-center gap-3 py-1" aria-hidden="true">
        <div className="skeleton h-5 w-9 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-2.5 w-44" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 fade-in">
      <SparklesIcon className="h-5 w-5 shrink-0 text-primary" />
      <p className="flex-1 min-w-[12rem] text-sm text-base-content/80">
        You&apos;re using the free random generator.{' '}
        <span className="text-base-content/60">
          Sign in for AI-enhanced results tailored to your prompts.
        </span>
      </p>
      <Link
        href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
        className="btn btn-primary btn-sm"
      >
        Sign in free
      </Link>
    </div>
  );
};
