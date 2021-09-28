import { promise } from "extension-tester-page-objects";

export type Resolver<T> = (value: T | PromiseLike<T>) => void;
export type Rejecter = (reason?: any) => void;
type Executor<T> = (resolve: Resolver<T>, reject: Rejecter) => void;

export interface TimeoutPromiseOptions {
	onTimeout?: () => any;
	message?: string | (() => string);
	id?: string;
	callStack?: any;
}

function captureStackTrace(limit: number = 50): any {
	const temp = Error.stackTraceLimit;
	try {
		Error.stackTraceLimit = limit;
		// get call stack
		let callStack: any = {};
		Error.captureStackTrace(callStack, captureStackTrace);
		return callStack.stack;
	}
	finally {
		Error.stackTraceLimit = temp;
	}
}

export class TimeoutError extends Error {
	private messageIndex!: number;
	private owner: object;

	constructor(owner: object, message?: string, callStack?: string | object, id?: string) {
		if (message) {
			super(message + `\r\n\r\n${callStack}`);
		}
		else {
			super(`Promise(id=${id}) timed out after 1 cycle (zero timeout).\r\n\r\n$${callStack}`)
		}
		this.owner = owner;
		this.name = 'TimeoutError';
		this.setMessageIndex();
	}

	private setMessageIndex(): void {
		this.messageIndex = this.message.indexOf('\r\n\r\n') + '\r\n\r\n'.length;
	}

	isThrownBy(obj: object): boolean {
		return this.owner === obj;
	}

	prependCallStack(callStack: string | object): void {
		this.message = `${this.message.substring(0, this.messageIndex)}${callStack}${this.message.substring(this.messageIndex)}`;
	}

	appendMessage(message: string): void {
		const endMessageIndex = this.messageIndex - '\r\n\r\n'.length;
		this.message = `${this.message.substring(0, endMessageIndex)}${message}${this.message.substring(this.messageIndex)}`;
		this.setMessageIndex();
	}
}

class TimeoutPromise<T> extends Promise<T> {

	public constructor(executor: Executor<T>, timeout?: number, options?: TimeoutPromiseOptions) {
		super(TimeoutPromise.create(executor, timeout, options));
	}

	private static decorateResolver<T>(resolver: Resolver<T> | Rejecter, timer: NodeJS.Timeout | null, resolve?: Resolver<T>, callStack?: any): Resolver<T> {
		return (value: T | PromiseLike<T>) => {
			if (timer) {
				clearTimeout(timer);
			}

			// in case of reject prepend additional call stack
			if (resolve && (value instanceof TimeoutError) && !value.isThrownBy(resolve)) {
				value.prependCallStack(callStack);
			}

			resolver(value);
		};
	}

	private static create<T>(executor: Executor<T>, timeout?: number, options?: TimeoutPromiseOptions): Executor<T> {
		// get call stack
		const callStack = options?.callStack ?? captureStackTrace();

		return async (resolve: (value: T | PromiseLike<T>) => void,
			reject: (reason?: any) => void) => {

			let timer: NodeJS.Timeout | null = null;
			const id = options?.id || "anonymous";

			if (typeof timeout === 'number' && timeout < 0) {
				throw new Error('Timeout cannot be negative.');
			}

			if (timeout !== undefined) {
				const start = Date.now();

				timer = setTimeout(() => {
					let message = `Promise(id=${id}) timed out after ${Date.now() - start}ms.`;
					if (options?.message) {
						message += ` Reason: ${options.message instanceof Function ? options.message() : options.message}`;
					}

					reject(new TimeoutError(resolve, message, callStack, id));
					if (options?.onTimeout) {
						options?.onTimeout();
					}
				}, timeout);
			}

			resolve = this.decorateResolver(resolve, timer);
			reject = this.decorateResolver(reject, timer, resolve, callStack);

			try {
				executor(resolve, reject);
			}
			catch (e) {
				reject(e);
			}
		};
	}

	static createFrom<T>(promise: Promise<T> | promise.Promise<T>, timeout?: number, options?: TimeoutPromiseOptions): TimeoutPromise<T> {
		return new TimeoutPromise<T>((resolve, reject) => {
			promise.then(resolve);
			promise.catch(reject);
		}, timeout, options);
	}
}

export { TimeoutPromise };
