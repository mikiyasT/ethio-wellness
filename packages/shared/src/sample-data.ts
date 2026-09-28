import type {
  AvailabilitySlot,
  Booking,
  Category,
  Client,
  Professional,
} from "./types";

export const categories: Category[] = [
  {
    id: "individual-mental-health",
    emoji: "🧠",
    name: "Individual Mental Health",
    description: "One-on-one support for stress, anxiety, and life's heavy moments.",
  },
  {
    id: "couples-counseling",
    emoji: "💛",
    name: "Couples Counseling",
    description: "Strengthen communication and trust with your partner.",
  },
  {
    id: "family-counseling",
    emoji: "👨‍👩‍👧",
    name: "Family Counseling",
    description: "Navigate family challenges together, across generations.",
  },
  {
    id: "addiction-recovery",
    emoji: "🌱",
    name: "Addiction & Recovery",
    description: "Confidential support on the path to recovery.",
  },
  {
    id: "grief-and-loss",
    emoji: "🕊️",
    name: "Grief and Loss",
    description: "Gentle guidance through loss and mourning.",
  },
  {
    id: "youth-and-students",
    emoji: "🎓",
    name: "Youth and Students",
    description: "Support for teens and students finding their way.",
  },
  {
    id: "faith-informed-counseling",
    emoji: "🕯️",
    name: "Faith-informed Counseling",
    description: "Counseling that honors your faith and values.",
  },
  {
    id: "career-and-life-stress",
    emoji: "💼",
    name: "Career and Life Stress",
    description: "Work pressure, burnout, and big life decisions.",
  },
];

export const professionals: Professional[] = [
  {
    id: "pro-hana-tesfaye",
    slug: "hana-tesfaye",
    initials: "HT",
    avatarClass: "av-1",
    name: "Hana Tesfaye",
    title: "Clinical Psychologist",
    city: "Addis Ababa",
    languages: ["amharic", "english"],
    specialties: ["individual-mental-health", "grief-and-loss"],
    rating: 4.9,
    reviewCount: 212,
    nextSlotLabel: "Today 4:00 PM",
    bio: "I help adults work through anxiety, grief, and major life transitions with warmth and without judgment.",
    status: "approved",
  },
  {
    id: "pro-dawit-mekonnen",
    slug: "dawit-mekonnen",
    initials: "DM",
    avatarClass: "av-2",
    name: "Dawit Mekonnen",
    title: "Licensed Counselor",
    city: "Addis Ababa",
    languages: ["amharic", "english"],
    specialties: ["addiction-recovery", "career-and-life-stress"],
    rating: 4.8,
    reviewCount: 167,
    nextSlotLabel: "Tomorrow 10:00 AM",
    bio: "Ten years supporting recovery and workplace wellbeing across Addis Ababa.",
    status: "approved",
  },
  {
    id: "pro-tigist-haile",
    slug: "tigist-haile",
    initials: "TH",
    avatarClass: "av-3",
    name: "Tigist Haile",
    title: "Psychologist",
    city: "Mekelle",
    languages: ["tigrinya", "amharic"],
    specialties: ["family-counseling", "youth-and-students"],
    rating: 4.9,
    reviewCount: 143,
    nextSlotLabel: "Today 6:00 PM",
    bio: "I work with families and young people, in the language they think in.",
    status: "approved",
  },
  {
    id: "pro-samuel-bekele",
    slug: "samuel-bekele",
    initials: "SB",
    avatarClass: "av-4",
    name: "Samuel Bekele",
    title: "Marriage & Family Therapist",
    city: "Adama",
    languages: ["afaan-oromoo", "amharic", "english"],
    specialties: ["couples-counseling", "family-counseling"],
    rating: 4.7,
    reviewCount: 198,
    nextSlotLabel: "Fri 2:00 PM",
    bio: "Helping couples and families communicate with honesty and care.",
    status: "approved",
  },
  {
    id: "pro-almaz-girma",
    slug: "almaz-girma",
    initials: "AG",
    avatarClass: "av-5",
    name: "Almaz Girma",
    title: "Counselor",
    city: "Hawassa",
    languages: ["amharic", "english"],
    specialties: ["individual-mental-health", "faith-informed-counseling"],
    rating: 4.8,
    reviewCount: 121,
    nextSlotLabel: "Tomorrow 3:00 PM",
    bio: "Faith-sensitive counseling for stress, low mood, and life questions.",
    status: "approved",
  },
  {
    id: "pro-yonas-tadesse",
    slug: "yonas-tadesse",
    initials: "YT",
    avatarClass: "av-6",
    name: "Yonas Tadesse",
    title: "Psychologist",
    city: "Washington, DC (diaspora)",
    languages: ["amharic", "tigrinya", "english"],
    specialties: ["individual-mental-health", "grief-and-loss"],
    rating: 5.0,
    reviewCount: 89,
    nextSlotLabel: "Sat 11:00 AM",
    bio: "Diaspora-friendly evening hours (US time). Grief and adjustment support.",
    status: "approved",
  },
  {
    id: "pro-meron-assefa",
    slug: "meron-assefa",
    initials: "MA",
    avatarClass: "av-7",
    name: "Meron Assefa",
    title: "Social Worker",
    city: "Bahir Dar",
    languages: ["amharic"],
    specialties: ["youth-and-students", "family-counseling"],
    rating: 4.6,
    reviewCount: 104,
    nextSlotLabel: "Mon 9:00 AM",
    bio: "School and family support for teenagers and parents.",
    status: "approved",
  },
  {
    id: "pro-kibrom-weldu",
    slug: "kibrom-weldu",
    initials: "KW",
    avatarClass: "av-8",
    name: "Kibrom Weldu",
    title: "Counselor",
    city: "Mekelle",
    languages: ["tigrinya", "english"],
    specialties: ["addiction-recovery", "career-and-life-stress"],
    rating: 4.7,
    reviewCount: 76,
    nextSlotLabel: "Today 7:00 PM",
    bio: "Confidential recovery support, in Tigrinya or English.",
    status: "approved",
  },
  {
    id: "pro-selamawit-kifle",
    slug: "selamawit-kifle",
    initials: "SK",
    avatarClass: "av-9",
    name: "Selamawit Kifle",
    title: "Psychologist",
    city: "Addis Ababa",
    languages: ["afaan-oromoo", "amharic", "english"],
    specialties: ["couples-counseling", "individual-mental-health"],
    rating: 4.9,
    reviewCount: 156,
    nextSlotLabel: "Tomorrow 1:00 PM",
    bio: "Couples and individual sessions in three languages.",
    status: "approved",
  },
  {
    id: "pro-girma-alemu",
    slug: "girma-alemu",
    initials: "GA",
    avatarClass: "av-10",
    name: "Girma Alemu",
    title: "Pastoral Counselor",
    city: "Addis Ababa",
    languages: ["amharic"],
    specialties: ["faith-informed-counseling", "grief-and-loss"],
    rating: 4.8,
    reviewCount: 190,
    nextSlotLabel: "Sun 4:00 PM",
    bio: "Counseling grounded in faith, hope, and community.",
    status: "approved",
  },
];

export const availabilitySlots: AvailabilitySlot[] = [
  { id: "slot-1", professionalId: "pro-hana-tesfaye", dayLabel: "Today", timeLabel: "2:00 PM", status: "booked" },
  { id: "slot-2", professionalId: "pro-hana-tesfaye", dayLabel: "Today", timeLabel: "4:00 PM", status: "open" },
  { id: "slot-3", professionalId: "pro-hana-tesfaye", dayLabel: "Today", timeLabel: "6:00 PM", status: "open" },
  { id: "slot-4", professionalId: "pro-hana-tesfaye", dayLabel: "Tomorrow", timeLabel: "10:00 AM", status: "open" },
  { id: "slot-5", professionalId: "pro-hana-tesfaye", dayLabel: "Tomorrow", timeLabel: "12:00 PM", status: "booked" },
  { id: "slot-6", professionalId: "pro-hana-tesfaye", dayLabel: "Tomorrow", timeLabel: "3:00 PM", status: "open" },
  { id: "slot-7", professionalId: "pro-hana-tesfaye", dayLabel: "Fri", timeLabel: "9:00 AM", status: "open" },
  { id: "slot-8", professionalId: "pro-hana-tesfaye", dayLabel: "Fri", timeLabel: "11:00 AM", status: "open" },
];

export const clients: Client[] = [
  { id: "client-abel", initials: "AD", name: "Abel Desta", preferredLanguage: "amharic" },
  { id: "client-sara", initials: "SB", name: "Sara Bekele", preferredLanguage: "english" },
  { id: "client-daniel", initials: "DH", name: "Daniel Haile", preferredLanguage: "tigrinya" },
];

export const bookings: Booking[] = [
  {
    id: "booking-1",
    professionalId: "pro-hana-tesfaye",
    clientId: "client-abel",
    specialty: "individual-mental-health",
    dateLabel: "Sat Oct 3, 4:00 PM EAT",
    status: "upcoming",
    linkState: "ready",
  },
  {
    id: "booking-2",
    professionalId: "pro-tigist-haile",
    clientId: "client-abel",
    specialty: "family-counseling",
    dateLabel: "Tue Oct 6, 6:00 PM EAT",
    status: "upcoming",
    linkState: "pending",
  },
  {
    id: "booking-3",
    professionalId: "pro-dawit-mekonnen",
    clientId: "client-abel",
    specialty: "career-and-life-stress",
    dateLabel: "Sep 12",
    status: "past",
  },
  {
    id: "booking-4",
    professionalId: "pro-almaz-girma",
    clientId: "client-abel",
    specialty: "individual-mental-health",
    dateLabel: "Aug 28",
    status: "past",
  },
  {
    id: "booking-5",
    professionalId: "pro-samuel-bekele",
    clientId: "client-abel",
    specialty: "couples-counseling",
    dateLabel: "Sep 5",
    status: "cancelled",
    cancelledBy: "client",
  },
];

export function professionalBySlug(slug: string) {
  return professionals.find((professional) => professional.slug === slug);
}

export function professionalById(id: string) {
  return professionals.find((professional) => professional.id === id);
}

export function categoryById(id: string) {
  return categories.find((category) => category.id === id);
}

export function bookingsForStatus(status: Booking["status"]) {
  return bookings.filter((booking) => booking.status === status);
}

export function slotById(id: string) {
  return availabilitySlots.find((slot) => slot.id === id);
}

export function slotsForProfessional(professionalId: string) {
  return availabilitySlots.filter((slot) => slot.professionalId === professionalId);
}
