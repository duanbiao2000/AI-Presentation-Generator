import pptxgen from "pptxgenjs";
import { SlideContent } from "../types";

// Helper to convert base64 to the format pptxgenjs expects
const getBase64Data = (base64: string): string => {
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:image/png;base64,${base64}`;
};

export const exportToPowerPoint = (slides: SlideContent[]): void => {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";

  slides.forEach((slideData) => {
    const slide = pptx.addSlide();

    // Set a background color for better visibility
    slide.background = { color: "F1F1F1" };

    // Add Title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.25,
      w: "90%",
      h: 1,
      fontSize: 36,
      bold: true,
      color: "363636",
      align: "center",
    });

    // Handle content and image layout
    if (slideData.image_base64) {
        // Layout with image on the right, text on the left
        slide.addText(slideData.content.map(pt => ({ text: pt, options: { breakLine: true } })), {
            x: 0.5,
            y: 1.5,
            w: "45%",
            h: 3.5,
            fontSize: 18,
            color: "363636",
            bullet: true,
        });

        slide.addImage({
            data: getBase64Data(slideData.image_base64),
            x: 5.2,
            y: 1.5,
            w: 4.3,
            h: 2.42, // Maintain 16:9 aspect ratio
        });
    } else {
        // Layout for text-only slide
        slide.addText(slideData.content.map(pt => ({ text: pt, options: { breakLine: true } })), {
            x: 0.5,
            y: 1.5,
            w: "90%",
            h: 3.5,
            fontSize: 20,
            color: "363636",
            bullet: true,
            align: 'left'
        });
    }

  });

  pptx.writeFile({ fileName: "presentation.pptx" });
};
