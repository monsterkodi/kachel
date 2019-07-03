<script>
	import { onMount } from 'svelte';

	let time = new Date();

	$: hours   = time.getHours();
	$: minutes = time.getMinutes();
	$: seconds = time.getSeconds();

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<style>

	body {
		padding: 0;
		margin: 0;
	}

	svg {
		margin: 0px;
		background-color: #111;
		width: 100%;
		height: 100%;
	}

	.clock-face {
		stroke: #333;
		fill: #222;
	}

	.minor {
		stroke: #999;
		stroke-width: 0.5;
	}

	.major {
		stroke: #333;
		stroke-width: 1;
	}

	.hour {
		stroke: #000;
	}

	.minute {
		stroke: #666;
	}

	.second {
		stroke: rgb(180,180,180);
	}
</style>

<svg viewBox='-50 -50 100 100'>
	<circle class='clock-face' r='48'/>

	{#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
		<line
			class='major'
			y1='40'
			y2='45'
			transform='rotate({30 * minute})'
		/>

		{#each [1, 2, 3, 4] as offset}
			<line
				class='minor'
				y1='44'
				y2='45'
				transform='rotate({6 * (minute + offset)})'
			/>
		{/each}
	{/each}

	<line
		class='hour'
		y1='2'
		y2='-28'
		transform='rotate({30 * hours + minutes / 2})'
	/>

	<line
		class='minute'
		y1='4'
		y2='-38'
		transform='rotate({6 * minutes + seconds / 10})'
	/>

	<g transform='rotate({6 * seconds})'>
		<line class='second' y1='4' y2='-38'/>
	</g>
</svg>