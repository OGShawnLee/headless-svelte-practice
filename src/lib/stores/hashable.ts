import type { Hashable } from '$lib/types';
import { isNumberArray } from '$lib/utils/predicate';
import { derived, writable } from 'svelte/store';

export function hashable<K, V>(map = new Map<K, V>()): Hashable<K, V> {
	const Mapped = writable(map);
	const NewItem = writable<[K, V] | undefined>();
	return {
		value: map,
		subscribe: Mapped.subscribe,
		Entries: derived(Mapped, ($Mapped) => {
			return Array.from($Mapped.entries());
		}),
		Keys: derived(Mapped, ($Mapped) => {
			return Array.from($Mapped.keys());
		}),
		Values: derived(Mapped, ($Mapped) => {
			return Array.from($Mapped.values());
		}),
		preRegister(val) {
			let index = 0;
			Mapped.update((state) => {
				const keys = Array.from(state.keys());
				if (!isNumberArray(keys)) throw new TypeError('Number Keys Expected');
				index = state.size;
				return map.set(index as unknown as K, val);
			});

			return index;
		},
		register(key, value, onRegister) {
			let index = 0;
			Mapped.update((state) => {
				const duplicate = state.has(key);
				if (duplicate) throw new Error('Duplicate Key Detected');
				index = state.size;

				if (onRegister) onRegister(key, value);
				return NewItem.set([key, value]), map.set(key, value);
			});

			return index;
		},
		unregister(key) {
			Mapped.update((state) => {
				const exists = state.has(key);
				if (!exists) throw new Error('Item To Delete Not Found');
				map.delete(key), state.delete(key);
				return state;
			});
		},
		update(key, value) {
			Mapped.update((state) => {
				const exists = state.has(key);
				if (!exists) throw new Error('Item to Update Not Found');
				return map.set(key, value);
			});
		},
		modify(key, callback) {
			Mapped.update((state) => {
				const item = state.get(key);
				if (!item) throw new Error('Item to Modify Not Found');
				return map.set(key, callback(item));
			});
		},
		listenItem(key, callback) {
			return Mapped.subscribe((state) => {
				callback(state.get(key));
			});
		},
		listenNewItem(callback) {
			return NewItem.subscribe((item) => {
				if (item) callback(item);
			});
		},
	};
}
