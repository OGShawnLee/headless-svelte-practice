<script context="module" lang="ts">
	import type { Activable, Notifier } from '$lib/types';
	import { registrable } from '$lib/stores';
	import { propsIn } from '$lib/utils/predicate';
	import { useId, useNamer, useSubscribers } from '$lib/utils';

	export const SWITCH_KEY = 'SVELTE-HEADLESS-SWITCH';
	const generateId = useId();

	function initSwitch({ Activable }: SwitchSettings) {
		const { toggle } = Activable;
		const id = generateId.next().value as number;
		const [baptize, switchName] = useNamer('switch', id);

		const Labels = registrable<string>([]);
		const Descriptions = registrable<string>([]);

		const labelGenerator = useId();
		const descriptionGenerator = useId();

		const preventDefault = (e: Event) => e.preventDefault();
		return {
			switcher: (node: HTMLElement) => {
				const STOP_SUBSCRIBERS = useSubscribers(
					Activable.subscribe((isActive) => {
						node.ariaChecked = String(isActive);
					}),
					Labels.subscribe((labels) => {
						if (labels.length) {
							const joinedLabels = labels.join(' ');
							node.setAttribute('aria-labelledby', joinedLabels);
						} else node.removeAttribute('aria-labelledby');
					}),
					Descriptions.subscribe((descriptions) => {
						if (descriptions.length) {
							const joinedDescriptions = descriptions.join(' ');
							node.setAttribute('aria-describedby', joinedDescriptions);
						} else node.removeAttribute('aria-describedby');
					})
				);

				node.id = switchName;
				node.addEventListener('click', toggle);
				return {
					destroy: () => {
						STOP_SUBSCRIBERS();
						node.removeEventListener('click', toggle);
					},
				};
			},
			label: (node: HTMLElement, passive = false) => {
				const id = labelGenerator.next().value as number;
				const labelName = baptize('label', id);
				Labels.register(labelName);

				node.id = labelName;
				node.setAttribute('for', switchName);
				if (passive) node.addEventListener('click', preventDefault);
				return {
					update: (newPassive: boolean) => {
						passive = newPassive;
						if (newPassive) node.addEventListener('click', preventDefault);
						else node.removeEventListener('click', preventDefault);
					},
					destroy: () => {
						Labels.unregister(labelName);
						if (passive) node.removeEventListener('click', preventDefault);
					},
				};
			},
			description: (node: HTMLElement) => {
				const id = descriptionGenerator.next().value as number;
				const descriptionName = baptize('description', id);
				Descriptions.register(descriptionName);

				node.id = descriptionName;
				return {
					destroy: () => {
						Descriptions.unregister(descriptionName);
					},
				};
			},
		};
	}

	export const isSwitchContext = (val: unknown): val is SwitchContext =>
		propsIn(val, 'label', 'description');

	interface SwitchSettings {
		Activable: Activable;
	}

	interface SwitchContext {
		label: (node: HTMLElement) => void;
		description: (node: HTMLElement) => void;
	}
</script>

<script lang="ts">
	import { activable } from '$lib/stores/activable';
	import { getContext, hasContext, setContext } from 'svelte';
	import { isSwitchGroupContext, SWITCH_GROUP_KEY } from './Group.svelte';

	let className = '';

	export let checked = false;
	export { className as class };
	export let activeClass = '';

	const Activable = activable(checked, (bool) => (checked = bool));
	const { switcher, label, description } = initSwitch({ Activable });

	$: finalClass = `${className} ${checked ? activeClass : ''}`;
	$: Activable.set(checked);

	let groupNotifier: Notifier<boolean> | undefined;
	$: groupNotifier && groupNotifier(checked);

	const hasGroupContext = hasContext(SWITCH_GROUP_KEY);
	if (hasGroupContext) {
		const GroupContext = getContext(SWITCH_GROUP_KEY);
		if (!isSwitchGroupContext(GroupContext)) throw Error('Invalid Switch Group Context');

		const { notifyGroupChecked, LabelGroupAction, DescriptionGroupAction } = GroupContext;

		LabelGroupAction.set(label);
		DescriptionGroupAction.set(description);
		groupNotifier = notifyGroupChecked;
	}

	setContext(SWITCH_KEY, { label, description });
</script>

<button class={finalClass} use:switcher>
	<slot {checked} />
</button>
