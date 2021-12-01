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
