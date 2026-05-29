import { GoogleGenAI } from '@google/genai';

// Initialize the GoogleGenAI client (automatically picks up process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({});

const SYSTEM_INSTRUCTION = `
You are an expert full-stack web developer AI. Your task is to generate or update single-file web applications (HTML/CSS/JS combined) based on the user's prompt and chat history.

Instructions:
1. Build interactive, fully functional, modern, and beautiful single-file applications. Ensure that layouts are fully responsive and scrollable. Avoid using "overflow: hidden" on the <body> tag so that users can scroll if the content exceeds the viewport height (e.g. on small screen sizes or inside preview panels).
2. Embed CSS in a <style> tag in the <head>. Use modern aesthetics: dark mode/glassmorphism, vibrant tailored HSL colors, smooth transitions, gradients, and custom modern typography. Make it look professional, sleek, and premium (not basic).
3. Embed JS in a <script> tag before </body>. Ensure all interactive parts work, and handle edge cases nicely.
4. Output your response in two parts:
   a. First, write a brief, friendly description of the features or changes you made.
   b. Second, write the complete, updated code wrapped inside a single \`\`\`html and \`\`\` code block. Do NOT write multiple files. Everything must be inside one self-contained HTML file.
`;

export const generateAppCode = async (messages, userPrompt, currentCode = '') => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error('GEMINI_API_KEY environment variable is missing or placeholder. Please configure it in server/.env.');
        }

        const contents = [];

        // Add current code context if it exists
        if (currentCode) {
            contents.push({
                role: 'user',
                parts: [{ text: `Here is the current code of the application: \n\n\`\`\`html\n${currentCode}\n\`\`\`` }]
            });
            contents.push({
                role: 'model',
                parts: [{ text: `I have received the current code and I am ready to modify it based on your instructions.` }]
            });
        }

        // Add chat history
        for (const msg of messages) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }

        // Add user prompt
        contents.push({
            role: 'user',
            parts: [{ text: userPrompt }]
        });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.2
            }
        });

        if (!response || !response.text) {
            throw new Error('No response from Gemini API.');
        }

        return response.text;
    } catch (error) {
        console.error('Gemini Service Error:', error);
        throw error;
    }
};

export const autoGenerateTitle = async (userPrompt) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return '';
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `Analyze this web application creation prompt: "${userPrompt}". 
Generate a short, modern, and beautiful project title (maximum 3-4 words). 
Respond ONLY with the plain text title, no quotes, no period, and no explanation.`
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.3,
                maxOutputTokens: 20
            }
        });

        if (response && response.text) {
            return response.text.trim().replace(/^["']|["']$/g, '');
        }
        return '';
    } catch (error) {
        console.error('Auto Title Generation Error:', error);
        return '';
    }
};