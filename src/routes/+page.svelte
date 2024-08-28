<script lang="ts">
	import { onMount } from 'svelte';

	interface Stay {
		entry: Date;
		exit: Date;
	}

	// Japan stays
	let japanStays: Stay[] = [
		{ entry: new Date('2022-11-09'), exit: new Date('2023-01-17') },
		{ entry: new Date('2023-04-11'), exit: new Date('2023-06-14') },
		{ entry: new Date('2023-09-01'), exit: new Date('2023-10-16') },
		{ entry: new Date('2024-02-15'), exit: new Date('2024-04-25') },
		{ entry: new Date('2024-06-26'), exit: new Date('2024-08-13') }
	];

	function calculateDays(stays: Stay[], currentDate: Date, daysBack: number): number {
		const pastDate = new Date(currentDate);
		pastDate.setDate(pastDate.getDate() - daysBack);

		let totalDays = 0;

		for (let stay of stays) {
			if (stay.exit >= pastDate) {
				const start = stay.entry > pastDate ? stay.entry : pastDate;
				const end = stay.exit < currentDate ? stay.exit : currentDate;
				totalDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			}
		}

		return Math.min(totalDays, daysBack);
	}

	function getCurrentUKTaxYear(): { start: Date; end: Date } {
		const now = new Date();
		const year = now.getMonth() < 3 || (now.getMonth() === 3 && now.getDate() < 6) ? now.getFullYear() - 1 : now.getFullYear();
		return {
			start: new Date(year, 3, 6),
			end: new Date(year + 1, 3, 5)
		};
	}

	let daysInJapan: number;
	let daysOutsideUK: number;
	let japanFutureEntry: string = '';
	let japanFutureExit: string = '';
	let japanFutureStayStatus: string = '';
	let ukFutureStayStatus: string = '';

	onMount(() => {
		const currentDate = new Date();
		daysInJapan = calculateDays(japanStays, currentDate, 365);
		
		const ukTaxYear = getCurrentUKTaxYear();
		const daysInCurrentTaxYear = Math.ceil((currentDate.getTime() - ukTaxYear.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
		const daysInJapanCurrentTaxYear = calculateDays(japanStays, currentDate, daysInCurrentTaxYear);
		daysOutsideUK = daysInJapanCurrentTaxYear;
	});

	function checkFutureStay(stays: Stay[], futureEntry: string, futureExit: string, limit: number, taxYear: boolean = false): string {
		if (futureEntry && futureExit) {
			const entry = new Date(futureEntry);
			const exit = new Date(futureExit);
			const futureDays = Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			
			let totalDays: number;
			if (taxYear) {
				const ukTaxYear = getCurrentUKTaxYear();
				const daysInCurrentTaxYear = Math.ceil((exit.getTime() - ukTaxYear.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
				totalDays = calculateDays(stays, exit, daysInCurrentTaxYear) + futureDays;
			} else {
				totalDays = calculateDays(stays, exit, 365) + futureDays;
			}

			if (totalDays <= limit) {
				return `Your planned stay is within limits. Total days: ${Math.min(totalDays, 365)}`;
			} else {
				return `Warning: Your planned stay exceeds limits. Total days: ${Math.min(totalDays, 365)}`;
			}
		}
		return '';
	}

	function checkJapanFutureStay() {
		japanFutureStayStatus = checkFutureStay(japanStays, japanFutureEntry, japanFutureExit, 180);
		ukFutureStayStatus = checkFutureStay(japanStays, japanFutureEntry, japanFutureExit, 180, true);
	}
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<main class="bg-yellow-100 min-h-screen py-8 font-retro text-green-800">
	<div class="container mx-auto px-4 max-w-2xl">
		<h1 class="text-4xl font-bold text-center mb-8 retro-text-shadow">Bisa /</h1>
		
		<!-- Japan Section -->
		<div class="bg-white border-4 border-green-800 rounded-lg p-6 mb-6 retro-box-shadow">
			<h2 class="text-2xl font-semibold mb-4 retro-text-shadow">Japan Status</h2>
			<p class="mb-4">
				Total days spent in Japan in the past year: 
				<span class="font-bold text-red-600">{daysInJapan}</span>
			</p>
			<h3 class="text-xl font-semibold mb-2 retro-text-shadow">Plan Future Japan Stay</h3>
			<div class="flex flex-col sm:flex-row justify-between mb-4">
				<label class="mb-2 sm:mb-0 sm:w-[48%]">
					<span class="block mb-1">Entry Date:</span>
					<input type="date" bind:value={japanFutureEntry} on:change={checkJapanFutureStay} class="w-full p-2 border-2 border-green-800 rounded bg-yellow-100">
				</label>
				<label class="sm:w-[48%]">
					<span class="block mb-1">Exit Date:</span>
					<input type="date" bind:value={japanFutureExit} on:change={checkJapanFutureStay} class="w-full p-2 border-2 border-green-800 rounded bg-yellow-100">
				</label>
			</div>
			{#if japanFutureStayStatus}
				<p class="font-semibold retro-text-shadow" class:text-green-600={!japanFutureStayStatus.includes('Warning')} class:text-red-600={japanFutureStayStatus.includes('Warning')}>
					{japanFutureStayStatus}
				</p>
			{/if}
		</div>

		<!-- UK Section -->
		<div class="bg-white border-4 border-green-800 rounded-lg p-6 retro-box-shadow">
			<h2 class="text-2xl font-semibold mb-4 retro-text-shadow">UK Status (Time Outside UK)</h2>
			<p class="mb-4">
				Total days outside UK in the current tax year: 
				<span class="font-bold text-red-600">{daysOutsideUK}</span>
			</p>
			{#if ukFutureStayStatus}
				<p class="font-semibold mt-4 retro-text-shadow" class:text-green-600={!ukFutureStayStatus.includes('Warning')} class:text-red-600={ukFutureStayStatus.includes('Warning')}>
						{ukFutureStayStatus}
				</p>
			{/if}
		</div>
	</div>
</main>

<style>
    :global(body) {
        font-family: 'VT323', monospace;
    }

    .retro-text-shadow {
        text-shadow: 2px 2px 0px #4a5568;
    }

    .retro-box-shadow {
        box-shadow: 5px 5px 0px #4a5568;
    }

    input[type="date"] {
        font-family: 'VT323', monospace;
        font-size: 1.1rem;
    }

    input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.8) sepia(1) saturate(5) hue-rotate(175deg);
    }
</style>
