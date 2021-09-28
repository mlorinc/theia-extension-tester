import { Rejecter, Resolver, TimeoutError, TimeoutPromise } from '@theia-extension-tester/timeout-promise';

export interface RepeatArguments {
	/**
	 * Repeat timeout after promise is rejected. If undefined function will be repeated <count> times or infinitely.
	 */
	timeout?: number;

	/**
	 * Do not resolve repeat operation immediately. Wait until truthy value is returned consequently for <threshold> milliseconds.
	 */
	threshold?: number;

	/**
	 * Error message when repeat time outs.
	 */
	message?: string | (() => string);

	// Repeat identification. For log purposes.
	id?: string;
}

export class Threshold {
	private start: number;
	private interval: number;
	private resetCounter: number;

	constructor(interval: number) {
		this.interval = interval;
		this.start = Date.now();
		this.resetCounter = 0;
	}

	reset(): void {
		this.start = Date.now();
		this.resetCounter++;
	}

	hasFinished(): boolean {
		return Date.now() - this.start >= this.interval;
	}

	
	public get resetCount() : number {
		return this.resetCounter;
	}
}

export class Repeat<T> {
	protected timeout?: number;
	protected id: string;
	protected threshold: Threshold;
	private message?: string | (() => string);
	private plannedTask?: NodeJS.Immediate;
	private resolve!: Resolver<T>;
	private reject!: Rejecter;
	private promise!: Promise<T>;
	private run: boolean = false;
	private hasStarted: boolean = false;

	constructor(protected func: (() => T | PromiseLike<T>), protected options?: RepeatArguments) {
		this.timeout = options?.timeout;
		this.id = options?.id ?? 'anonymous';
		this.threshold = new Threshold(options?.threshold ?? 0);
		this.message = options?.message;
		this.loop = this.loop.bind(this);
	}

	protected async loop(): Promise<void> {
		// task has been started
		this.plannedTask = undefined;

		if (this.run === false) {
			this.reject(new Error('Aborted'));
		}

		try {
			const value = await this.func();
			if (value && this.threshold.hasFinished()) {
				this.resolve(value);
			}
			else if (value) {
				this.scheduleNextLoop();
			}
			else {
				this.threshold.reset();
				if (this.run) {
					this.scheduleNextLoop();
				}
			}
		}
		catch (e) {
			this.reject(e);
		}
	}

	async execute(): Promise<T> {
		if (this.hasStarted) {
			throw new Error('It is not possible to run Repeat task again. Create new instance.');
		}

		this.hasStarted = true;
		try {
			this.promise = new Promise((resolve, reject) => {
				this.resolve = resolve;
				this.reject = reject;
				this.run = true;
				process.nextTick(() => this.loop());
			});

			if (this.timeout !== 0) {
				this.promise = TimeoutPromise.createFrom(this.promise, this.timeout, {
					id: this.id,
					message: this.message
				});
			}

			return await this.promise;
		}
		finally {
			this.cleanup();
		}
	}

	abort(value: Error | T | undefined): void {
		if (!this.hasStarted) {
			throw new Error('Repeat has not been started.');
		}

		this.run = false;

		if (typeof (value) === 'undefined') {
			this.reject(new Error('Aborted'));
		}
		else if (value instanceof Error) {
			this.reject(value);
		}
		else {
			this.resolve(value);
		}
	}

	protected cleanup(): void {
		this.run = false;
		if (this.plannedTask) {
			clearImmediate(this.plannedTask);
			this.plannedTask = undefined;
		}
	}

	private scheduleNextLoop(): void {
		if (this.timeout !== 0) {
			this.plannedTask = setImmediate(this.loop);
		}
		else {
			this.reject(new TimeoutError(this.resolve, 'Cannot iterate more than 1 times. Timeout is set to 0.', this.id))
		}
	}
}

/**
 * Repeat function until it returns truthy value.
 * 
 * @param func function to repeat
 * @param options repeat options
 */
export async function repeat<T>(func: (() => T | PromiseLike<T>), options?: RepeatArguments): Promise<T> {
	return new Repeat(func, options).execute();
}

export { TimeoutError };