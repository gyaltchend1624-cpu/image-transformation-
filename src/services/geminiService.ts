import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "") {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your Netlify environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface TransformResult {
  prompt: string;
  imageUrl?: string;
}

const JOJO_SYSTEM_PROMPT = `
You are the "Bizarre" Persona Generator, an expert anime visual designer specializing in translating real-world photos into the high-fashion, hyper-dramatic, and iconic art style of "JoJo's Bizarre Adventure" (specifically Parts 3, 4, and 5 anime styles).

CRITICAL MISSION: You MUST preserve the recognizable likeness of the person in the photo. The result must be a "JJBA version" of THIS EXACT PERSON, not a generic character. 

Analyze for Likeness:
- Face: Identify and describe the unique facial structure, chin shape, and forehead.
- Eyes: Preserve the original eye shape and eyebrow character.
- Nose/Mouth: Capture the specific proportions of the nose and lips.
- Hair: Keep the hairstyle recognizable but render it with thick, jagged Araki-style bunches.
- Ethnicity: Respect and preserve skin tone and ethnic features perfectly.

Translate to "Bizarre" Visuals:
- Pose: Highly dramatic "Menacing" pose (leaning, twisting, contrapposto).
- Anatomy: Chiseled, cross-hatched shadows on the neck and cheekbones.
- Clothes: Redesign the user's outfit into a flamboyant, absurdly tailored high-fashion version with cutouts, gold zippers, heart/star emblems.
- Style: Thick bold linework, cinematic lighting, and surreal JoJo colors (e.g. purple/cyan background).
- Text: Include floating red manga text "ゴゴゴゴ" (MENACING).

Output ONLY the prompt in English. No conversation.
`;

export async function generateJoJoPrompt(imageBase64: string, mimeType: string): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64.split(',')[1] || imageBase64,
              mimeType
            }
          },
          {
            text: JOJO_SYSTEM_PROMPT
          }
        ]
      },
      config: {
        thinkingConfig: {
          thinkingLevel: "LOW" as any // Minimize latency
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT" as any,
            threshold: "BLOCK_NONE" as any,
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH" as any,
            threshold: "BLOCK_NONE" as any,
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
            threshold: "BLOCK_NONE" as any,
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
            threshold: "BLOCK_NONE" as any,
          },
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("The Stand couldn't analyze the soul (No response text).");
    return text.trim();
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
}

export async function generateJoJoImage(prompt: string): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT" as any,
            threshold: "BLOCK_NONE" as any,
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH" as any,
            threshold: "BLOCK_NONE" as any,
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any,
            threshold: "BLOCK_NONE" as any,
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any,
            threshold: "BLOCK_NONE" as any,
          },
        ]
      }
    });

    let imageUrl = "";
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("No image data returned from Gemini");
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
