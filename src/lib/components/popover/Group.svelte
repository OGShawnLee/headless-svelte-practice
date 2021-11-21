<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';

	export const POPOVER_GROUP_CONTEXT_KEY = 'SVELTE-HEADLESS-POPOVER-GROUP';

	function initPopoverGroup() {
		const { value: popovers, values, ...hashAPI } = staticHash<number, Popover>();

		function getMembers() {
			return values().flatMap(({ button, panel }) => {
				if (panel) return [button, panel];
				return button;
			});
		}

		function isMember(target: HTMLElement) {
			return getMembers().some((item) => {
				return item === target || item.contains(target);
			});
		}

		function closeAll(e: Event) {
			popovers.forEach((item) => item.close(e));
		}

		function handleClickOutside(event: MouseEvent) {
			const target = event.target;
			if (isHTMLElement(target) && !isMember(target)) closeAll(event);
		}

		function handleEscapeClose(event: KeyboardEvent) {
			if (event.key === 'Escape') closeAll(event);
		}

		function handleFocusOut(event: FocusEvent) {
			const target = event.target;
			if (target === document.body) return;
			if (isHTMLElement(target) && !isMember(target)) closeAll(event);
		}

		return {
			useGroupButton: (Toggleable: Toggleable, id: number) => {
				const { toggle, defineElements } = Toggleable;
				const close = () => Toggleable.set(false);

				return function (node: HTMLElement) {
					defineElements({ button: node });
					hashAPI.register(id, { button: node, panel: null, close });

					node.addEventListener('click', toggle);
					return {
						destroy: () => {
							hashAPI.unregister(id);
							node.removeEventListener('click', toggle);
						},
					};
				};
			},
			useGroupPanel: (Toggleable: Toggleable, id: number) => {
				const { defineElements } = Toggleable;
				return function (node: HTMLElement) {
					defineElements({ panel: node });
					hashAPI.updateItem(id, (item) => {
						if (!item) throw new Error('Unable to Update Popover');
						return { ...item, panel: node };
					});
				};
			},
			addListeners: () => {
				if (browser) {
					window.addEventListener('click', handleClickOutside);
					window.addEventListener('keydown', handleEscapeClose);
					window.addEventListener('focusin', handleFocusOut, true);
				}
			},
			removeListeners: () => {
				if (browser) {
					window.removeEventListener('click', handleClickOutside);
					window.removeEventListener('keydown', handleEscapeClose);
					window.removeEventListener('focusin', handleFocusOut, true);
				}
			},
		};
	}

	export type PopoverGroupContext = ReturnType<typeof initPopoverGroup>;

	export const isPopoverGroupContext = (val: unknown): val is PopoverGroupContext =>
		propsIn(val, 'useGroupButton', 'useGroupPanel', 'addListeners', 'removeListeners');

	interface Popover {
		button: HTMLElement;
		panel: HTMLElement | null;
		close: (ref?: HTMLElement | Event) => void;
	}
</script>

<script lang="ts">
	import { onDestroy, onMount, setContext } from 'svelte';
	import { isHTMLElement, propsIn } from '$lib/utils/predicate';
	import { staticHash } from '$lib/stores/staticHash';
	import { browser } from '$app/env';

	let className = '';
	export { className as class };

	const PopoverGroup = initPopoverGroup();

	onMount(() => PopoverGroup.addListeners());
	onDestroy(() => PopoverGroup.removeListeners());

	setContext(POPOVER_GROUP_CONTEXT_KEY, PopoverGroup);
</script>

<div class={className}>
	<slot />
</div>
