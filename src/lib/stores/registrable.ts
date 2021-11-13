import { get, writable } from 'svelte/store';
import type { Registrable } from '$lib/types';
import { isNumberArray } from '$lib/utils/predicate';

export function registrable<T>(val: T[]): Registrable<T> {
	const Registered = writable(val);
	const NewItem = writable<T | null>(null);

	return {
		subscribe: Registered.subscribe,
		register: (val, onRegister) => {
			let registeredIndex = 0;

			val && NewItem.set(val);
			Registered.update((items) => {
				registeredIndex = items.length;
				if (val) {
					if (items.includes(val)) throw new Error('Duplicate Value');

					onRegister && onRegister(val);
					return [...items, val];
				}

				if (isNumberArray(items)) {
					onRegister && onRegister(val as T);
					return [...items, registeredIndex] as unknown as T[];
				} else throw new Error('Invalid Value');
			});

			return registeredIndex;
		},
		unregister: (val) => {
			Registered.update((items) => {
				return items.filter((item) => item !== val);
			});
		},
		useItems: (callback) => {
			const items = get(Registered);
			for (let index = 0; index < items.length; index++) {
				callback(items[index]);
			}
		},
		watchers: {
			watchNewItem: (callback) => {
				return NewItem.subscribe((val) => {
					if (val) callback(val);
				});
			},
		},
	};
}
