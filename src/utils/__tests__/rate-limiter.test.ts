import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
  it('should not allow more than the rate limit to run concurrently', async () => {
    const limit = new RateLimiter(3);
    let activeTasks = 0;

    const increaseActive = () => {
      activeTasks++;
    };

    const decreaseActive = () => {
      activeTasks--;
      limit.free();
    };

    const tasks = Array(5)
      .fill(null)
      .map(async () => {
        await limit.allocate();

        increaseActive();
        expect(activeTasks).toBeLessThanOrEqual(3);

        // Mock task duration (randomness to affect completion order)
        await new Promise(resolve =>
          setTimeout(resolve, 500 + 500 * Math.random())
        );
        decreaseActive();
      });
    await Promise.all(tasks);
  });

  it('should queue tasks and execute them in order', async () => {
    const limit = new RateLimiter(1);
    const taskOrder: number[] = [];
    const mockTask = async (id: number) => {
      await limit.allocate();

      // Make each task successively longer to ensure execution completion order
      await new Promise(resolve => setTimeout(resolve, 100));

      taskOrder.push(id);
      limit.free();
    };

    const tasks = [1, 2, 3, 4].map(id => mockTask(id));
    await Promise.all(tasks);
    expect(taskOrder).toEqual([1, 2, 3, 4]); // Ensure tasks are executed in the expected order
    expect(limit.getProcessing()).toEqual(0);
    expect(limit.getWaiting()).toEqual(0);
  });

  it('ensure too many tasks never run at once', async () => {
    const maxConcurrent = 20;
    const limit = new RateLimiter(maxConcurrent);
    const mockTask = async () => {
      await limit.allocate();

      expect(limit.getProcessing()).toBeLessThanOrEqual(maxConcurrent);

      // Mock task duration (randomness to affect completion order)
      await new Promise(resolve => setTimeout(resolve, 500 * Math.random()));

      expect(limit.getProcessing()).toBeLessThanOrEqual(maxConcurrent);

      limit.free();
    };
    await Promise.all(
      Array(100)
        .fill(0)
        .map(() => mockTask())
    );

    expect(limit.getProcessing()).toEqual(0);
    expect(limit.getWaiting()).toEqual(0);
  });

  it('should handle rapid calls to free correctly', async () => {
    const limit = new RateLimiter(1);
    const mockTask = async () => {
      await limit.allocate();
      limit.free();
      limit.free(); // Intentional rapid call to free
    };

    await Promise.all([mockTask(), mockTask()]);
    expect(limit.getProcessing()).toEqual(0);
    expect(limit.getWaiting()).toEqual(0);
  });
});
