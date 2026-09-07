import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const MAX_REQUESTS_PER_HOUR = 20;

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const windowStart = now - windowMs;
  const ref = doc(db, 'rateLimits', userId);

  try {
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : { requests: [], updatedAt: now };
    const recentRequests: number[] = (data.requests || []).filter(
      (ts: number) => ts > windowStart
    );

    if (recentRequests.length >= MAX_REQUESTS_PER_HOUR) {
      return { allowed: false, remaining: 0 };
    }

    recentRequests.push(now);
    await setDoc(ref, { requests: recentRequests, updatedAt: now, userId });
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR - recentRequests.length };
  } catch {
    return { allowed: true, remaining: MAX_REQUESTS_PER_HOUR };
  }
}
