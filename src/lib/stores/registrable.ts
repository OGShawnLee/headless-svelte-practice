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
