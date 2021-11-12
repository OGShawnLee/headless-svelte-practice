export function isBoolean(val: unknown): val is boolean {
	return typeof val === 'boolean';
}

export function isObject(val: unknown): val is object {
	return val instanceof Object;
}

export function isNumberArray(val: unknown): val is number[] {
	if (!(val instanceof Array)) return false;
	return val.every((val): val is number => typeof val === 'number');
}
