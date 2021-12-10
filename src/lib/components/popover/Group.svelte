<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import { derived, Unsubscriber, writable, Writable } from 'svelte/store';
	import { browser } from '$app/env';
	import { useNamer, useSubscribers } from '$lib/utils';
	import { isHTMLElement, propsIn } from '$lib/utils/predicate';
	import { hashable } from '$lib/stores';

	export const POPOVER_GROUP_CONTEXT_KEY = 'SVELTE-HEADLESS-POPOVER-GROUP';

	function initPopoverGroup({ Expanded }: PopoverGroupSettings) {
		const { Values, value, ...Popovers } = hashable<number, Popover>();
		const EventTarget = writable<HTMLElement>();
		let CurrentOpenPopover: Popover | undefined;

		const Members = derived(Values, ($Values) => {
			return $Values.flatMap(({ button, panel }) => {
				return panel ? [button, panel] : button;
			});
		});

		const IsMember = derived([EventTarget, Members], ([$Target, $Members]) => {
			if (!document.contains($Target)) return 'SKIP';
			return $Members.some((member) => {
				return member === $Target || member.contains($Target);
			});
		});

		const closeAll = () => value.forEach((item) => item.close());
		function handleEscape({ key }: KeyboardEvent) {
			if (key === 'Escape') closeAll();
		}

		function handleClickOutside({ target }: MouseEvent) {
			if (isHTMLElement(target)) EventTarget.set(target);
		}

		function handleFocusOut({ target }: FocusEvent) {
			if (target === document.body) return;
			if (isHTMLElement(target)) EventTarget.set(target);
		}

		const TargetButton = writable<HTMLElement>();
		function handleSmartClose(e: MouseEvent | KeyboardEvent) {
			const target = e.target;
			if (!isHTMLElement(target)) return;
			if (e instanceof MouseEvent) return TargetButton.set(target);

			if (['Enter', 'Space'].includes(e.code)) TargetButton.set(target);
		}
		const MainLoop = derived(
			[IsMember, Expanded, TargetButton],
			([$IsMember, $Expanded, $Button]) =>
				[$IsMember, $Expanded, $Button] as [boolean | 'SKIP', boolean, HTMLElement]
		);

		return {
			usePopoverGroup() {
				return useSubscribers(
					MainLoop.subscribe(([isMember, expanded, targetButton]) => {
						if (isMember === 'SKIP') return;
						if (!isMember) return closeAll();
						if (!expanded && CurrentOpenPopover) {
							const { button, close } = CurrentOpenPopover;
							if (targetButton !== button) close();
						}
					})
				);
			},
			useGroupButton(Toggleable: Toggleable, id: number) {
				const close = () => Toggleable.set(false);
				const Panel = Toggleable.Panel;

				const [baptize] = useNamer('popover', id);
				const buttonName = baptize('button');
				const panelName = baptize('panel');

				return function (node: HTMLElement) {
					node.addEventListener('mousedown', handleSmartClose);
					node.addEventListener('keydown', handleSmartClose);

					Popovers.register(id, { button: node, close });
					const STOP_SUBSCRIBERS = useSubscribers(
						Toggleable.useButton(node, { useDefaultKeys: true }),
						Toggleable.subscribe((isOpen) => {
							CurrentOpenPopover = { button: node, close };
							node.ariaExpanded = String(isOpen);
						}),
						Panel.subscribe((panel) => {
							if (panel) {
								panel.id = panelName;
								node.setAttribute('aria-controls', panelName);
							} else node.removeAttribute('aria-controls');
						})
					);

					node.id = buttonName;
					node.ariaHasPopup = 'true';
					return {
						destroy() {
							Popovers.unregister(id), STOP_SUBSCRIBERS();
							node.removeEventListener('mousedown', handleSmartClose);
							node.removeEventListener('keydown', handleSmartClose);
						},
					};
				};
			},
			useGroupPanel(Toggleable: Toggleable, id: number) {
				return function (node: HTMLElement) {
					Toggleable.definePanel(node);
					Popovers.modify(id, (item) => ({ ...item, panel: node }));
					return {
						destroy: () => Toggleable.unregisterPanel(),
					};
				};
			},
			useListeners() {
				if (!browser) return;
				window.addEventListener('mousedown', handleClickOutside);
				window.addEventListener('keydown', handleEscape);
				window.addEventListener('focus', handleFocusOut, true);
			},
			removeListeners() {
				if (!browser) return;
				window.removeEventListener('mousedown', handleClickOutside);
				window.removeEventListener('keydown', handleEscape);
				window.removeEventListener('focus', handleFocusOut, true);
			},
		};
	}

	export const isPopoverGroupContext = (val: unknown): val is PopoverGroupContext =>
		propsIn(val, 'useGroupButton', 'useGroupPanel');

	export type PopoverGroupContext = Pick<
		ReturnType<typeof initPopoverGroup>,
		'useGroupButton' | 'useGroupPanel'
	>;

	interface Popover {
		button: HTMLElement;
		panel?: HTMLElement;
		close: () => void;
	}

	interface PopoverGroupSettings {
		Expanded: Writable<boolean>;
	}
</script>

<script lang="ts">
	import { onDestroy, onMount, setContext } from 'svelte';

	let className = '';

	export let expanded = false;
	export { className as class };

	const Expanded = writable(expanded);

	$: Expanded.set(expanded);

	const PopoverGroupState = initPopoverGroup({ Expanded });

	let STOP_SUBSCRIBERS: Unsubscriber;
	onMount(() => {
		PopoverGroupState.useListeners();
		STOP_SUBSCRIBERS = PopoverGroupState.usePopoverGroup();
	});
	onDestroy(() => {
		PopoverGroupState.removeListeners();
		if (STOP_SUBSCRIBERS) STOP_SUBSCRIBERS();
	});

	const { useGroupButton, useGroupPanel } = PopoverGroupState;
	setContext(POPOVER_GROUP_CONTEXT_KEY, { useGroupButton, useGroupPanel });
</script>

<div class={className}>
	<slot />
</div>
