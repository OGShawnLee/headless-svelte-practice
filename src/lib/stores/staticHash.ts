import type { StaticHash } from '$lib/types';

export function staticHash<K, V>(map = new Map<K, V>()): StaticHash<K, V> {
	return {
		value: map,
		entries: () => Array.from(map.entries()),
		keys: () => Array.from(map.keys()),
		values: () => Array.from(map.values()),
		register: (key, value) => {
			let registeredIndex = 0;

			const duplicateKey = map.has(key);
			if (duplicateKey) throw Error('Duplicate Key');

			const duplicateValue = Array.from(map.values()).includes(value);
			if (duplicateValue) throw new Error('Duplicate Value');

			return map.set(key, value), registeredIndex;
		},
		updateItem: (key, callback) => {
			const result = callback(map.get(key), map);
			if (result) map.set(key, result);
		},
		unregister: (key) => {
			const deleted = map.delete(key);
			if (deleted) return;
			else throw Error('Unable To Delete Item');
		},
		update: (key, value) => {
			map.set(key, value);
		},
	};
}
