import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Check if API key exists
const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';

if (!hasApiKey && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ GEMINI_API_KEY not set. AI features will be disabled.');
  console.warn('To enable AI: Get API key from https://aistudio.google.com/app/apikey');
}

export const ai = genkit({
  plugins: hasApiKey ? [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
  })] : [],
  model: hasApiKey ? 'googleai/gemini-2.5-flash' : undefined,
});
