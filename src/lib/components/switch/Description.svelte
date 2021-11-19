<script lang="ts">
	import type { SoftAction } from '$lib/types';
	import { getContext, hasContext, onDestroy } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import { isSwitchGroupContext, SWITCH_GROUP_KEY } from './Group.svelte';
	import { isSwitchContext, SWITCH_KEY } from './Switch.svelte';

	let className = '';
	export { className as class };

	const hasGroupContext = hasContext(SWITCH_GROUP_KEY);
	const hasSwitchContext = hasContext(SWITCH_KEY);

	let description: SoftAction = () => void 0;
	let stopGroupAction: Unsubscriber | undefined;
	if (hasGroupContext && !hasSwitchContext) {
		const GroupContext = getContext(SWITCH_GROUP_KEY);
		if (!isSwitchGroupContext(GroupContext))
			throw new Error('Invalid Switch Group Context');
		const { DescriptionGroupAction } = GroupContext;
		stopGroupAction = DescriptionGroupAction.subscribe((action) => {
			description = action;
		});
	}

	if (hasSwitchContext) {
		const SwitchContext = getContext(SWITCH_KEY);
		if (!isSwitchContext(SwitchContext)) throw new Error('Invalid Switch Context');
		const { description: descriptionAction } = SwitchContext;
		description = descriptionAction;
	}

	onDestroy(() => {
		if (stopGroupAction) stopGroupAction();
	});
</script>

<p class={className} use:description>
	<slot />
</p>
