export class ExecutionMetricsCollector {

  private readonly metrics = new Map<string, number>();

  start(name: string): number {
    const start = Date.now();

    this.metrics.set(name, start);

    return start;
  }

  stop(name: string): number {

    const start = this.metrics.get(name);

    if (!start) {
      return 0;
    }

    return Date.now() - start;
  }

}