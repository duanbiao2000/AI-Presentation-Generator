import React, { useState } from 'react';
import type { SlideContent } from '../types';
import type { Theme } from '../App';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';

interface SlideProps {
  slide: SlideContent;
  theme: Theme;
}

const ImageWithPrompt: React.FC<{ slide: SlideContent, theme: Theme }> = ({ slide, theme }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!slide.image_prompt) return;
        navigator.clipboard.writeText(slide.image_prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const themeClasses = {
        containerBg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200',
        text: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
        promptLabel: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
        buttonHover: theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-300',
        buttonText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
    };

    return (
        <div className="flex flex-col h-full gap-2">
            <div className={`flex-grow ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} rounded-md overflow-hidden relative`}>
                <img
                    src={`data:image/png;base64,${slide.image_base64}`}
                    alt={slide.image_prompt || 'Generated slide image'}
                    className="w-full h-full object-cover"
                />
            </div>
            {slide.image_prompt && (
                <div className={`flex-shrink-0 text-xs ${themeClasses.containerBg} p-2 rounded-md flex items-center gap-2`}>
                    <p className={`${themeClasses.text} overflow-hidden text-ellipsis whitespace-nowrap flex-grow`}>
                        <span className={`font-bold ${themeClasses.promptLabel}`}>Prompt:</span> {slide.image_prompt}
                    </p>
                    <button onClick={handleCopy} className={`p-1 rounded-md ${themeClasses.buttonHover} ${themeClasses.buttonText} flex-shrink-0`}>
                        {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardIcon className="w-4 h-4" />}
                    </button>
                </div>
            )}
        </div>
    );
};


const Slide: React.FC<SlideProps> = ({ slide, theme }) => {
  const themeClasses = {
    bg: theme === 'dark' ? 'bg-gray-700' : 'bg-white',
    title: theme === 'dark' ? 'text-white' : 'text-gray-800',
    content: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    loadingText: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    noImageBg: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200',
    noImageText: theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
  };

  if (!slide) {
    return (
        <div className={`aspect-[16/9] w-full ${themeClasses.bg} overflow-hidden flex items-center justify-center`}>
            <p className={themeClasses.loadingText}>Loading slide...</p>
        </div>
    );
  }

  const renderContent = () => {
    switch (slide.layout) {
      case 'TITLE_ONLY':
        return (
          <div className="flex items-center justify-center h-full text-center p-6">
            <h2 className={`text-5xl font-bold ${themeClasses.title}`}>{slide.title}</h2>
          </div>
        );
      case 'IMAGE_FOCUSED':
        return (
            <div className="relative w-full h-full">
                {slide.image_base64 ? (
                    <img 
                        src={`data:image/png;base64,${slide.image_base64}`} 
                        alt={slide.image_prompt || 'Generated slide image'} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={`w-full h-full ${themeClasses.noImageBg} flex items-center justify-center ${themeClasses.noImageText}`}>Image not available</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent p-6 flex items-end">
                    <h2 className="text-4xl font-bold text-white drop-shadow-lg">{slide.title}</h2>
                </div>
            </div>
        );
      case 'TWO_COLUMNS':
        return (
            <div className="p-6 flex flex-col h-full">
                <h2 className={`text-2xl font-bold ${themeClasses.title} text-center mb-4 flex-shrink-0`}>{slide.title}</h2>
                <div className="flex-grow grid grid-cols-2 gap-6">
                    <ul className={`list-disc list-inside ${themeClasses.content} space-y-2 text-sm overflow-y-auto`}>
                        {(slide.content_col1 || []).map((point, index) => <li key={`col1-${index}`}>{point}</li>)}
                    </ul>
                    <ul className={`list-disc list-inside ${themeClasses.content} space-y-2 text-sm overflow-y-auto`}>
                        {(slide.content_col2 || []).map((point, index) => <li key={`col2-${index}`}>{point}</li>)}
                    </ul>
                </div>
            </div>
        );
      case 'TEXT_WITH_IMAGE':
        return (
            <div className="p-6 flex flex-col h-full">
                <h2 className={`text-2xl font-bold ${themeClasses.title} text-center mb-4 flex-shrink-0`}>{slide.title}</h2>
                <div className="flex-grow grid grid-cols-2 gap-6 min-h-0">
                    <div className="flex items-center overflow-y-auto">
                        <ul className={`list-disc list-inside ${themeClasses.content} space-y-2 text-sm`}>
                            {(slide.content || []).map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>
                    <div className="min-h-0">
                        {slide.image_base64 ? <ImageWithPrompt slide={slide} theme={theme} /> : <div className={`w-full h-full ${themeClasses.noImageBg} rounded-md flex items-center justify-center ${themeClasses.noImageText}`}>No Image</div>}
                    </div>
                </div>
            </div>
        );
      case 'TEXT_ONLY':
      default:
        return (
            <div className="p-6 flex flex-col h-full">
                <h2 className={`text-2xl font-bold ${themeClasses.title} text-center mb-4 flex-shrink-0`}>{slide.title}</h2>
                <div className="flex-grow flex items-center justify-center">
                    <ul className={`list-disc list-inside ${themeClasses.content} space-y-3 text-base`}>
                        {(slide.content || []).map((point, index) => <li key={index}>{point}</li>)}
                    </ul>
                </div>
            </div>
        );
    }
  };

  return (
    <div className={`aspect-[16/9] w-full ${themeClasses.bg} overflow-hidden flex flex-col transition-colors duration-300`}>
      {renderContent()}
    </div>
  );
};

export default Slide;