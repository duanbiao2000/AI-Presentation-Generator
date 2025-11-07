import React from 'react';
import type { SlideContent } from '../types';

interface SlideProps {
  slide: SlideContent;
}

const BulletList: React.FC<{ points?: string[] }> = ({ points }) => {
    if (!points || points.length === 0) return null;
    return (
        <ul className="space-y-3 text-lg md:text-xl list-disc list-inside">
            {points.map((point, index) => (
              <li key={index} className="text-gray-300">
                {point}
              </li>
            ))}
        </ul>
    );
};

const Slide: React.FC<SlideProps> = ({ slide }) => {
  if (!slide) {
    return null;
  }

  const renderLayout = () => {
    switch (slide.layout) {
      case 'TITLE_ONLY':
        return (
          <div className="w-full h-full flex items-center justify-center text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-300">
              {slide.title}
            </h2>
          </div>
        );
      
      case 'TWO_COLUMNS':
        return (
            <>
                <h2 className="text-2xl md:text-3xl font-bold text-indigo-300 mb-6 shrink-0 truncate text-center">
                    {slide.title}
                </h2>
                <div className="flex-grow flex gap-8 items-start overflow-hidden">
                    <div className="h-full overflow-y-auto w-1/2"><BulletList points={slide.contentColumn1} /></div>
                    <div className="h-full overflow-y-auto w-1/2"><BulletList points={slide.contentColumn2} /></div>
                </div>
            </>
        )

      case 'IMAGE_FOCUSED':
        return (
             <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-indigo-300 shrink-0 truncate text-center">
                    {slide.title}
                </h2>
                {slide.imageBase64 ? (
                    <div className="flex-grow w-full bg-black/20 rounded-md p-2 flex items-center justify-center min-h-0">
                        <img 
                        src={slide.imageBase64} 
                        alt={`AI generated for ${slide.title}`} 
                        className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>
                ) : <div className="flex-grow w-full bg-black/20 rounded-md"/>}
            </div>
        )

      case 'TEXT_ONLY':
        return (
            <>
                <h2 className="text-2xl md:text-3xl font-bold text-indigo-300 mb-6 shrink-0 truncate text-center">
                    {slide.title}
                </h2>
                <div className="flex-grow flex gap-8 items-start overflow-hidden">
                    <div className="h-full overflow-y-auto w-full"><BulletList points={slide.content} /></div>
                </div>
            </>
        )

      case 'TEXT_WITH_IMAGE':
      default:
        return (
            <>
                <h2 className="text-2xl md:text-3xl font-bold text-indigo-300 mb-6 shrink-0 truncate text-center">
                    {slide.title}
                </h2>
                <div className="flex-grow flex gap-8 items-start overflow-hidden">
                    <div className="h-full overflow-y-auto w-1/2"><BulletList points={slide.content} /></div>
                    <div className="w-1/2 h-full flex items-center justify-center bg-black/20 rounded-md p-2">
                    {slide.imageBase64 ? (
                        <img 
                        src={slide.imageBase64} 
                        alt={`AI generated for ${slide.title}`} 
                        className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    ) : <div className="w-full h-full bg-gray-700 animate-pulse rounded-lg"/>}
                    </div>
                </div>
            </>
        );
    }
  };

  return (
    <div className="w-full aspect-video bg-gray-900 shadow-2xl rounded-lg flex flex-col p-6 md:p-8 lg:p-10 text-white border border-gray-700 overflow-hidden">
      {renderLayout()}
    </div>
  );
};

export default Slide;
