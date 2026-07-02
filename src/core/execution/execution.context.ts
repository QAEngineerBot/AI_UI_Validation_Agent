export interface ExecutionContext {

    screenName: string;

    startTime: number;

    endTime?: number;

    expectedSource?: 'cache' | 'figma';

    artifacts?: {

        runId: string;

        runDirectory: string;

        screenDirectory: string;

        expectedImage: string;

        actualImage: string;

        comparisonJson: string;

        rawGemini: string;

        metadata: string;

        report: string;

    };

    metrics: {

        appiumMs: number;

        figmaMs: number;

        navigationMs: number;

        screenshotMs: number;

        geminiMs: number;

        totalMs: number;
    };
}