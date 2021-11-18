import type { Notifier, Selectable } from '$lib/types';
import { derived, get, writable } from 'svelte/store';
import { hashable, notifiable } from '$lib/stores';
import { useSubscribers } from '$lib/utils';

export function selectable<T>(defaultValue: T, notifier: Notifier<T>): Selectable<T> {
	const SelectedValue = notifiable(defaultValue, notifier);
	const { Keys, Values, ...hashAPI } = hashable<HTMLElement, T>();

	let isInitialized = false;

	let initializedWithDefault = true;
	const SelectedIndex = writable(0);

	const Waiting = writable(true);
	let onDestroy = false;

	function handleDefaultMatch() {
		initializedWithDefault = false;
		get(Values).some((value, index) => {
			if (value === defaultValue) {
				Waiting.set(false);
				SelectedIndex.set(index);
			}
		});
	}

	function isSelected(registeredIndex: number) {
		return derived([SelectedIndex, Waiting], ([$SelectedIndex, $Waiting]) => {
			return !$Waiting && $SelectedIndex === registeredIndex;
		});
	}

	return {
		Keys,
		Values,
		subscribe: SelectedValue.subscribe,
		SelectedIndex,
		selectIndex: SelectedIndex.set,
		Waiting,
		selectIndexEvent: (index) => () => SelectedIndex.set(index),
		set: SelectedValue.set,
		finishWaiting: () => Waiting.set(false),
		listenSelection: () => {
			isInitialized = true;
			onDestroy = false;
			if (initializedWithDefault) handleDefaultMatch();

			const MainLoop = derived(
				[Values, SelectedIndex, Waiting],
				([$Values, $SelectedIndex, $Waiting]) => {
					return [$Values[$SelectedIndex], $Waiting] as [T, boolean];
				}
			);

			return useSubscribers(
				MainLoop.subscribe(([newSelectedValue, isWaiting]) => {
					if (!isWaiting && !onDestroy) SelectedValue.set(newSelectedValue);
				})
			);
		},
		listenNewItem: hashAPI.listenNewItem,
		initOption: ({ initialValue, initialIsSelected, Selected }) => {
			const Value = writable(initialValue);
			const Id = writable(0);

			return {
				set: Value.set,
				Id: derived(Id, ($Id) => $Id),
				registerOption: (key, onRegister) => {
					const registeredIndex = hashAPI.register(key, initialValue, onRegister);
					if (initialIsSelected && !isInitialized) {
						Waiting.set(false);
						initializedWithDefault = false;
						SelectedIndex.set(registeredIndex);
					}

					return Id.set(registeredIndex), registeredIndex;
				},
				unregisterOption: (key) => {
					onDestroy = true;
					hashAPI.unregister(key);
				},
				listenOption: (key, registeredIndex, isSelectedCallback) => {
					return useSubscribers(
						Value.subscribe((value) => hashAPI.update(key, value)),
						isSelected(registeredIndex).subscribe((isSelected) => {
							if (isSelectedCallback) isSelectedCallback(isSelected);
							Selected.notify(isSelected);
						}),
						Selected.subscribe((selected) => {
							if (selected && !isInitialized) SelectedIndex.set(registeredIndex);
						})
					);
				},
			};
		},
	};
}
