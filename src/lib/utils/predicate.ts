export function isBoolean(val: unknown): val is boolean {
	return typeof val === 'boolean';
}

export function isObject(val: unknown): val is object {
	return val instanceof Object;
}
