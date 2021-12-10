<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { PopoverGroupContext } from '$lib/components/popover/Group.svelte';
	import { derived, Readable } from 'svelte/store';
	import { propsIn, useId, useNamer, useSubscribers } from '$lib/utils';

	export const POPOVER_CONTEXT_KEY = 'SVELTE-HEADLESS-POPOVER';
	const generateId = useId();

	function initPopover({ Toggleable, GroupContext }: PopoverSettings) {
		const id = generateId.next().value as number;
		const [baptize] = useNamer('popover', id);

		const buttonName = baptize('button');
		function isolatedButton(node: HTMLElement) {
			const Panel = Toggleable.Panel;
			const STOP_SUBSCRIBERS = useSubscribers(
				Toggleable.useButton(node, { useDefaultKeys: true }),
				Toggleable.subscribe((isOpen) => {
					node.ariaExpanded = String(isOpen);
				}),
				Panel.subscribe((panel) => {
					if (panel) node.setAttribute('aria-controls', panelName);
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
		}

		const panelName = baptize('panel');
		function isolatedPanel(node: HTMLElement) {
			const DISPOSE_PANEL = Toggleable.usePanel(node, {
				listeners: ['FOCUS_LEAVE', 'ESCAPE_KEY', 'CLICK_OUTSIDE'],
			});

			node.id = panelName;
			return {
				destroy: () => DISPOSE_PANEL(),
			};
		}

		const { useGroupButton, useGroupPanel } = GroupContext || {};
		return {
			button: GroupContext ? useGroupButton!(Toggleable, id) : isolatedButton,
			panel: GroupContext ? useGroupPanel!(Toggleable, id) : isolatedPanel,
		};
	}

	export const isPopoverContext = (val: unknown): val is PopoverContext =>
		propsIn(val, 'Open', 'button', 'panel');

	interface PopoverSettings {
		Toggleable: Toggleable;
		GroupContext?: PopoverGroupContext;
	}

	interface PopoverContext extends ReturnType<typeof initPopover> {
		Open: Readable<boolean>;
	}
</script>

<script lang="ts">
	import { toggleable } from '$lib/stores';
	import { getContext, setContext } from 'svelte';
	import { isPopoverGroupContext, POPOVER_GROUP_CONTEXT_KEY } from './Group.svelte';

	const GroupContext = getContext(POPOVER_GROUP_CONTEXT_KEY);
	if (GroupContext !== undefined && !isPopoverGroupContext(GroupContext))
		throw new Error('Invalid Group Context');

	let open = false;

	let className = '';
	export { className as class };

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const { button, panel } = initPopover({ Toggleable, GroupContext });

	const Open = derived(Toggleable, ($Open) => $Open);

	setContext(POPOVER_CONTEXT_KEY, { Open, button, panel });
</script>

<div class={className}>
	<slot {open} {button} {panel} close={Toggleable.close} />
	{#if open}
		<slot name="panel" />
	{/if}
</div>
