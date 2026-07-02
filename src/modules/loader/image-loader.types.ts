import path from 'path';

export interface ImagePair {
  screenName: string;
  expectedImagePath: string;
  actualImagePath: string;
}

export interface ImageLoaderResult {
  pairs: ImagePair[];
  missingExpected: string[];
  missingActual: string[];
}