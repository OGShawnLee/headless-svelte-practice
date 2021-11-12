<script context="module">
	import { notifiable } from '$lib/stores';
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
