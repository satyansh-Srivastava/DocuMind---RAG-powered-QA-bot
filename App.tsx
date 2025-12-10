import React, { useState, useRef, useEffect } from 'react';
import { UserDetails, AppStep, Message, ParsedDocument } from './types';
import { Logo } from './components/Logo';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { AssurancePanel } from './components/AssurancePanel';
import { parsePdf } from './services/pdfService';
import { initializeChat, sendMessage } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    domain: '',
    industry: '',
    role: '',
    docTitle: '',
    docTopic: ''
  });
  const [parsedDoc, setParsedDoc] = useState<ParsedDocument | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(userDetails).every((val) => (val as string).trim().length > 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStep(AppStep.PARSING);

    try {
      // Simulate "Processing" visual delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      const result = await parsePdf(file);
      setParsedDoc(result);
      setStep(AppStep.ASSURANCE);
    } catch (error) {
      alert("Error parsing PDF. Please try a valid PDF file.");
      setStep(AppStep.ONBOARDING);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    if (!parsedDoc || !apiKey) {
      alert("API Key is missing or document is invalid.");
      return;
    }
    
    setLoading(true);
    try {
      await initializeChat(apiKey, userDetails, parsedDoc.fullText);
      setStep(AppStep.CHAT);
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Hello. I have analyzed **${userDetails.docTitle}**. As a specialist in **${userDetails.docTopic}**, I am ready to assist you with your **${userDetails.role}** tasks. What specific information do you need?`,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      alert("Failed to initialize AI. Check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const responseText = await sendMessage(userMsg.text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered an error retrieving that information. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Render Logic
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          {step === AppStep.CHAT && (
            <div className="flex items-center gap-4 text-xs">
               <span className="text-zinc-500 hidden sm:inline-block">Context: <span className="text-zinc-300">{userDetails.docTitle}</span></span>
               <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded uppercase tracking-wider font-bold">
                 {userDetails.role} Mode
               </span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative max-w-6xl mx-auto w-full px-6 py-8">
        
        {/* Step 1: Onboarding */}
        {step === AppStep.ONBOARDING && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-full max-w-lg space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">Initialize Analysis</h1>
                <p className="text-zinc-400">Configure your session parameters to begin.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Your Domain" name="domain" value={userDetails.domain} onChange={handleInputChange} placeholder="e.g. Finance" />
                <Input label="Industry" name="industry" value={userDetails.industry} onChange={handleInputChange} placeholder="e.g. Banking" />
              </div>
              <Input label="Your Role" name="role" value={userDetails.role} onChange={handleInputChange} placeholder="e.g. Senior Analyst" />
              
              <div className="h-px bg-zinc-800 my-6" />
              
              <Input label="Document Title" name="docTitle" value={userDetails.docTitle} onChange={handleInputChange} placeholder="e.g. Q3 Earnings Report" />
              <Input label="Document Topic" name="docTopic" value={userDetails.docTopic} onChange={handleInputChange} placeholder="e.g. Revenue Growth & Risks" />

              <div className="pt-4">
                <div className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${!isFormValid ? 'hidden' : ''}`}></div>
                  <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-zinc-900 ${
                    isFormValid 
                      ? 'border-zinc-600 hover:border-yellow-400 hover:bg-zinc-800' 
                      : 'border-zinc-800 opacity-50 cursor-not-allowed'
                  }`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className={`w-8 h-8 mb-3 ${isFormValid ? 'text-zinc-400' : 'text-zinc-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="mb-1 text-sm text-zinc-400"><span className="font-semibold">Click to upload PDF</span></p>
                      <p className="text-xs text-zinc-500">
                        {isFormValid ? 'Ready for ingestion' : 'Fill details above to unlock'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf" 
                      disabled={!isFormValid}
                      onChange={handleFileUpload} 
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Processing Spinner */}
        {step === AppStep.PARSING && (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 border-4 border-zinc-800 border-t-yellow-400 rounded-full animate-spin"></div>
            <p className="text-zinc-400 animate-pulse">Extracting semantic structure...</p>
          </div>
        )}

        {/* Step 3: Assurance */}
        {step === AppStep.ASSURANCE && parsedDoc && (
          <AssurancePanel 
            toc={parsedDoc.toc} 
            docTitle={userDetails.docTitle}
            onConfirm={startChat}
            onRetake={() => {
              setParsedDoc(null);
              setStep(AppStep.ONBOARDING);
            }}
          />
        )}

        {/* Step 4: Chat */}
        {step === AppStep.CHAT && (
          <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700' 
                      : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800'
                  }`}>
                     {msg.role === 'model' && (
                       <div className="mb-2 flex items-center gap-2">
                         <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                         <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Documind AI</span>
                       </div>
                     )}
                     <div className="whitespace-pre-wrap leading-relaxed text-sm">
                       {msg.text}
                     </div>
                  </div>
                </div>
              ))}
               {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 rounded-2xl rounded-tl-none px-6 py-4 border border-zinc-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="relative mt-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask as a ${userDetails.role}...`}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-6 pr-14 py-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 shadow-xl transition-all"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || loading}
                className="absolute right-2 top-2 p-2 bg-yellow-400 text-zinc-900 rounded-lg hover:bg-yellow-300 disabled:opacity-0 transition-all disabled:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;