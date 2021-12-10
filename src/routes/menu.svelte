<script lang="ts">
	import Menu, { MenuButton, MenuItems, MenuItem } from '$lib/components/menu/';
	import { fade } from 'svelte/transition';

	let numOfItems = 3;
	function more({ key }: KeyboardEvent) {
		if (key === 'k') numOfItems++;
	}

	$: items = [...Array(numOfItems).keys()];
</script>

<svelte:window on:keydown={more} />

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"
	/>
</svelte:head>

<Menu let:open>
	<MenuButton class="button">Toggle {open}</MenuButton>
	<MenuItems>
		<MenuItem class="button" activeClass="is-primary" let:selected>
			Add {selected}
		</MenuItem>
		<MenuItem class="button" activeClass="is-danger" let:selected>
			Delete {selected}
		</MenuItem>
		<MenuItem class="button" activeClass="is-primary" let:selected>
			Edit {selected}
		</MenuItem>
		<MenuItem class="button" activeClass="is-primary" let:selected>
			Favourite {selected}
		</MenuItem>
		<MenuItem class="button" activeClass="is-primary" let:selected>
			Update {selected}
		</MenuItem>
	</MenuItems>
</Menu>

<p>
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque facilis dignissimos,
	voluptas exercitationem ducimus labore porro sint perspiciatis reprehenderit ad debitis
	explicabo illum soluta nostrum voluptatum repellendus excepturi beatae magnam? Cumque
	asperiores quod tempora veniam molestiae magni voluptatem, aut debitis, quibusdam
	exercitationem dolor soluta quia esse ab adipisci ad eos!
	<button>External</button>
</p>

<Menu let:open>
	<MenuButton class="button">Toggle {open}</MenuButton>
	<MenuItems>
		<MenuItem class="button" activeClass="is-primary">Add</MenuItem>
		<MenuItem class="button" activeClass="is-danger">Delete</MenuItem>
		<MenuItem class="button" activeClass="is-primary">Edit</MenuItem>
		<MenuItem class="button" activeClass="is-primary">Favourite</MenuItem>
		<MenuItem class="button" activeClass="is-primary">Update</MenuItem>
	</MenuItems>
</Menu>

<p>
	Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea ullam vel enim aut, sed
	omnis voluptatibus, dolorum doloremque non earum dolor obcaecati facere cumque tempore?
	Culpa iusto vel modi porro!
</p>

<input type="number" min="1" max="500" bind:value={numOfItems} />

<Menu let:open>
	<MenuButton class="button">Toggle {open}</MenuButton>
	<MenuItems>
		{#each items as item}
			<MenuItem class="button" activeClass="is-primary">Menu Item {item}</MenuItem>
		{/each}
	</MenuItems>
</Menu>

<p>
	Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem eligendi sapiente sit
	aliquam. Enim consequatur, totam cum, distinctio minima eligendi ratione pariatur
	voluptatem fuga corporis laborum! Debitis nostrum ex impedit earum odit nobis ipsam
	cupiditate, libero molestiae quos. Fuga, perferendis.
</p>

<Menu let:open let:menu let:button>
	<button class="button" use:button>Toggle {open}</button>
	<div slot="menu" use:menu transition:fade|local>
		<MenuItem class="button" activeClass="is-primary">Add</MenuItem>
		<MenuItem class="button" activeClass="is-danger">Delete</MenuItem>
		<MenuItem class="button" activeClass="is-primary">Edit</MenuItem>
		<MenuItem class="button" activeClass="is-primary">Favourite</MenuItem>
		<MenuItem class="button" activeClass="is-primary">Update</MenuItem>
	</div>
</Menu>
