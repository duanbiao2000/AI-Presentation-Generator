import React, { useState } from 'react';
import type { SlideContent, LayoutType } from '../types';
import type { Theme } from '../App';
import Slide from './Slide';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import DownloadIcon from './icons/DownloadIcon';
import LayoutIcon from './icons/LayoutIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface PresentationPreviewProps {
  slides: SlideContent[];
  onExport: () => void;
  onLayoutChange: (slideIndex: number, newLayout: LayoutType) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const PresentationPreview: React.FC<PresentationPreviewProps> = ({ slides, onExport, onLayoutChange, theme, onThemeChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handleLayoutSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLayoutChange(currentSlide, e.target.value as LayoutType);
  }

  const handleThemeToggle = () => {
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  const currentLayout = slides[currentSlide]?.layout || 'TEXT_ONLY';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <Slide slide={slides[currentSlide]} theme={theme} />
      </div>
      <div className="flex-shrink-0 mt-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
                onClick={onExport}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
            >
                <DownloadIcon className="w-4 h-4 mr-2"/>
                PowerPoint
            </button>
            <div className="flex items-center gap-2">
              <label htmlFor="layout-select" className="sr-only">Slide Layout</label>
              <LayoutIcon />
              <select 
                id="layout-select"
                value={currentLayout}
                onChange={handleLayoutSelect}
                className="bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-2 pr-8 py-1 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
              >
                  <option value="TEXT_ONLY">Text Only</option>
                  <option value="TEXT_WITH_IMAGE">Text &amp; Image</option>
                  <option value="TWO_COLUMNS">Two Columns</option>
                  <option value="IMAGE_FOCUSED">Image Focused</option>
                  <option value="TITLE_ONLY">Title Only</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className='flex items-center space-x-2'>
                <button
                onClick={goToPrevious}
                disabled={currentSlide === 0}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                <ChevronLeftIcon />
                </button>
                <span className="text-sm font-medium text-gray-400 w-12 text-center">
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
    </div>
  );
};

export default PresentationPreview;