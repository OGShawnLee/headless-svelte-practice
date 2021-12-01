import { writable } from 'svelte/store';
import type { Registrable } from '$lib/types';
import { isNumberArray } from '$lib/utils/predicate';

export function registrable<T>(val: T[] = []): Registrable<T> {
	const Stored = writable(val);
	const NewItem = writable<T | undefined>();

	const value = [...val];
	return {
		value,
		NewItem,
		subscribe: Stored.subscribe,
		emptyRegister() {
			let registeredIndex = value.length;
			Stored.update((state) => {
				const valueIsNumberArr = isNumberArray(value);
				const stateIsNumberArr = isNumberArray(state);

				if (!valueIsNumberArr || !stateIsNumberArr)
					throw new TypeError('Number Array Expected');

				value.push(registeredIndex as unknown as T);
				return [...state, registeredIndex] as unknown as T[];
			});

			return registeredIndex;
		},
		register(val: T, onRegister?: (val: T) => void) {
			const index = value.length;
			Stored.update((state) => {
				const duplicate = state.includes(val);
				if (duplicate) throw new Error('Duplicate Element');

				if (onRegister) onRegister(val);
				return value.push(val), [...state, val];
			});

			return index;
		},
		unregister(target, index) {
			Stored.update((state) => {
				const targetIndex = index ?? value.indexOf(target);
				value.splice(targetIndex);
				return state.filter((item) => item !== target);
			});
		},
		exists(val) {
			return value.includes(val);
		},
		useItems(callback) {
			value.forEach(callback);
		},
		listenNewItem(callback) {
			return NewItem.subscribe((val) => {
				if (val) callback(val);
			});
		},
	};
}

export function staticRegistrable<T>(items: T[]) {
	const NewItem = writable<T | null>(null);

	return {
		value: items,
		register: (val?: T, onRegister?: (val: T) => void) => {
			val && NewItem.set(val);
			if (val) {
				if (items.includes(val)) throw new Error('Duplicate Value');

				onRegister && onRegister(val);
				return items.push(val) - 1;
			} else if (isNumberArray(items)) {
				onRegister && onRegister(val as T);
				return items.push(items.length) - 1;
			} else throw new Error('Invalid Value');
		},
		extend: () => {},
		unregister: (registeredIndex: number) => {
			items.splice(registeredIndex);
		},
		useItems: (callback: (val: T) => void) => {
			for (let index = 0; index < items.length; index++) {
				const element = items[index];
				callback(element);
			}
		},
		listenNewItem: (callback: (val: T) => void) => {
			return NewItem.subscribe((val) => {
				if (val) callback(val);
			});
		},
	};
}
