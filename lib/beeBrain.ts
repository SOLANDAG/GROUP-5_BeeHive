import { askBee } from "@/lib/ai";
import {
  beeAddToSchedule,
  beeCancelBooking,
  beeCreateBooking,
  beeFindProviders,
  beeGetUpcomingBookings,
  beeRescheduleLatestBooking,
  type BeeBooking,
  type BeeService,
} from "@/lib/bee";

export type BeeMessage = {
  role: "user" | "assistant";
  text: string;
};

export type BeeIntent =
  | "find_providers"
  | "book_service"
  | "view_schedule"
  | "cancel_booking"
  | "reschedule_booking"
  | "general";

export type BeeActionResult = {
  reply: string;
  intent: BeeIntent;
  providers?: BeeService[];
  bookings?: BeeBooking[];
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function detectIntent(input: string): BeeIntent {
  const text = normalize(input);

  if (
    includesAny(text, [
      "find provider",
      "find providers",
      "provider",
      "providers",
      "service",
      "services",
      "available provider",
      "available providers",
    ])
  ) {
    return "find_providers";
  }

  if (
    includesAny(text, [
      "book",
      "booking",
      "schedule me",
      "make appointment",
      "create booking",
      "appoint",
    ])
  ) {
    return "book_service";
  }

  if (
    includesAny(text, [
      "my schedule",
      "view schedule",
      "show schedule",
      "upcoming",
      "appointments",
      "calendar",
    ])
  ) {
    return "view_schedule";
  }

  if (
    includesAny(text, [
      "cancel booking",
      "cancel appointment",
      "cancel my booking",
      "cancel my appointment",
    ])
  ) {
    return "cancel_booking";
  }

  if (
    includesAny(text, [
      "reschedule",
      "move my booking",
      "change my booking",
      "change schedule",
    ])
  ) {
    return "reschedule_booking";
  }

  return "general";
}

function extractServiceKeyword(input: string) {
  const text = normalize(input);

  const fillers = [
    "find",
    "provider",
    "providers",
    "service",
    "services",
    "book",
    "booking",
    "appointment",
    "schedule",
    "for",
    "me",
    "a",
    "an",
    "the",
    "please",
  ];

  const cleaned = text
    .replace(/[.,!?]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !fillers.includes(word))
    .join(" ")
    .trim();

  return cleaned;
}

function extractDate(input: string) {
  const text = normalize(input);

  if (text.includes("today")) {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  if (text.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  }

  const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    return isoMatch[1];
  }

  return "";
}

function extractTime(input: string) {
  const text = input.trim();

  const exactTime = text.match(
    /\b(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM|am|pm)\b/
  );
  if (exactTime) {
    return `${exactTime[1]}:${exactTime[2]} ${exactTime[3].toUpperCase()}`;
  }

  const hourOnly = text.match(/\b(1[0-2]|0?[1-9])\s?(AM|PM|am|pm)\b/);
  if (hourOnly) {
    return `${hourOnly[1]}:00 ${hourOnly[2].toUpperCase()}`;
  }

  if (normalize(input).includes("morning")) return "9:00 AM";
  if (normalize(input).includes("afternoon")) return "2:00 PM";
  if (normalize(input).includes("evening")) return "6:00 PM";

  return "";
}

function formatProviders(providers: BeeService[]) {
  return providers
    .slice(0, 5)
    .map((provider, index) => {
      const name = provider.businessName || "Unnamed Provider";
      const category = provider.category ? ` — ${provider.category}` : "";
      return `${index + 1}. ${name}${category}`;
    })
    .join("\n");
}

function formatBookings(bookings: BeeBooking[]) {
  return bookings
    .slice(0, 5)
    .map((booking, index) => {
      const name = booking.businessName || "Appointment";
      const date = booking.scheduledDate || "No date yet";
      const time = booking.scheduledTime || "No time yet";
      const status = booking.status || "pending";
      return `${index + 1}. ${name} • ${date} • ${time} • ${status}`;
    })
    .join("\n");
}

export async function executeBeeCommand(input: string): Promise<BeeActionResult> {
  const intent = detectIntent(input);

  if (intent === "find_providers") {
    const keyword = extractServiceKeyword(input);
    const providers = await beeFindProviders(keyword);

    if (!providers.length) {
      return {
        intent,
        providers: [],
        reply:
          keyword
            ? `I couldn't find providers matching "${keyword}" right now. Try another keyword or tap Book Appointment to continue.`
            : "I couldn't find any active providers right now.",
      };
    }

    return {
      intent,
      providers,
      reply: `Here are the available providers I found:\n\n${formatProviders(
        providers
      )}`,
    };
  }

  if (intent === "book_service") {
    const keyword = extractServiceKeyword(input);
    const date = extractDate(input);
    const time = extractTime(input);

    if (!keyword) {
      return {
        intent,
        reply:
          "I can book that for you. Please tell me the service you want, like cleaning, makeup, tutoring, or repair.",
      };
    }

    const providers = await beeFindProviders(keyword);

    if (!providers.length) {
      return {
        intent,
        providers: [],
        reply: `I couldn't find a provider for "${keyword}" right now.`,
      };
    }

    if (!date || !time) {
      return {
        intent,
        providers,
        reply:
          `I found provider options for "${keyword}".\n\n${formatProviders(
            providers
          )}\n\nTo complete the booking, send a date and time like:\nBook ${keyword} tomorrow 3 PM`,
      };
    }

    const chosen = providers[0];
    const bookingId = await beeCreateBooking(chosen);

    if (!bookingId) {
      return {
        intent,
        providers,
        reply:
          "I couldn't create the booking right now. Please make sure you're logged in and try again.",
      };
    }

    await beeAddToSchedule(bookingId, date, time);

    return {
      intent,
      providers,
      reply: `You're booked with ${
        chosen.businessName || "the provider"
      } on ${date} at ${time}. I also added it to your schedule.`,
    };
  }

  if (intent === "view_schedule") {
    const bookings = await beeGetUpcomingBookings();

    if (!bookings.length) {
      return {
        intent,
        bookings: [],
        reply: "You don't have any bookings yet.",
      };
    }

    return {
      intent,
      bookings,
      reply: `Here are your bookings:\n\n${formatBookings(bookings)}`,
    };
  }

  if (intent === "cancel_booking") {
    const bookings = await beeGetUpcomingBookings();

    if (!bookings.length) {
      return {
        intent,
        bookings: [],
        reply: "You don't have any bookings to cancel.",
      };
    }

    const latest = bookings[0];

    await beeCancelBooking(latest.id);

    return {
      intent,
      bookings,
      reply: `Your latest booking with ${
        latest.businessName || "the provider"
      } has been cancelled.`,
    };
  }

  if (intent === "reschedule_booking") {
    const date = extractDate(input);
    const time = extractTime(input);

    if (!date || !time) {
      return {
        intent,
        reply:
          "Please tell me the new date and time, like: reschedule my booking to tomorrow 4 PM",
      };
    }

    const result = await beeRescheduleLatestBooking(date, time);

    if (!result) {
      return {
        intent,
        reply: "I couldn't find a booking to reschedule.",
      };
    }

    return {
      intent,
      reply: `Your latest booking has been moved to ${date} at ${time}.`,
    };
  }

  const aiReply = await askBee(input);

  return {
    intent: "general",
    reply: aiReply,
  };
}