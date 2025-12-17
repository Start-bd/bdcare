import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Camera, 
  MapPin,
  Shield
} from 'lucide-react';

export default function LiveChat({ emergencyRequest, isBengali }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [responder, setResponder] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Simulate connecting to emergency responder
    const timer = setTimeout(() => {
      setIsConnected(true);
      setResponder({
        name: "Dr. Rahman",
        role: "Emergency Medicine Specialist",
        hospital: "Dhaka Medical College Hospital"
      });
      
      // Add initial message from responder
      setMessages([{
        id: 1,
        sender: 'responder',
        content: isBengali ? 
          'আমি ডা. রহমান। আমি আপনার জরুরি অবস্থায় সাহায্য করতে এসেছি। আপনার অবস্থা কেমন?' :
          'This is Dr. Rahman. I\'m here to help with your emergency. How are you feeling right now?',
        timestamp: new Date(),
        type: 'text'
      }]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isBengali]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate responder reply
    setTimeout(() => {
      const replies = [
        isBengali ? 'বুঝতে পারছি। আরো বিস্তারিত বলুন।' : 'I understand. Please tell me more details.',
        isBengali ? 'ঠিক আছে। আপনি কি কোনো ওষুধ খাচ্ছেন?' : 'Okay. Are you taking any medications?',
        isBengali ? 'আমি আপনার কাছের হাসপাতালে যোগাযোগ করছি।' : 'I\'m contacting the nearest hospital for you.'
      ];
      
      const responderMessage = {
        id: Date.now() + 1,
        sender: 'responder',
        content: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, responderMessage]);
    }, 1000 + Math.random() * 2000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const message = {
        id: Date.now(),
        sender: 'user',
        content: URL.createObjectURL(file),
        timestamp: new Date(),
        type: 'image',
        fileName: file.name
      };
      setMessages(prev => [...prev, message]);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const message = {
          id: Date.now(),
          sender: 'user',
          content: `${position.coords.latitude}, ${position.coords.longitude}`,
          timestamp: new Date(),
          type: 'location'
        };
        setMessages(prev => [...prev, message]);
      });
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">
            {isBengali ? 'জরুরি বিশেষজ্ঞের সাথে সংযোগ করা হচ্ছে...' : 'Connecting to Emergency Specialist...'}
          </h3>
          <p className="text-gray-600">
            {isBengali ? 'অনুগ্রহ করে অপেক্ষা করুন। আমরা আপনাকে একজন চিকিৎসকের সাথে সংযুক্ত করছি।' : 'Please wait. We are connecting you with a medical professional.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Responder Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{responder.name}</h4>
                <p className="text-sm text-gray-600">{responder.role}</p>
                <p className="text-xs text-gray-500">{responder.hospital}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="h-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            {isBengali ? 'লাইভ সহায়তা' : 'Live Support'}
            <Badge className="bg-green-100 text-green-800 ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              {isBengali ? 'সংযুক্ত' : 'Connected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.type === 'text' && <p className="text-sm">{message.content}</p>}
                {message.type === 'image' && (
                  <div>
                    <img src={message.content} alt="Shared" className="max-w-full rounded" />
                    <p className="text-xs mt-1 opacity-75">{message.fileName}</p>
                  </div>
                )}
                {message.type === 'location' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{isBengali ? 'অবস্থান শেয়ার করেছেন' : 'Location shared'}</span>
                  </div>
                )}
                <p className="text-xs mt-1 opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Chat Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isBengali ? 'আপনার বার্তা টাইপ করুন...' : 'Type your message...'}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={shareLocation}>
              <MapPin className="w-4 h-4" />
            </Button>
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}