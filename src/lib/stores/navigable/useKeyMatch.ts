import type { NavigablePluginFunction } from '$lib/types';

export const useKeyMatch: NavigablePluginFunction = (node, { Data, Methods }) => {
	const keyEvent = { keyPressed: false, keys: new Set<string>() };

	function onPress({ key }: KeyboardEvent) {
		keyEvent.keys.add(key.toLocaleLowerCase());
		keyEvent.keyPressed = true;
	}

	function onRelease() {
		if (!keyEvent.keyPressed) return;
		Data.items.some((item, index) => {
			const text = item.textContent?.toLocaleLowerCase();
			const validKeys = Array.from(keyEvent.keys).join('');
			if (text?.startsWith(validKeys)) return Methods.interact(index), true;
		});

		keyEvent.keys.clear();
		keyEvent.keyPressed = false;
	}

	node.addEventListener('keydown', onPress);
	node.addEventListener('keyup', onRelease);
	return function () {
		node.removeEventListener('keydown', onPress);
		node.removeEventListener('keyup', onRelease);
	};
};
