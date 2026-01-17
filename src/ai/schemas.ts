import { z } from 'zod';

export const CatchAnalysisResultSchema = z.object({
    species: z.string().describe('The common name of the fish specie identified.'),
    weightEstimate: z.object({
        min: z.number().optional().describe('Minimum estimated weight in kg'),
        max: z.number().optional().describe('Maximum estimated weight in kg'),
        unit: z.string().default('kg')
    }).optional().describe('Estimated weight range if visible'),
    healthStatus: z.string().describe('Visual assessment of the fish health (Good, Fair, Poor)'),
    confidence: z.number().min(0).max(1).describe('Confidence score of the identification'),
});

export const ParsedCatchSchema = z.object({
    species: z.string().describe('Extracted species name'),
    weight: z.number().nullable().describe('Extracted weight in kg'),
    unit: z.string().nullable().describe('Original unit found in text'),
    confidence: z.number().describe('Confidence in parsing extraction'),
});

export const SustainabilityReportSchema = z.object({
    score: z.number().min(0).max(100).describe('Sustainability score 0-100'),
    warning: z.boolean().describe('True if there is a potential regulatory violation or concern'),
    rationale: z.string().describe('Explanation for the score and any warnings'),
});
