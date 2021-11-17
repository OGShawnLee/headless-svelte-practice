import type { Hashable } from '$lib/types';
import { derived, writable } from 'svelte/store';

export function hashable<K, V>(map = new Map<K, V>()): Hashable<K, V> {
	const Mapped = writable(map);
	const NewItem = writable<[K, V] | null>(null);
	return {
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
		register: (key, value, onRegister) => {
			let registeredIndex = 0;
			Mapped.update((items) => {
				const duplicateKey = items.has(key);
				if (duplicateKey) throw Error('Duplicate Key');

				const duplicateValue = Array.from(items.values()).includes(value);
				if (duplicateValue) throw new Error('Duplicate Value');

				NewItem.set([key, value]);
				if (onRegister) onRegister(key);
				return (registeredIndex = items.size), items.set(key, value);
			});

			return registeredIndex;
		},
		unregister: (key) => {
			Mapped.update((items) => {
				const deleted = items.delete(key);
				if (deleted) return items;
				else throw Error('Unable To Delete Item');
			});
		},
		update: (key, value) => {
			Mapped.update((items) => {
				return items.set(key, value);
			});
		},
		listenNewItem: (callback) => {
			return NewItem.subscribe((newItem) => {
				if (newItem) callback(newItem);
			});
		},
	};
}
