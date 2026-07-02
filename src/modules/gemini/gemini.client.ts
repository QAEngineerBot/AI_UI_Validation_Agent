import fs from 'fs-extra';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { geminiConfig } from '../../config/gemini.config';
import { GeminiError } from '../../core/errors/gemini.error';
import { RetryUtil } from '../../core/utils/retry.util';
import { logger } from '../../core/logger/logger';


export class GeminiClient {
  private readonly ai: GoogleGenAI;

  constructor() {
    if (!geminiConfig.apiKey) {
      throw new GeminiError(
        'GEMINI_API_KEY is missing. Please add it to your .env file.',
        'GEMINI_API_KEY_MISSING'
      );
    }

    this.ai = new GoogleGenAI({
      apiKey: geminiConfig.apiKey,
    });
  }

  /**
   * Read an image file from disk and convert it to an inline image part for Gemini.
   */
  private async imagePathToPart(imagePath: string): Promise<{
    inlineData: {
      mimeType: string;
      data: string;
    };
  }> {
    const exists = await fs.pathExists(imagePath);

    if (!exists) {
      throw new GeminiError(`Image file not found: ${imagePath}`, 'GEMINI_IMAGE_NOT_FOUND');
    }

    const buffer = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    const mimeType =
      ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : null;

    if (!mimeType) {
      throw new GeminiError(
        `Unsupported image type for Gemini input: ${imagePath}`,
        'GEMINI_UNSUPPORTED_IMAGE_TYPE'
      );
    }

    return {
      inlineData: {
        mimeType,
        data: buffer.toString('base64'),
      },
    };
  }

  /**
   * Send a multimodal comparison request to Gemini using:
   * - prompt text
   * - expected image
   * - actual image
   */
  async compareImages(
    prompt: string,
    expectedImagePath: string,
    actualImagePath: string
  ): Promise<string> {
    try {
      const expectedImagePart = await this.imagePathToPart(expectedImagePath);
      const actualImagePart = await this.imagePathToPart(actualImagePath);

      const model = geminiConfig.model || 'gemini-3.5-flash';

      const start = Date.now();


const response = await RetryUtil.execute(
  async () => {
    return this.ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'EXPECTED IMAGE (Figma design reference):',
            },
            expectedImagePart,
            {
              text: 'ACTUAL IMAGE (mobile app screenshot):',
            },
            actualImagePart,
            {
              text: prompt,
            },
          ],
        },
      ],
    });
  },
  {
    operationName: 'Gemini Image Comparison',
    maxRetries: 3,
    initialDelayMs: 3000,
    backoffMultiplier: 2,
    retryableStatusCodes: [
      429,
      500,
      502,
      503,
      504,
    ],
  }
);

logger.info(
  `Gemini comparison completed in ${
    Date.now() - start
  } ms`
);

logger.info(
  `Gemini comparison completed in ${Date.now() - start} ms`
);

      const outputText = response.text?.trim();

      if (!outputText) {
        throw new GeminiError('Gemini returned an empty comparison response', 'GEMINI_EMPTY_RESPONSE');
      }

      return outputText;
    } catch (error) {
      if (error instanceof GeminiError) {
        throw error;
      }

      throw new GeminiError(
        `Failed to compare images using Gemini: ${error instanceof Error ? error.message : String(error)}`,
        'GEMINI_COMPARE_FAILED',
        error
      );
    }
  }
}