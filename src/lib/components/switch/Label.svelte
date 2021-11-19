<script lang="ts">
	import type { Action } from '$lib/types';
	import { getContext, hasContext, onDestroy } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import { isSwitchGroupContext, SWITCH_GROUP_KEY } from './Group.svelte';
	import { isSwitchContext, SWITCH_KEY } from './Switch.svelte';

	export let passive = false;
	let className = '';
	export { className as class };

	const hasGroupContext = hasContext(SWITCH_GROUP_KEY);
	const hasSwitchContext = hasContext(SWITCH_KEY);

	let label: Action<boolean> = () => void 0;
	let stopGroupAction: Unsubscriber | undefined;
	if (hasGroupContext && !hasSwitchContext) {
		const GroupContext = getContext(SWITCH_GROUP_KEY);
		if (!isSwitchGroupContext(GroupContext))
			throw new Error('Invalid Switch Group Context');
		const { LabelGroupAction } = GroupContext;
		stopGroupAction = LabelGroupAction.subscribe((action) => {
			label = action;
		});
	}

	if (hasSwitchContext) {
		const SwitchContext = getContext(SWITCH_KEY);
		if (!isSwitchContext(SwitchContext)) throw new Error('Invalid Switch Context');
		const { label: labelAction } = SwitchContext;
		label = labelAction;
	}

	onDestroy(() => {
		if (stopGroupAction) stopGroupAction();
	});
</script>

<label class={className} for="" use:label={passive}>
	<slot />
</label>
