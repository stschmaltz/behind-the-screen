import { useState, useCallback } from 'react';

const STORAGE_KEY = 'feedbackPrompt';
const COMPLETED_ENCOUNTERS_KEY = 'completedEncountersCount';
const PROMPT_FREQUENCY = 3; // Show feedback modal every 3 completed encounters

interface FeedbackPromptData {
  lastPromptDate?: string;
  timesDismissed: number;
  timesFeedbackGiven: number;
  permanentlyDismissed: boolean;
}

const getStoredData = (): FeedbackPromptData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading feedback prompt data:', error);
  }
  return {
    timesDismissed: 0,
    timesFeedbackGiven: 0,
    permanentlyDismissed: false,
  };
};

const saveStoredData = (data: FeedbackPromptData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving feedback prompt data:', error);
  }
};

const getCompletedCount = (): number => {
  try {
    const count = localStorage.getItem(COMPLETED_ENCOUNTERS_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error reading completed encounters count:', error);
    return 0;
  }
};

const incrementCompletedCount = (): number => {
  const newCount = getCompletedCount() + 1;
  try {
    localStorage.setItem(COMPLETED_ENCOUNTERS_KEY, newCount.toString());
  } catch (error) {
    console.error('Error saving completed encounters count:', error);
  }
  return newCount;
};

/**
 * Hook to manage feedback prompt display logic
 * Returns whether to show the feedback modal after encounter completion
 */
export const useFeedbackPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Check if we should show the feedback prompt
   * Call this after an encounter is completed
   */
  const checkShouldPrompt = useCallback((): boolean => {
    const data = getStoredData();

    // Don't show if permanently dismissed
    if (data.permanentlyDismissed) {
      return false;
    }

    // Don't show if user has given feedback 3+ times (they've been helpful enough!)
    if (data.timesFeedbackGiven >= 3) {
      return false;
    }

    // Increment completed encounter count
    const completedCount = incrementCompletedCount();

    // Show every PROMPT_FREQUENCY encounters
    const shouldShow = completedCount % PROMPT_FREQUENCY === 0;

    if (shouldShow) {
      setIsOpen(true);
      // Update last prompt date
      saveStoredData({
        ...data,
        lastPromptDate: new Date().toISOString(),
      });
    }

    return shouldShow;
  }, []);

  /**
   * Mark feedback as given
   */
  const markFeedbackGiven = useCallback(() => {
    const data = getStoredData();
    saveStoredData({
      ...data,
      timesFeedbackGiven: data.timesFeedbackGiven + 1,
    });
    setIsOpen(false);
  }, []);

  /**
   * Mark as dismissed without feedback
   */
  const markDismissed = useCallback(() => {
    const data = getStoredData();
    const newDismissCount = data.timesDismissed + 1;

    saveStoredData({
      ...data,
      timesDismissed: newDismissCount,
      // Permanently dismiss after 5 dismissals
      permanentlyDismissed: newDismissCount >= 5,
    });
    setIsOpen(false);
  }, []);

  /**
   * Close the modal (called on successful feedback submission)
   */
  const closeModal = useCallback(() => {
    markFeedbackGiven();
  }, [markFeedbackGiven]);

  /**
   * Skip/dismiss the modal
   */
  const skipModal = useCallback(() => {
    markDismissed();
  }, [markDismissed]);

  return {
    isOpen,
    checkShouldPrompt,
    closeModal,
    skipModal,
  };
};
