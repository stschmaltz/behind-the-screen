import React, { useState } from 'react';
import { showDaisyToast } from '../../lib/daisy-toast';
import { logger } from '../../lib/logger';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  userName = 'Adventurer',
}) => {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      showDaisyToast('error', 'Please select if you like the app or not');

      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          allowContact: false,
          feedbackType: rating === 'positive' ? 'feature' : 'bug',
          message: `Post-encounter feedback (${rating}): ${feedback || 'No additional comments'}`,
        }),
      });

      if (response.ok) {
        showDaisyToast('success', 'Thank you for your feedback!');
        onClose();
        resetForm();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      logger.error('Error submitting feedback:', error);
      showDaisyToast('error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setRating(null);
    setFeedback('');
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">How was your encounter?</h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm mb-3">Do you like using Behind the Screen?</p>
            <div className="flex gap-2 justify-center">
              <button
                className={`btn flex-1 ${rating === 'positive' ? 'btn-success' : 'btn-outline'}`}
                onClick={() => setRating('positive')}
                disabled={isSubmitting}
              >
                👍 Yes!
              </button>
              <button
                className={`btn flex-1 ${rating === 'negative' ? 'btn-error' : 'btn-outline'}`}
                onClick={() => setRating('negative')}
                disabled={isSubmitting}
              >
                👎 Not really
              </button>
            </div>
          </div>

          {rating && (
            <div className="fade-in">
              <label className="label">
                <span className="label-text">
                  {rating === 'positive'
                    ? 'What do you like? Any suggestions?'
                    : 'What can we improve?'}
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Your feedback helps us improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </button>
          {rating && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleSkip} disabled={isSubmitting}>
          close
        </button>
      </form>
    </dialog>
  );
};

export default FeedbackModal;
