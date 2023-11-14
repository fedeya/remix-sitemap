/**
 * Usage:
 * const limit = new RateLimiter(3);
 * Promise.all(arr.map(async x => {
 *   await limit.allocate(); // waits until there are less than three active
 *   await longTask(x);
 *   limit.free();           // mark the task as done, allowing another to start
 * }))
 */

export class RateLimiter {
  rate: number;
  queue: Array<() => void>;
  active: number;

  constructor(rate: number) {
    this.rate = rate;
    this.queue = [];
    this.active = 0;
  }


  allocate(): Promise<void> {
    return new Promise((res) => {
      if (this.active < this.rate) {
        this.active++;
        res();
      } else {
        this.queue.push(res);
      }
    });
  }

  free(): void {
    const first = this.queue.pop();
    if (first) {
      // Don't change activity count
      // just substitute the finished work with new work
      first();
    } else {
      this.active = Math.max(0, this.active-1);
    }
  }
}