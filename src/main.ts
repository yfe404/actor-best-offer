import { Actor } from 'apify';

await Actor.init();

interface Input {
    datasetId: string;
}

interface Offer {
    title: string;
    asin: string;
    itemUrl: string;
    description: string;
    keyword: string;
    sellerName: string;
    offer: string;
    price: number;
}

const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
const { datasetId } = input;

if (!datasetId) {
    throw new Error('Please provide a `datasetId` in the input.');
}

const dataset = await Actor.openDataset(datasetId);
if (!dataset) {
    throw new Error(`Dataset with ID ${datasetId} not found.`);
}

// each item is an Offer object
const offers: Offer[] = await dataset.map((item) => item as Offer);
console.log(`Fetched ${offers.length} offers from the dataset.`);

// filter items to only the cheapest one per asin
const cheapestOffers: Record<string, Offer> = offers.reduce<Record<string, Offer>>((acc, offerData) => {
    const prev = acc[offerData.asin];
    const currPrice = offerData.price;
    const prevPrice = prev ? prev.price : Infinity;

    if (currPrice < prevPrice) {
        acc[offerData.asin] = offerData;
    }
    return acc;
}, {});

console.log(`Filtered to ${Object.keys(cheapestOffers).length} cheapest offers.`);

// Save each cheapest offer to the dataset
for (const offer of Object.values(cheapestOffers)) {
    console.log(`Saving cheapest offer for ASID ${offer.asin}: ${offer.title} - ${offer.offer}`);
    await Actor.pushData(offer);
}

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
