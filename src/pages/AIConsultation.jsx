import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/entities/User';
import { AIConsultation as AIConsultationEntity } from '@/entities/AIConsultation';
import { InvokeLLM } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, User as UserIcon, Bot, Loader2, Sparkles, HeartPulse, Activity, ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SymptomChecker from '../components/ai/SymptomChecker';
import GuidedHealthConsultation from '../components/ai/GuidedHealthConsultation';
import SkinIssueFinder from '../components/ai/SkinIssueFinder';

export default function AIConsultationPage() {
    const [user, setUser] = useState(null);
    const [isBengali, setIsBengali] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const messagesEndRef = useRef(null);
    const sessionId = useRef(Date.now().toString());
    const [useGuidedMode, setUseGuidedMode] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            } catch (e) {
                /* Not logged in */
                setUseGuidedMode(true);
            }
        };
        loadUser();
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const userProfile = user ? `
        User Profile Context:
        - Name: ${user.full_name || 'Not provided'}
        - Age: ${user.date_of_birth ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear() : 'Not provided'}
        - Blood Group: ${user.blood_group || 'Not provided'}
        - Medical Conditions: ${user.medical_conditions?.join(', ') || 'None reported'}
        - Current Medications: ${user.medications?.join(', ') || 'None reported'}
        - Allergies: ${user.allergies?.join(', ') || 'None reported'}
        - Location: ${user.district || 'Bangladesh'}
        ` : '';

        const prompt = `You are a helpful and empathetic AI Health Agent for Bangladesh. 
        Your primary language is Bengali, but you can respond in English if the user asks.
        Current user language preference: ${isBengali ? 'Bengali' : 'English'}.
        
        ${userProfile}
        
        VERY IMPORTANT SAFETY RULES:
        1. You are NOT a doctor and MUST NOT provide medical diagnosis
        2. You MUST NOT prescribe medications or treatments
        3. Always encourage users to consult healthcare professionals for serious concerns
        4. Focus on general health education, symptom understanding, and when to seek help
        5. Be culturally sensitive to Bangladesh context (diet, climate, common diseases)
        6. Use appropriate emojis to make responses friendly and easy to understand
        
        Always start your response with this disclaimer:
        In Bengali: "⚠️ 🩺 গুরুত্বপূর্ণ মনে রাখবেন: আমি একজন AI স্বাস্থ্য সহায়ক, ডাক্তার নই। গুরুতর লক্ষণের জন্য অবিলম্বে চিকিৎসক দেখান বা 🚨 ৯৯৯ নম্বরে কল করুন।"
        In English: "⚠️ 🩺 Important: I am an AI Health Assistant, not a doctor. For serious symptoms, please see a doctor immediately or call 🚨 999."

        Consider Bangladesh context:
        - Common diseases: Dengue, malaria, typhoid, diabetes, hypertension
        - Climate: Hot, humid, monsoon season health issues  
        - Diet: Rice-based, fish, vegetables, lentils
        - Healthcare: Mix of government and private hospitals
        - Cultural practices: Traditional remedies alongside modern medicine

        User query: "${input}"

        Provide a helpful, safe, and culturally appropriate response. Use emojis and markdown for formatting.`;

        try {
            const aiResponseContent = await InvokeLLM({ prompt });
            const aiMessage = { role: 'assistant', content: aiResponseContent };
            setMessages(prev => [...prev, aiMessage]);

            await AIConsultationEntity.create({
                user_message: userMessage.content,
                ai_response: aiMessage.content,
                language: isBengali ? 'bengali' : 'english',
                session_id: sessionId.current
            });

        } catch (error) {
            const errorMessage = { role: 'assistant', content: isBengali ? '😔 দুঃখিত, একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : '😔 Sorry, an error occurred. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSymptomAssessment = (assessment) => {
        const assessmentMessage = {
            role: 'assistant',
            content: `## ${isBengali ? '🔍 লক্ষণ মূল্যায়ন' : '🔍 Symptom Assessment'}

**${isBengali ? '📊 গুরুত্ব:' : '📊 Severity:'} ${assessment.severity.toUpperCase()}**

**${isBengali ? '🔍 সম্ভাব্য কারণ:' : '🔍 Possible Causes:'}**
${assessment.possibleCauses.map(cause => `• ${cause}`).join('\n')}

**${isBengali ? '💡 সুপারিশ:' : '💡 Recommendations:'}**
${assessment.recommendations.map(rec => `• ${rec}`).join('\n')}

**${isBengali ? '🏥 কখন ডাক্তার দেখাবেন:' : '🏥 When to See a Doctor:'}**
${assessment.whenToSeeDoctor}

---
⚠️ ${assessment.disclaimer}`
        };
        setMessages(prev => [...prev, assessmentMessage]);
        setActiveTab('chat');
    };

    const handleGuidedConsultationComplete = (result) => {
        console.log('Guided consultation result:', result);
        setUseGuidedMode(false);
        setActiveTab('chat');
        let summary = '';
        if (isBengali) {
            summary = `🏥 আমার প্রধান স্বাস্থ্য উদ্বেগ: ${result.mainConcern || 'অনির্দিষ্ট'}. ⏰ আমি এটি অনুভব করছি: ${result.duration || 'অনির্দিষ্ট সময় ধরে'}. 📝 অন্যান্য তথ্য: ${result.additionalInfo || 'নেই'}.`;
        } else {
            summary = `🏥 My main health concern is: ${result.mainConcern || 'unspecified'}. ⏰ I've been experiencing it for: ${result.duration || 'an unspecified duration'}. 📝 Other info: ${result.additionalInfo || 'none'}.`;
        }
        setInput(summary);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex flex-col p-4">
            <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
                <Card className="flex-1 flex flex-col shadow-2xl border-0">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6" />
                                <div>
                                    <CardTitle>🤖 {isBengali ? 'AI স্বাস্থ্য সহায়ক' : 'AI Health Assistant'}</CardTitle>
                                    <p className="text-sm text-emerald-100">✨ {isBengali ? 'সহজ ধাপে ধাপে স্বাস্থ্য পরামর্শ' : 'Easy step-by-step health consultation'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant={useGuidedMode ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setUseGuidedMode(!useGuidedMode)}
                                    className={useGuidedMode ? "bg-white text-emerald-600 hover:bg-emerald-50" : "bg-transparent border-white text-white hover:bg-white/10"}
                                >
                                    {useGuidedMode ? '💬' : '🎯'} {isBengali ? (useGuidedMode ? 'চ্যাট মোড' : 'গাইড মোড') : (useGuidedMode ? 'Chat Mode' : 'Guided Mode')}
                                </Button>
                                {user && (
                                    <div className="text-right text-emerald-100">
                                        <p className="text-sm">👋 {user.full_name}</p>
                                        <p className="text-xs opacity-75">📍 {user.district}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    {useGuidedMode ? (
                        <CardContent className="flex-1 p-8">
                            <GuidedHealthConsultation 
                                isBengali={isBengali} 
                                onComplete={handleGuidedConsultationComplete} 
                            />
                        </CardContent>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
                                <TabsTrigger value="chat" className="flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    💬 {isBengali ? 'AI চ্যাট' : 'AI Chat'}
                                </TabsTrigger>
                                <TabsTrigger value="symptoms" className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    🔍 {isBengali ? 'লক্ষণ পরীক্ষক' : 'Symptom Checker'}
                                </TabsTrigger>
                                <TabsTrigger value="skin-checker" className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    📸 {isBengali ? 'চর্ম পরীক্ষক' : 'Skin Checker'}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="chat" className="flex-1 flex flex-col m-4 mt-0">
                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
                                    {messages.length === 0 && (
                                        <div className="space-y-4">
                                            <Alert className="bg-emerald-50 border-emerald-200">
                                                <HeartPulse className="h-4 w-4 text-emerald-700" />
                                                <AlertTitle className="text-emerald-800">🎉 {isBengali ? 'স্বাগতম!' : 'Welcome!'}</AlertTitle>
                                                <AlertDescription className="text-emerald-700">
                                                    👨‍⚕️ {isBengali ? 'আপনার ব্যক্তিগত AI স্বাস্থ্য সহায়ক। আপনার স্বাস্থ্য সম্পর্কিত যেকোনো প্রশ্ন করুন।' : 'Your personal AI Health Assistant. Ask any health-related questions.'} 💪
                                                </AlertDescription>
                                            </Alert>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { textBn: '🌡️ জ্বর হলে কি করব?', textEn: '🌡️ What to do for fever?' },
                                                    { textBn: '🦟 ডেঙ্গুর লক্ষণ কি?', textEn: '🦟 What are dengue symptoms?' },
                                                    { textBn: '🍎 ডায়াবেটিসের খাবার', textEn: '🍎 Diet for diabetes' },
                                                    { textBn: '😌 মানসিক চাপ কমাতে', textEn: '😌 Reduce stress' }
                                                ].map((suggestion, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setInput(isBengali ? suggestion.textBn : suggestion.textEn)}
                                                        className="text-left justify-start h-auto p-3 bg-white hover:bg-emerald-50 border-emerald-200"
                                                    >
                                                        {isBengali ? suggestion.textBn : suggestion.textEn}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>}
                                            <div className={`max-w-2xl p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                                                <ReactMarkdown 
                                                    components={{
                                                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                        ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                        li: ({children}) => <li className="mb-1">{children}</li>,
                                                        h1: ({children}) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                                                        h2: ({children}) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                                                        h3: ({children}) => <h3 className="text-base font-bold mb-1">{children}</h3>,
                                                        strong: ({children}) => <strong className="font-bold">{children}</strong>,
                                                        em: ({children}) => <em className="italic">{children}</em>,
                                                        code: ({children}) => <code className="bg-gray-100 px-1 rounded">{children}</code>,
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-white" /></div>}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>
                                            <div className="max-w-lg p-4 rounded-lg bg-white text-gray-800 rounded-bl-none shadow-sm flex items-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mr-2" />
                                                <span>🤔 {isBengali ? 'চিন্তা করছি...' : 'Thinking...'}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </CardContent>
                                <div className="p-4 border-t bg-white">
                                    <div className="flex items-end gap-3">
                                        <Textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={isBengali ? '💭 আপনার স্বাস্থ্য প্রশ্ন এখানে লিখুন... (Shift+Enter নতুন লাইনের জন্য)' : '💭 Type your health question here... (Shift+Enter for new line)'}
                                            className="flex-1 min-h-[60px] resize-none border-emerald-200 focus:border-emerald-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-emerald-600 hover:bg-emerald-700 px-6">
                                            <Send className="w-5 h-5" /> 📤
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="symptoms" className="flex-1 m-4 mt-0">
                                <div className="h-full overflow-y-auto">
                                    <SymptomChecker onAssessment={handleSymptomAssessment} isBengali={isBengali} />
                                </div>
                            </TabsContent>

                            <TabsContent value="skin-checker" className="flex-1 m-4 mt-0">
                                <div className="h-full overflow-y-auto p-1">
                                    <SkinIssueFinder isBengali={isBengali} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </Card>
            </div>
        </div>
    );
}