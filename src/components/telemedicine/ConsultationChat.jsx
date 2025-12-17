import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Loader2, FileText } from 'lucide-react';

export default function ConsultationChat({ consultation, user, isBengali }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

    useEffect(() => {
        loadMessages();
        
        // Poll for new messages every 2 seconds
        pollingInterval.current = setInterval(loadMessages, 2000);
        
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [consultation.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const fetchedMessages = await base44.entities.ConsultationChat.filter(
                { consultation_id: consultation.id },
                'created_date',
                100
            );
            setMessages(fetchedMessages);

            // Mark messages as read
            const unreadMessages = fetchedMessages.filter(
                msg => !msg.is_read && msg.sender_id !== user.id
            );
            for (const msg of unreadMessages) {
                await base44.entities.ConsultationChat.update(msg.id, { is_read: true });
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await base44.entities.ConsultationChat.create({
                consultation_id: consultation.id,
                sender_id: user.id,
                sender_name: user.full_name,
                sender_type: user.user_type === 'doctor' || user.role === 'doctor' ? 'doctor' : 'patient',
                message: newMessage,
                message_type: 'text',
                is_read: false
            });
            setNewMessage('');
            await loadMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
        setIsSending(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            await base44.entities.ConsultationChat.create({
                consultation_id: consultation.id,
                sender_id: user.id,
                sender_name: user.full_name,
                sender_type: user.user_type === 'doctor' || user.role === 'doctor' ? 'doctor' : 'patient',
                message: `${isBengali ? 'ফাইল শেয়ার করেছেন' : 'Shared a file'}: ${file.name}`,
                message_type: 'file',
                file_url,
                is_read: false
            });
            await loadMessages();
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
        setIsUploading(false);
    };

    return (
        <Card className="h-[600px] flex flex-col bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
                <CardTitle className="text-white text-lg">
                    {isBengali ? '💬 সুরক্ষিত চ্যাট' : '💬 Secure Chat'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 mt-8">
                            <p>{isBengali ? 'এখনো কোনো মেসেজ নেই' : 'No messages yet'}</p>
                            <p className="text-sm mt-1">
                                {isBengali ? 'কথোপকথন শুরু করুন' : 'Start the conversation'}
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwnMessage = msg.sender_id === user.id;
                            return (
                                <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${isOwnMessage ? 'bg-emerald-600' : 'bg-gray-700'} rounded-lg p-3`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xs text-gray-200 font-medium">
                                                {msg.sender_name}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                                {msg.sender_type === 'doctor' ? '👨‍⚕️' : '👤'}
                                            </span>
                                        </div>
                                        <p className="text-white text-sm">{msg.message}</p>
                                        {msg.message_type === 'file' && msg.file_url && (
                                            <a 
                                                href={msg.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 mt-2 text-xs text-blue-300 hover:text-blue-200"
                                            >
                                                <FileText className="w-3 h-3" />
                                                {isBengali ? 'ফাইল দেখুন' : 'View File'}
                                            </a>
                                        )}
                                        <p className="text-xs text-gray-300 mt-1">
                                            {new Date(msg.created_date).toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-700 p-4">
                    <div className="flex gap-2">
                        <label className="cursor-pointer">
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <Button 
                                variant="outline" 
                                size="icon"
                                disabled={isUploading}
                                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                                type="button"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Paperclip className="w-4 h-4" />
                                )}
                            </Button>
                        </label>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder={isBengali ? 'মেসেজ লিখুন...' : 'Type a message...'}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                        <Button 
                            onClick={sendMessage}
                            disabled={isSending || !newMessage.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}