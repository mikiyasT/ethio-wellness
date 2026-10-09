/** Public catalog. Keep ids aligned with packages/shared sample categories and languages. */

export const categories = [
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
] as const;

export const languageIds = ["amharic", "tigrinya", "afaan-oromoo", "english"] as const;

export type CategoryId = (typeof categories)[number]["id"];
export type LanguageId = (typeof languageIds)[number];
