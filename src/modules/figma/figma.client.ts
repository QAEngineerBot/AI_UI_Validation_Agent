import axios, { AxiosError, AxiosInstance } from 'axios';
import { figmaConfig } from '../../config/figma.config';
import {
  FigmaFileResponse,
  FigmaNodeImageResponse,
  FigmaNodeMetadataResponse,
} from '../../core/types/figma.types';
import { FigmaError } from '../../core/errors/figma.error';
import { logger } from '../../core/logger/logger';

export class FigmaClient {
  private readonly httpClient: AxiosInstance;

  constructor() {
    if (!figmaConfig.apiToken) {
      throw new FigmaError(
        'FIGMA_API_TOKEN is missing. Please add it to your .env file.',
        'FIGMA_TOKEN_MISSING'
      );
    }

    this.httpClient = axios.create({
      baseURL: figmaConfig.baseUrl,
      headers: {
        'X-Figma-Token': figmaConfig.apiToken,
      },
      timeout: 30000,
    });
  }

  /**
   * Build a structured diagnostic object from Axios / unknown errors.
   * This makes Figma failures much easier to debug.
   */
  private buildAxiosErrorDetails(error: unknown): Record<string, unknown> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      return {
        message: axiosError.message,
        code: axiosError.code,
        method: axiosError.config?.method,
        baseURL: axiosError.config?.baseURL,
        url: axiosError.config?.url,
        params: axiosError.config?.params,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        responseHeaders: axiosError.response?.headers,
        responseData: axiosError.response?.data,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
      };
    }

    return { error };
  }

  /**
   * Retry Figma API operations when rate-limited (HTTP 429).
   * Honors Retry-After header when available.
   */
  private async executeWithRateLimitRetry<T>(
    operationName: string,
    operation: () => Promise<T>,
    maxRetries = 3,
    defaultRetryAfterSeconds = 60
  ): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await operation();
      } catch (error: unknown) {
        if (!axios.isAxiosError(error)) {
          throw error;
        }

        const status = error.response?.status;

        // Only retry rate-limit errors
        if (status !== 429) {
          throw error;
        }

        if (attempt >= maxRetries) {
          logger.error(
            `[Figma Retry] ${operationName} exceeded retry limit after ${attempt} retries`
          );
          throw error;
        }

        const retryAfterHeader = error.response?.headers?.['retry-after'];
        const retryAfterSeconds = Number(retryAfterHeader || defaultRetryAfterSeconds);
        const waitMs = retryAfterSeconds * 1000;

        attempt += 1;

        logger.warn(
          `[Figma Retry] ${operationName} hit rate limit (429). ` +
            `Attempt ${attempt}/${maxRetries}. Waiting ${retryAfterSeconds}s before retry...`
        );

        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  /**
   * Fetch the full Figma file JSON.
   * Useful later for automatic frame discovery.
   */
  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    try {
      const response = await this.httpClient.get<FigmaFileResponse>(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      const details = this.buildAxiosErrorDetails(error);

      logger.error(
        `Figma getFile failed. fileKey=${fileKey}. details=${JSON.stringify(details)}`
      );

      throw new FigmaError(
        `Failed to fetch Figma file metadata for fileKey=${fileKey}`,
        'FIGMA_GET_FILE_FAILED',
        details
      );
    }
  }

  /**
   * Fetch metadata for one or more nodes from a Figma file.
   */
  async getNodes(fileKey: string, nodeIds: string[]): Promise<FigmaNodeMetadataResponse> {
    const ids = nodeIds.join(',');

    try {
      logger.info(`Calling Figma nodes API. fileKey=${fileKey}, ids=${ids}`);

      const response = await this.executeWithRateLimitRetry(
        'getNodes',
        async () => {
          return this.httpClient.get<FigmaNodeMetadataResponse>(`/files/${fileKey}/nodes`, {
            params: { ids },
          });
        },
        3,
        60
      );

      logger.info(
        `Figma nodes API success. fileKey=${fileKey}, ids=${ids}, returnedNodeKeys=${Object.keys(
          response.data.nodes ?? {}
        ).join(',')}`
      );

      return response.data;
    } catch (error) {
      const details = this.buildAxiosErrorDetails(error);

      logger.error(
        `Figma getNodes failed. fileKey=${fileKey}, nodeIds=${ids}, details=${JSON.stringify(
          details
        )}`
      );

      throw new FigmaError(
        `Failed to fetch Figma nodes for fileKey=${fileKey}, nodeIds=${ids}`,
        'FIGMA_GET_NODES_FAILED',
        details
      );
    }
  }

  /**
   * Ask Figma to render a node as an image and return the temporary image URL.
   */
  async getRenderedImageUrl(
    fileKey: string,
    nodeId: string,
    format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
    scale = 1
  ): Promise<string> {
    try {
      logger.info(
        `Calling Figma images API. fileKey=${fileKey}, nodeId=${nodeId}, format=${format}, scale=${scale}`
      );

      const response = await this.executeWithRateLimitRetry(
        'getRenderedImageUrl',
        async () => {
          return this.httpClient.get<FigmaNodeImageResponse>(`/images/${fileKey}`, {
            params: {
              ids: nodeId,
              format,
              scale,
            },
          });
        },
        3,
        60
      );

      const imageUrl = response.data.images?.[nodeId];

      if (!imageUrl) {
        logger.error(
          `Figma images API returned no image URL. fileKey=${fileKey}, nodeId=${nodeId}, rawResponse=${JSON.stringify(
            response.data
          )}`
        );

        throw new FigmaError(
          `Figma returned no renderable image for nodeId=${nodeId}. The node may be invalid, invisible, or not renderable.`,
          'FIGMA_IMAGE_URL_MISSING',
          response.data
        );
      }

      logger.info(`Figma images API success. fileKey=${fileKey}, nodeId=${nodeId}`);
      return imageUrl;
    } catch (error) {
      if (error instanceof FigmaError) {
        throw error;
      }

      const details = this.buildAxiosErrorDetails(error);

      logger.error(
        `Figma getRenderedImageUrl failed. fileKey=${fileKey}, nodeId=${nodeId}, details=${JSON.stringify(
          details
        )}`
      );

      throw new FigmaError(
        `Failed to render Figma image for fileKey=${fileKey}, nodeId=${nodeId}`,
        'FIGMA_RENDER_IMAGE_FAILED',
        details
      );
    }
  }

  /**
   * Download the actual image bytes from the temporary Figma image URL.
   */
  async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      return Buffer.from(response.data);
    } catch (error) {
      const details = this.buildAxiosErrorDetails(error);

      logger.error(
        `Figma downloadImage failed. imageUrl=${imageUrl}, details=${JSON.stringify(details)}`
      );

      throw new FigmaError(
        `Failed to download Figma image from URL: ${imageUrl}`,
        'FIGMA_IMAGE_DOWNLOAD_FAILED',
        details
      );
    }
  }
}