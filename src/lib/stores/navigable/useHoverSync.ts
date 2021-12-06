import type { NavigableMethods } from '$lib/types';

export function useHoverSync(
	node: HTMLElement,
	index: number,
	interact: NavigableMethods['interact']
) {
	function onMouseMove() {
		interact(index);
	}

	node.addEventListener('mousemove', onMouseMove);
	return function () {
		node.removeEventListener('mousemove', onMouseMove);
	};
}
