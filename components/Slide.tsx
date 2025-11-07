import React from 'react';
import type { SlideContent } from '../types';

interface SlideProps {
  slide: SlideContent;
}

const Slide: React.FC<SlideProps> = ({ slide }) => {
  const hasImage = !!slide.image_base64;

  return (
    <div className="aspect-[16/9] w-full bg-gray-700 rounded-lg shadow-lg overflow-hidden flex flex-col p-6">
      <h2 className="text-2xl font-bold text-white text-center mb-4 truncate">{slide.title}</h2>
      <div className={`flex-grow grid gap-4 ${hasImage ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className="flex items-center">
            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                {slide.content.map((point, index) => (
                    <li key={index}>{point}</li>
                ))}
            </ul>
        </div>
        {hasImage && (
          <div className="flex items-center justify-center bg-gray-800 rounded-md overflow-hidden">
            <img 
              src={`data:image/png;base64,${slide.image_base64}`} 
              alt={slide.image_prompt || 'Generated slide image'} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Slide;
