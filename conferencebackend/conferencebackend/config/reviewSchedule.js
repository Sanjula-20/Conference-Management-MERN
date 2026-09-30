const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

// Live conference schedule. Change these environment variables if needed.
export const getReviewDeadlineMinutes = () =>
  positiveInteger(process.env.REVIEW_DEADLINE_MINUTES, 7 * 24 * 60);

export const getReviewReminderLeadMinutes = () =>
  positiveInteger(process.env.REVIEW_REMINDER_LEAD_MINUTES, 2 * 24 * 60);

export const getReviewReminderCheckIntervalMs = () =>
  positiveInteger(process.env.REVIEW_REMINDER_CHECK_INTERVAL_MS, 60 * 60 * 1000);
