import React from 'react';
import type { PresentationStyle } from '../App';

interface TextInputAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
  placeholder: string;
  presentationStyle: PresentationStyle;
  onStyleChange: (style: PresentationStyle) => void;
}

const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, onGenerate, isLoading, placeholder, presentationStyle, onStyleChange }) => {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <label htmlFor="transcript-input" className="text-lg font-semibold text-gray-300">
            Paste your transcript or notes here
        </label>
        <p className="text-sm text-gray-500">The more detailed your notes, the better the result.</p>
      </div>

      <textarea
        id="transcript-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-full min-h-[400px] p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-none"
        disabled={isLoading}
      />
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
             <label htmlFor="presentation-style" className="block text-sm font-medium text-gray-400 mb-1">
                Presentation Style
            </label>
            <select
                id="presentation-style"
                value={presentationStyle}
                onChange={(e) => onStyleChange(e.target.value as PresentationStyle)}
                disabled={isLoading}
                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            >
                <option value="BALANCED">Balanced</option>
                <option value="TEXT_FOCUSED">Text-Focused</option>
                <option value="VISUAL_FOCUSED">Visual-Focused</option>
            </select>
        </div>

        <div className="flex-1 flex items-end">
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full h-12 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </>
                ) : (
                'Generate Presentation'
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TextInputArea;
