
export const calculateLocalScore = (species: string, weight: number): { score: number; rationale: string } => {
    // Basic heuristics for offline demonstration
    const lowerSpecies = species.toLowerCase();

    if (lowerSpecies.includes('tuna')) {
        return {
            score: 45,
            rationale: 'Tuna populations are generally overfished. Verify species (Yellowfin/Bluefin) for accurate score.'
        };
    }
    if (lowerSpecies.includes('mackerel')) {
        return {
            score: 85,
            rationale: 'Mackerel is typically a fast-growing, sustainable choice.'
        };
    }
    if (lowerSpecies.includes('tilapia')) {
        return {
            score: 75,
            rationale: 'Tilapia is often farmed sustainably, but wild stocks vary.'
        };
    }

    // Default / Unknown
    return {
        score: 60,
        rationale: 'Species data not locally available. Pending full AI analysis.'
    };
}
