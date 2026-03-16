import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export type BeeIntent =
  | "view_schedule"
  | "find_providers"
  | "book_appointment"
  | "cancel_booking"
  | "reschedule_booking"
  | "help"
  | "unknown";

export type BeeResponse = {
  intent: BeeIntent;
  reply: string;
};

export type BeeService = {
  id: string;
  providerId?: string;
  applicationId?: string;
  businessName?: string;
  category?: string;
  description?: string;
  location?: string;
  price?: number;
  availableDays?: string[];
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
};

export type BeeBooking = {
  id: string;
  serviceId?: string;
  providerId?: string;
  customerId?: string;
  businessName?: string;
  category?: string;
  price?: number;
  status?: string;
  date?: string;
  time?: string;
  bookingDate?: string;
  bookingTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type BeeParsedSchedule = {
  date: string | null;
  time: string | null;
};

export const BeeReplies = {
  greeting:
    "Hi, I’m Bee. I can help you find providers, make bookings, check your schedule, cancel bookings, and reschedule appointments.",

  help:
    "You can ask me things like: show my schedule, find providers, find cleaning providers, book cleaning tomorrow 3 PM, cancel my latest booking, or reschedule my latest booking to 2026-03-20 4 PM.",

  unknown:
    "I’m not sure about that yet. Try asking about providers, bookings, or your schedule.",
};

export function normalizeText(value: string) {
  return String(value || "").trim().toLowerCase();
}

export function capitalizeWords(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseScheduleFromText(text: string): BeeParsedSchedule {
  const lower = normalizeText(text);

  let date: string | null = null;
  let time: string | null = null;

  const isoDateMatch = lower.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoDateMatch) {
    date = isoDateMatch[1];
  } else if (lower.includes("today")) {
    const now = new Date();
    date = toIsoDate(now);
  } else if (lower.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = toIsoDate(tomorrow);
  }

  const time12HrMatch = lower.match(
    /\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s?(am|pm)\b/
  );

  if (time12HrMatch) {
    const hour = Number(time12HrMatch[1]);
    const minute = time12HrMatch[2] ? Number(time12HrMatch[2]) : 0;
    const meridiem = time12HrMatch[3];

    let hour24 = hour;

    if (meridiem === "pm" && hour24 !== 12) {
      hour24 += 12;
    }

    if (meridiem === "am" && hour24 === 12) {
      hour24 = 0;
    }

    time = to12HourString(hour24, minute);
  } else {
    const time24HrMatch = lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);

    if (time24HrMatch) {
      const hour24 = Number(time24HrMatch[1]);
      const minute = Number(time24HrMatch[2]);
      time = to12HourString(hour24, minute);
    }
  }

  return { date, time };
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function to12HourString(hour24: number, minute: number) {
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  let hour = hour24 % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export function extractProviderKeyword(text: string) {
  const lower = normalizeText(text);

  const removablePhrases = [
    "find providers",
    "find provider",
    "search providers",
    "search provider",
    "show providers",
    "show provider",
    "find service",
    "find services",
    "book appointment",
    "book",
    "appointment",
    "provider",
    "providers",
    "service",
    "services",
    "please",
    "bee",
  ];

  let cleaned = lower;

  removablePhrases.forEach((phrase) => {
    cleaned = cleaned.replaceAll(phrase, " ");
  });

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

export async function beeGetServices(): Promise<BeeService[]> {
  const q = query(collection(db, "services"));
  const snap = await getDocs(q);

  if (snap.empty) {
    return [];
  }

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<BeeService, "id">),
  }));
}

export async function beeFindProviders(keyword?: string): Promise<BeeService[]> {
  const services = await beeGetServices();

  const activeServices = services.filter((service) => service.isActive !== false);

  if (!keyword || !keyword.trim()) {
    return activeServices;
  }

  const normalizedKeyword = normalizeText(keyword);

  return activeServices.filter((service) => {
    const businessName = normalizeText(service.businessName || "");
    const category = normalizeText(service.category || "");
    const description = normalizeText(service.description || "");
    const location = normalizeText(service.location || "");

    return (
      businessName.includes(normalizedKeyword) ||
      category.includes(normalizedKeyword) ||
      description.includes(normalizedKeyword) ||
      location.includes(normalizedKeyword)
    );
  });
}

export async function beeCreateBooking(service: BeeService) {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const bookingRef = await addDoc(collection(db, "bookings"), {
    serviceId: service.id ?? "",
    providerId: service.providerId ?? "",
    customerId: user.uid,
    businessName: service.businessName ?? "Service",
    category: service.category ?? "",
    price: service.price ?? 0,
    status: "pending",
    date: "",
    time: "",
    bookingDate: "",
    bookingTime: "",
    scheduledDate: "",
    scheduledTime: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return bookingRef.id;
}

export async function beeAddToSchedule(
  bookingId: string,
  date: string,
  time: string
) {
  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    date,
    time,
    bookingDate: date,
    bookingTime: time,
    scheduledDate: date,
    scheduledTime: time,
    updatedAt: serverTimestamp(),
  });
}

export async function beeGetUpcomingBookings(): Promise<BeeBooking[]> {
  const user = auth.currentUser;

  if (!user) {
    return [];
  }

  const q = query(
    collection(db, "bookings"),
    where("customerId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    return [];
  }

  const bookings: BeeBooking[] = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<BeeBooking, "id">),
  }));

  return bookings.sort((a, b) => {
    const left = `${a.date || a.bookingDate || a.scheduledDate || ""} ${a.time || a.bookingTime || a.scheduledTime || ""}`;
    const right = `${b.date || b.bookingDate || b.scheduledDate || ""} ${b.time || b.bookingTime || b.scheduledTime || ""}`;
    return left.localeCompare(right);
  });
}

export async function beeGetLatestBooking(): Promise<BeeBooking | null> {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const q = query(
    collection(db, "bookings"),
    where("customerId", "==", user.uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    return null;
  }

  const latest = snap.docs[0];

  return {
    id: latest.id,
    ...(latest.data() as Omit<BeeBooking, "id">),
  };
}

export async function beeCancelBooking(bookingId: string) {
  const bookingRef = doc(db, "bookings", bookingId);

  await updateDoc(bookingRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function beeRescheduleLatestBooking(date: string, time: string) {
  const latest = await beeGetLatestBooking();

  if (!latest) {
    return null;
  }

  await beeAddToSchedule(latest.id, date, time);

  return latest.id;
}

export function formatServiceList(services: BeeService[]) {
  if (!services.length) {
    return "I could not find any matching providers right now.";
  }

  const top = services.slice(0, 3);

  return top
    .map((service, index) => {
      const name = service.businessName || "Service";
      const category = service.category || "General";
      const price =
        typeof service.price === "number" ? ` - ₱${service.price}` : "";
      return `${index + 1}. ${name} (${category}${price})`;
    })
    .join("\n");
}

export function formatBookingSummary(booking: BeeBooking) {
  const businessName = booking.businessName || "Service";
  const date = booking.date || booking.bookingDate || booking.scheduledDate || "Date not set";
  const time = booking.time || booking.bookingTime || booking.scheduledTime || "Time not set";
  const status = booking.status || "pending";

  return `${businessName} on ${date} at ${time} (${status})`;
}