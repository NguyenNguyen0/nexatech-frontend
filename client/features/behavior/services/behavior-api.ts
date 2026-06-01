'use client';

import axiosClient from '@/lib/axios-client';
import { BEHAVIOR_API_BASE } from '@/lib/constants';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { getUserIdFromAccessToken } from '@/features/auth/utils/auth-session';
import { featureFlags } from '@/lib/feature-flags';

export type BehaviorEventType = 'VIEW' | 'SEARCH_CLICK' | 'CART_ADD' | 'PURCHASE' | 'RATE';

export interface BehaviorEventDraft {
  eventId?: string;
  productId: string;
  eventType: BehaviorEventType;
  weight?: number;
  rating?: number;
  timestamp?: string;
  categoryIds?: string[];
  brandId?: string;
  price?: number;
}

interface BehaviorEventPayload extends BehaviorEventDraft {
  eventId: string;
  userId: string;
  timestamp: string;
}

const GUEST_BEHAVIOR_STORAGE_KEY = 'nexatech:guest-behavior-batch';

let flushGuestBehaviorPromise: Promise<number> | null = null;

const EVENT_DEFAULT_WEIGHT: Record<BehaviorEventType, number> = {
  VIEW: 1.0,
  SEARCH_CLICK: 1.5,
  CART_ADD: 3.0,
  PURCHASE: 5.0,
  RATE: 1.0,
};

function createEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getCurrentUserId(): string | null {
  return getUserIdFromAccessToken(authStorage.getAccessToken());
}

function normalizeCategoryIds(categoryIds?: string[]): string[] | undefined {
  if (!Array.isArray(categoryIds)) return undefined;
  const filtered = categoryIds.map((categoryId) => categoryId.trim()).filter(Boolean);
  return filtered.length > 0 ? filtered : undefined;
}

function clampRating(rating?: number): number | undefined {
  if (typeof rating !== 'number' || !Number.isFinite(rating)) return undefined;
  return Math.max(1, Math.min(5, Math.round(rating)));
}

function resolveWeight(eventType: BehaviorEventType, rating?: number, weight?: number): number {
  if (typeof weight === 'number' && Number.isFinite(weight)) {
    return weight;
  }

  if (eventType === 'RATE') {
    return clampRating(rating) ?? EVENT_DEFAULT_WEIGHT.RATE;
  }

  return EVENT_DEFAULT_WEIGHT[eventType];
}

export function createBehaviorDraft(input: BehaviorEventDraft): Required<Pick<BehaviorEventDraft, 'eventId' | 'timestamp' | 'weight'>> & BehaviorEventDraft {
  const clampedRating = clampRating(input.rating);

  return {
    ...input,
    eventId: input.eventId ?? createEventId(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    categoryIds: normalizeCategoryIds(input.categoryIds),
    rating: clampedRating,
    weight: resolveWeight(input.eventType, clampedRating, input.weight),
  };
}

function createDraft(input: BehaviorEventDraft): Required<Pick<BehaviorEventDraft, 'eventId' | 'timestamp' | 'weight'>> & BehaviorEventDraft {
  return createBehaviorDraft(input);
}

function readGuestQueue(): BehaviorEventDraft[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(GUEST_BEHAVIOR_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as BehaviorEventDraft[] : [];
  } catch {
    return [];
  }
}

function writeGuestQueue(events: BehaviorEventDraft[]): void {
  if (typeof window === 'undefined') return;

  if (events.length === 0) {
    window.localStorage.removeItem(GUEST_BEHAVIOR_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(GUEST_BEHAVIOR_STORAGE_KEY, JSON.stringify(events));
}

function appendGuestBehavior(event: BehaviorEventDraft): void {
  const current = readGuestQueue();
  current.push(createDraft(event));
  writeGuestQueue(current);
}

function attachCurrentUser(event: BehaviorEventDraft, userId: string): BehaviorEventPayload {
  const draft = createDraft(event);
  return {
    ...draft,
    userId,
  };
}

async function postSingleBehavior(event: BehaviorEventPayload): Promise<void> {
  await axiosClient.post(BEHAVIOR_API_BASE, event);
}

async function postBehaviorBatch(events: BehaviorEventPayload[]): Promise<void> {
  if (events.length === 0) return;

  try {
    await axiosClient.post(`${BEHAVIOR_API_BASE}/batch`, events);
  } catch {
    await axiosClient.post(`${BEHAVIOR_API_BASE}/batch`, { events });
  }
}

export async function trackBehavior(event: BehaviorEventDraft): Promise<void> {
  if (!featureFlags.ENABLE_BEHAVIOR_TRACKING) return;

  const draft = createDraft(event);

  if (authStorage.isOtpStepUpPending()) {
    appendGuestBehavior(draft);
    return;
  }

  const userId = getCurrentUserId();
  if (!userId) {
    appendGuestBehavior(draft);
    return;
  }

  await postSingleBehavior(attachCurrentUser(draft, userId));
}

export async function flushGuestBehaviors(): Promise<number> {
  if (!featureFlags.ENABLE_BEHAVIOR_TRACKING) return 0;
  if (authStorage.isOtpStepUpPending()) return 0;

  const userId = getCurrentUserId();
  if (!userId) return 0;

  if (flushGuestBehaviorPromise) {
    return flushGuestBehaviorPromise;
  }

  flushGuestBehaviorPromise = (async () => {
    const queued = readGuestQueue();
    if (queued.length === 0) return 0;

    writeGuestQueue([]);

    try {
      const payload = queued.map((event) => attachCurrentUser(event, userId));
      await postBehaviorBatch(payload);
      return payload.length;
    } catch (error) {
      writeGuestQueue(queued);
      throw error;
    }
  })().finally(() => {
    flushGuestBehaviorPromise = null;
  });

  return flushGuestBehaviorPromise;
}

export function getQueuedGuestBehaviorCount(): number {
  return readGuestQueue().length;
}
