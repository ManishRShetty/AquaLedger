import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SustainabilityReportSchema } from '../schemas';

// Mock Regulatory Database (in real RAG this comes from vector db or API)
const REGULATORY_CONTEXT = `
CURRENT FISHING ALERTS (May 2026):
- Bluefin Tuna: STRICTLY PROHIBITED in Atlantic/Mediterranean. Quota full.
- Sea Bass: Bag limit 2 per day in UK waters.
- Grouper: Seasonal closure in Florida Keys.
- Red Snapper: Open season, but monitor size limits (min 16 inches).
`;

export const checkSustainability = ai.defineFlow(
    {
        name: 'checkSustainability',
        inputSchema: z.object({
            species: z.string(),
            location: z.string().optional(),
            date: z.string().optional(),
        }),
        outputSchema: SustainabilityReportSchema,
    },
    async ({ species, location, date }) => {

        // In a real app, strict retrieval step would happen here based on species/location
        const context = REGULATORY_CONTEXT;

        const result = await ai.generate({
            prompt: `Analyze the sustainability and compliance for catching "${species}" at "${location || 'Unknown Location'}" on "${date || 'Today'}".
      
      Use the following Regulatory Context to determine legality:
      """
      ${context}
      """
      
      Return a score (0-100) where 100 is perfectly sustainable/legal, and 0 is illegal/harmful.
      Flag 'warning' as true if it violates any rule in the context or is generally known as endangered.
      Provide a short rationale.`,
            output: { schema: SustainabilityReportSchema },
        });

        if (!result.output) {
            throw new Error("Failed to check sustainability");
        }

        return result.output;
    }
);
