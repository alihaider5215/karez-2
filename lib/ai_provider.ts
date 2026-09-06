/**
 * Karez 2.0 - AI Provider Layer
 * Gemini is the primary provider. Never returns synthetic/fallback data.
 * Throws when all providers fail so the UI can show a real error.
 */

import { GoogleGenAI } from '@google/genai';

export interface InlineImagePart {
  inlineData: { mimeType: string; data: string };
}
export interface TextPart {
  text: string;
}
export type ProviderPart = TextPart | InlineImagePart;

export interface ProviderResult {
  text: string;
  provider: 'gemini';
  model: string;
}

interface GenerateArgs {
  parts: ProviderPart[];
  systemInstruction?: string;
  timeoutMs?: number;
}

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
];

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)
    ),
  ]);
}

function stripCodeFences(text: string): string {
  return text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
}

export async function generateWithProviders(args: GenerateArgs): Promise<ProviderResult> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = DEFAULT_GEMINI_MODELS;
  const timeoutMs = args.timeoutMs ?? 50000;
  const errors: string[] = [];

  for (const model of models) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: { parts: args.parts as any[] },
          config: {
            systemInstruction: args.systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        timeoutMs,
        `Gemini ${model}`
      ) as any;

      const text = stripCodeFences(response.text || '');
      if (text) {
        return { text, provider: 'gemini', model };
      }
      errors.push(`${model}: empty response`);
    } catch (err: any) {
      errors.push(`${model}: ${err?.message || err}`);
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  throw new Error(
    `All Gemini models failed. No synthetic data will be returned. Attempts: ${errors.join(' | ')}`
  );
}
