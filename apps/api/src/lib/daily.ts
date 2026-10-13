import { env } from "../config/env.js";

type DailyRoom = { name: string; url: string };

export class VideoUnavailable extends Error {
  constructor() {
    super("video_unavailable");
  }
}

/** Private Daily room plus a short-lived participant token. The room URL is for the embed only. */
export async function ensureDailyRoom(input: { name: string; endsAt: Date }): Promise<DailyRoom> {
  if (!env.dailyApiKey) throw new VideoUnavailable();
  const exp = Math.floor(input.endsAt.getTime() / 1000);
  try {
    return await dailyPost<DailyRoom>("/rooms", {
      name: input.name,
      privacy: "private",
      properties: {
        exp,
        enable_prejoin_ui: true,
        enable_knocking: true,
        eject_at_room_exp: true,
        max_participants: 2,
      },
    });
  } catch (error) {
    if (!(error instanceof DailyHttpError) || error.status !== 400) throw new VideoUnavailable();
    return dailyGet<DailyRoom>(`/rooms/${encodeURIComponent(input.name)}`);
  }
}

export async function mintDailyToken(input: { roomName: string; endsAt: Date; owner: boolean; userName: string }) {
  if (!env.dailyApiKey) throw new VideoUnavailable();
  try {
    const minted = await dailyPost<{ token: string }>("/meeting-tokens", {
      properties: {
        room_name: input.roomName,
        exp: Math.floor(input.endsAt.getTime() / 1000),
        is_owner: input.owner,
        user_name: input.userName.slice(0, 80),
        eject_at_token_exp: true,
      },
    });
    return minted.token;
  } catch {
    throw new VideoUnavailable();
  }
}

class DailyHttpError extends Error {
  constructor(public status: number) {
    super(`daily_${status}`);
  }
}

async function dailyPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.daily.co/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.dailyApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new DailyHttpError(response.status);
  return (await response.json()) as T;
}

async function dailyGet<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.daily.co/v1${path}`, {
    headers: { Authorization: `Bearer ${env.dailyApiKey}` },
  });
  if (!response.ok) throw new VideoUnavailable();
  return (await response.json()) as T;
}
