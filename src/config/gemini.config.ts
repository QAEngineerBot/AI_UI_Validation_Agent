import { env } from './env';

export const geminiConfig = {
  apiKey: env.gemini.apiKey,
  model: env.gemini.model,
};