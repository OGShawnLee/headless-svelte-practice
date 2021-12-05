export function hideScrollbar() {
	const originalOverflow = document.body.style.overflow;
	document.body.style.overflow = 'hidden';
	return function () {
		document.body.style.overflow = originalOverflow;
	};
}

export function isWithin(node?: HTMLElement, target?: HTMLElement) {
	return node?.contains(target || document.activeElement);
}

export function isOverflowed(
	index: number,
	direction: 'ASCENDING' | 'DESCENDING',
	items: HTMLElement[]
) {
	if (direction === 'ASCENDING') return index + 1 === items.length;
	if (direction === 'DESCENDING') return index - 1 === -1;
	throw new Error('Invalid Direction');
}
