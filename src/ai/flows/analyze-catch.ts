import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CatchAnalysisResultSchema } from '../schemas';

export const analyzeCatchImage = ai.defineFlow(
    {
        name: 'analyzeCatchImage',
        inputSchema: z.object({
            imageBase64: z.string().describe('Base64 encoded image of the catch'),
        }),
        outputSchema: CatchAnalysisResultSchema,
    },
    async ({ imageBase64 }) => {
        // Construct the prompt manually for now using generate
        const result = await ai.generate({
            prompt: [
                { media: { url: imageBase64 } },
                { text: "Analyze this image of a fish catch. Identify the species, estimate its weight if possible from visual cues (size relative to surroundings), and assess its visible health. Provide a confidence score for your identification." }
            ],
            output: { schema: CatchAnalysisResultSchema },
        });

        if (!result.output) {
            throw new Error("Failed to generate analysis result");
        }

        return result.output;
    }
);
