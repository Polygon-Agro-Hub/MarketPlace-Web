// utils/schedule.ts
export const dayOptions = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const validPeriodOptions = Array.from({ length: 11 }, (_, i) => {
  const week = i + 2;
  const padded = String(week).padStart(2, "0");
  return { value: padded, label: `${padded} weeks` };
});

export const dayNameToIndex: Record<string, number> = {
  Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6,
};

export const TIME_SLOT_OPTIONS = [
  { value: "08:00 AM - 12:00 PM", label: "08:00 AM - 12:00 PM" },
  { value: "12:00 PM - 04:00 PM", label: "12:00 PM - 04:00 PM" },
  { value: "04:00 PM - 09:00 PM", label: "04:00 PM - 09:00 PM" },
];

export const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Ms", label: "Ms" },
  { value: "Mrs", label: "Mrs" },
  { value: "Rev", label: "Rev" },
];

export const BUILDING_TYPE_OPTIONS = [
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
];

export const getMinDeliveryDate = (): Date => {
  const now = new Date();
  const extraDays = now.getHours() >= 18 ? 4 : 3;
  const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + extraDays);
  minDate.setHours(0, 0, 0, 0);
  return minDate;
};

export const getMinDateStr = (): string => {
  const d = getMinDeliveryDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Before 6 PM: 3 days out minimum. After 6 PM: 4 days out, pushed off weekends.
export const getMinRecurringDate = (): Date => {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  base.setHours(0, 0, 0, 0);
  const minDate = new Date(base);

  if (now.getHours() < 18) {
    minDate.setDate(minDate.getDate() + 3);
  } else {
    minDate.setDate(minDate.getDate() + 4);
    const dow = minDate.getDay();
    if (dow === 0) minDate.setDate(minDate.getDate() + 1);
    else if (dow === 6) minDate.setDate(minDate.getDate() + 2);
  }
  return minDate;
};

export const getFirstOccurrence = (dayCode: string, minDate: Date): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (dayNameToIndex[dayCode] - today.getDay() + 7) % 7;
  const occurrence = new Date(today);
  occurrence.setDate(occurrence.getDate() + diff);
  if (occurrence < minDate) occurrence.setDate(occurrence.getDate() + 7);
  return occurrence;
};

export const generateScheduledOrderDates = (
  scheduleType: string,
  selectedDays: string[],
  validPeriod: string,
): Date[] => {
  const weeks = parseInt(validPeriod, 10) || 0;
  const minDate = getMinRecurringDate();
  const dates: Date[] = [];

  const daysToUse =
    scheduleType === "Once a week" ? selectedDays.slice(0, 1) :
    scheduleType === "Twice a week" ? selectedDays :
    [];

  daysToUse.forEach((dayCode) => {
    const first = getFirstOccurrence(dayCode, minDate);
    for (let i = 0; i < weeks; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() + i * 7);
      dates.push(d);
    }
  });

  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates;
};

export const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export const formatOrderDate = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });