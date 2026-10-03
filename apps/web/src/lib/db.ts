/**
 * PILOT DATA LAYER — localStorage stand-in for the real API + Postgres.
 * Keep every function async so the swap is mechanical.
 *
 * Known limitation: data is per-browser only (no multi-device sync).
 */

import {
  availabilitySlots as sampleSlots,
  bookings as sampleBookings,
  professionals as sampleProfessionals,
  type CategoryId,
  type LanguageId,
  type Professional,
} from "@ethio-wellness/shared";
import { AUTO_APPROVE_PROFESSIONALS, defaultProfessionalStatus } from "@/lib/pro-approval";

const DB_KEY = "ayzon-db-v1";
const LEGACY_DB_KEY = "ethio-wellness-db-v1";

export type DbUserRole = "client" | "professional";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: DbUserRole;
  professionalId?: string;
  createdAt: string;
}

export interface DbProfessional {
  id: string;
  userId: string;
  slug: string;
  name: string;
  title: string;
  city: string;
  credentials: string;
  bio: string;
  practiceMore: string;
  languages: LanguageId[];
  specialties: CategoryId[];
  fee: number;
  avatarClass: `av-${number}`;
  initials: string;
  status: "pending" | "approved";
  rating?: number;
  reviewCount?: number;
}

export interface DbSlot {
  id: string;
  professionalId: string;
  dateIso: string;
  dayLabel: string;
  timeLabel: string;
  status: "open" | "closed" | "booked";
}

export interface DbBooking {
  id: string;
  clientId: string;
  professionalId: string;
  slotId: string;
  specialty: CategoryId;
  dateLabel: string;
  fee: number;
  status: "upcoming" | "cancelled" | "completed";
  createdAt: string;
  linkState?: "ready" | "pending";
  cancelledBy?: "client" | "professional";
}

export type ThemePref = "light" | "dark";

interface Store {
  version: 1;
  users: DbUser[];
  professionals: DbProfessional[];
  slots: DbSlot[];
  bookings: DbBooking[];
  sessionUserId: string | null;
  theme: ThemePref;
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDayChip(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function resolveSampleDayLabel(label: string, today: Date): string {
  const lower = label.toLowerCase();
  if (lower === "today") return toIsoDate(today);
  if (lower === "tomorrow") {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return toIsoDate(t);
  }
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const idx = weekdays.findIndex((day) => lower.startsWith(day));
  if (idx >= 0) {
    const result = new Date(today);
    const delta = (idx - result.getDay() + 7) % 7 || 7;
    result.setDate(result.getDate() + delta);
    return toIsoDate(result);
  }
  return toIsoDate(today);
}

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AZ"
  );
}

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function avatarForIndex(index: number): `av-${number}` {
  const n = (index % 10) + 1;
  return `av-${n}` as `av-${number}`;
}

function buildSeed(): Store {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users: DbUser[] = [];
  const professionals: DbProfessional[] = [];

  sampleProfessionals.forEach((pro, index) => {
    const email =
      pro.slug === "hana-tesfaye" ? "hana@example.com" : `${pro.slug.replace(/-/g, ".")}@example.com`;
    const userId = `user-${pro.slug}`;
    users.push({
      id: userId,
      name: pro.name,
      email,
      role: "professional",
      professionalId: pro.id,
      createdAt: nowIso(),
    });
    professionals.push({
      id: pro.id,
      userId,
      slug: pro.slug,
      name: pro.name,
      title: pro.title,
      city: pro.city,
      credentials: "",
      bio: pro.bio,
      practiceMore: "",
      languages: [...pro.languages],
      specialties: [...pro.specialties],
      fee: 25,
      avatarClass: pro.avatarClass,
      initials: pro.initials,
      status: pro.status === "pending" ? "pending" : "approved",
      rating: pro.rating,
      reviewCount: pro.reviewCount,
    });
    void index;
  });

  const abelId = "user-abel";
  users.push({
    id: abelId,
    name: "Abel Desta",
    email: "abel@example.com",
    role: "client",
    createdAt: nowIso(),
  });

  // Pilot demo accounts (login: "test client" / "test provider" — no password)
  const testClientId = "user-test-client";
  users.push({
    id: testClientId,
    name: "Test Client",
    email: "test.client@example.com",
    role: "client",
    createdAt: nowIso(),
  });

  const testProviderUserId = "user-test-provider";
  const testProviderProId = "pro-test-provider";
  users.push({
    id: testProviderUserId,
    name: "Test Provider",
    email: "test.provider@example.com",
    role: "professional",
    professionalId: testProviderProId,
    createdAt: nowIso(),
  });
  professionals.push({
    id: testProviderProId,
    userId: testProviderUserId,
    slug: "test-provider",
    name: "Test Provider",
    title: "Licensed Counselor",
    city: "Addis Ababa",
    credentials: "Demo credentials",
    bio: "Demo provider account for pilot testing. Book sessions and manage availability.",
    practiceMore: "",
    languages: ["amharic", "english"],
    specialties: ["individual-mental-health", "career-and-life-stress"],
    fee: 25,
    avatarClass: "av-3",
    initials: "TP",
    status: "approved",
    rating: 4.9,
    reviewCount: 12,
  });

  const slots: DbSlot[] = sampleSlots.map((slot) => {
    const dateIso = slot.date ?? resolveSampleDayLabel(slot.dayLabel, today);
    return {
      id: slot.id,
      professionalId: slot.professionalId,
      dateIso,
      dayLabel: formatDayChip(dateIso),
      timeLabel: slot.timeLabel,
      status: slot.status,
    };
  });

  const todayIso = toIsoDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = toIsoDate(tomorrow);
  slots.push(
    {
      id: "slot-test-provider-1",
      professionalId: testProviderProId,
      dateIso: todayIso,
      dayLabel: formatDayChip(todayIso),
      timeLabel: "4:00 PM",
      status: "open",
    },
    {
      id: "slot-test-provider-2",
      professionalId: testProviderProId,
      dateIso: tomorrowIso,
      dayLabel: formatDayChip(tomorrowIso),
      timeLabel: "10:00 AM",
      status: "open",
    },
    {
      id: "slot-test-provider-3",
      professionalId: testProviderProId,
      dateIso: tomorrowIso,
      dayLabel: formatDayChip(tomorrowIso),
      timeLabel: "2:00 PM",
      status: "booked",
    },
  );

  const bookings: DbBooking[] = sampleBookings.map((booking) => {
    const matchingSlot =
      slots.find(
        (slot) =>
          slot.professionalId === booking.professionalId &&
          booking.dateLabel.toLowerCase().includes(slot.timeLabel.toLowerCase().split(" ")[0] ?? ""),
      ) ?? slots.find((slot) => slot.professionalId === booking.professionalId);
    const status =
      booking.status === "past" ? "completed" : booking.status === "cancelled" ? "cancelled" : "upcoming";
    return {
      id: booking.id,
      clientId: booking.clientId === "client-abel" ? abelId : booking.clientId,
      professionalId: booking.professionalId,
      slotId: matchingSlot?.id ?? `slot-seed-${booking.id}`,
      specialty: booking.specialty,
      dateLabel: booking.dateLabel,
      fee: 25,
      status,
      createdAt: nowIso(),
      linkState: booking.linkState,
      cancelledBy: booking.cancelledBy,
    };
  });

  bookings.push({
    id: "booking-test-client-1",
    clientId: testClientId,
    professionalId: testProviderProId,
    slotId: "slot-test-provider-3",
    specialty: "individual-mental-health",
    dateLabel: `${formatDayChip(tomorrowIso)}, 2:00 PM`,
    fee: 25,
    status: "upcoming",
    createdAt: nowIso(),
    linkState: "ready",
  });
  bookings.push({
    id: "booking-test-client-2",
    clientId: testClientId,
    professionalId: "pro-hana-tesfaye",
    slotId: "slot-2",
    specialty: "individual-mental-health",
    dateLabel: "Sat Oct 3, 4:00 PM EAT",
    fee: 25,
    status: "upcoming",
    createdAt: nowIso(),
    linkState: "pending",
  });

  return {
    version: 1,
    users,
    professionals,
    slots,
    bookings,
    sessionUserId: null,
    theme: "light",
  };
}

function emptyStore(): Store {
  return {
    version: 1,
    users: [],
    professionals: [],
    slots: [],
    bookings: [],
    sessionUserId: null,
    theme: "light",
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** TEMP: flip pending → approved while auto-approve is on. */
function ensureAutoApprovedProfessionals(store: Store): boolean {
  if (!AUTO_APPROVE_PROFESSIONALS) return false;
  let changed = false;
  for (const pro of store.professionals) {
    if (pro.status === "pending") {
      pro.status = "approved";
      changed = true;
    }
  }
  return changed;
}

/** Inject pilot demo accounts into an existing store if they are missing. */
function ensureDemoAccountsInStore(store: Store): boolean {
  let changed = false;
  const hasClient = store.users.some((user) => user.id === "user-test-client");
  const hasProviderUser = store.users.some((user) => user.id === "user-test-provider");
  const hasProviderPro = store.professionals.some((pro) => pro.id === "pro-test-provider");
  if (hasClient && hasProviderUser && hasProviderPro) return false;

  const seeded = buildSeed();
  if (!hasClient) {
    const client = seeded.users.find((user) => user.id === "user-test-client");
    if (client) {
      store.users.push(client);
      changed = true;
    }
    for (const booking of seeded.bookings.filter((item) => item.clientId === "user-test-client")) {
      if (!store.bookings.some((item) => item.id === booking.id)) {
        store.bookings.push(booking);
        changed = true;
      }
    }
  }
  if (!hasProviderUser || !hasProviderPro) {
    const providerUser = seeded.users.find((user) => user.id === "user-test-provider");
    const providerPro = seeded.professionals.find((pro) => pro.id === "pro-test-provider");
    if (providerUser && !hasProviderUser) {
      store.users.push(providerUser);
      changed = true;
    }
    if (providerPro && !hasProviderPro) {
      store.professionals.push(providerPro);
      changed = true;
    }
    for (const slot of seeded.slots.filter((item) => item.professionalId === "pro-test-provider")) {
      if (!store.slots.some((item) => item.id === slot.id)) {
        store.slots.push(slot);
        changed = true;
      }
    }
    for (const booking of seeded.bookings.filter((item) => item.professionalId === "pro-test-provider")) {
      if (!store.bookings.some((item) => item.id === booking.id)) {
        store.bookings.push(booking);
        changed = true;
      }
    }
  }
  return changed;
}

function readStore(): Store {
  if (!canUseStorage()) return buildSeed();
  try {
    let raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem(LEGACY_DB_KEY);
      if (legacy) {
        window.localStorage.setItem(DB_KEY, legacy);
        raw = legacy;
      }
    }
    if (!raw) {
      const seeded = buildSeed();
      window.localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Store;
    if (parsed?.version !== 1 || !Array.isArray(parsed.users)) {
      const seeded = buildSeed();
      window.localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const store: Store = {
      ...emptyStore(),
      ...parsed,
      users: parsed.users ?? [],
      professionals: parsed.professionals ?? [],
      slots: parsed.slots ?? [],
      bookings: parsed.bookings ?? [],
      sessionUserId: parsed.sessionUserId ?? null,
      theme: parsed.theme === "dark" ? "dark" : "light",
    };
    const demoChanged = ensureDemoAccountsInStore(store);
    const approvedChanged = ensureAutoApprovedProfessionals(store);
    if (demoChanged || approvedChanged) {
      try {
        window.localStorage.setItem(DB_KEY, JSON.stringify(store));
      } catch {
        /* ignore */
      }
    }
    return store;
  } catch {
    const seeded = buildSeed();
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    } catch {
      /* ignore */
    }
    return seeded;
  }
}

function persist(store: Store) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota — keep in-memory seed behavior on next read */
  }
}

function mutate(fn: (store: Store) => void): Store {
  const store = readStore();
  fn(store);
  persist(store);
  return store;
}

/** FOUC / chrome theme script — keep localStorage access inside this module only. */
export const themeInitScript = `(function(){try{var raw=localStorage.getItem("${DB_KEY}")||localStorage.getItem("${LEGACY_DB_KEY}");var t="light";if(raw){var p=JSON.parse(raw);if(p&&p.theme==="dark")t="dark";}document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){}document.addEventListener("change",function(e){var el=e.target;if(!el||el.getAttribute("data-chrome")!=="theme")return;var v=el.value==="dark"?"dark":"light";document.documentElement.setAttribute("data-theme",v);document.documentElement.style.colorScheme=v;try{var raw2=localStorage.getItem("${DB_KEY}")||localStorage.getItem("${LEGACY_DB_KEY}");var store=raw2?JSON.parse(raw2):{version:1,users:[],professionals:[],slots:[],bookings:[],sessionUserId:null};store.theme=v;localStorage.setItem("${DB_KEY}",JSON.stringify(store));}catch(err){}},true);})();`;

export function formatFee(fee: number) {
  return `$${fee}`;
}

export function formatFeeExact(fee: number) {
  return `$${fee.toFixed(2)}`;
}

/** Map DB professional → shared card/list shape used by UI components. */
export function toCardProfessional(pro: DbProfessional, nextSlotLabel = ""): Professional {
  return {
    id: pro.id,
    slug: pro.slug,
    initials: pro.initials,
    avatarClass: pro.avatarClass,
    name: pro.name,
    title: pro.title || "Counselor",
    city: pro.city || "Ethiopia",
    languages: pro.languages,
    specialties: pro.specialties,
    rating: pro.rating ?? 5,
    reviewCount: pro.reviewCount ?? 0,
    nextSlotLabel: nextSlotLabel || "Check availability",
    bio: pro.bio,
    status: pro.status,
  };
}

export const db = {
  users: {
    async findByEmail(email: string): Promise<DbUser | undefined> {
      const key = email.trim().toLowerCase();
      return readStore().users.find((user) => user.email === key);
    },

    async findByName(name: string): Promise<DbUser | undefined> {
      const key = name.trim().toLowerCase().replace(/\s+/g, " ");
      return readStore().users.find((user) => user.name.trim().toLowerCase() === key);
    },

    async getById(id: string): Promise<DbUser | undefined> {
      return readStore().users.find((user) => user.id === id);
    },

    async create(input: {
      name: string;
      email: string;
      role: DbUserRole;
      professionalId?: string;
    }): Promise<DbUser> {
      const email = input.email.trim().toLowerCase();
      const existing = await db.users.findByEmail(email);
      if (existing) return existing;
      const user: DbUser = {
        id: id("user"),
        name: input.name.trim() || email.split("@")[0] || "Member",
        email,
        role: input.role,
        professionalId: input.professionalId,
        createdAt: nowIso(),
      };
      mutate((store) => {
        store.users.push(user);
      });
      return user;
    },

    async update(userId: string, patch: Partial<Pick<DbUser, "name" | "professionalId" | "role">>) {
      let updated: DbUser | undefined;
      mutate((store) => {
        const user = store.users.find((item) => item.id === userId);
        if (!user) return;
        Object.assign(user, patch);
        updated = user;
      });
      return updated;
    },
  },

  professionals: {
    async create(input: {
      userId: string;
      name: string;
      title?: string;
      city?: string;
      credentials?: string;
      bio?: string;
      practiceMore?: string;
      languages?: LanguageId[];
      specialties?: CategoryId[];
      fee?: number;
      status?: "pending" | "approved";
    }): Promise<DbProfessional> {
      const store = readStore();
      const count = store.professionals.length;
      const slugBase = slugFromName(input.name) || `pro-${count + 1}`;
      let slug = slugBase;
      let n = 2;
      while (store.professionals.some((pro) => pro.slug === slug)) {
        slug = `${slugBase}-${n++}`;
      }
      const proId = id("pro");
      const pro: DbProfessional = {
        id: proId,
        userId: input.userId,
        slug,
        name: input.name,
        title: input.title ?? "",
        city: input.city ?? "",
        credentials: input.credentials ?? "",
        bio: input.bio ?? "",
        practiceMore: input.practiceMore ?? "",
        languages: input.languages ?? [],
        specialties: input.specialties ?? [],
        fee: input.fee ?? 25,
        avatarClass: avatarForIndex(count),
        initials: initialsFromName(input.name),
        status: input.status ?? defaultProfessionalStatus(),
      };
      mutate((s) => {
        s.professionals.push(pro);
        const user = s.users.find((u) => u.id === input.userId);
        if (user) {
          user.role = "professional";
          user.professionalId = pro.id;
        }
      });
      return pro;
    },

    async update(professionalId: string, patch: Partial<Omit<DbProfessional, "id" | "userId">>) {
      let updated: DbProfessional | undefined;
      mutate((store) => {
        const pro = store.professionals.find((item) => item.id === professionalId);
        if (!pro) return;
        Object.assign(pro, patch);
        if (patch.name) pro.initials = initialsFromName(patch.name);
        updated = pro;
      });
      return updated;
    },

    async getByUserId(userId: string) {
      return readStore().professionals.find((pro) => pro.userId === userId);
    },

    async getById(idValue: string) {
      return readStore().professionals.find((pro) => pro.id === idValue);
    },

    async getBySlug(slug: string) {
      return readStore().professionals.find((pro) => pro.slug === slug);
    },

    async list(opts?: { status?: "pending" | "approved" }) {
      const list = readStore().professionals;
      if (!opts?.status) return [...list];
      return list.filter((pro) => pro.status === opts.status);
    },
  },

  slots: {
    async listForProfessional(proId: string) {
      return readStore().slots.filter((slot) => slot.professionalId === proId);
    },

    async getById(slotId: string) {
      return readStore().slots.find((slot) => slot.id === slotId);
    },

    async upsert(slot: DbSlot) {
      mutate((store) => {
        const idx = store.slots.findIndex(
          (item) =>
            item.id === slot.id ||
            (item.professionalId === slot.professionalId &&
              item.dateIso === slot.dateIso &&
              item.timeLabel === slot.timeLabel),
        );
        if (idx === -1) store.slots.push(slot);
        else store.slots[idx] = { ...store.slots[idx], ...slot };
      });
      return slot;
    },

    async upsertMany(slots: DbSlot[]) {
      for (const slot of slots) {
        await db.slots.upsert(slot);
      }
      return slots;
    },

    async setStatus(slotId: string, status: DbSlot["status"]) {
      let updated: DbSlot | undefined;
      mutate((store) => {
        const slot = store.slots.find((item) => item.id === slotId);
        if (!slot) return;
        if (slot.status === "booked" && status !== "booked") return;
        slot.status = status;
        updated = slot;
      });
      return updated;
    },

    /** Replace editable availability for a pro; booked slots are preserved. */
    async replaceForProfessional(professionalId: string, next: DbSlot[]) {
      mutate((store) => {
        const booked = store.slots.filter(
          (slot) => slot.professionalId === professionalId && slot.status === "booked",
        );
        const bookedKeys = new Set(booked.map((slot) => `${slot.dateIso}|${slot.timeLabel}`));
        const others = store.slots.filter((slot) => slot.professionalId !== professionalId);
        const open = next.filter(
          (slot) =>
            slot.professionalId === professionalId &&
            slot.status === "open" &&
            !bookedKeys.has(`${slot.dateIso}|${slot.timeLabel}`),
        );
        store.slots = [...others, ...booked, ...open];
      });
    },
  },

  bookings: {
    async create(input: {
      clientId: string;
      professionalId: string;
      slotId: string;
      specialty: CategoryId;
      dateLabel: string;
      fee: number;
    }): Promise<DbBooking> {
      const store = readStore();
      const slot = store.slots.find((item) => item.id === input.slotId);
      if (!slot) throw new Error("Slot not found");
      if (slot.professionalId !== input.professionalId) {
        throw new Error("Slot does not belong to this professional");
      }
      if (slot.status === "booked") throw new Error("Slot already booked");

      const booking: DbBooking = {
        id: id("booking"),
        clientId: input.clientId,
        professionalId: input.professionalId,
        slotId: input.slotId,
        specialty: input.specialty,
        dateLabel: input.dateLabel,
        fee: input.fee,
        status: "upcoming",
        createdAt: nowIso(),
        linkState: "pending",
      };

      mutate((s) => {
        s.bookings.push(booking);
        const target = s.slots.find((item) => item.id === input.slotId);
        if (target) target.status = "booked";
      });
      return booking;
    },

    async listForClient(clientId: string) {
      return readStore().bookings.filter((booking) => booking.clientId === clientId);
    },

    async listForProfessional(proId: string) {
      return readStore().bookings.filter((booking) => booking.professionalId === proId);
    },

    async getById(bookingId: string) {
      return readStore().bookings.find((booking) => booking.id === bookingId);
    },

    async cancel(bookingId: string, cancelledBy: "client" | "professional" = "client") {
      let updated: DbBooking | undefined;
      mutate((store) => {
        const booking = store.bookings.find((item) => item.id === bookingId);
        if (!booking || booking.status === "cancelled") return;
        booking.status = "cancelled";
        booking.cancelledBy = cancelledBy;
        updated = booking;
      });
      return updated;
    },
  },

  session: {
    async getUserId(): Promise<string | null> {
      return readStore().sessionUserId;
    },

    async setUserId(userId: string | null) {
      mutate((store) => {
        store.sessionUserId = userId;
      });
    },

    async clear() {
      await db.session.setUserId(null);
    },
  },

  prefs: {
    async getTheme(): Promise<ThemePref> {
      return readStore().theme;
    },

    async setTheme(theme: ThemePref) {
      mutate((store) => {
        store.theme = theme;
      });
    },
  },

  async ensureDemoAccounts() {
    const store = readStore();
    if (ensureDemoAccountsInStore(store)) persist(store);
  },

  async reset() {
    const seeded = buildSeed();
    persist(seeded);
    return seeded;
  },
};

export type { Store };
