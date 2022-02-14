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
	message?: string | (() => string | PromiseLike<string>);

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

export enum LoopStatus {
	LOOP_DONE, LOOP_UNDONE
}

export type RepeatLoopResult<T> = {
	value?: T;
	loopStatus: LoopStatus;
	delay?: number;
}

export class RepeatError extends Error {}
export class RepeatExitError extends Error {}

export class Repeat<T> {
	protected timeout?: number;
	protected id: string;
	protected threshold: Threshold;
	private message?: string | (() => string | PromiseLike<string>);
	private clearTask?: () => void;
	private resolve!: Resolver<T>;
	private reject!: Rejecter;
	private promise!: Promise<T>;
	private run: boolean = false;
	private hasStarted: boolean = false;
	private finishedLoop: boolean = false;
	private usingExplicitLoopSignaling: boolean = false;

	constructor(protected func: (() => T | PromiseLike<T> | RepeatLoopResult<T> | PromiseLike<RepeatLoopResult<T>>), protected options?: RepeatArguments) {
		this.timeout = options?.timeout;
		this.id = options?.id ?? 'anonymous';
		this.threshold = new Threshold(options?.threshold ?? 0);
		this.message = options?.message;
		this.loop = this.loop.bind(this);
		this.cleanup = this.cleanup.bind(this);
	}

	protected async loop(): Promise<void> {
		// task has been started
		this.clearTask = undefined;

		if (this.run === false || process.exitCode !== undefined) {
			this.reject(new RepeatExitError(`Aborted task with id"${this.id}".`));
		}

		try {
			const functionResult = await this.func();

			let value: T | undefined = undefined;
			let delay = 0;
			let simpleForm = true;

			if (functionResult !== undefined && Object.keys(functionResult).includes('delay')) {
				const status = functionResult as RepeatLoopResult<T>;
				delay = status.delay ?? 0;
				simpleForm = false;
			}

			if (functionResult !== undefined && Object.keys(functionResult).includes('loopStatus')) {
				const status = functionResult as RepeatLoopResult<T>;
				this.finishedLoop = this.finishedLoop || status.loopStatus === LoopStatus.LOOP_DONE;
				this.usingExplicitLoopSignaling = true;
				simpleForm = false;
			}

			if (functionResult !== undefined && Object.keys(functionResult).includes('value')) {
				const status = functionResult as RepeatLoopResult<T>;
				value = status.value;
				simpleForm = false;
			}

			// check if repeat object was returned
			if (simpleForm) {
				value = functionResult as T;
			}
		
			if (value && this.threshold.hasFinished()) {
				this.resolve(value);
			}
			else if (value) {
				this.scheduleNextLoop(delay);
			}
			else {
				this.threshold.reset();
				if (this.run) {
					this.scheduleNextLoop(delay);
				}
			}
		}
		catch (e) {
			this.reject(e);
		}
	}

	async execute(): Promise<T> {
		if (this.hasStarted) {
			throw new RepeatError('It is not possible to run Repeat task again. Create new instance.');
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
			throw new RepeatError('Repeat has not been started.');
		}

		this.run = false;

		if (typeof (value) === 'undefined') {
			this.reject(new RepeatError(`Aborted task with id"${this.id}".`));
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
		if (this.clearTask) {
			this.clearTask();
			this.clearTask = undefined;
		}
	}

	private scheduleNextLoop(delay: number = 0): void {
		if (this.timeout !== 0 || (this.usingExplicitLoopSignaling && !this.finishedLoop)) {
			if (delay === 0) {
				const handler = setImmediate(this.loop);
				this.clearTask = () => clearImmediate(handler);
			}
			else {
				const handler = setTimeout(this.loop, delay);
				this.clearTask = () => clearTimeout(handler);
			}
		}
		else if (this.usingExplicitLoopSignaling === false) {
			this.reject(new TimeoutError(this.resolve, 'Cannot iterate more than 1 times. Timeout is set to 0.', this.id))
		}
		else if(this.finishedLoop) {
			this.reject(new TimeoutError(this.resolve, 'Cannot perform more than 1 loops. Timeout is set to 0.', this.id))
		}
		else {
			throw new RepeatError('Unexpected state.');
		}
	}
}

/**
 * Repeat function until it returns truthy value.
 * 
 * @param func function to repeat
 * @param options repeat options
 */
export async function repeat<T>(func: (() => T | PromiseLike<T> | RepeatLoopResult<T> | PromiseLike<RepeatLoopResult<T>>), options?: RepeatArguments): Promise<T> {
	return new Repeat(func, options).execute();
}

export { TimeoutError };