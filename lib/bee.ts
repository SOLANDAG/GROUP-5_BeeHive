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

export type BeeService = {
  id: string;
  providerId?: string;
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
  scheduledDate?: string;
  scheduledTime?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export async function beeFindProviders(search?: string): Promise<BeeService[]> {
  const snap = await getDocs(collection(db, "services"));

  if (snap.empty) return [];

  const services: BeeService[] = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<BeeService, "id">),
  }));

  const activeServices = services.filter((service) => service.isActive !== false);

  if (!search?.trim()) {
    return activeServices;
  }

  const keyword = normalizeText(search);

  return activeServices.filter((service) => {
    const businessName = normalizeText(service.businessName || "");
    const category = normalizeText(service.category || "");
    const description = normalizeText(service.description || "");
    const location = normalizeText(service.location || "");

    return (
      businessName.includes(keyword) ||
      category.includes(keyword) ||
      description.includes(keyword) ||
      location.includes(keyword)
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
    status: "pending",
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
    const left = `${a.scheduledDate || ""} ${a.scheduledTime || ""}`;
    const right = `${b.scheduledDate || ""} ${b.scheduledTime || ""}`;
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