<script lang="ts">
	import Dialog, {
		DialogOverlay,
		DialogModal,
		DialogTitle,
		DialogDescription,
	} from '$lib/components/dialog';

	import { fade, scale } from 'svelte/transition';

	let initialFocus: HTMLElement;

	let open = false;
	let secondOpen = false;
	let thirdOpen = false;
	let fourthOpen = false;
</script>

<h2>Complete Dialog</h2>
<p>All components should render properly and focus has to be trapped</p>
<p>
	Dialog has to close upon clicking on the overlay, pressing Escape key or pressing the
	nested button with the close function
</p>
<button on:click={() => (open = !open)}>Toggle Dialog</button>
<Dialog bind:open let:close>
	<DialogOverlay class="dialog-overlay" />
	<DialogModal class="dialog-modal">
		<DialogTitle>This is a modal</DialogTitle>
		<DialogDescription>This is an awesome description</DialogDescription>

		<button>Accept</button>
		<button on:click={close}>Close</button>
	</DialogModal>
</Dialog>

<h2>Custom Modal using actions and transitions</h2>
<p>Should work as well, focus should be on first focusable element</p>
<button on:click={() => (secondOpen = !secondOpen)}>Other Open</button>
<Dialog bind:open={secondOpen} let:modal let:overlay let:close>
	<div class="dialog-overlay" use:overlay transition:fade={{ duration: 150 }} />
	<div slot="modal" class="dialog-modal" use:modal transition:scale={{ start: 0.75 }}>
		<h1>What are you buying?</h1>
		<p>A stranger has appeared. What are you buying?</p>

		<button>First</button>
		<button on:click={close}>Close</button>
	</div>
</Dialog>

<h2>No Focusable Children</h2>
<p>Focus should stay on toggler button so that dialog can be closed with the Enter key</p>
<button on:click={() => (thirdOpen = !thirdOpen)}>Other Open</button>
<Dialog bind:open={thirdOpen} let:modal let:overlay>
	<div class="dialog-overlay" use:overlay />
	<div slot="modal" class="dialog-modal" use:modal>
		<h1>What are you buying?</h1>
		<p>A stranger has appeared. What are you buying?</p>
	</div>
</Dialog>

<h2>Changing initial focus</h2>
<p>Should focus element given</p>
<button on:click={() => (fourthOpen = !fourthOpen)}>Toggle Dialog</button>
<Dialog bind:open={fourthOpen} let:close {initialFocus}>
	<DialogOverlay class="dialog-overlay" />
	<DialogModal class="dialog-modal">
		<DialogTitle>This is a modal</DialogTitle>
		<DialogDescription>This is an awesome description</DialogDescription>

		<button>First</button>
		<button>Second</button>
		<button bind:this={initialFocus}>Third</button>
		<button on:click={close}>Close</button>
	</DialogModal>
</Dialog>

<style>
	button:focus {
		background-color: black;
	}

	:global(.dialog-overlay) {
		position: fixed;
		inset: 0 0 0 0;

		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.85);
	}

	:global(.dialog-modal) {
		width: 80%;
		max-width: 600px;
		background-color: white;
		padding: 2rem 2.25rem;
		border-radius: 1.5rem;
		box-shadow: 15px 15px 15px rgba(0, 0, 0, 0.15);
	}
</style>
