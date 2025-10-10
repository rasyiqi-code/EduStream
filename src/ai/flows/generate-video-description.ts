'use server';
/**
 * @fileOverview A flow to generate a video description using AI.
 *
 * - generateVideoDescription - A function that generates a description for a video.
 * - GenerateVideoDescriptionInput - The input type for the generateVideoDescription function.
 * - GenerateVideoDescriptionOutput - The return type for the generateVideoDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVideoDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
});
export type GenerateVideoDescriptionInput = z.infer<
  typeof GenerateVideoDescriptionInputSchema
>;

const GenerateVideoDescriptionOutputSchema = z.object({
  description: z.string().describe("The generated video description. Should be concise and engaging for students."),
});
export type GenerateVideoDescriptionOutput = z.infer<
  typeof GenerateVideoDescriptionOutputSchema
>;

export async function generateVideoDescription(
  input: GenerateVideoDescriptionInput
): Promise<GenerateVideoDescriptionOutput> {
  return generateVideoDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVideoDescriptionPrompt',
  input: { schema: GenerateVideoDescriptionInputSchema },
  output: { schema: GenerateVideoDescriptionOutputSchema },
  prompt: `You are an expert educator creating content for a learning platform. Your task is to write a short, engaging, and informative description for a video based on its title. The description should be suitable for students.

Video Title: {{{title}}}

Generate a description that is no more than 2-3 sentences long.`,
});

const generateVideoDescriptionFlow = ai.defineFlow(
  {
    name: 'generateVideoDescriptionFlow',
    inputSchema: GenerateVideoDescriptionInputSchema,
    outputSchema: GenerateVideoDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
