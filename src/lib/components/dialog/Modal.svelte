<script>
	import { getContext } from 'svelte';
	import { DIALOG_CONTEXT_KEY, isDialogContext } from './Dialog.svelte';

	let className = '';
	export { className as class };

	const DialogContext = getContext(DIALOG_CONTEXT_KEY);
	if (!isDialogContext(DialogContext)) throw Error('Invalid Dialog Context');

	const { modal } = DialogContext;
</script>

<div class={className} use:modal>
	<slot />
</div>
