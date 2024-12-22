<script lang="ts">
	interface Ticket {
		validAllZones: boolean;
		productName?: { name: string };
		carnetDetails?: {
			remainingConsumptions: number;
			lastPossibleConsumptionDate: string;
			consumptionLog?: {
				validity: {
					startDate: string;
				};
			}[];
		};
		zones?: { name: string }[];
	}

	let travelCardNumber: string = '';
	let result: Ticket[] | null = null;
	let error: string | null = null;
	let showTravelLog: boolean = false;

	async function checkTravelCard(): Promise<void> {
		error = null;
		result = null;

		if (!travelCardNumber) {
			error = 'Travel card number is required.';
			return;
		}

		try {
			const response = await fetch('/api/travel-card', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ travelCardNumber })
			});

			const data = await response.json();
			if (response.ok) {
				result = data.tickets || [];
				if (result && !result.length) {
					error = 'Ingen billetter funnet for dette kortnummeret.';
				}
			} else {
				error = data.message || 'Noe gikk galt.';
			}
		} catch (err) {
			error = `Det oppstod en feil: ${(err as Error).message}`;
		}
	}

	function formatDate(value: string): string {
		try {
			const date = new Date(value);
			return date.toLocaleString('en-GB', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return value;
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-8 text-gray-800">
	<h1 class="mb-6 text-3xl font-bold text-gray-700">Sjekk Reisekort 🚌</h1>
	<form
		on:submit|preventDefault={checkTravelCard}
		class="w-full max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
	>
		<div>
			<label for="travelCardNumber" class="block text-sm font-medium text-gray-700">
				Kortnummer
			</label>
			<input
				id="travelCardNumber"
				type="text"
				bind:value={travelCardNumber}
				placeholder="123456789"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
			/>
		</div>
		<button
			type="submit"
			class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-blue-700"
		>
			Hent saldo
		</button>
	</form>

	{#if error}
		<p class="mt-6 text-red-600">{error}</p>
	{/if}

	{#if result}
		<div class="mt-8 w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-700">Biletter</h2>
				<div class="flex items-center space-x-2">
					<input
						id="toggleTravelLog"
						type="checkbox"
						bind:checked={showTravelLog}
						class="h-4 w-4 rounded border-gray-300 text-blue-600"
					/>
					<label for="toggleTravelLog" class="text-sm text-gray-600"> Vis reiselogg </label>
				</div>
			</div>
			<ul class="divide-y divide-gray-200">
				{#each result as ticket}
					<li class="py-4">
						<p class="text-sm font-medium text-gray-800">
							Produkt: {ticket.productName?.name || 'N/A'}
						</p>
						<p class="text-sm text-gray-600">
							Soner: {ticket.zones?.map((zone) => zone.name).join(', ') || 'None'}
						</p>
						{#if ticket.carnetDetails}
							<p class="text-sm text-gray-600">
								Gjenværende klipp: {ticket.carnetDetails.remainingConsumptions}
							</p>
							<p class="text-sm text-gray-600">
								Utløpsdato: {formatDate(ticket.carnetDetails.lastPossibleConsumptionDate)}
							</p>
							{#if showTravelLog && ticket.carnetDetails.consumptionLog}
								<div class="mt-2 text-gray-600">
									<strong>Reiselogg:</strong>
									<ul class="list-inside list-disc space-y-1">
										{#each ticket.carnetDetails.consumptionLog as log}
											<li>
												{formatDate(log.validity.startDate)}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</main>

<style>
</style>
