import type { RequestHandler } from '@sveltejs/kit';

const API_URL = 'https://ruter-api.transhub.io/graphql';

interface QueryPayload {
	operationName: string;
	variables: {
		travelCardNumber: number;
	};
	query: string;
}

interface TravelCardResponse {
	data: {
		travelCard?: {
			tickets?: {
				validAllZones: boolean;
				productName?: { name: string };
				carnetDetails?: {
					remainingConsumptions: number;
					lastPossibleConsumptionDate: string;
					consumptionLog?: {
						numberOfConsumptions: number;
						validity: {
							startDate: string;
							endDate: string;
						};
					}[];
				};
				zones?: { name: string }[];
			}[];
		};
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const { travelCardNumber } = await request.json();

	if (!travelCardNumber) {
		return new Response(JSON.stringify({ message: 'Travel card number is required.' }), {
			status: 400
		});
	}

	try {
		const query: QueryPayload = {
			operationName: 'GetTravelCard',
			variables: { travelCardNumber: parseInt(travelCardNumber) },
			query: `
                query GetTravelCard($travelCardNumber: Int!) {
                    travelCard(id: $travelCardNumber) {
                        tickets {
                        validAllZones
                        productName { name }
                        carnetDetails {
                            remainingConsumptions
                            lastPossibleConsumptionDate
                            consumptionLog {
                            numberOfConsumptions
                            validity {
                                startDate
                                endDate
                            }
                            }
                        }
                        zones {
                            name
                        }
                        }
                    }
                }

            `
		};

		const headers = {
			Accept: '*/*',
			'Accept-Language': 'en',
			'Client-Platform': 'web',
			'Client-Version': '1.0.0',
			'Content-Type': 'application/json',
			'Owner-ID': 'AGDER'
		};

		const response = await fetch(API_URL, {
			method: 'POST',
			headers,
			body: JSON.stringify(query)
		});

		if (response.ok) {
			const data: TravelCardResponse = await response.json();
			if (!data.data) {
				return new Response(JSON.stringify({ message: 'Fant ingen reisekort på kortnummeret' }), {
					status: 404
				});
			}
			return new Response(JSON.stringify(data.data.travelCard || {}), { status: 200 });
		} else {
			return new Response(JSON.stringify({ message: 'Noe gikk galt ved henting av data' }), {
				status: response.status
			});
		}
	} catch (err) {
		return new Response(
			JSON.stringify({ message: `An error occurred: ${(err as Error).message}` }),
			{ status: 500 }
		);
	}
};
