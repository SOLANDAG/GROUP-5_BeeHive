import {
  BeeIntent,
  BeeResponse,
  BeeReplies,
  beeCancelBooking,
  beeCreateBooking,
  beeFindProviders,
  beeGetLatestBooking,
  beeGetUpcomingBookings,
  beeRescheduleLatestBooking,
  extractProviderKeyword,
  formatBookingSummary,
  formatServiceList,
  normalizeText,
  parseScheduleFromText,
} from "./bee";

function detectIntent(text: string): BeeIntent {
  const msg = normalizeText(text);

  if (
    msg.includes("schedule") ||
    msg.includes("calendar") ||
    msg.includes("my bookings") ||
    msg.includes("show bookings") ||
    msg.includes("show my schedule")
  ) {
    return "view_schedule";
  }

  if (
    msg.includes("cancel") &&
    msg.includes("booking")
  ) {
    return "cancel_booking";
  }

  if (
    msg.includes("cancel my latest") ||
    msg.includes("cancel latest booking")
  ) {
    return "cancel_booking";
  }

  if (
    msg.includes("reschedule") ||
    msg.includes("change booking") ||
    msg.includes("move my booking")
  ) {
    return "reschedule_booking";
  }

  if (
    msg.includes("book") ||
    msg.includes("appointment") ||
    msg.includes("make booking")
  ) {
    return "book_appointment";
  }

  if (
    msg.includes("provider") ||
    msg.includes("providers") ||
    msg.includes("service") ||
    msg.includes("services")
  ) {
    return "find_providers";
  }

  if (
    msg.includes("help") ||
    msg.includes("what can you do") ||
    msg.includes("what do you do")
  ) {
    return "help";
  }

  return "unknown";
}

async function handleViewSchedule(): Promise<BeeResponse> {
  const bookings = await beeGetUpcomingBookings();

  if (!bookings.length) {
    return {
      intent: "view_schedule",
      reply: "You do not have any bookings yet. I will still open your schedule so you can check your calendar.",
    };
  }

  const upcoming = bookings
    .filter((booking) => booking.status !== "cancelled")
    .slice(0, 3);

  if (!upcoming.length) {
    return {
      intent: "view_schedule",
      reply: "Your recent bookings are currently cancelled or completed. I will open your schedule so you can review them.",
    };
  }

  const summary = upcoming.map(formatBookingSummary).join("\n");

  return {
    intent: "view_schedule",
    reply: `Here is your schedule summary:\n${summary}\n\nI will open your calendar for you.`,
  };
}

async function handleFindProviders(message: string): Promise<BeeResponse> {
  const keyword = extractProviderKeyword(message);
  const providers = await beeFindProviders(keyword);

  if (!providers.length) {
    if (keyword) {
      return {
        intent: "find_providers",
        reply: `I could not find providers for "${keyword}" right now. Try a broader keyword like cleaning, repair, salon, tutor, or photographer.`,
      };
    }

    return {
      intent: "find_providers",
      reply: "I could not find providers right now. Please make sure providers have been approved and saved in the services collection.",
    };
  }

  const label = keyword ? ` for "${keyword}"` : "";
  const summary = formatServiceList(providers);

  return {
    intent: "find_providers",
    reply: `I found these providers${label}:\n${summary}\n\nYou can open a provider chat and send a booking request.`,
  };
}

async function handleBookAppointment(message: string): Promise<BeeResponse> {
  const keyword = extractProviderKeyword(message);
  const { date, time } = parseScheduleFromText(message);

  const providers = await beeFindProviders(keyword);

  if (!providers.length) {
    return {
      intent: "book_appointment",
      reply: "I could not find a matching provider for that booking request. Try something like: book cleaning tomorrow 3 PM.",
    };
  }

  const selectedProvider = providers[0];
  const bookingId = await beeCreateBooking(selectedProvider);

  if (!bookingId) {
    return {
      intent: "book_appointment",
      reply: "You need to be logged in before I can create a booking.",
    };
  }

  if (date && time) {
    await import("./bee").then(async ({ beeAddToSchedule }) => {
      await beeAddToSchedule(bookingId, date, time);
    });

    return {
      intent: "book_appointment",
      reply: `Your booking request for ${selectedProvider.businessName || "the provider"} has been created and added to your schedule on ${date} at ${time}.`,
    };
  }

  return {
    intent: "book_appointment",
    reply: `I created a booking request for ${selectedProvider.businessName || "the provider"}, but I still need a clear date and time. Try: reschedule my latest booking to 2026-03-20 4 PM.`,
  };
}

async function handleCancelBooking(): Promise<BeeResponse> {
  const latest = await beeGetLatestBooking();

  if (!latest) {
    return {
      intent: "cancel_booking",
      reply: "You do not have any booking to cancel yet.",
    };
  }

  await beeCancelBooking(latest.id);

  return {
    intent: "cancel_booking",
    reply: `Your latest booking has been cancelled.\n${formatBookingSummary(latest)}`,
  };
}

async function handleRescheduleBooking(message: string): Promise<BeeResponse> {
  const { date, time } = parseScheduleFromText(message);

  if (!date || !time) {
    return {
      intent: "reschedule_booking",
      reply: "Please include both a date and time. Example: reschedule my latest booking to 2026-03-20 4 PM.",
    };
  }

  const updatedId = await beeRescheduleLatestBooking(date, time);

  if (!updatedId) {
    return {
      intent: "reschedule_booking",
      reply: "I could not find any booking to reschedule.",
    };
  }

  return {
    intent: "reschedule_booking",
    reply: `Your latest booking has been rescheduled to ${date} at ${time}.`,
  };
}

export async function executeBeeCommand(
  message: string
): Promise<BeeResponse> {
  const intent = detectIntent(message);

  switch (intent) {
    case "view_schedule":
      return handleViewSchedule();

    case "find_providers":
      return handleFindProviders(message);

    case "book_appointment":
      return handleBookAppointment(message);

    case "cancel_booking":
      return handleCancelBooking();

    case "reschedule_booking":
      return handleRescheduleBooking(message);

    case "help":
      return {
        intent: "help",
        reply: BeeReplies.help,
      };

    default:
      return {
        intent: "unknown",
        reply: BeeReplies.unknown,
      };
  }
}