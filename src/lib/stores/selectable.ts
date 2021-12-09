import type { Notifier, Selectable } from '$lib/types';
import { writable } from 'svelte/store';
import { hashable, notifiable } from '$lib/stores';
import { useValidator } from '$lib/utils';

export function selectable<K, V>(
	initialValue: V,
	notifier: Notifier<V>,
	wait = false
): Selectable<K, V> {
	const Value = notifiable(initialValue, notifier);
	const Options = hashable<K, V>();
	const SelectedIndex = writable(0);
	const Waiting = writable(wait);

	let isInitialized = false;

	function getValues() {
		return Array.from(Options.value.values());
	}

	return {
		Waiting,
		SelectedIndex,
		Keys: Options.Keys,
		Values: Options.Values,
		Options: Options.subscribe,
		subscribe: Value.subscribe,
		select(index) {
			SelectedIndex.set(index);
			Waiting.set(false);
			isInitialized = true;
		},
		useInitialValueMatch() {
			if (isInitialized) return [false, -1];
			const values = getValues();
			const hasMatch = values.includes(initialValue);
			const matchIndex = values.indexOf(initialValue);
			return [hasMatch, matchIndex];
		},
		useSelection() {
			const MainLoop = useValidator(SelectedIndex, Waiting, true);
			return MainLoop((index) => {
				Value.set(getValues()[index]);
			});
		},
		register(key, value, isSelected) {
			const index = Options.register(key, value);
			if (!isInitialized && isSelected) this.select(index);
			return index;
		},
		update: Options.update,
		unregister: Options.unregister,
	};
}
