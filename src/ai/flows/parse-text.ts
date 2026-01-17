import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ParsedCatchSchema } from '../schemas';

export const parseDirtyCatchText = ai.defineFlow(
    {
        name: 'parseDirtyCatchText',
        inputSchema: z.object({
            text: z.string().describe('The raw/dirty text input from the user'),
        }),
        outputSchema: ParsedCatchSchema,
    },
    async ({ text }) => {
        // We use a simple prompt to extract structured data
        const result = await ai.generate({
            prompt: `Extract the fish species, weight (convert to kg), and original unit from this text: "${text}".
      
      If the text is vague, make your best guess and lower the confidence score.
      If no species is found, return "Unknown".
      If no weight is found, return null.`,
            output: { schema: ParsedCatchSchema },
        });

        if (!result.output) {
            throw new Error("Failed to parse text");
        }

        return result.output;
    }
);
