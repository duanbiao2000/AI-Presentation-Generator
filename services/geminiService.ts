import { GoogleGenAI, Type } from "@google/genai";
import { SlideContent } from "../types";
import { PresentationStyle } from '../App';

// Fix: Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The main title of the slide. Should be concise and engaging.",
    },
    content: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of strings, where each string is a bullet point for the slide body. Should be informative but not overly verbose.",
    },
    image_prompt: {
        type: Type.STRING,
        description: "A descriptive prompt for an image generation model to create a relevant, visually appealing image for this slide. The prompt should be in English and detailed. For title slides, this could be an abstract concept related to the topic. For content slides, it should illustrate the key message."
    },
  },
  required: ["title", "content"],
};

const presentationSchema = {
    type: Type.ARRAY,
    items: slideSchema,
};

const getStylePrompt = (style: PresentationStyle): string => {
    switch (style) {
        case 'TEXT_FOCUSED':
            return `
- Focus on detailed, text-heavy slides.
- Prioritize information density.
- Image prompts should be minimal and abstract.
- Use more bullet points per slide if necessary.
            `;
        case 'VISUAL_FOCUSED':
            return `
- Focus on visually driven slides with minimal text.
- Each slide should have a powerful, descriptive image prompt.
- Text content should be very concise, ideally 1-3 short bullet points.
- Create more slides if needed to cover the content, rather than putting too much text on one slide.
            `;
        case 'BALANCED':
        default:
            return `
- Create a balanced mix of text and visuals.
- Each slide should have a clear title, 3-5 bullet points, and a relevant image prompt.
- Ensure the image prompt complements the text content.
            `;
    }
}

export const generateSlidesFromText = async (
  text: string,
  style: PresentationStyle,
  setLoadingMessage: (message: string) => void
): Promise<SlideContent[]> => {
    setLoadingMessage("Analyzing your text and structuring slides...");
    
    const styleInstruction = getStylePrompt(style);

    const prompt = `
    You are an expert presentation creator. Your task is to transform the following raw text into a structured JSON array for a slide presentation. Each object in the array represents a single slide.

    **Instructions:**
    1.  Analyze the provided text to understand its key themes, sections, and points.
    2.  Divide the content logically into a series of slides.
    3.  For each slide, create a concise 'title', a list of 'content' bullet points (as an array of strings), and a descriptive 'image_prompt'.
    4.  The 'image_prompt' MUST be in English and detailed enough for an AI image generator to create a high-quality, relevant image.
    5.  Adhere to the following presentation style guidelines:
        ${styleInstruction}
    6.  Ensure the output is a valid JSON array of slide objects. Do not include any text or markdown formatting outside of the JSON structure.

    **Raw Text:**
    ---
    ${text}
    ---
    `;

    // Step 1: Generate the slide structure (title, content, image_prompt)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: presentationSchema,
        },
    });

    let slides: SlideContent[];
    try {
        slides = JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", response.text);
        throw new Error("Could not structure the presentation. The model returned an invalid format.");
    }
    
    if (!slides || slides.length === 0) {
        throw new Error("No slides were generated from the provided text.");
    }

    // Step 2: Generate images for each slide that has an image prompt
    const imageGenerationPromises = slides.map(async (slide, index) => {
        if (slide.image_prompt && style !== 'TEXT_FOCUSED') {
            try {
                setLoadingMessage(`Generating image for slide ${index + 1} of ${slides.length}...`);
                const imageResponse = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: slide.image_prompt,
                    config: {
                        numberOfImages: 1,
                        aspectRatio: '16:9',
                    },
                });
                
                if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
                    return { ...slide, image_base64: imageResponse.generatedImages[0].image.imageBytes };
                }
            } catch (error) {
                console.error(`Failed to generate image for slide ${index + 1}:`, error);
                return slide;
            }
        }
        return slide;
    });

    setLoadingMessage(`Finalizing presentation...`);
    const slidesWithImages = await Promise.all(imageGenerationPromises);
    
    return slidesWithImages;
};
