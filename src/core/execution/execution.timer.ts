export class ExecutionTimer {

    private readonly start = performance.now();

    stop(): number {

        return Math.round(
            performance.now() - this.start
        );
    }

}