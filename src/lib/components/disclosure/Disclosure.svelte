<script context="module" lang="ts">
	import type { Toggleable } from '$lib/types';
	import type { Readable } from 'svelte/store';
	import { propsIn, useId, useNamer, useSubscribers } from '$lib/utils';

	export const DISCLOSURE_CONTEXT_KEY = 'SVELTE-HEADLESS-DISCLOSURE';
	const generateId = useId();

	function initDisclosure({ Toggleable }: DisclosureConfig) {
		const id = generateId.next().value as number;
		const [baptize] = useNamer('disclosure', id);

		const buttonName = baptize('button');
		const panelName = baptize('panel');
		return {
			button: (node: HTMLElement) => {
				const STOP_SUBSCRIBERS = useSubscribers(
					Toggleable.useButton(node, { useDefaultKeys: true }),
					Toggleable.subscribe((isOpen) => {
						node.ariaExpanded = String(isOpen);
						if (isOpen) {
							node.setAttribute('aria-labelledby', panelName);
							node.setAttribute('aria-controls', panelName);
						} else {
							node.removeAttribute('aria-labelledby');
							node.removeAttribute('aria-controls');
						}
					})
				);

				node.id = buttonName;
				return {
					destroy: () => {
						STOP_SUBSCRIBERS();
					},
				};
			},
			panel: (node: HTMLElement) => {
				const DISPOSE_PANEL = Toggleable.usePanel(node);
				node.id = panelName;
				return {
					destroy: () => {
						DISPOSE_PANEL();
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
	import { toReadable } from '$lib/utils';

	export let open = false;

	const Toggleable = toggleable(open, (bool) => (open = bool));
	const Open = toReadable(Toggleable);

	$: Toggleable.set(open);

	const { button, panel } = initDisclosure({ Toggleable });
	setContext(DISCLOSURE_CONTEXT_KEY, { Open, button, panel });
</script>

<slot {open} {button} {panel} close={Toggleable.close} />
{#if open}
	<slot name="panel" />
{/if}
