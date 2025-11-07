import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { SlideContent } from '../types';
import type { PresentationStyle } from '../App';

async function generateImageForSlide(ai: GoogleGenAI, slide: SlideContent): Promise<string> {
    const prompt = `Create a professional and visually appealing image for a presentation slide. The style should be modern, minimalist, and abstract, using a cool color palette of blues and purples. Avoid generating any text within the image. The slide title is "${slide.title}" and the content is: ${slide.content?.join(', ') || slide.contentColumn1?.join(', ') || ''}.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return '';
    } catch (error) {
        console.error('Image generation failed for slide:', slide.title, error);
        return '';
    }
}

export async function generateSlidesFromText(
  text: string,
  style: PresentationStyle,
  onProgress: (message: string) => void
): Promise<SlideContent[]> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const slideSchema = {
    type: Type.OBJECT,
    properties: {
      slides: {
        type: Type.ARRAY,
        description: "An array of slide objects that make up the presentation.",
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The main title of the slide. Should be concise and impactful.",
            },
            layout: {
                type: Type.STRING,
                description: "The layout for this slide.",
                enum: ['TEXT_WITH_IMAGE', 'TEXT_ONLY', 'IMAGE_FOCUSED', 'TITLE_ONLY', 'TWO_COLUMNS']
            },
            content: {
              type: Type.ARRAY,
              description: "For TEXT_ONLY or TEXT_WITH_IMAGE layouts. An array of strings, where each string is a bullet point.",
              items: { type: Type.STRING },
            },
            contentColumn1: {
                type: Type.ARRAY,
                description: "For TWO_COLUMNS layout. Bullet points for the first column.",
                items: { type: Type.STRING },
            },
            contentColumn2: {
                type: Type.ARRAY,
                description: "For TWO_COLUMNS layout. Bullet points for the second column.",
                items: { type: Type.STRING },
            },
            speakerNotes: {
              type: Type.STRING,
              description: "Optional, detailed speaker notes for the presenter.",
            },
          },
          required: ["title", "layout"],
        },
      },
    },
    required: ["slides"],
  };

  const systemInstruction = `You are an expert presentation designer. Convert the user's raw text into a structured, compelling presentation.
- Analyze the input to identify main topics and key points.
- Create a logical flow: title slide, content slides, and a summary/final slide.
- For each slide, choose the most appropriate layout from the available options: 'TEXT_WITH_IMAGE', 'TEXT_ONLY', 'IMAGE_FOCUSED', 'TITLE_ONLY', 'TWO_COLUMNS'.
- The user has expressed a preference for a '${style}' style. Please adhere to this preference:
  - 'BALANCED': Use a variety of layouts as you see fit.
  - 'TEXT_FOCUSED': Primarily use 'TEXT_ONLY' and 'TWO_COLUMNS'. Use other layouts sparingly.
  - 'VISUAL_FOCUSED': Primarily use 'IMAGE_FOCUSED' and 'TEXT_WITH_IMAGE'.
- Populate content fields based on the chosen layout. For 'TITLE_ONLY', all content fields should be empty. For 'TWO_COLUMNS', use 'contentColumn1' and 'contentColumn2'. For others, use 'content'.
- Ensure the final output strictly adheres to the provided JSON schema.`;
  
  onProgress('Analyzing text and generating slide content...');

  const textResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on the following text, create a presentation:\n\n---\n\n${text}`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: slideSchema,
    },
  });
  
  const jsonStr = textResponse.text.trim();
  const parsed = JSON.parse(jsonStr);

  if (!parsed || !Array.isArray(parsed.slides)) {
    throw new Error("Invalid response format from API for slide content.");
  }

  const textSlides = parsed.slides as SlideContent[];
  const slidesWithImages: SlideContent[] = [];

  const slidesToGetImagesFor = textSlides.filter(s => s.layout === 'TEXT_WITH_IMAGE' || s.layout === 'IMAGE_FOCUSED');
  let imageCounter = 0;

  for (let i = 0; i < textSlides.length; i++) {
    const slide = textSlides[i];
    if (slide.layout === 'TEXT_WITH_IMAGE' || slide.layout === 'IMAGE_FOCUSED') {
        imageCounter++;
        onProgress(`Generating image ${imageCounter} of ${slidesToGetImagesFor.length} for slide: "${slide.title}"`);
        try {
            const imageBase64 = await generateImageForSlide(ai, slide);
            slidesWithImages.push({
                ...slide,
                imageBase64: imageBase64 ? `data:image/png;base64,${imageBase64}` : undefined,
            });
        } catch (error) {
            console.error(`Skipping image for slide "${slide.title}" due to an error.`, error);
            slidesWithImages.push({ ...slide, imageBase64: undefined });
        }
    } else {
        slidesWithImages.push(slide);
    }
  }
  
  onProgress('Finalizing presentation...');
  return slidesWithImages;
}
