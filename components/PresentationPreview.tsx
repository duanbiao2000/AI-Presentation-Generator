
import React, { useState } from 'react';
import type { SlideContent } from '../types';
import Slide from './Slide';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import DownloadIcon from './icons/DownloadIcon';

interface PresentationPreviewProps {
  slides: SlideContent[];
  onExport: () => void;
}

const PresentationPreview: React.FC<PresentationPreviewProps> = ({ slides, onExport }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <Slide slide={slides[currentSlide]} />
      </div>
      <div className="flex-shrink-0 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
                onClick={onExport}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
            >
                <DownloadIcon className="w-4 h-4 mr-2"/>
                PowerPoint
            </button>
            <div className="relative group">
                <button
                    disabled
                    className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-sm font-medium rounded-md text-gray-400 bg-gray-700 cursor-not-allowed"
                >
                    <DownloadIcon className="w-4 h-4 mr-2"/>
                    Keynote
                </button>
                <div className="absolute bottom-full mb-2 w-48 p-2 text-xs text-center text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Keynote export is not yet available.
                </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              disabled={currentSlide === 0}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            <span className="text-sm font-medium text-gray-400">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={goToNext}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationPreview;
