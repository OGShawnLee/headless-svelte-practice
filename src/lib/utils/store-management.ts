import type { Readable, Writable, Unsubscriber } from 'svelte/store';
import { readable } from 'svelte/store';
import { isStore } from './predicate';

export function useSubscribers(
	...Unsubscribers: (Unsubscriber | undefined)[]
): Unsubscriber {
	return function () {
		Unsubscribers.forEach((Unsubscribe) => Unsubscribe?.());
	};
}

export function toStore<T>(
	Store: Readable<T> | undefined | T,
	defaultValue: T,
	type: (value: T) => Readable<T> | Writable<T> = readable
) {
	return isStore(Store) ? Store : Store ? type(Store) : type(defaultValue);
}
