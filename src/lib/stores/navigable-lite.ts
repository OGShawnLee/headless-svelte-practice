import type { Readable, Unsubscriber, Writable } from 'svelte/store';
import type { NavigableLite } from '$lib/types';
import { derived, readable, writable } from 'svelte/store';
import { isBoolean, isHTMLElement } from '$lib/utils/predicate';
import { useSubscribers } from '$lib/utils';
import { unstoppable } from '$lib/stores';

export function navigableLite({ items, ...Optional }: Settings): NavigableLite {
	let {
		Index = writable(0),
		Manual = readable(false),
		Vertical = readable(false),
	} = Optional;

	if (isBoolean(Manual)) Manual = readable(Manual);
	if (isBoolean(Vertical)) Vertical = readable(Vertical);

	const ManualIndex = writable(0);
	const TargetIndex = derived(Manual as Readable<boolean>, ($Manual) => {
		return $Manual ? ManualIndex : Index;
	});

	const Selected = derived(Index, ($Index) => items[$Index]);

	function isOverflowed(
		index: number,
		direction: 'ASCENDING' | 'DESCENDING',
		length: number
	) {
		if (direction === 'ASCENDING') return index + 1 === length;
		if (direction === 'DESCENDING') return index - 1 === -1;
		throw new Error('Invalid Direction');
	}

	function navigate(
		direction: 'ASCENDING' | 'DESCENDING',
		Index: Writable<number>,
		callback: (index: number, isOverflowed: boolean) => number
	) {
		Index.update((index) => {
			const overflowed = isOverflowed(index, direction, items.length);
			const newIndex = callback(index, overflowed);
			return items[newIndex].focus(), newIndex;
		});
	}

	function goFirst() {
		return 0;
	}

	function goLast() {
		return items.length - 1;
	}

	function goPrev(Index: Writable<number>, ctrlKey: boolean) {
		navigate('DESCENDING', Index, (index, isOverflowed) => {
			if (ctrlKey) return goFirst();
			return isOverflowed ? goLast() : index - 1;
		});
	}

	function goNext(Index: Writable<number>, ctrlKey: boolean) {
		navigate('ASCENDING', Index, (index, isOverflowed) => {
			if (ctrlKey) return goLast();
			return isOverflowed ? goFirst() : index + 1;
		});
	}

	return {
		Index,
		ManualIndex,
		set: Index.set,
		useNavigation(node, callback) {
			const ARROWS = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
			const Arrow = unstoppable('');
			let should_run = false;
			let usedCtrl = false;

			function handleKeyboard({ key, ctrlKey }: KeyboardEvent) {
				usedCtrl = ctrlKey;
				if (ARROWS.includes(key)) {
					should_run = true;
					Arrow.set(key);
				}
			}

			const MainLoop = derived(
				[Arrow, TargetIndex, Vertical as Readable<boolean>],
				([$Arrow, $Index, $Vertical]) =>
					[$Arrow, $Index, $Vertical] as [string, Writable<number>, boolean]
			);

			const STOP_SUBSCRIBERS = useSubscribers(
				Index.subscribe((index) => {
					ManualIndex.set(index);
					if (callback) callback(index);
				}),
				MainLoop.subscribe(([arrow, Index, vertical]) => {
					if (!should_run) return;
					should_run = false;

					arrow = Arrow.resolve();
					if (vertical)
						switch (arrow) {
							case 'ArrowUp':
								return goPrev(Index, usedCtrl);
							case 'ArrowDown':
								return goNext(Index, usedCtrl);
						}
					else
						switch (arrow) {
							case 'ArrowLeft':
								return goPrev(Index, usedCtrl);
							case 'ArrowRight':
								return goNext(Index, usedCtrl);
						}
				})
			);

			node.addEventListener('keydown', handleKeyboard);
			return function () {
				STOP_SUBSCRIBERS();
				node.removeEventListener('keydown', handleKeyboard);
			};
		},
		handleSelection: (index) => {
			return function () {
				Index.set(index), ManualIndex.set(index);
			};
		},
		listenSelected: (callback) => {
			let previous: HTMLElement | undefined;
			return Selected.subscribe((selected) => {
				if (selected && selected !== previous) callback(selected, previous);
				previous = selected;
			});
		},
		isSelected: (index, callback) => {
			return Index.subscribe((Index) => callback(Index === index));
		},
	};
}

interface Settings {
	items: HTMLElement[];
	Index?: Writable<number>;
	Manual?: Readable<boolean> | boolean;
	Vertical?: Readable<boolean> | boolean;
}

export function useManualBlur(
	node: HTMLElement,
	items: HTMLElement[],
	Index: Readable<number>,
	ManualIndex: Writable<number>
) {
	const HasLeft = writable(false);
	const MainLoop = derived([HasLeft, Index], ([$HasLeft, $Index]) => {
		return [$HasLeft, $Index] as [boolean, number];
	});

	let STOP_SUBSCRIBER: Unsubscriber | undefined;
	let isEventAdded = false;
	let currentIndex: number | undefined;
	let selectedItem: HTMLElement | undefined;

	function onFocusEnter({ target }: FocusEvent) {
		// Syncing when user tabs to the Selected Item
		if (target === selectedItem && currentIndex !== undefined)
			ManualIndex.set(currentIndex);

		if (isEventAdded) return;
		(isEventAdded = true), HasLeft.set(false);

		STOP_SUBSCRIBER = MainLoop.subscribe(([hasLeft, index]) => {
			(selectedItem = items[index]), (currentIndex = index);
			if (hasLeft) ManualIndex.set(index);
		});

		window.addEventListener('focus', handleFocusLeave, true);
	}

	function onFocusLeave() {
		window.removeEventListener('focus', handleFocusLeave, true);
		HasLeft.set(true), (isEventAdded = false);
		if (STOP_SUBSCRIBER) STOP_SUBSCRIBER();
		STOP_SUBSCRIBER = undefined;
	}

	function handleFocusLeave({ target }: FocusEvent) {
		if (!isHTMLElement(target)) return;
		if (!node.contains(target)) onFocusLeave();
	}

	node.addEventListener('focusin', onFocusEnter);
	return function () {
		HasLeft.set(false), (isEventAdded = false);
		if (STOP_SUBSCRIBER) STOP_SUBSCRIBER = STOP_SUBSCRIBER() as undefined;
		node.removeEventListener('focusin', onFocusEnter);
	};
}

export function useKeyMatch(
	node: HTMLElement,
	items: HTMLElement[],
	Index: Writable<number>
) {
	const Key = writable('');

	function handleKeyMatch({ key }: KeyboardEvent) {
		Key.set(key.toLocaleLowerCase());
	}

	const STOP_SUBSCRIBER = Key.subscribe((key) => {
		items.some((item, index) => {
			const text = item.textContent?.toLocaleLowerCase();
			if (key && text?.startsWith(key)) {
				return Index.set(index), item.focus(), true;
			}
		});
	});

	node.addEventListener('keydown', handleKeyMatch);
	return function () {
		STOP_SUBSCRIBER();
		node.removeEventListener('keydown', handleKeyMatch);
	};
}
