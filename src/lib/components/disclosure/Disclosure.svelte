<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable } from 'svelte/store';
	import { FocusManager } from '$lib/utils';
	import { propsIn } from '$lib/utils/predicate';

	const DISCLOSURES = registrable<number>([]);

	function initDisclosure({ Toggleable, id }: DisclosureConfig) {
		const { useButton, usePanel } = Toggleable;
		Toggleable.configureAria({ id, name: 'svelte-headless', hasPopup: false });

		return {
			button: (node: HTMLElement) => {
				const DisposeButton = useButton(node);
				return {
					destroy: () => DisposeButton(),
				};
			},
			panel: (node: HTMLElement) => {
				const DisposePanel = usePanel({ panelElement: node });
				FocusManager.focusFirstElement(node);
				return {
					destroy: () => {
						DisposePanel();
					},
				};
			},
		};
	}

	export const isDisclosureContext = (val: unknown): val is DisclosureContext =>
		propsIn(val, 'Open', 'button', 'panel');

	interface DisclosureConfig {
		Toggleable: Toggleable;
		id: number;
	}

	interface DisclosureContext {
		Open: Readable<boolean>;
		button: (node: HTMLElement) => void;
		panel: (node: HTMLElement) => void;
	}

	export const DISCLOSURE_CONTEXT_KEY = 'svelte-headless-disclosure';
</script>

<script lang="ts">
	import { registrable, toggleable } from '$lib/stores';
	import { onDestroy, setContext } from 'svelte';

	let id = DISCLOSURES.register();
	onDestroy(() => DISCLOSURES.unregister(id));

	export let open = false;

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const { close } = Toggleable;

	$: Toggleable.set(open);

	const { button, panel } = initDisclosure({ Toggleable, id });
	setContext(DISCLOSURE_CONTEXT_KEY, { Open: Toggleable, button, panel });
</script>

<slot {open} {button} {panel} {close} />
{#if open}
	<slot name="panel" />
{/if}
