import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { logger } from '../core/logger/logger';

async function run(): Promise<void> {
  if (!env.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is missing in .env');
  }

  const model = env.gemini.model || 'gemini-3.5-flash';

  logger.info(`Starting Gemini sanity test using model="${model}"`);

  const ai = new GoogleGenAI({
    apiKey: env.gemini.apiKey,
  });

  const response = await ai.models.generateContent({
    model,
    contents: 'Reply with exactly this text: GEMINI_CONNECTION_OK',
  });

  const outputText = response.text?.trim();

  logger.info(`Gemini raw response: ${outputText}`);

  if (!outputText) {
    throw new Error('Gemini returned an empty response');
  }

  logger.info('Gemini sanity test completed successfully');
}

run().catch((error) => {
  logger.error(
    `Gemini sanity test failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});