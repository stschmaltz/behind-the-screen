import { NextPage } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { logger } from '../lib/logger';

const FeedbackPage: NextPage = () => {
  const [name, setName] = useState('');
  const [allowContact, setAllowContact] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feature');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          allowContact,
          feedbackType,
          message,
        }),
      });

      if (response.ok) {
        // Track feedback submitted event
        posthog.capture('feedback_submitted', {
          feedback_type: feedbackType,
          allows_contact: allowContact,
          message_length: message.length,
        });

        setIsSubmitted(true);
        setName('');
        setAllowContact(false);
        setFeedbackType('feature');
        setMessage('');
      } else {
        const data = await response.json();
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to send feedback. Please try again later.');
      logger.error('Feedback submission error:', err);
      posthog.captureException(err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-base-100 min-h-screen p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Feedback</h1>

      {isSubmitted ? (
        <div className="bg-success text-success-content rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Thank You!</h2>
          <p className="mb-6">
            Your feedback has been submitted successfully and emailed to the
            developer. Thanks for helping make Dungeon Master Essentials better!
          </p>
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <p className="mb-6 text-center">
            I&apos;d love to hear your thoughts on Dungeon Master Essentials.
            Your feedback will help shape the future of this app!
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                />
                <span className="label-text">
                  <span className="font-semibold">(Optional)</span> I&apos;m
                  okay with being emailed for more details if needed
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Feedback Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                required
              >
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Your Feedback</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Please describe your feedback, suggestion, or the issue you're experiencing..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                  Sending...
                </>
              ) : (
                'Send Feedback'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
