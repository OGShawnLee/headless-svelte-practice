export { handleSelectedStyles } from './handleSelectedStyles';
export * from './components';
export * from './dom-management';
export * from './focus-management';
export * from './predicate';
export * from './store-management';

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
