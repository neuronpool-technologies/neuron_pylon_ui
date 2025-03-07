import moment from "moment";

export function convertNanosecondsToElapsedTime(
  timestampNanos: number
): string {
  // Validate the input timestamp
  if (
    timestampNanos === null ||
    timestampNanos === undefined ||
    typeof timestampNanos !== "number"
  ) {
    throw new Error("Invalid timestamp provided.");
  }

  // Convert nanoseconds to milliseconds
  const timestampMillis = Math.floor(timestampNanos / 1_000_000);

  // Create a moment object from the timestamp
  const pastMoment = moment(timestampMillis);

  // Get the current time
  const currentMoment = moment();

  // Calculate the difference in milliseconds
  const diffMillis = currentMoment.diff(pastMoment);

  // Create a duration from the difference
  const duration = moment.duration(diffMillis);

  // Determine whether to display in minutes, hours, or days
  if (duration.asDays() >= 1) {
    const days = Math.floor(duration.asDays());
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (duration.asHours() >= 1) {
    const hours = Math.floor(duration.asHours());
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else {
    const minutes = Math.floor(duration.asMinutes());
    // Handle cases where duration is less than a minute
    if (minutes <= 0) {
      return "just now";
    }
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
}

export function convertSecondsToDays(seconds: number): number {
  const days = moment.duration(seconds, "seconds").asDays();
  return days;
}

export const convertDaysToMonthsAndYears = (days: number): string => {
  if (days === 184) return "6 months";
  if (days >= 2922) return "8 years";

  const daysPerYear = 365.2425; // Average Gregorian year length
  const daysPerMonth = daysPerYear / 12; // Approx. 30.436875 days per month

  const years = Math.floor(days / daysPerYear);
  const remainingDaysAfterYears = days % daysPerYear;

  const months = Math.floor(remainingDaysAfterYears / daysPerMonth);
  const remainingDays = Math.round(remainingDaysAfterYears % daysPerMonth);

  let result = "";

  if (years > 0) {
    result += `${years} year${years > 1 ? "s" : ""}, `;
  }

  if (months > 0) {
    result += `${months} month${months > 1 ? "s" : ""}, `;
  }

  if (remainingDays > 0) {
    result += `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
  }

  return result.replace(/,\s*$/, "");
};

export function calculateTimeUntilTimestamp(timestampSeconds: number): string {
  // Get current timestamp in seconds
  const currentTimestampSeconds = Math.floor(Date.now() / 1000);
  
  // Calculate difference in seconds
  const diffSeconds = timestampSeconds - currentTimestampSeconds;
  
  // If the timestamp is in the past, return "0 days"
  if (diffSeconds <= 0) {
    return "0 days";
  }
  
  // Convert seconds to days
  const diffDays = diffSeconds / (60 * 60 * 24);
  
  // Use the existing function to format the days into years, months, and days
  return convertDaysToMonthsAndYears(diffDays);
}
