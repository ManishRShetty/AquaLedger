export interface ParsedCatch {
    species: string;
    weight: number | null;
    original: string;
    status: 'clean' | 'draft';
}

export function parseCatchString(text: string): ParsedCatch {
    const cleanText = text.trim();

    // 1. Extract Weight (Start/End/Middle)
    // Matches: 20kg, 20.5 kg, 20 kilos, 20 lbs, 20pounds, 500g, 500 grams, 20
    // Group 1: Number
    // Group 3: Unit (optional)
    const weightRegex = /(\d+(?:\.\d+)?)\s*(kilos|kilo|kg|pounds|pound|lbs|grams|gram|g)?/i;
    const weightMatch = cleanText.match(weightRegex);

    let weight: number | null = null;
    let remainingText = cleanText;

    if (weightMatch) {
        const value = parseFloat(weightMatch[1]);
        const unit = weightMatch[2]?.toLowerCase();

        // Normalize to kg
        if (unit === 'lbs' || unit === 'pounds' || unit === 'pound') {
            weight = parseFloat((value * 0.453592).toFixed(2));
        } else if (unit === 'g' || unit === 'grams' || unit === 'gram') {
            weight = value / 1000;
        } else {
            weight = value;
        }

        // Remove the weight part from the text to isolate species
        // We replace only the first occurrence to avoid removing other numbers that might be part of species (unlikely but safe)
        remainingText = cleanText.replace(weightMatch[0], ':::WEIGHT:::');
    }

    // 2. Smart Cleanup for Species
    // We want to remove filler words ONLY if they are adjacent to the weight or at edges.
    // We don't want to break "Sea of Galilee"

    let species = remainingText;

    // Replace the placeholder back to empty space, but handle surrounding fillers
    // Regex to match fillers around the weight marker
    // (?:^|\s)(?:of|captured|caught|weighing|is|a)(?=\s|$)

    const fillers = 'of|captured|caught|weighing|is|a|an';
    const fillerRegex = new RegExp(`(?:^|\\s)(?:${fillers})(?=\\s|$)`, 'gi');

    // Strategy: Split by the weight marker. Clean the immediate edges of the split parts.
    const parts = species.split(':::WEIGHT:::');

    if (parts.length > 1) {
        // We had a weight match
        let pre = parts[0];
        let post = parts[1];

        // Remove fillers at the END of the pre-weight text (e.g. "Catch of [20kg]")
        // remove trailing fillers
        pre = pre.replace(new RegExp(`\\s+(?:${fillers})\\s*$`, 'gi'), ' ');

        // Remove fillers at the START of the post-weight text (e.g. "[20kg] of Tuna")
        // remove leading fillers
        post = post.replace(new RegExp(`^\\s*(?:${fillers})\\s+`, 'gi'), ' ');

        species = (pre + ' ' + post).trim();
    } else {
        // No weight found, or weight was at very start/end and split behavior varies.
        // If no weight found, just return text as species (maybe clean generic start fillers)
        species = species.replace(/:::WEIGHT:::/g, '').trim();
    }

    // Final cleanup of extra whitespace
    species = species.replace(/\s+/g, ' ').trim();

    // Capitalize first letter of each word
    species = species.replace(/\b\w/g, c => c.toUpperCase());

    const status: 'clean' | 'draft' = (weight !== null && species.length > 2) ? 'clean' : 'draft';

    return {
        species,
        weight,
        original: text,
        status
    };
}
