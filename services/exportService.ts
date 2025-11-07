import type { SlideContent, LayoutType } from '../types';

// The PptxGenJS library is loaded from a CDN in index.html, so we declare its type here.
declare var PptxGenJS: any;

function addSlideContent(slide: any, slideData: SlideContent) {
    // Common Title Style
    slide.addText(slideData.title, { 
        x: 0.5, 
        y: 0.25, 
        w: '90%', 
        h: 1, 
        fontSize: 32, 
        bold: true, 
        color: 'FFFFFF',
        align: 'left',
        valign: 'top',
    });

    const bulletPoints = (content?: string[]) => content?.map(point => ({ text: point })) || [];
    
    const commonTextOpts = { 
        fontSize: 18, 
        color: 'E2E8F0',
        bullet: { type: 'bullet' },
        valign: 'top',
        lineSpacing: 30,
    };

    switch (slideData.layout) {
        case 'TEXT_ONLY':
            slide.addText(bulletPoints(slideData.content), { ...commonTextOpts, x: 0.5, y: 1.5, w: '90%', h: 3.5 });
            break;

        case 'TEXT_WITH_IMAGE':
            slide.addText(bulletPoints(slideData.content), { ...commonTextOpts, x: 0.5, y: 1.5, w: '45%', h: 3.5 });
            if (slideData.imageBase64) {
                slide.addImage({ data: slideData.imageBase64, x: 5.25, y: 1.5, w: 4.25, h: 2.39 }); // 16:9 aspect
            }
            break;

        case 'IMAGE_FOCUSED':
             if (slideData.imageBase64) {
                slide.addImage({ data: slideData.imageBase64, x: 0.5, y: 1.5, w: '90%', h: 3.5 });
            }
            break;
            
        case 'TWO_COLUMNS':
            slide.addText(bulletPoints(slideData.contentColumn1), { ...commonTextOpts, x: 0.5, y: 1.5, w: '43%', h: 3.5 });
            slide.addText(bulletPoints(slideData.contentColumn2), { ...commonTextOpts, x: 5.2, y: 1.5, w: '43%', h: 3.5 });
            break;

        case 'TITLE_ONLY':
            // Center the title for this layout
            slide.addText(slideData.title, { 
                x: 0.5, y: 0, w: '90%', h: '100%', fontSize: 44, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
            });
            break;
    }
}


export function exportToPowerPoint(slides: SlideContent[]): void {
  if (typeof PptxGenJS === 'undefined') {
    throw new Error('PptxGenJS library is not loaded.');
  }

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  slides.forEach((slideData, index) => {
    const slide = pres.addSlide();
    
    // Slide Background
    slide.background = { color: '1A202C' }; // A dark gray matching the theme

    if (index === 0 && slideData.layout !== 'TITLE_ONLY') {
        // Special case for the first slide to be a title slide
        slide.addText(slideData.title, {
            x: 0, y: 0, w: '100%', h: '100%', fontSize: 44, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
        });
    } else {
        addSlideContent(slide, slideData);
    }

    // Speaker Notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  });

  pres.writeFile({ fileName: 'AI-Generated-Presentation.pptx' });
}
