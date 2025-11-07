import { GoogleGenAI, Type } from "@google/genai";
import { SlideContent } from "../types";
import { PresentationStyle } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The main title of the slide. Should be concise and engaging.",
    },
    layout: {
        type: Type.STRING,
        enum: ['TEXT_WITH_IMAGE', 'TEXT_ONLY', 'TITLE_ONLY', 'IMAGE_FOCUSED', 'TWO_COLUMNS'],
        description: "The layout style for the slide. Choose the most appropriate one based on the content and presentation style.",
    },
    content: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of strings for bullet points. Used for 'TEXT_ONLY' and 'TEXT_WITH_IMAGE' layouts. Should be omitted for 'TITLE_ONLY' and 'TWO_COLUMNS'.",
    },
    content_col1: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of strings for bullet points in the first column. MUST be used for the 'TWO_COLUMNS' layout.",
    },
    content_col2: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of strings for bullet points in the second column. MUST be used for the 'TWO_COLUMNS' layout.",
    },
    image_prompt: {
        type: Type.STRING,
        description: "A descriptive prompt for an image generation model to create a relevant, visually appealing image for this slide. The prompt MUST be in English and highly detailed. This is required for 'TEXT_WITH_IMAGE' and 'IMAGE_FOCUSED' layouts."
    },
  },
  required: ["title", "layout"],
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
- Prioritize 'TEXT_ONLY' and 'TWO_COLUMNS' layouts.
- Use the 'TITLE_ONLY' layout for section breaks.
- Avoid image-based layouts unless absolutely necessary.
            `;
        case 'VISUAL_FOCUSED':
            return `
- Focus on visually driven slides with minimal text.
- Prioritize 'IMAGE_FOCUSED' and 'TEXT_WITH_IMAGE' layouts.
- Each visual slide MUST have a powerful, descriptive image prompt.
- Text content should be very concise.
            `;
        case 'BALANCED':
        default:
            return `
- Create a balanced mix of text and visuals.
- Use a variety of layouts like 'TEXT_WITH_IMAGE', 'TEXT_ONLY', and 'TWO_COLUMNS' to keep the presentation engaging.
- Ensure any visual layouts have a relevant and complementary image prompt.
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
    3.  For each slide, you must decide on the most appropriate 'layout' from the available options.
    4.  Based on the chosen layout, provide the required fields:
        -   For 'TEXT_WITH_IMAGE': 'title', 'content', and 'image_prompt'.
        -   For 'TEXT_ONLY': 'title' and 'content'.
        -   For 'TWO_COLUMNS': 'title', 'content_col1', and 'content_col2'.
        -   For 'IMAGE_FOCUSED': 'title' and 'image_prompt' (content is optional and should be minimal).
        -   For 'TITLE_ONLY': just the 'title'.
    5.  The 'image_prompt' MUST be in English and detailed enough for an AI image generator to create a high-quality, relevant image.
    6.  Adhere to the following presentation style guidelines to influence your layout choices:
        ${styleInstruction}
    7.  Ensure the output is a valid JSON array of slide objects. Do not include any text or markdown formatting outside of the JSON structure.

    **Raw Text:**
    ---
    ${text}
    ---
    `;

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

    const imageGenerationPromises = slides.map(async (slide, index) => {
        if (slide.image_prompt) {
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