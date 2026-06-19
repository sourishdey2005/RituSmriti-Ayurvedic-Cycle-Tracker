import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  AlertCircle, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Terminal,
  RefreshCw,
  Compass,
  Smile
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

interface AyurvedicAIGuruProps {
  language: 'en' | 'hi' | 'bn';
}

export default function AyurvedicAIGuru({ language }: AyurvedicAIGuruProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: language === 'hi' 
        ? 'नमस्ते! मैं ऋतुस्मृति का आयुर्वेदिक एआई गुरु हूँ। आपको वैयक्तिकृत अनुष्ठान, षड रस पोषण, योगासन और चक्र कल्याण के बारे में मार्गदर्शन प्रदान करने के लिए यहाँ हूँ। आज आपके शरीर में क्या स्थिति है?'
        : language === 'bn'
          ? 'নমস্কার! আমি ঋতুস্মৃতির আয়ুর্বেদিক এআই গুরু। আপনার ঋতুচক্রের সুস্থতার জন্য সামগ্রিক রীতিনীতি, পুষ্টিকর খাবার, যোগব্যায়াম এবং মানসিক প্রশান্তি নিয়ে উত্তর দিতে আমি প্রস্তুত। আজ আপনার শরীর কেমন অনুভব করছে?'
          : 'Namaste! I am your RituSmriti Ayurvedic AI Wellness Guru. Empowered by Nvidia Nemotron, I can guide you through tailored Ritucharya rhythms, soothing herbs, Sattvik diets, and restorative yogic postures. How can I support your hormone alignment and prana balance today?'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeReasoning, setActiveReasoning] = useState('');
  const [activeContent, setActiveContent] = useState('');
  const [showReasoningMap, setShowReasoningMap] = useState<Record<number, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll on new outputs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContent, activeReasoning]);

  const fallbackQuestions = {
    en: [
      { text: 'Best herbs for severe menstrual cramps?', label: 'Cramp Remedies' },
      { text: 'Dynamic foods for high Pitta/Luteal stage?', label: 'Pitta Balancing' },
      { text: 'Explain Vata dosha role in cycle irregularities.', label: 'Vata Regulation' },
      { text: 'Create a morning yoga routine for follicular energy surge.', label: 'Yogic Pranayama' }
    ],
    hi: [
      { text: 'मासिक ऐंठन के लिए सबसे अच्छी आयुर्वेदिक जड़ी-बूटियाँ?', label: 'ऐंठन उपचार' },
      { text: 'पिट्टा ल्यूटियल चरण के लिए कौन से खाद्य पदार्थ अच्छे हैं?', label: 'पित्त संतुलन' },
      { text: 'चक्र अनियमितताओं में वात दोष की भूमिका क्या है?', label: 'वात नियमन' },
      { text: 'फॉलिकुलर चरण के दौरान योग दिनचर्या क्या होनी चाहिए?', label: 'योग प्राणायाम' }
    ],
    bn: [
      { text: 'পিরিয়ডের তীব্র তলপেট ব্যথার জন্য কি কি ভেষজ উপকারী?', label: 'ক্র্যাম্পের ভেষজ' },
      { text: 'পিত্ত দশা নিয়ন্ত্রণে কি কি স্যাত্বিক আহার করা উচিত?', label: 'পিত্ত ভারসাম্য' },
      { text: 'ঋতুচক্রের জটিলতায় বাথ দোষের ভূমিকা বুঝিয়ে বলুন।', label: 'বাত নিয়ন্ত্রণ' },
      { text: 'ফলিকুলার এনার্জি বৃদ্ধির জন্য সকালে যোগব্যায়ামের নিয়ম কি?', label: 'যোগ প্রাণায়াম' }
    ]
  }[language] || [
    { text: 'Best herbs for severe menstrual cramps?', label: 'Cramp Remedies' },
    { text: 'Dynamic foods for high Pitta/Luteal stage?', label: 'Pitta Balancing' },
    { text: 'Explain Vata dosha role in cycle irregularities.', label: 'Vata Regulation' },
    { text: 'Create a morning yoga routine for follicular energy surge.', label: 'Yogic Pranayama' }
  ];

  const handleSend = async (textToSend: string) => {
    // 5. Prevent empty messages
    if (!textToSend?.trim()) {
      alert("Message cannot be empty");
      throw new Error("Message cannot be empty");
    }
    if (isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    
    // 3 & 4. Log the exact messages array before API calls and verify roles
    console.log("=== Front-end message hist payload sending to backend API ===");
    console.log(JSON.stringify(updatedMessages, null, 2));

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setActiveReasoning('');
    setActiveContent('');

    try {
      // Direct call to our Express relative API Endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported on this preview container.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let partialText = '';
      
      let incomingContent = '';
      let incomingReasoning = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkText = decoder.decode(value, { stream: !done });
          partialText += chunkText;

          const lines = partialText.split('\n');
          partialText = lines.pop() || ''; // keep last hanging item

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;
            if (cleanLine === 'data: [DONE]') {
              done = true;
              break;
            }
            if (cleanLine.startsWith('data: ')) {
              const rawJson = cleanLine.substring(6);
              try {
                const parsed = JSON.parse(rawJson);
                const delta = parsed.choices?.[0]?.delta;
                if (delta) {
                  if (delta.reasoning_content) {
                    incomingReasoning += delta.reasoning_content;
                    setActiveReasoning(incomingReasoning);
                  }
                  if (delta.content) {
                    incomingContent += delta.content;
                    setActiveContent(incomingContent);
                  }
                }
              } catch (e) {
                // Ignore chunk parsing failures
              }
            }
          }
        }
      }

      // Append final message to message array once stream is fully compiled
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: incomingContent || 'Namaste. I processed your request but no final visible text was streamed.',
          reasoning: incomingReasoning || undefined
        }
      ]);
      setActiveReasoning('');
      setActiveContent('');

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `🔴 **Error reaching AI Guru:** ${err.message || 'Unknown network error'}. Please verify your network and make sure the NVIDIA_API_KEY is properly initialized.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReasoning = (idx: number) => {
    setShowReasoningMap(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 shadow-xs p-6 flex flex-col gap-6" id="ai-wellness-guru-panel">
      
      {/* HEADER SECTION WITHOUT METADATA CHIPS/BADGES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#82B678] to-[#5BA97F] flex items-center justify-center text-white shadow-md animate-pulse">
              <Bot className="w-6 h-6" />
            </div>
            <div className="absolute right-0 bottom-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-800">
              <span>{language === 'hi' ? 'आयुर्वेदिक एआई गुरु' : language === 'bn' ? 'আয়ুর্বেদিক এআই গুরু' : 'Ayurvedic AI Wellness Guru'}</span>
            </h2>
            <p className="text-stone-500 text-[11px] mt-0.5 font-medium leading-relaxed">
              {language === 'hi' 
                ? 'मासिक स्तरों और समग्र स्वास्थ्य को संरेखित करने के लिए उन्नत एआई सोच प्रणाली।' 
                : language === 'bn' 
                  ? 'উন্নত চিন্তাভাবনা সম্পন্ন শক্তিশালী এআই দিয়ে প্রাকৃতিকভাবে পিরিয়ড ক্র্যাম্প বা হরমোন সমতা জানুন।' 
                  : 'Empowered with deep cognitive reasoning to solve physical cycle discomfort and hormonal dinacharya.'}
            </p>
          </div>
        </div>
      </div>

      {/* CHAT BOARD STREAM CONTAINER */}
      <div className="flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin" id="guru-chat-history">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
            
            {/* User Label versus Guru Label */}
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-extrabold text-stone-400">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-stone-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-[#5BA97F]" />
                  <span>Ayurvedic Guru</span>
                </>
              )}
            </div>

            {/* Bubble contents */}
            <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed transition-all shadow-3xs ${
              msg.role === 'user'
                ? 'bg-stone-800 text-white rounded-tr-xs shadow-sm'
                : 'bg-warm-cream/40 border border-[#F1EBE3] text-stone-800 rounded-tl-xs font-sans'
            }`}>
              
              {/* If there is REASONING output from Nemotron thinking token, show in an expandable terminal block */}
              {msg.reasoning && (
                <div className="mb-3 border border-stone-150 rounded-xl overflow-hidden bg-stone-50 p-2.5 font-mono text-[10px] text-stone-500">
                  <button 
                    onClick={() => toggleReasoning(idx)}
                    className="flex justify-between items-center w-full font-bold text-[9px] uppercase text-stone-500 hover:text-stone-700 tracking-wider cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-[#D4B06A] animate-pulse" />
                      🧠 Nemotron Cognitive Thinking Process
                    </span>
                    {showReasoningMap[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  
                  {showReasoningMap[idx] && (
                    <div className="mt-2 text-[10px] text-stone-600 border-t border-stone-200/50 pt-2 leading-relaxed whitespace-pre-wrap max-h-[160px] overflow-y-auto">
                      {msg.reasoning}
                    </div>
                  )}
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* ACTIVE LIVE STREAMING CELL */}
        {isLoading && (activeReasoning || activeContent) && (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-extrabold text-[#5BA97F]">
              <Bot className="w-3 h-3 animate-bounce" />
              <span>Ayurvedic Guru (Streaming Live...)</span>
            </div>

            <div className="max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed bg-warm-cream/50 border border-amber-200/40 text-stone-800 rounded-tl-xs block w-full">
              {/* Real-time reasoning chunk ticker */}
              {activeReasoning && (
                <div className="mb-3 border border-amber-150/50 rounded-xl overflow-hidden bg-[#FAF7F0] p-3 font-mono text-[9px] text-[#A67C43]">
                  <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[8px] text-[#A67C43]/80 mb-1.5 animate-pulse">
                    <Cpu className="w-3.5 h-3.5 text-[#D4B06A]" />
                    NVIDIA Deep Cognitive Thinking Stream:
                  </span>
                  <div className="leading-relaxed whitespace-pre-wrap italic">
                    {activeReasoning}
                  </div>
                </div>
              )}

              {/* Real-time final response chunk ticker */}
              {activeContent ? (
                <p className="whitespace-pre-wrap font-sans">{activeContent}</p>
              ) : (
                <div className="flex items-center gap-1 text-stone-400 italic font-medium">
                  {activeReasoning ? 'Formulating beautiful advice based on guidelines...' : 'Prana connecting to Nemotron super nodes...'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOADING EMPTY DOTS PULSAR */}
        {isLoading && !activeReasoning && !activeContent && (
          <div className="flex items-center gap-2 text-stone-400 text-xs py-2 bg-stone-50/60 px-4 rounded-xl border border-stone-100/60 w-max">
            <RefreshCw className="w-3.5 h-3.5 text-[#82B678] animate-spin" />
            <span>Guru is contemplating deep answers...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* QUICK SUGGESTIONS CARDS */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#5BA97F]" />
          <span>{language === 'hi' ? 'सुझाए गए प्रश्न' : language === 'bn' ? 'প্রস্তাবিত কিছু প্রশ্ন' : 'Suggested Inquiries'}</span>
        </span>
        <div className="grid grid-cols-2 gap-2" id="ai-quick-sug-grid">
          {fallbackQuestions.map((q, qidx) => (
            <button
              key={qidx}
              onClick={() => handleSend(q.text)}
              disabled={isLoading}
              className="text-left p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-[#FFFDFC] hover:border-[#D4B06A]/45 hover:shadow-2xs transition-all text-[11px] font-bold text-stone-700 leading-snug cursor-pointer disabled:opacity-50 flex flex-col gap-0.5"
            >
              <span className="text-[#A67C43] text-[9px] uppercase font-extrabold tracking-wide">{q.label}</span>
              <span className="line-clamp-1 text-stone-500 font-medium">{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM INPUT AND DISCHARGES */}
      <div className="flex flex-col gap-2">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 border border-stone-200 rounded-2xl px-4 py-2 bg-white focus-within:border-stone-400 transition"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              language === 'hi'
                ? 'वात ऐंठन को शांत कैसे करें, शतावरी की खुराक क्या है...'
                : language === 'bn'
                  ? 'উষ্ণ স্যাত্বিক খাদ্য কি, যোগব্যায়ামের উপকারিতা বলুন...'
                  : 'Ask about Doshas, hormone balancing, Sattvik recipe guides...'
            }
            className="flex-1 bg-transparent border-none text-xs text-stone-800 outline-none placeholder-stone-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white transition disabled:opacity-30 disabled:scale-100 active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        
        <div className="text-[9px] text-stone-400 font-medium text-center flex items-center justify-center gap-1 mt-1 leading-normal">
          <AlertCircle className="w-3.5 h-3.5 text-lotus-gold" />
          <span>
            {language === 'hi'
              ? 'ऋतुस्मृति गुरु आयुर्वेद ज्ञान पर आधारित है। कृपया गंभीर स्थितियों के लिए हमेशा डॉक्टर से परामर्श लें।'
              : language === 'bn'
                ? 'ঋতুস্মৃতি এআই সুস্থতা গাইড। যেকোনো জটিল চিকিৎসার ক্ষেত্রে সর্বদা গাইনোকোলজিস্টের পরামর্শ নিন।'
                : 'Ayurvedic AI is designed for informational daily wellness. Always consult certified gynecologists for clinical irregularities.'}
          </span>
        </div>
      </div>

    </div>
  );
}
