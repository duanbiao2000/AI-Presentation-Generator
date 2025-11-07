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
  language: string;
  onLanguageChange: (language: string) => void;
  customLanguage: string;
  onCustomLanguageChange: (language: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  customTone: string;
  onCustomToneChange: (tone: string) => void;
}

const TextInputArea: React.FC<TextInputAreaProps> = ({ 
    value, onChange, onGenerate, isLoading, placeholder, 
    presentationStyle, onStyleChange,
    language, onLanguageChange, customLanguage, onCustomLanguageChange,
    tone, onToneChange, customTone, onCustomToneChange
 }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Selector */}
        <div>
            <label htmlFor="language-style" className="block text-sm font-medium text-gray-400 mb-1">
                Output Language
            </label>
            <select
                id="language-style"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            >
                <option value="Chinese (中文)">Chinese (中文)</option>
                <option value="English">English</option>
                <option value="Bilingual (中英混杂)">Bilingual (中英混杂)</option>
                <option value="OTHER">Other (Custom)</option>
            </select>
            {language === 'OTHER' && (
                <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => onCustomLanguageChange(e.target.value)}
                    placeholder="Enter language (e.g., Japanese)"
                    className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                    disabled={isLoading}
                />
            )}
        </div>
        {/* Tone Selector */}
        <div>
            <label htmlFor="tone-style" className="block text-sm font-medium text-gray-400 mb-1">
                Presentation Tone
            </label>
            <select
                id="tone-style"
                value={tone}
                onChange={(e) => onToneChange(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            >
                <option value="Book Club (读书会)">Book Club (读书会)</option>
                <option value="Educational Training (教育培训)">Educational Training (教育培训)</option>
                <option value="Tech Forum (技术论坛)">Tech Forum (技术论坛)</option>
                <option value="OTHER">Other (Custom)</option>
            </select>
            {tone === 'OTHER' && (
                <input
                    type="text"
                    value={customTone}
                    onChange={(e) => onCustomToneChange(e.target.value)}
                    placeholder="Enter tone (e.g., Casual, Formal)"
                    className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm pl-3 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
                    disabled={isLoading}
                />
            )}
        </div>
        {/* Style Selector */}
        <div>
             <label htmlFor="presentation-style" className="block text-sm font-medium text-gray-400 mb-1">
                Visual Style
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

        {/* Generate Button */}
        <div className="flex items-end">
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