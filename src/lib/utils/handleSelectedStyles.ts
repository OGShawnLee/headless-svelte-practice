import type { SelectedStyles } from '$lib/types';

// https://gist.github.com/dbowling/2589645
function safeClassName(className?: string) {
	if (!className) return;
	const classNames = className.split(' ');
	const noInvalidReg = new RegExp(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g);
	const replaceNLower = (str: string) => str.replace(noInvalidReg, '').toLowerCase();
	return classNames.map(replaceNLower).filter(Boolean);
}

export function handleSelectedStyles(styles?: SelectedStyles) {
	return function (selected: HTMLElement, previous?: HTMLElement) {
		if (!styles) return;
		const validIf = safeClassName(styles.if);
		const validElse = safeClassName(styles.else);
		if (validIf) {
			validElse && selected.classList.remove(...validElse);
			selected.classList.add(...validIf);
		}

		if (validElse) {
			validIf && previous?.classList.remove(...validIf);
			previous?.classList.add(...validElse);
		}
	};
}
