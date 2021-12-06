import type { NavigablePluginFunction } from '$lib/types';
import type { Unsubscriber } from 'svelte/store';
import { isHTMLElement } from '$lib/utils/predicate';
import { isWithin } from '$lib/utils/dom-management';

export const useManualBlur: NavigablePluginFunction = (node, { Data, Stores }) => {
	const { Index, ManualIndex } = Stores;

	let STOP_SUBSCRIBERS: Unsubscriber | undefined;
	let isWindowEventAdded = false;
	let currentIndex = 0;

	function onEnter() {
		if (isWindowEventAdded) return;
		isWindowEventAdded = true;
		window.addEventListener('focusin', onFocus);
		STOP_SUBSCRIBERS = Index.subscribe((index) => (currentIndex = index));
	}

	function onFocus({ target }: FocusEvent) {
		if (target === Data.selectedItem) ManualIndex.set(currentIndex);
		if (isHTMLElement(target) && !isWithin(node, target)) onLeave();
	}

	function onLeave() {
		ManualIndex.set(currentIndex);
		window.removeEventListener('focusin', onFocus);
		isWindowEventAdded = false;
		if (STOP_SUBSCRIBERS) STOP_SUBSCRIBERS = STOP_SUBSCRIBERS() as undefined;
	}

	node.addEventListener('focusin', onEnter);
	return function () {
		node.removeEventListener('focusin', onEnter);
		if (STOP_SUBSCRIBERS) STOP_SUBSCRIBERS = STOP_SUBSCRIBERS() as undefined;
	};
};
