export function defineListener<E extends Event>(
	type: string,
	func: (callback: (event: E) => void, node: HTMLElement) => (e: E) => void,
	bubble = false
) {
	return function (callback: (e: E) => void, node: HTMLElement) {
		return {
			type,
			func: func(callback, node),
			bubble,
		};
	};
}
