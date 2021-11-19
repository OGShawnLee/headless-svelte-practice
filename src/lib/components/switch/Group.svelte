<script context="module" lang="ts">
	import type { Writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { propsIn } from '$lib/utils/predicate';

	export const SWITCH_GROUP_KEY = 'svelte-headless-switch-group';

	export const isSwitchGroupContext = (val: unknown): val is SwitchGroupContext =>
		propsIn(val, 'notifyGroupChecked', 'LabelGroupAction', 'DescriptionGroupAction');

	interface SwitchGroupContext {
		notifyGroupChecked: Notifier<boolean>;
		LabelGroupAction: Writable<Action<boolean>>;
		DescriptionGroupAction: Writable<SoftAction>;
	}
</script>

<script lang="ts">
	import type { Action, Notifier, SoftAction } from '$lib/types';
	import { writable } from 'svelte/store';

	let [checked, notifyGroupChecked] = [false, (bool: boolean) => (checked = bool)];

	const LabelGroupAction = writable<Action<boolean>>();
	const DescriptionGroupAction = writable<SoftAction>();

	const GroupContext = { notifyGroupChecked, LabelGroupAction, DescriptionGroupAction };
	setContext(SWITCH_GROUP_KEY, GroupContext);
</script>

<slot {checked} />
