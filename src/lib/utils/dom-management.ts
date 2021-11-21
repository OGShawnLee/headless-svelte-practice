export function hideScrollbar() {
	const originalOverflow = document.body.style.overflow;
	document.body.style.overflow = 'hidden';
	return function () {
		document.body.style.overflow = originalOverflow;
	};
}
