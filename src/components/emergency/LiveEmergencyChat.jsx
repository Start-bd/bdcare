import React, { useState, useEffect, useRef } from 'react';
import { EmergencyChat } from '@/entities/EmergencyChat';
import { EmergencyResponse } from '@/entities/EmergencyResponse';
import { UploadFile } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, Send, Phone, Video, MapPin, 
  User as UserIcon, Shield, Clock, AlertTriangle,
  Loader2, Image as ImageIcon
} from 'lucide-react';

export default function LiveEmergencyChat({ emergencyRequest, user, isBengali }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [responders, setResponders] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [emergencyResponse, setEmergencyResponse] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeChat();
    const interval = setInterval(loadMessages, 3000); // Refresh messages every 3 seconds
    return () => clearInterval(interval);
  }, [emergencyRequest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Check if there's already a response team assigned
      const responses = await EmergencyResponse.filter({ 
        emergency_request_id: emergencyRequest.id 
      });
      
      if (responses.length > 0) {
        setEmergencyResponse(responses[0]);
        setIsConnected(true);
        loadMessages();
      } else {
        // Simulate emergency response team assignment
        setTimeout(async () => {
          const newResponse = await EmergencyResponse.create({
            emergency_request_id: emergencyRequest.id,
            responder_id: 'resp_001',
            responder_name: 'Dr. Rahman',
            responder_type: 'doctor',
            response_status: 'dispatched',
            estimated_arrival: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
          });
          
          setEmergencyResponse(newResponse);
          setIsConnected(true);
          
          // Send initial message from responder
          await EmergencyChat.create({
            emergency_request_id: emergencyRequest.id,
            sender_id: 'resp_001',
            sender_name: 'Dr. Rahman',
            sender_type: 'doctor',
            content: isBengali ? 
              'আমি ডা. রহমান। আমি আপনার জরুরি অবস্থায় সাহায্য করতে এসেছি। আপনার বর্তমান অবস্থা কেমন?' :
              'This is Dr. Rahman. I\'m here to help with your emergency. How are you feeling right now?'
          });
          
          loadMessages();
        }, 2000);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const chatMessages = await EmergencyChat.filter({ 
        emergency_request_id: emergencyRequest.id 
      }, '-created_date');
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (messageType = 'text', content = newMessage, locationData = null) => {
    if (!content.trim() && messageType === 'text') return;

    try {
      await EmergencyChat.create({
        emergency_request_id: emergencyRequest.id,
        sender_id: user?.id || 'anonymous',
        sender_name: user?.full_name || 'Patient',
        sender_type: 'patient',
        message_type: messageType,
        content: content,
        location_data: locationData
      });

      if (messageType === 'text') {
        setNewMessage('');
      }
      loadMessages();

      // Simulate responder reply for demo
      if (Math.random() > 0.3) { // 70% chance of reply
        setTimeout(async () => {
          const replies = [
            isBengali ? 'বুঝতে পারছি। আমি সাহায্যের জন্য পথে আছি।' : 'I understand. Help is on the way.',
            isBengali ? 'আপনার অবস্থান পেয়েছি। ৫ মিনিটের মধ্যে পৌঁছাব।' : 'Got your location. Will reach in 5 minutes.',
            isBengali ? 'শ্বাস নিতে কষ্ট হলে গভীর শ্বাস নেওয়ার চেষ্টা করুন।' : 'If breathing is difficult, try to take deep breaths.',
            isBengali ? 'অ্যাম্বুলেন্স পাঠানো হয়েছে। শান্ত থাকুন।' : 'Ambulance dispatched. Please stay calm.'
          ];
          
          await EmergencyChat.create({
            emergency_request_id: emergencyRequest.id,
            sender_id: 'resp_001',
            sender_name: emergencyResponse?.responder_name || 'Emergency Responder',
            sender_type: 'doctor',
            content: replies[Math.floor(Math.random() * replies.length)]
          });
          
          loadMessages();
        }, 1000 + Math.random() * 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          sendMessage(
            'location',
            isBengali ? 'বর্তমান অবস্থান শেয়ার করেছি' : 'Current location shared',
            locationData
          );
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await sendMessage('image', file_url);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isConnected) {
    return (
      <Card className="h-96">
        <CardContent className="flex flex-col items-center justify-center h-full text-center">
          <div className="animate-pulse flex items-center mb-4">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2 animate-bounce"></div>
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2 animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-700">
            {isBengali ? 'জরুরি টিমের সাথে সংযোগ করা হচ্ছে...' : 'Connecting to Emergency Team...'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isBengali ? 
              'অনুগ্রহ করে অপেক্ষা করুন। আমরা আপনাকে একজন চিকিৎসকের সাথে সংযুক্ত করছি।' :
              'Please wait. We are connecting you with a medical professional.'
            }
          </p>
          <div className="text-sm text-gray-500">
            {isBengali ? 'গড় প্রতিক্রিয়া সময়: ২ মিনিট' : 'Average response time: 2 minutes'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Emergency Response Status */}
      {emergencyResponse && (
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-green-800">
                  {emergencyResponse.responder_name} 
                </span>
                <span className="text-green-700 ml-2">
                  ({emergencyResponse.responder_type})
                </span>
                <div className="text-sm text-green-600 mt-1">
                  {isBengali ? 'স্ট্যাটাস:' : 'Status:'} <Badge className="bg-green-100 text-green-800">
                    {emergencyResponse.response_status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-green-300">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-green-300">
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {emergencyResponse.estimated_arrival && (
              <div className="text-sm text-green-600 mt-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {isBengali ? 'আনুমানিক পৌঁছানোর সময়:' : 'Estimated arrival:'} {
                  new Date(emergencyResponse.estimated_arrival).toLocaleTimeString()
                }
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Live Chat */}
      <Card className="h-96">
        <CardHeader className="pb-3 border-b bg-red-50">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-600" />
            {isBengali ? 'জরুরি লাইভ চ্যাট' : 'Emergency Live Chat'}
            <Badge className="bg-red-100 text-red-800 ml-auto">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
              {isBengali ? 'লাইভ' : 'LIVE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-3 p-4 h-64">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${
              message.sender_type === 'patient' ? 'justify-end' : 'justify-start'
            }`}>
              {message.sender_type !== 'patient' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender_type === 'doctor' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {message.sender_type === 'doctor' ? (
                    <Shield className="w-4 h-4 text-white" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_type === 'patient' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                {message.message_type === 'text' && (
                  <p className="text-sm">{message.content}</p>
                )}
                
                {message.message_type === 'image' && (
                  <div>
                    <img 
                      src={message.content} 
                      alt="Shared" 
                      className="max-w-full rounded mb-1"
                    />
                    <p className="text-xs opacity-75">
                      {isBengali ? 'ছবি শেয়ার করেছেন' : 'Image shared'}
                    </p>
                  </div>
                )}
                
                {message.message_type === 'location' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{message.content}</p>
                      {message.location_data && (
                        <p className="text-xs opacity-75">
                          {message.location_data.latitude?.toFixed(4)}, {message.location_data.longitude?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-xs mt-1 opacity-75">
                  {formatTime(message.created_date)}
                  {message.is_urgent && (
                    <AlertTriangle className="w-3 h-3 inline ml-1 text-red-400" />
                  )}
                </p>
              </div>
              
              {message.sender_type === 'patient' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        
        {/* Chat Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-end gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isBengali ? 'আপনার বার্তা টাইপ করুন...' : 'Type your message...'}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
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
              disabled={isUploading}
              className="border-gray-300"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={shareLocation}
              className="border-gray-300"
            >
              <MapPin className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={() => sendMessage()}
              disabled={!newMessage.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>
              {isBengali ? 'Enter চাপুন পাঠানোর জন্য' : 'Press Enter to send'}
            </span>
            <span>
              {isBengali ? 'প্রতিক্রিয়া সময়: < ৩০সে' : 'Response time: < 30s'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}