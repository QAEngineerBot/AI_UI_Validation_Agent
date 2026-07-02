export interface FigmaNodeImageResponse {
  err?: string;
  images: Record<string, string | null>;
  status?: number;
}

export interface FigmaFileResponse {
  name: string;
  lastModified?: string;
  thumbnailUrl?: string;
  version?: string;
  document: unknown;
}

export interface FigmaNodeMetadataResponse {
  name?: string;
  lastModified?: string;
  thumbnailUrl?: string;
  version?: string;
  nodes: Record<
    string,
    {
      document?: {
        id?: string;
        name?: string;
        type?: string;
      };
    }
  >;
}

export interface FigmaExportOptions {
  fileKey: string;
  nodeId: string;
  format?: 'png' | 'jpg' | 'svg' | 'pdf';
  scale?: number;
  useAbsoluteBounds?: boolean;
}

export interface DownloadedFigmaFrame {
  screenName: string;
  nodeId: string;
  imageUrl: string;
  localPath: string;
  downloadedAt: string;
}