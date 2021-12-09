import type { Keys, Navigable, NavigableData, NavigableMethods } from '$lib/types';
import type { Readable, Writable } from 'svelte/store';
import { toStore, useSubscribers, isNotValidKey, useValidator } from '$lib/utils';
import { isOverflowed } from '$lib/utils/dom-management';
import { derived, writable } from 'svelte/store';
import { isArray } from '$lib/utils/predicate';
import { tick } from 'svelte';

interface NavigableSettings {
	Items: Readable<HTMLElement[]> | HTMLElement[];
	Index?: Writable<number> | number;
	Manual?: Readable<boolean> | boolean;
	Vertical?: Readable<boolean> | boolean;
	Wait?: Readable<boolean> | boolean;
	onChange?: (index: number) => void;
}

export function navigable({ Items, ...Optional }: NavigableSettings): Navigable {
	const CoreStores = {
		Index: toStore(Optional.Index, 0, writable) as Writable<number>,
		Manual: toStore(Optional.Manual, false),
		Vertical: toStore(Optional.Vertical, false),
		Wait: toStore(Optional.Wait, false),
	};

	const { Index, Manual, Vertical, Wait } = CoreStores;

	const Data: NavigableData = {
		items: isArray(Items) ? Items : [],
		isVertical: false,
		isManual: false,
		isWaiting: false,
		selectedItem: undefined,
		TargetIndex: Index,
	};

	const ManualIndex = writable(0);
	const TargetIndex = derived(Manual, ($Manual) => ($Manual ? ManualIndex : Index));
	const Waiting = writable(true);
	const SelectedItem = isArray(Items)
		? derived([Index, Waiting], ([$Index, $Waiting]) => {
				return $Waiting ? undefined : Data.items[$Index];
		  })
		: derived([Index, Waiting, Items], ([$Index, $Waiting, $Items]) => {
				return $Waiting ? undefined : $Items[$Index];
		  });

	const Stores = { ...CoreStores, Items, ManualIndex, SelectedItem, Waiting };

	function listenStores() {
		const ItemsSubscriber = Items instanceof Array ? undefined : Items;
		const onChangeLoop = useValidator(Index, Waiting, true);
		return useSubscribers(
			Index.subscribe(ManualIndex.set),
			TargetIndex.subscribe((TargetIndex) => {
				Data.TargetIndex = TargetIndex;
			}),
			ItemsSubscriber?.subscribe((items) => {
				Data.items = items;
			}),
			SelectedItem.subscribe((item) => {
				Data.selectedItem = item;
			}),
			Vertical.subscribe((isVertical) => {
				Data.isVertical = isVertical;
			}),
			Manual.subscribe((isManual) => {
				Data.isManual = isManual;
			}),
			Wait.subscribe(Waiting.set),
			Waiting.subscribe((isWaiting) => {
				Data.isWaiting = isWaiting;
			}),
			Optional.onChange && onChangeLoop(Optional.onChange)
		);
	}

	const Methods: NavigableMethods = {
		set(index) {
			Index.set(index);
			Data.items[index].focus();
			Waiting.set(false);
		},
		interact(action, setWaiting = false) {
			const { TargetIndex, items, isManual } = Data;
			TargetIndex.update((index) => {
				const newIndex = typeof action === 'number' ? action : action(index);
				return items[newIndex].focus(), newIndex;
			});

			if (!isManual || setWaiting) Waiting.set(false);
		},
		navigate(direction, cb) {
			Methods.interact((index) => cb(index, isOverflowed(index, direction, Data.items)));
		},
		goNext(ctrlKey) {
			Methods.navigate('ASCENDING', (index, isOverflowed) => {
				if (ctrlKey) return Data.items.length - 1;
				return isOverflowed ? 0 : index + 1;
			});
		},
		goBack(ctrlKey) {
			Methods.navigate('DESCENDING', (index, isOverflowed) => {
				if (ctrlKey) return 0;
				return isOverflowed ? Data.items.length - 1 : index - 1;
			});
		},
		useLast() {
			Methods.interact(Data.items.length - 1);
		},
		useFirst() {
			Methods.interact(0);
		},
		useSelected() {
			Data.selectedItem?.focus();
		},
	};

	return {
		subscribe: Index.subscribe,
		Data,
		...Stores,
		Stores,
		...Methods,
		Methods,
		handleSelection(index) {
			return function (event) {
				if (event instanceof MouseEvent) Methods.set(index);

				if (event instanceof KeyboardEvent) {
					const { code } = event;
					if (['Enter', 'Space'].includes(code)) Methods.set(index);
				}
			};
		},
		async useDynamicOpen(node, startWithFunction) {
			await tick();
			const startWith = startWithFunction(Data);
			switch (startWith) {
				case 'FIRST':
					return Methods.useFirst();
				case 'LAST':
					return Methods.useLast();
				case 'AUTO':
					if (Data.isWaiting) return node.focus();
					return Methods.useSelected();
				default:
					const isInRange = (index: number, min: number, max: number) =>
						index >= min && index < max;

					if (isInRange(startWith, 0, Data.items.length)) Methods.set(startWith);
					else console.warn('Index out of Range'), node.focus();
			}
		},
		useNavigation(node) {
			const { goBack, goNext, useFirst, useLast, useSelected } = Methods;

			let isParentFocused = false;
			function handleParentFocus() {
				isParentFocused = true;
			}

			function handleChildrenFocus(event: FocusEvent) {
				if (event.target !== node) isParentFocused = false;
			}

			function handleNavigation(event: KeyboardEvent) {
				const { code, ctrlKey } = event;
				if (isNotValidKey(code)) return;
				const { isVertical, isWaiting } = Data;

				switch (code) {
					case 'Space':
					case 'Enter':
						if (isParentFocused) {
							event.preventDefault();
							isWaiting ? useFirst() : useSelected();
						}
				}

				if (isVertical)
					switch (code as Keys) {
						case 'ArrowUp':
							event.preventDefault();
							if (isParentFocused) return isWaiting ? useLast() : useSelected();

							return goBack(ctrlKey);
						case 'ArrowDown':
							event.preventDefault();
							if (isParentFocused) return isWaiting ? useFirst() : useSelected();

							return goNext(ctrlKey);
					}
				else
					switch (code as Keys) {
						case 'ArrowLeft':
							event.preventDefault();
							if (isParentFocused) return isWaiting ? useLast() : useSelected();

							return goBack(ctrlKey);
						case 'ArrowRight':
							event.preventDefault();
							if (isParentFocused) return isWaiting ? useFirst() : useSelected();

							return goNext(ctrlKey);
					}
			}

			const STOP_SUBSCRIBERS = listenStores();

			node.addEventListener('keydown', handleNavigation);
			node.addEventListener('focus', handleParentFocus);
			node.addEventListener('focusin', handleChildrenFocus);
			return function () {
				STOP_SUBSCRIBERS();
				isParentFocused = false;
				node.removeEventListener('keydown', handleNavigation);
				node.removeEventListener('focus', handleParentFocus);
				node.removeEventListener('focusin', handleChildrenFocus);
			};
		},
		usePlugins(node, ...pluginFn) {
			return useSubscribers(
				...pluginFn.map((plugin) => plugin(node, { Stores, Data, Methods }))
			);
		},
		listenSelected(callback) {
			let previous: HTMLElement | undefined;
			return SelectedItem.subscribe((selected) => {
				if (selected && selected !== previous) callback(selected, previous);
				previous = selected;
			});
		},
		isSelected(index, callback) {
			return Index.subscribe((idx) => callback(index === idx));
		},
		onDestroy(callback) {
			callback(Stores);
		},
	};
}
