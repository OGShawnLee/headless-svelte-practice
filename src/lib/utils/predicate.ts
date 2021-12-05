import type { Readable } from 'svelte/store';

export function propsIn(val: unknown, ...properties: string[]) {
	if (!isObject(val)) return false;
	return properties.every((prop) => prop in val);
}

export function isBoolean(val: unknown): val is boolean {
	return typeof val === 'boolean';
}

export function isHTMLElement(val: unknown): val is HTMLElement {
	return val instanceof HTMLElement;
}

export function isObject(val: unknown): val is object {
	return val instanceof Object;
}

export function isNumberArray(val: unknown): val is number[] {
	if (!(val instanceof Array)) return false;
	return val.every((val): val is number => typeof val === 'number');
}

export function isArray(val: unknown): val is Array<unknown> {
	return val instanceof Array;
}

export const isFunction = (val: unknown): val is Function => typeof val === 'function';

export const isStringArray = (val: unknown): val is string[] =>
	isArray(val) && val.every((item) => typeof item === 'string');

export const isStore = <T>(val: unknown): val is Readable<T> => propsIn(val, 'subscribe');
