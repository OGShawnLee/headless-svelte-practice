export { useSubscribers } from './useSubscribers';
export { handleSelectedStyles } from './handleSelectedStyles';
export { use_id, useNamer } from './components';

export const KEYS = {
	ArrowUp: 'ArrowUp',
	ArrowDown: 'ArrowDown',
	ArrowRight: 'ArrowRight',
	ArrowLeft: 'ArrowLeft',
	Enter: 'Enter',
	Space: 'Space',
};

export function isNotValidKey(key: string) {
	return !(key in KEYS);
}
