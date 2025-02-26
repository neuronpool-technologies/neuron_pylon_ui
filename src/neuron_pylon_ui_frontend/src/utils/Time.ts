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