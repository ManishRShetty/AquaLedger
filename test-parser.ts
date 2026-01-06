import { parseCatchString } from './src/lib/catchParser';

const testCases = [
    { input: "20kg Tuna", expected: { species: "Tuna", weight: 20 } },
    { input: "Tuna 20kg", expected: { species: "Tuna", weight: 20 } },
    { input: "20.5 kilos of Salmon", expected: { species: "Salmon", weight: 20.5 } },
    { input: "Jack of all Trades 5kg", expected: { species: "Jack of all Trades", weight: 5 } },
    { input: "Catch of the Day 10 lbs", expected: { species: "Catch of the Day", weight: 4.54 } }, // 10 * 0.453592 = 4.53592 -> 4.54
    { input: "Sea of Galilee Tilapia 2kg", expected: { species: "Sea of Galilee Tilapia", weight: 2 } },
    { input: "500 grams sardines", expected: { species: "Sardines", weight: 0.5 } }, // Normalizes to 0.5kg
    { input: "Just a fish", expected: { species: "Just a fish", weight: null } },
];

console.log("Running Parser Tests...\n");

let passed = 0;
testCases.forEach(({ input, expected }) => {
    const result = parseCatchString(input);
    const matchSpecies = result.species === expected.species;
    const matchWeight = result.weight === expected.weight;

    if (matchSpecies && matchWeight) {
        passed++;
        console.log(`✅ PASS: "${input}" -> { species: "${result.species}", weight: ${result.weight} }`);
    } else {
        console.error(`❌ FAIL: "${input}"`);
        console.error(`   Expected: { species: "${expected.species}", weight: ${expected.weight} }`);
        console.error(`   Actual:   { species: "${result.species}", weight: ${result.weight} }`);
    }
});

console.log(`\nResult: ${passed}/${testCases.length} passed.`);
