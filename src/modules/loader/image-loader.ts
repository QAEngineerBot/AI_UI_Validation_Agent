import fs from 'fs-extra';
import path from 'path';

import { logger } from '../../core/logger/logger';
import {
  ImagePair,
  ImageLoaderResult,
} from './image-loader.types';

export class ImageLoader {
  private readonly expectedDir: string;
  private readonly actualDir: string;

  private readonly supportedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
  ];

  constructor() {
    this.expectedDir = path.join(
      process.cwd(),
      'input',
      'expected'
    );

    this.actualDir = path.join(
      process.cwd(),
      'input',
      'actual'
    );
  }

  async load(): Promise<ImageLoaderResult> {
    await fs.ensureDir(this.expectedDir);
    await fs.ensureDir(this.actualDir);

    const expectedFiles =
      await this.getImages(this.expectedDir);

    const actualFiles =
      await this.getImages(this.actualDir);

    const pairs: ImagePair[] = [];

    const missingExpected: string[] = [];
    const missingActual: string[] = [];

    const expectedMap = new Map(
      expectedFiles.map(file => [
        this.fileName(file),
        file,
      ])
    );

    const actualMap = new Map(
      actualFiles.map(file => [
        this.fileName(file),
        file,
      ])
    );

    const allScreens = new Set([
      ...expectedMap.keys(),
      ...actualMap.keys(),
    ]);

    for (const screen of allScreens) {

      const expected =
        expectedMap.get(screen);

      const actual =
        actualMap.get(screen);

      if (!expected) {
        logger.warn(
          `Missing expected image for "${screen}"`
        );

        missingExpected.push(screen);

        continue;
      }

      if (!actual) {
        logger.warn(
          `Missing actual image for "${screen}"`
        );

        missingActual.push(screen);

        continue;
      }

      pairs.push({
        screenName: screen,
        expectedImagePath: expected,
        actualImagePath: actual,
      });
    }

    logger.info(
      `Loaded ${pairs.length} matching screen(s).`
    );

    return {
      pairs,
      missingExpected,
      missingActual,
    };
  }

  private async getImages(
    directory: string
  ): Promise<string[]> {

    const files =
      await fs.readdir(directory);

    return files
      .filter(file =>
        this.supportedExtensions.includes(
          path.extname(file).toLowerCase()
        )
      )
      .map(file =>
        path.join(directory, file)
      );
  }

  private fileName(
    file: string
  ): string {

    return path.parse(file).name;
  }
}