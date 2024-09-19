import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.0-pro";

// Safely access the API key in both client-side and server-side environments
const API_KEY =
  import.meta.env.VITE_GOOGLE_GENAI_API_KEY
   

if (!API_KEY) {
  console.error("API key is not defined. Please provide a valid API key.");
}

async function initializeChat(modelName, apiKey) {
  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = await genAI.getGenerativeModel({ model: modelName });
    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    return model.startChat({
      generationConfig,
      history: [],
    });
  } catch (error) {
    throw new Error("Failed to initialize chat: " + error.message);
  }
}

async function sendPrompt(chatInstance, prompt) {
  try {
    const result = await chatInstance.sendMessage(prompt);
    return await result.response.text();
  } catch (error) {
    throw new Error("Failed to send prompt: " + error.message);
  }
}

async function run(prompt) {
  try {
    if (!API_KEY) {
      throw new Error("API key is not available.");
    }
    const chat = await initializeChat(MODEL_NAME, API_KEY);
    const responseText = await sendPrompt(chat, prompt);
    console.log(responseText);
    return responseText;
  } catch (error) {
    console.error("Error occurred while generating response:", error);
    return null;
  }
}

export default run;
