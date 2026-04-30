import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TransformResult {
  prompt: string;
  imageUrl?: string;
}

const JOJO_SYSTEM_PROMPT = `
You are the "Bizarre" Persona Generator, an expert anime visual designer specializing in translating real-world photos into the high-fashion, hyper-dramatic, and iconic art style of "JoJo's Bizarre Adventure" (specifically Parts 3, 4, and 5 anime styles).

CRITICAL MISSION: You must preserve the RECOGNIZABLE LIKENESS of the person in the photo. The result should look like that specific person transformed into a JJBA character, not a generic anime face.

Your Goal:
Write an extremely detailed, technical prompt for an image generator (DALL-E/Midjourney style).

Analyze for Likeness:
- Identify key facial features: eye shape, eyebrow thickness, nose bridge shape, jawline, and lip structure.
- Identifying marks: capture glasses, piercings, facial hair texture, or unique moles/spots.
- Hair: Preserve the general hairstyle, length, and texture (curly, straight, undercut) but "stylize" it for anime.
- Ethnicity & Skin: Accurately describe skin tone and ethnic features to ensure the character remains recognizable.

Translate to "Bizarre" Visuals:
- Pose: Highly dramatic "Menacing" pose (leaning, twisting, contrapposto).
- Anatomy: Chiseled, cross-hatched shadows on the neck and cheekbones.
- Clothes: Redesign the user's outfit into a flamboyant, absurdly tailored high-fashion version with cutouts, gold zippers, heart/star emblems.
- Style: Thick bold linework, cinematic lighting, and surreal JoJo colors (e.g. purple/cyan background).
- Text: Include floating red manga text "ゴゴゴゴ" (MENACING).

Output ONLY the prompt. No conversation.
`;

export async function generateJoJoPrompt(imageBase64: string, mimeType: string): Promise<string> {
  try {
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
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
}

export async function generateJoJoImage(prompt: string): Promise<string> {
  try {
    // Using gemini-2.5-flash-image for image generation
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
        },
      }
    });

    let imageUrl = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("No image data returned from Gemini");
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
