import React, { useState, useCallback } from 'react';
import { SlideContent, LayoutType } from './types';
import { generateSlidesFromText } from './services/geminiService';
import { exportToPowerPoint } from './services/exportService';
import Header from './components/Header';
import TextInputArea from './components/TextInputArea';
import PresentationPreview from './components/PresentationPreview';
import Loader from './components/Loader';

export type PresentationStyle = 'BALANCED' | 'TEXT_FOCUSED' | 'VISUAL_FOCUSED';


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [slides, setSlides] = useState<SlideContent[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Generation options state
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>('BALANCED');
  const [language, setLanguage] = useState('Chinese (中文)');
  const [customLanguage, setCustomLanguage] = useState('');
  const [tone, setTone] = useState('Book Club (读书会)');
  const [customTone, setCustomTone] = useState('');


  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to generate a presentation.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSlides(null);
    setLoadingMessage('Initializing generation...');
    
    const finalLanguage = language === 'OTHER' ? customLanguage : language;
    const finalTone = tone === 'OTHER' ? customTone : tone;

    if ((language === 'OTHER' && !customLanguage.trim()) || (tone === 'OTHER' && !customTone.trim())) {
        setError('Please specify the custom language and tone.');
        setIsLoading(false);
        return;
    }

    try {
      const generatedSlides = await generateSlidesFromText(
        inputText, 
        presentationStyle,
        finalLanguage,
        finalTone,
        setLoadingMessage
      );
      setSlides(generatedSlides);
    } catch (err) {
      console.error(err);
      setError('Failed to generate presentation. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [inputText, presentationStyle, language, customLanguage, tone, customTone]);

  const handleExport = useCallback(() => {
    if (slides) {
      try {
        exportToPowerPoint(slides);
      } catch (err) {
        console.error(err);
        setError('Failed to export presentation.');
      }
    }
  }, [slides]);

  const handleLayoutChange = useCallback((slideIndex: number, newLayout: LayoutType) => {
    setSlides(prevSlides => {
      if (!prevSlides) return null;
      const newSlides = [...prevSlides];
      const targetSlide = { ...newSlides[slideIndex] };
      const oldLayout = targetSlide.layout;

      // Preserve content when switching layouts
      if (oldLayout === 'TWO_COLUMNS' && newLayout !== 'TWO_COLUMNS') {
        targetSlide.content = [...(targetSlide.content_col1 || []), ...(targetSlide.content_col2 || [])];
        delete targetSlide.content_col1;
        delete targetSlide.content_col2;
      } else if (oldLayout !== 'TWO_COLUMNS' && newLayout === 'TWO_COLUMNS') {
        const half = Math.ceil((targetSlide.content?.length || 0) / 2);
        targetSlide.content_col1 = targetSlide.content?.slice(0, half) || [];
        targetSlide.content_col2 = targetSlide.content?.slice(half) || [];
        delete targetSlide.content;
      }
      
      targetSlide.layout = newLayout;
      newSlides[slideIndex] = targetSlide;
      return newSlides;
    });
  }, []);
  
  const initialText = `### **演讲稿范文：从“忙碌的无效”到“成果的价值”**

**【开场】**

各位同仁，各位思考者，大家下午好！

今天，我想和大家探讨一个我们每个人、每个团队、甚至每个组织都可能面临的深层困境：**我们都很忙，我们都在努力工作，但我们真的在创造价值吗？我们真的在解决问题吗？**

你是否曾有过这样的体验：项目排得满满当当，会议一个接一个，任务列表越拉越长，每天都精疲-尽，但回首一看，那些真正关键的、深层次的问题，似乎依然纹丝不动？我们像一台高速运转的机器，不断地生产着“东西”，却发现这些“东西”并没有带来预期的“改变”。

这就是我今天要揭示的核心矛盾：**产出 (Output) 与 成果 (Outcome) 之间的巨大鸿沟。**

---

**【核心概念阐释】**

让我们从一个最简单的比喻开始。想象一下，你的房间很乱，玩具、书籍散落一地。妈妈走进来，说：“把房间收拾好！”

你做了什么？你可能把所有玩具都一股脑塞到床底下，把书堆在角落。恭喜你，你“完成任务”了，你有了“产出”——一个看起来暂时不那么乱的房间。但房间真的“好”了吗？你还能在上面玩耍吗？你下次找书方便吗？显然，问题并没有真正解决。

而真正的“成果”是什么？是你把玩具分类放进不同的箱子，把书摆回书架，地面变得干净整洁，你可以在上面自由玩耍。这个“可以玩耍的整洁房间”，就是**成果 (Outcome)**。它改变了房间的**状态 (state)**，创造了**可衡量的、有意义的价值 (measurable, meaningful value)**。
  `;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TextInputArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            placeholder={initialText}
            presentationStyle={presentationStyle}
            onStyleChange={setPresentationStyle}
            language={language}
            onLanguageChange={setLanguage}
            customLanguage={customLanguage}
            onCustomLanguageChange={setCustomLanguage}
            tone={tone}
            onToneChange={setTone}
            customTone={customTone}
            onCustomToneChange={setCustomTone}
          />
          <div className="relative min-h-[500px] lg:min-h-0 flex flex-col items-center justify-center bg-gray-800/50 border border-dashed border-gray-600 rounded-2xl p-4">
            {isLoading && <Loader message={loadingMessage} />}
            {error && !isLoading && (
              <div className="text-center text-red-400">
                <p className="font-semibold">An Error Occurred</p>
                <p>{error}</p>
              </div>
            )}
            {slides && !isLoading && (
              <PresentationPreview 
                slides={slides} 
                onExport={handleExport}
                onLayoutChange={handleLayoutChange} 
              />
            )}
            {!slides && !isLoading && !error && (
              <div className="text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" /></svg>
                <h3 className="mt-2 text-sm font-medium text-gray-300">Your presentation will appear here</h3>
                <p className="mt-1 text-sm text-gray-500">Paste your content on the left and click "Generate".</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;