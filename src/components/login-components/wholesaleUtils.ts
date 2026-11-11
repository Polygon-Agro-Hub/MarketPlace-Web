const TZ = "Asia/Colombo";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Today -> "Today, 10:42 AM", otherwise "2:15 PM, 29th October"
export const formatReviewDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });

  const dayKey = (x: Date) =>
    x.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
  if (dayKey(d) === dayKey(new Date())) return `Today, ${time}`;

  const day = Number(
    d.toLocaleDateString("en-GB", { day: "numeric", timeZone: TZ }),
  );
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: TZ });
  return `${time}, ${ordinal(day)} ${month}`;
};