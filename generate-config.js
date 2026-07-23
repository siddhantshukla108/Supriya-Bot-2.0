import fs from 'fs';

// Get the API key from Netlify environment variables, or fallback to a placeholder
const apiKey = process.env.OPENROUTER_API_KEY || "your-openrouter-api-key-here";
const apiModel = "openai/gpt-oss-20b:free";

const configContent = `// --- Configuration ---
const API_KEY = "${apiKey}";
const API_MODEL = "${apiModel}";
`;

fs.writeFileSync('config.js', configContent);
console.log('Successfully generated config.js for deployment.');
