import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION as DEFAULT_SYSTEM_INSTRUCTION } from "../constants";
import { ChatConfig } from "../types";

const getClient = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY || '';
    return new GoogleGenAI({ apiKey });
};

// Helper to provide friendly error messages based on status codes
const getFriendlyErrorMessage = (error: any): string => {
    const msg = error?.message || error?.toString() || '';
    const status = error?.status || error?.response?.status;
    
    if (status === 400 || msg.includes('400') || msg.includes('INVALID_ARGUMENT')) {
        return "I apologize, but the request was invalid (400). Please check your input.";
    }
    if (status === 401 || msg.includes('401') || msg.includes('UNAUTHENTICATED')) {
        return "Authentication failed (401). Please check that your API key is valid.";
    }
    if (status === 403 || msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
        return "I cannot access this feature (403). It might be restricted in your region or for your account.";
    }
    if (status === 404 || msg.includes('404') || msg.includes('NOT_FOUND')) {
        return "The requested service is currently unavailable (404).";
    }
    if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        return "I have reached my activity limit for now (429). Please try again in a moment.";
    }
    if (status >= 500 || msg.includes('500') || msg.includes('INTERNAL')) {
        return "I am experiencing internal server issues (500). Please try again later.";
    }
    if (status === 503 || msg.includes('503') || msg.includes('SERVICE_UNAVAILABLE')) {
         return "The service is temporarily unavailable (503). Please check back soon.";
    }
    if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        return "I am having trouble connecting to the internet. Please check your network.";
    }
    
    return "An unexpected error occurred. Please try again.";
};

// Helper for image encoding
const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const sendMessageToGemini = async (
    history: { role: 'user' | 'model', text: string }[],
    newMessage: string,
    config?: ChatConfig
): Promise<string> => {
    try {
        const ai = getClient();
        
        // Determine model and tools based on config
        let model = "gemini-2.5-flash";
        const tools: any[] = [];
        let thinkingConfig = undefined;

        if (config?.thinkingBudget && config.thinkingBudget > 0) {
            model = "gemini-3-pro-preview";
            thinkingConfig = { thinkingBudget: config.thinkingBudget };
        } else if (config?.useGoogleSearch) {
             model = "gemini-2.5-flash";
             tools.push({ googleSearch: {} });
        } else if (config?.model) {
            model = config.model;
        }

        const chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: config?.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
                tools: tools.length > 0 ? tools : undefined,
                thinkingConfig: thinkingConfig,
            },
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }))
        });

        const result = await chat.sendMessage({
            message: newMessage
        });

        let responseText = result.text || "I apologize, I could not generate a response at this time.";
        return responseText;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return getFriendlyErrorMessage(error);
    }
};

export const editImage = async (imageFile: File, prompt: string): Promise<string | null> => {
    try {
        const ai = getClient();
        const base64Data = await fileToBase64(imageFile);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: imageFile.type
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Image Editing Error:", error);
        throw error;
    }
};

export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string | null> => {
    try {
        const ai = getClient();
        // Using gemini-3-pro-image-preview for high quality output and size control
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    {
                        text: prompt
                    }
                ]
            },
            config: {
                imageConfig: {
                    aspectRatio: "9:16", // Wallpapers are typically portrait
                    imageSize: size
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Image Generation Error:", error);
        throw error;
    }
};

export const generateVideo = async (imageFile: File, prompt: string): Promise<string | null> => {
    try {
        const ai = getClient();
        const base64Data = await fileToBase64(imageFile);

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || "Animate this image.",
            image: {
                imageBytes: base64Data,
                mimeType: imageFile.type
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16' // Keeping portrait for consistency with app theme, or could be passed as arg
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;

        // Fetch the actual video bytes using the API key
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Video Generation Error:", error);
        throw error;
    }
};