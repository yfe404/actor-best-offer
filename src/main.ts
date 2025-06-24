import { Actor } from 'apify';

await Actor.init();

interface Input {
    datasetId: string;
}

interface Offer {
    title: string;
    asid: string;
    itemUrl: string;
    description: string;
    keyword: string;
    sellerName: string;
    offer: string;
}

// function to parse the price in the forme '$valueInDollars' to a number
function parsePrice(price: string): number {
    const match = price.match(/^\$(\d+(\.\d{1,2})?)$/);
    if (!match) {
        throw new Error(`Invalid price format: ${price}`);
    }
    return parseFloat(match[1]);
}

// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
const { datasetId } = input;

if (!datasetId) {
    throw new Error('Please provide a `datasetId` in the input.');
}

// @todo check if error occured
const dataset = await Actor.openDataset(datasetId);

// each item is an Offer object
const items: Offer[] = [];

dataset.forEach((item) => {
    items.push(item as Offer);
});

// filter items to only the cheapest one per asid
const cheapestOffers: Record<string, Offer> = {};
items.forEach((item) => {
    if (!cheapestOffers[item.asid] || parsePrice(item.offer) < parsePrice(cheapestOffers[item.asid].offer)) {
        cheapestOffers[item.asid] = item;
    }
});

// Save each cheapest offer to the dataset
for (const offer of Object.values(cheapestOffers)) {
    await dataset.pushData(offer);
}

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
