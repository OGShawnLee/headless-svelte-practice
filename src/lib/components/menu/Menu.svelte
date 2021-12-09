<script context="module" lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Keys, NavigableStartWith, Notifier, Toggleable } from '$lib/types';
	import { isNotValidKey, useNamer, useSubscribers, use_id, propsIn } from '$lib/utils';
	import { navigable, useKeyMatch, useHoverSync } from '$lib/stores/navigable';
	import { registrable, toggleable } from '$lib/stores';
	import {
		makeFocusable,
		preventTabbing,
		removeFocusable,
	} from '$lib/utils/focus-management';

	export const MENU_CONTEXT_KEY = 'SVELTE-HEADLESS-MENU';
	const generateId = use_id();

	function initMenu({ Toggleable }: MenuSettings) {
		const Items = registrable<HTMLElement>();
		const Navigable = navigable({ Items, Vertical: true, Wait: true });

		const id = generateId.next().value as number;
		const [baptize, menuName] = useNamer('menu', id);
		const buttonName = baptize('button');
		const generateItemId = use_id();

		let startWith: NavigableStartWith = 'AUTO';
		return {
			button(node: HTMLElement) {
				const STOP_SUBSCRIBERS = useSubscribers(
					Toggleable.useButton(node, {
						useDefaultKeys: false,
						keysReducer(event, { open, toggle }) {
							if (isNotValidKey(event.code)) return;
							switch (event.code as Keys) {
								case 'Enter':
								case 'Space':
									return (startWith = 'FIRST'), toggle(event);
								case 'ArrowUp':
									return (startWith = 'LAST'), open();
								case 'ArrowDown':
									return (startWith = 'FIRST'), open();
							}
						},
					}),
					Toggleable.subscribe((isOpen) => {
						node.ariaExpanded = String(isOpen);
						if (isOpen) node.setAttribute('aria-controls', menuName);
						else node.removeAttribute('aria-controls');
					})
				);

				node.id = buttonName;
				node.ariaHasPopup = 'true';
				return {
					destroy() {
						STOP_SUBSCRIBERS();
					},
				};
			},
			menu(node: HTMLElement) {
				makeFocusable(node);
				Navigable.useDynamicOpen(node, ({ isWaiting }) => {
					return isWaiting ? startWith : 'AUTO';
				});

				const STOP_SUBSCRIBERS = useSubscribers(
					Toggleable.usePanel(node, {
						listeners: ['FOCUS_LEAVE', 'ESCAPE_KEY', 'CLICK_OUTSIDE'],
					}),
					Navigable.useNavigation(node),
					Navigable.usePlugins(node, useKeyMatch),
					Navigable.listenSelected((selected) => {
						node.setAttribute('aria-activedescendant', selected.id);
					})
				);

				node.id = menuName;
				node.setAttribute('role', 'menu');
				node.setAttribute('aria-labelledby', buttonName);
				node.addEventListener('keydown', preventTabbing);
				return {
					destroy() {
						startWith = 'AUTO';
						STOP_SUBSCRIBERS();
						node.removeEventListener('keydown', preventTabbing);
					},
				};
			},
			item(node: HTMLElement, notifySelected: Notifier<boolean>) {
				const id = generateItemId.next().value as number;
				const itemName = baptize('item', id);

				const index = Items.register(node, removeFocusable);

				const STOP_SUBSCRIBERS = useSubscribers(
					useHoverSync(node, index, Navigable.interact),
					Navigable.isSelected(index, notifySelected)
				);

				const handleKeys = ({ code }: KeyboardEvent) =>
					['Enter', 'Space'].includes(code) && Toggleable.close();

				node.id = itemName;
				node.setAttribute('role', 'menuitem');
				node.addEventListener('mousedown', Toggleable.close);
				node.addEventListener('keydown', handleKeys);
				return {
					destroy() {
						STOP_SUBSCRIBERS(), Items.unregister(node, index);
						node.removeEventListener('mousedown', Toggleable.close);
						node.removeEventListener('keydown', handleKeys);
					},
				};
			},
		};
	}

	export const isMenuContext = (val: unknown): val is MenuContext =>
		propsIn(val, 'Open', 'button', 'menu', 'item');

	interface MenuContext {
		Open: Readable<boolean>;
		button: (node: HTMLElement) => void;
		menu: (node: HTMLElement, activeClass?: string) => void;
		item: (node: HTMLElement, notifySelected: Notifier<boolean>) => void;
	}

	interface MenuSettings {
		Toggleable: Toggleable;
	}
</script>

<script lang="ts">
	import { setContext } from 'svelte';
	import { toReadable } from '$lib/utils';

	let open = false;
	let Toggleable = toggleable(open, (bool) => (open = bool), true);
	const Open = toReadable(Toggleable);

	const { button, menu, item } = initMenu({ Toggleable });
	setContext(MENU_CONTEXT_KEY, { Open, button, menu, item });
</script>

<slot {open} {button} {menu} />
{#if open}
	<slot name="menu" />
{/if}
