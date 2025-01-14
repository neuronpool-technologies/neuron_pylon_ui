import moment from "moment";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Account } from "@/declarations/neuron_pylon/neuron_pylon.did";

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

export function deepConvertToString(obj: Record<string, any>): any {
  // 1. Handle null
  if (obj === null) {
    return null;
  }

  // 2. Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(deepConvertToString);
  }

  // 3. Handle Principal-like objects
  if (obj && obj._isPrincipal) {
    return obj.toString();
  }

  // 4. Check the type
  const typeOfObj = typeof obj;

  // 5. Convert known non-serializable primitives to strings
  //    BigInt, function, symbol
  if (
    typeOfObj === "bigint" ||
    typeOfObj === "function" ||
    typeOfObj === "symbol"
  ) {
    return String(obj);
  }

  // 6. Recurse into plain objects
  if (typeOfObj === "object") {
    const newObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = deepConvertToString(value);
    }
    return newObj;
  }

  // 7. Return booleans, numbers, strings as-is
  return obj;
}

export const daysToMonthsAndYears = (days: number): string => {
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

export const stringToIcrcAccount = (account: string): Account => {
  const { owner, subaccount } = decodeIcrcAccount(account);

  return {
    owner,
    subaccount: subaccount ? [subaccount] : [],
  };
};

export const isAccountOkay = (account: string): boolean => {
  try {
    decodeIcrcAccount(account);
  } catch {
    return false;
  }

  return true;
};

export const isDelayOkay = (delay: number): boolean => {
  return delay >= 184 && delay <= 3000;
};

export const isNtnAmountInvalid = (balance: string, amount: string) => {
  return (
    (amount !== "" && icpToE8s(Number(amount)) <= 10_000) ||
    icpToE8s(Number(amount)) > Number(balance)
  );
};

export const e8sFeeToPercentage = (feeE8s: number): number => {
  return (feeE8s / 100_000_000) * 100;
};
