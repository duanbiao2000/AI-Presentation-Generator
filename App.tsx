import React, { useState, useCallback } from 'react';
import { SlideContent, LayoutType } from './types';
import { generateSlidesFromText } from './services/geminiService';
import { exportToPowerPoint } from './services/exportService';
import Header from './components/Header';
import TextInputArea from './components/TextInputArea';
import PresentationPreview from './components/PresentationPreview';
import Loader from './components/Loader';

export type PresentationStyle = 'BALANCED' | 'TEXT_FOCUSED' | 'VISUAL_FOCUSED';
export type Theme = 'dark' | 'light';


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
  const [theme, setTheme] = useState<Theme>('dark');


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
  
  const initialText = `(Slide 1: 标题页 - 从“忙碌的无效”到“成果的价值：目标驱动下的系统性问题解决”)
各位同仁，各位思考者，大家下午好！
今天，我想和大家探讨一个我们每个人、每个团队、甚至每个组织都可能面临的深层困境：我们都很忙，我们都在努力工作，但我们真的在创造价值吗？我们真的在解决问题吗？
你是否曾有过这样的体验：项目排得满满当当，会议一个接一个，任务列表越拉越长，每天都精疲力尽，但回首一看，那些真正关键的、深层次的问题，似乎依然纹丝不动？我们像一台高速运转的机器，不断地生产着“东西”，却发现这些“东西”并没有带来预期的“改变”。
这就是我今天要揭示的核心矛盾：产出 (Output) 与 成果 (Outcome) 之间的巨大鸿沟。
【核心概念阐释】
(Slide 2: 核心定义 - 产出 vs. 成果)
让我们从一个最简单的比喻开始。想象一下，你的房间很乱，玩具、书籍散落一地。妈妈走进来，说：“把房间收拾好！”
你做了什么？你可能把所有玩具都一股脑塞到床底下，把书堆在角落。恭喜你，你“完成任务”了，你有了“产出”——一个看起来暂时不那么乱的房间。但房间真的“好”了吗？你还能在上面玩耍吗？你下次找书方便吗？显然，问题并没有真正解决。
而真正的“成果”是什么？是你把玩具分类放进不同的箱子，把书摆回书架，地面变得干净整洁，你可以在上面自由玩耍。这个“可以玩耍的整洁房间”，就是成果 (Outcome)。它改变了房间的状态 (state)，创造了可衡量的、有意义的价值 (measurable, meaningful value)。
(Slide 3: 反模式 - “功能工厂”的陷阱)
在我们的工作中，这种“只重产出，不重成果”的现象比比皆是。我们称之为“产出陷阱 (The Output Trap)”。
一个典型的反例是软件行业的“功能工厂 (Feature Factory)”：团队不断地发布新功能 (output)，他们很“高效”，每周都有新的版本上线。但用户满意度或关键业务指标 (key business metrics) 却毫无改善，甚至下降。为什么？因为他们没有解决用户的根本问题，没有创造真正的 outcome。他们很忙，但他们是“高效的无效 (efficient ineffectiveness)”。
所以，解决问题的能力和成果，其本质是通过一系列行动，将一个系统的状态从一个 less desirable state 转变为一个 more desirable state，并最终交付可衡量的、有意义的价值。 这不是单纯的“完成任务列表”(task completion) 或“遵循流程”(process compliance)。
【案例分析：成果驱动的力量】
(Slide 4: 案例总览 - 成果驱动的四大奇迹)
那么，这种思维模式在实践中是如何体现的呢？让我们穿越历史和行业，看几个震撼人心的案例，它们都深刻诠释了“目标驱动下的系统性问题解决”的巨大力量。
1. 曼哈顿计划：以终为始的极致演绎 (The Manhattan Project: Begin with the End in Mind)
(Slide 5: 曼哈顿计划 - 聚焦终极成果)
二战期间，美国面临纳粹德国可能率先研制原子弹的巨大威胁。核心问题只有一个：必须在敌人之前，从零开始成功设计并制造出功能性的原子武器。
这不仅仅是一个科学问题，而是一个巨大的系统工程 (a systems problem)。他们没有纠结于“我们能做多少实验”，而是绝对聚焦于最终的 outcome——一个可用的武器。为此，他们创建了全新的产业链，实施了前所未有的保密措施，将顶尖的理论物理学家与工程师紧密结合，在极大的时间压力下协同工作。
洞察： 曼哈顿计划揭示了，当对单一、明确的最终成果有绝对聚焦时，可以整合不同领域的专业知识，以“蛮力 (brute force)”推动项目，不惜一切代价实现目标。它证明了“以终为始”的极致力量。
2. Netflix 的转型：主动自我颠覆，解决未来的问题 (Netflix: Proactive Self-Disruption)
(Slide 6: Netflix 转型 - 牺牲短期，成就未来)
Netflix 最初是一家成功的 DVD 邮寄租赁公司。但其领导层预见到，物理媒介的未来有限，流媒体将是未来。他们面临的问题是：如何在一个核心业务仍在盈利时，主动自我颠覆 (disrupt themselves)，转向一个全新的、充满不确定性的商业模式？
Netflix 解决的不是一个问题，而是一系列相互关联的“未来问题”。他们解决了内容版权、全球CDN、订阅模式、推荐算法等难题，每一步都是为了实现“随时地、任何内容”这个最终的 customer outcome。
洞察： Netflix 案例表明，最高级的问题解决是前瞻性 (proactive and forward-looking) 的，是解决未来将要发生的问题，而非仅仅应对当前危机。它揭示了一个根本性权衡 (fundamental trade-off)：为了未来的生存和发展 (long-term effectiveness)，必须愿意牺牲短期的利润和用户满意度 (short-term efficiency)。
3. 根除天花：重新定义解决方案的公共卫生奇迹 (Smallpox Eradication: Redefining the Solution)
(Slide 7: 根除天花 - 智慧的杠杆化干预)
天花，曾是肆虐人类数个世纪的致命疾病。世界卫生组织 (WHO) 面临的挑战是：如何在全球范围内彻底消灭这种疾病，这是人类历史上从未有过的壮举。
成功的关键不在于疫苗本身，而在于解决问题的策略。WHO 放弃了为全球每个人接种的“蛮力”方法，而是采用了一种更聪明的“监视与遏制 (surveillance and containment)”策略。他们快速识别新爆发的病例，然后对病例周围的所有密切接触者进行“环形接种 (ring vaccination)”。这是一个 highly leveraged intervention (高度杠杆化干预)。
洞察： 这个案例的洞察在于，解决方案的“优雅”和“智慧”至关重要。有时候，改变解决问题的心智模型或方法本身 (a mental model or an approach)，比投入更多资源更有效。它证明了，通过优化策略，我们可以将一个看似不可能完成的任务变为可能。
4. 丰田生产方式 (TPS)：将问题解决融入组织文化 (Toyota Production System: Culture of Continuous Improvement)
(Slide 8: 丰田生产方式 - 问题即机会)
二战后，丰田在资本和规模上远逊于美国巨头。他们的问题是：如何在资源有限的情况下，生产出高质量、有竞争力的汽车，并消除大规模生产中的浪费？
TPS 本质上是一个持续解决问题的系统。其核心理念，如“自働化 (Jidoka)”和“准时制生产 (Just-in-Time)”，其设计目的就是为了让问题（如次品、库存积压）能够立即暴露出来。整个组织的每个员工都被赋权去发现并解决问题。这使得问题解决从少数专家的工作，变成了 a collective, continuous effort (集体、持续的努力)。
洞察： 此案例揭示，最强大的问题解决能力，是可以被系统化和文化化的。它将问题从“需要被隐藏的坏事”转变为“持续改善的机会 (Kaizen)”。这种模式的代价是需要极高的组织纪律性和长期的文化建设投入，但其回报是无与伦比的韧性和效率。焦点从“谁的责任”转向“如何改进流程”。
【模式识别与行动纲领】
(Slide 9: 核心矛盾 - 产出 vs. 成果)
这四个案例，无论背景如何不同，都指向一个核心真理：我们必须警惕“产出陷阱”，并深刻理解产出与成果的根本区别。 专注于产出，只会让我们陷入“高效的无效”；而聚焦成果，才能真正创造价值。
(Slide 10: 思维框架转变 - 从“做什么”到“解决什么问题”)
所以，是时候进行一场思维框架的转变 (a mental framework shift) 了！
当你发现自己或团队陷入了无休止的会议、任务和交付，但感觉“核心指针”并未移动时，请立刻警觉：“Aha, this is fundamentally an output vs. outcome problem!”
然后，请你立刻停下来，问自己三个关键问题：
What problem are we actually trying to solve here? (我们到底要解决什么问题？)
What is the single most important outcome we want to achieve? (我们最想达成的那个单一、最重要的成果是什么？)
How will we know we've achieved it? (我们如何衡量这个成果？)
这个“压缩包”对你和你的团队的现实决策帮助是巨大的：
重新校准优先级 (Recalibrate Priorities): 它能帮助你识别并砍掉那些只产生 output 而不贡献 outcome 的“伪工作 (vanity work)”。
优化资源分配 (Optimize Resource Allocation): 你会开始基于问题的重要性和预期成果来投资，而不是基于一个看起来很详尽的计划。
改变评估标准 (Change Evaluation Metrics): 你会从衡量“完成了多少”转向衡量“带来了什么改变”，这能更准确地激励和评估价值创造。
【总结与展望】
(Slide 11: 总结 - 成为成果驱动的问题解决者)
各位，在今天这个快速变化、充满不确定性的时代，我们需要的不再是单纯的“执行者”，而是能够洞察问题本质、驱动系统性变革、并最终交付可衡量成果的“问题解决者”。
曼哈顿计划的宏大、Netflix的远见、天花根除的智慧、丰田的持续改善，都向我们证明了：真正的价值，源于对成果的执着追求。
所以，从今天起，让我们停止忙碌，开始思考。停止仅仅完成任务，开始创造真正的价值。
从今天起，成为一个成果驱动的问题解决者！
谢谢大家！
(Slide 12: 感谢页 - Q&A)`;

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
            onAcceptSample={() => setInputText(initialText)}
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
                theme={theme}
                onThemeChange={setTheme}
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