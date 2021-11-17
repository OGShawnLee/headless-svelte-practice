<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { PopoverGroupContext } from '$lib/components/popover/Group.svelte';
	import { clickOutside, escapeKey, focusLeave } from '$lib/utils/definedListeners';
	import { derived, Readable } from 'svelte/store';
	import { propsIn } from '$lib/utils/predicate';

	const POPOVERS = registrable<number>([]);
	export const POPOVERS_CONTEXT_KEY = 'svelte-headless-popover';

	function initPopover({ Toggleable, id, GroupContext }: PopoverSettings) {
		const { useButton, usePanel } = Toggleable;

		function isolatedButton(node: HTMLElement) {
			const disposeButton = useButton(node);
			return {
				destroy: () => {
					disposeButton();
				},
			};
		}

		function isolatedPanel(node: HTMLElement) {
			const disposePanel = usePanel({
				panelElement: node,
				listenersBuilders: [escapeKey, clickOutside, focusLeave],
			});

			return {
				destroy: () => {
					disposePanel();
				},
			};
		}

		return {
			button: GroupContext?.useGroupButton(Toggleable, id) || isolatedButton,
			panel: GroupContext?.useGroupPanel(Toggleable, id) || isolatedPanel,
		};
	}

	export const isPopoverContext = (val: unknown): val is PopoverContext =>
		propsIn(val, 'Open', 'button', 'panel');

	interface PopoverSettings {
		Toggleable: Toggleable;
		id: number;
		GroupContext?: PopoverGroupContext;
	}

	interface PopoverContext extends ReturnType<typeof initPopover> {
		Open: Readable<boolean>;
	}
</script>

<script lang="ts">
	import { registrable, toggleable } from '$lib/stores';
	import { getContext, onDestroy, setContext } from 'svelte';
	import { isPopoverGroupContext, POPOVER_GROUP_CONTEXT_KEY } from './Group.svelte';

	const id = POPOVERS.register();
	onDestroy(() => POPOVERS.unregister(id));

	let open = false;
	let className = '';
	export { className as closeAll };

	const GroupContext = getContext(POPOVER_GROUP_CONTEXT_KEY);
	if (GroupContext !== undefined) {
		if (!isPopoverGroupContext(GroupContext))
			throw new Error('Invalid Popover Group Context');
	}

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const { button, panel } = initPopover({ Toggleable, id, GroupContext });

	const Open = derived(Toggleable, ($Open) => $Open);
	setContext(POPOVERS_CONTEXT_KEY, { Open, button, panel });
</script>

<div class={className}>
	<slot {open} {button} {panel} close={Toggleable.close} />
	{#if open}
		<slot name="panel" />
	{/if}
</div>
