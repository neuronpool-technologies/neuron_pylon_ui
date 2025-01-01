import moment from "moment";

export function e8sToIcp(x: number): number {
  if (!x) return 0;
  return x / Math.pow(10, 8);
}

export function icpToE8s(x: number): bigint {
  try {
    return BigInt(Math.round(x * 100000000));
  } catch (e) {
    return 0n;
  }
}

export function convertSecondsToDays(seconds: number): number {
  const days = moment.duration(seconds, "seconds").asDays();
  return days;
}

export function convertNanosecondsToDays(nanoseconds: number): number {
  const seconds = nanoseconds / 1e9;
  const days = moment.duration(seconds, "seconds").asDays();
  return days;
}

export function convertNanoToFormattedDate(
  timestampNanos: number,
  format: string = "MMM DD, HH:mm"
): string {
  // Convert nanoseconds to milliseconds
  const timestampMillis = Math.floor(timestampNanos / 1_000_000);

  // Create a moment object from the milliseconds
  const momentDate = moment(timestampMillis);

  // Format the date as needed
  return momentDate.format(format);
}

export function convertSecondsToFormattedDate(
  timestampSeconds: number,
  format: string = "MMM DD, YYYY"
): string {
  // Convert seconds to milliseconds
  const timestampMillis = Math.floor(timestampSeconds * 1_000);

  // Create a moment object from the milliseconds
  const momentDate = moment(timestampMillis);

  // Format the date as needed
  return momentDate.format(format);
}

export function convertSecondsToDaysOrHours(seconds: number): string {
  const duration = moment.duration(seconds, "seconds");

  if (duration.asDays() <= 1) {
    // If less than or equal to one day, return hours
    const hours = duration.asHours();
    // Check if it's exactly 1 hour to adjust the unit
    return hours <= 1
      ? `${Math.ceil(hours)} hour`
      : `${Math.ceil(hours)} hours`;
  } else {
    // Otherwise, return days
    return `${Math.ceil(duration.asDays())} days`;
  }
}

export function deepConvertToString(obj: Record<string, any>) {
  // Base case: if obj is already a primitive type
  if (obj === null || typeof obj !== "object") {
    return String(obj);
  }

  if (obj && obj._isPrincipal) {
    return obj.toString();
  }

  // Special case: Array
  if (Array.isArray(obj)) {
    return obj.map(deepConvertToString);
  }

  // Recursive case: object
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    newObj[key] = deepConvertToString(value);
  }

  return newObj;
}

export const daysToMonthsAndYears = (days: number): string => {
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
