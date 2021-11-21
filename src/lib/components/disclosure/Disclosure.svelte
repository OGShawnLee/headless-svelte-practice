<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable } from 'svelte/store';
	import { use_id, useNamer } from '$lib/utils';
	import { propsIn } from '$lib/utils/predicate';

	export const DISCLOSURE_CONTEXT_KEY = 'SVELTE-HEADLESS-DISCLOSURE';
	const generate_id = use_id();

	function initDisclosure({ Toggleable }: DisclosureConfig) {
		const { useButton, usePanel } = Toggleable;
		const id = generate_id.next().value as number;
		const [nameSubcomponent] = useNamer('disclosure', id);

		const button_id = nameSubcomponent('button');
		const panel_id = nameSubcomponent('panel');
		return {
			button: (node: HTMLElement) => {
				const DisposeButton = useButton(node);
				const stopSubcribers = Toggleable.subscribe((isOpen) => {
					node.ariaExpanded = String(isOpen);
					if (isOpen) {
						node.setAttribute('aria-labelledby', panel_id);
						node.setAttribute('aria-controls', panel_id);
					} else {
						node.removeAttribute('aria-labelledby');
						node.removeAttribute('aria-controls');
					}
				});

				node.id = button_id;
				return {
					destroy: () => {
						DisposeButton(), stopSubcribers();
					},
				};
			},
			panel: (node: HTMLElement) => {
				const DisposePanel = usePanel({ panelElement: node });

				node.id = panel_id;
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
	}

	interface DisclosureContext {
		Open: Readable<boolean>;
		button: (node: HTMLElement) => void;
		panel: (node: HTMLElement) => void;
	}
</script>

<script lang="ts">
	import { toggleable } from '$lib/stores';
	import { setContext } from 'svelte';

	export let open = false;

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const { close } = Toggleable;

	$: Toggleable.set(open);

	const { button, panel } = initDisclosure({ Toggleable });
	setContext(DISCLOSURE_CONTEXT_KEY, { Open: Toggleable, button, panel });
</script>

<slot {open} {button} {panel} {close} />
{#if open}
	<slot name="panel" />
{/if}
