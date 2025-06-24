// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

interface Input {
    datasetId: string;
}
// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
const { datasetId } = input;

if (!datasetId) {
    throw new Error('Please provide a `datasetId` in the input.');
}

// Open the specified dataset
const dataset = await Actor.openDataset(datasetId);

// Fetch and log items (up to first 100)
console.log(`Logging up to 100 items from dataset ${datasetId}:`);
const { items } = await dataset.getData({ limit: 100 });
items.forEach((item) => console.log(item));

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
