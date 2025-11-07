import pptxgen from "pptxgenjs";
import { SlideContent } from "../types";

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
    slide.background = { color: "F1F1F1" };

    if (slideData.image_prompt) {
        slide.addNotes(`AI Image Prompt: ${slideData.image_prompt}`);
    }

    switch (slideData.layout) {
      case 'TITLE_ONLY':
        slide.addText(slideData.title, {
          x: 0, y: 0, w: '100%', h: '100%',
          align: 'center', valign: 'middle',
          fontSize: 44, bold: true, color: '363636'
        });
        break;

      case 'TEXT_ONLY':
        slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 1, fontSize: 36, bold: true, color: '363636', align: 'center' });
        slide.addText((slideData.content || []).map(pt => ({ text: pt, options: { breakLine: true } })), {
          x: 0.5, y: 1.5, w: '90%', h: 3.5, fontSize: 20, color: '363636', bullet: true,
        });
        break;

      case 'TEXT_WITH_IMAGE':
        slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 1, fontSize: 36, bold: true, color: '363636', align: 'center' });
        slide.addText((slideData.content || []).map(pt => ({ text: pt, options: { breakLine: true } })), {
          x: 0.5, y: 1.5, w: '45%', h: 3.5, fontSize: 18, color: '363636', bullet: true,
        });
        if (slideData.image_base64) {
          slide.addImage({ data: getBase64Data(slideData.image_base64), x: 5.2, y: 1.5, w: 4.3, h: 2.42 });
        }
        break;

      case 'TWO_COLUMNS':
        slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 1, fontSize: 36, bold: true, color: '363636', align: 'center' });
        slide.addText((slideData.content_col1 || []).map(pt => ({ text: pt, options: { breakLine: true } })), {
          x: 0.5, y: 1.5, w: '45%', h: 3.5, fontSize: 16, color: '363636', bullet: true,
        });
        slide.addText((slideData.content_col2 || []).map(pt => ({ text: pt, options: { breakLine: true } })), {
          x: 5.2, y: 1.5, w: '45%', h: 3.5, fontSize: 16, color: '363636', bullet: true,
        });
        break;

      case 'IMAGE_FOCUSED':
        if (slideData.image_base64) {
          slide.addImage({ data: getBase64Data(slideData.image_base64), x: 0, y: 0, w: '100%', h: '100%' });
        }
        // Add a semi-transparent overlay for text readability
        slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: '80%', w: '100%', h: '20%', fill: { color: '000000', transparency: 50 } });
        slide.addText(slideData.title, {
          x: 0, y: '80%', w: '100%', h: '20%',
          align: 'center', valign: 'middle',
          fontSize: 32, bold: true, color: 'FFFFFF'
        });
        break;
        
      default:
        // Fallback for any unknown layout
        slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 1, fontSize: 32, bold: true });
        slide.addText((slideData.content || []).join('\n'), { x: 0.5, y: 1.5, w: '90%', h: 3.5, fontSize: 18 });
        break;
    }
  });

  pptx.writeFile({ fileName: "presentation.pptx" });
};
