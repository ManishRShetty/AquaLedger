import { parseCatchString } from './src/lib/catchParser';

const testCases = [
    { input: "20kg Tuna", expected: { species: "Tuna", weight: 20, status: 'clean' } },
    { input: "Tuna 20kg", expected: { species: "Tuna", weight: 20, status: 'clean' } },
    { input: "20.5 kilos of Salmon", expected: { species: "Salmon", weight: 20.5, status: 'clean' } },
    { input: "Jack of all Trades 5kg", expected: { species: "Jack Of All Trades", weight: 5, status: 'clean' } },
    { input: "Catch of the Day 10 lbs", expected: { species: "Catch Of The Day", weight: 4.54, status: 'clean' } },
    { input: "Sea of Galilee Tilapia 2kg", expected: { species: "Sea Of Galilee Tilapia", weight: 2, status: 'clean' } },
    { input: "500 grams sardines", expected: { species: "Sardines", weight: 0.5, status: 'clean' } },
    { input: "Just a fish", expected: { species: "Just A Fish", weight: null, status: 'draft' } },
    { input: "big bass roughly 10 lbs", expected: { species: "Big Bass Roughly", weight: 4.54, status: 'clean' } }, // Regex might actually catch this as clean if it matches "10 lbs" and leaves the rest.
    // If our regex is strictly Number+Unit, "roughly 10 lbs" might fail or just extract 10lbs.
    // Let's test a fail case.
    { input: "big bass approx ten pounds", expected: { species: "Big Bass Approx Ten Pounds", weight: null, status: 'draft' } },
];

console.log("Running Parser Tests...\n");

let passed = 0;
testCases.forEach(({ input, expected }) => {
    const result = parseCatchString(input);
    const matchSpecies = result.species === expected.species;
    const matchWeight = result.weight === expected.weight;
    const matchStatus = result.status === expected.status;

    if (matchSpecies && matchWeight && matchStatus) {
        passed++;
        console.log(`✅ PASS: "${input}" -> { species: "${result.species}", weight: ${result.weight}, status: ${result.status} }`);
    } else {
        console.error(`❌ FAIL: "${input}"`);
        console.error(`   Expected: { species: "${expected.species}", weight: ${expected.weight}, status: ${expected.status} }`);
        console.error(`   Actual:   { species: "${result.species}", weight: ${result.weight}, status: ${result.status} }`);
    }
});

console.log(`\nResult: ${passed}/${testCases.length} passed.`);
