import { env } from './env';

export const figmaConfig = {
  apiToken: env.figma.apiToken,
  fileKey: env.figma.fileKey,
  baseUrl: 'https://api.figma.com/v1',
};