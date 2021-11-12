import { writable } from 'svelte/store';
import type { Registrable } from '$lib/types';
import { isNumberArray } from '$lib/utils/predicate';

export function registrable<T>(val: T[]): Registrable<T> {
	const Registered = writable(val);
	const NewItem = writable<T | null>(null);

	return {
		subscribe: Registered.subscribe,
		register: (val, onRegister) => {
			let registeredIndex = 0;

			NewItem.set(val);
			Registered.update((items) => {
				registeredIndex = items.length;
				if (items.includes(val)) throw Error('Duplicate Item');
				if (!val && isNumberArray(items)) {
					if (onRegister) onRegister(val);
					return [...items, registeredIndex] as unknown as T[];
				}

				if (onRegister) onRegister(val);
				return [...items, val];
			});

			return registeredIndex;
		},
		unregister: (val) => {
			Registered.update((items) => {
				return items.filter((item) => item !== val);
			});
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
