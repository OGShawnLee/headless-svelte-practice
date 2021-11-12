<script context="module" lang="ts">
	import type { Readable } from 'svelte/store';
	import type { Notifiable } from '$lib/types';
	import { notifiable } from '$lib/stores';

	interface TabsSettings {
		Index: Notifiable<number>;
		Manual: Readable<boolean>;
		Vertical: Readable<boolean>;
	}
</script>

<script lang="ts">
	import { writable } from 'svelte/store';

	export let current = 0;
	export let manual = false;
	export let vertical = false;
	export let onChange: (index: number) => void = () => void 0;

	const Index = notifiable(current, (num) => (current = num));
	const Manual = writable(manual);
	const Vertical = writable(vertical);

	$: Index.set(current);
	$: Vertical.set(vertical);
	$: Manual.set(manual);

	$: if (onChange) onChange(current);
</script>
