export type TimeoutGetter = (value?: number) => number;

export function timeout(defaultValue: number | (() => TimeoutGetter) = 0): TimeoutGetter {
    return (value?: number) => {
        if (value !== undefined) {
            return value;
        }
        if (typeof defaultValue === 'number') {
            return defaultValue;
        }
        else {
            return defaultValue()(value);
        }
    };
}

export interface TheiaTimeouts {
    defaultTimeout: TimeoutGetter,
    findElementTimeout: TimeoutGetter,
    pageLoadTimeout: TimeoutGetter
}
