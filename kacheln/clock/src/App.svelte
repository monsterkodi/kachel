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
	svg {
        margin: 5%;
        width:  90%;
        height: 90%;
	}

    .clock-face { stroke: #333; fill: #222; stroke-width: 2;}

    .major  { stroke: #333; stroke-width: 2; stroke-linecap:round; }

    .hour   { stroke: #888; stroke-width: 3; stroke-linecap:round; } 
    .minute { stroke: #555; stroke-width: 2; stroke-linecap:round; } 
    .second { stroke: #333; stroke-width: 1; stroke-linecap:round; } 
</style>

<svg viewBox='-50 -50 100 100'>
	<circle class='clock-face' r='48'/>

	{#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
        <line class='major' y1='45' y2='47' transform='rotate({30 * minute})' />
	{/each}

    <line class='hour'   y1='0' y2='-32' transform='rotate({30 * hours + minutes / 2})' />
    <line class='minute' y1='0' y2='-42' transform='rotate({6 * minutes + seconds / 10})' />

	<g transform='rotate({6 * seconds})'>
        <line class='second' y1='0' y2='-43'/>
	</g>
</svg>