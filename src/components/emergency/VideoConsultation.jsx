import React, { useState, useEffect } from 'react';
import { VideoConsultation as VideoConsultationEntity } from '@/entities/VideoConsultation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Monitor, Users, Clock, Shield, Camera
} from 'lucide-react';

export default function VideoConsultation({ emergencyRequest, user, isBengali }) {
  const [consultation, setConsultation] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    initializeVideoConsultation();
  }, [emergencyRequest]);

  useEffect(() => {
    if (consultation && consultation.session_status === 'in_progress') {
      const interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [consultation]);

  const initializeVideoConsultation = async () => {
    try {
      // Check if there's already a video consultation for this emergency
      const existingConsultations = await VideoConsultationEntity.filter({
        emergency_request_id: emergencyRequest.id
      });

      if (existingConsultations.length > 0) {
        setConsultation(existingConsultations[0]);
        simulateConnection();
      } else {
        // Create new video consultation
        setTimeout(async () => {
          const newConsultation = await VideoConsultationEntity.create({
            patient_id: user?.id || 'anonymous',
            doctor_id: 'doc_001',
            emergency_request_id: emergencyRequest.id,
            consultation_type: 'emergency',
            scheduled_time: new Date().toISOString(),
            meeting_room_id: `emergency_${emergencyRequest.id}_${Date.now()}`,
            session_status: 'scheduled'
          });
          
          setConsultation(newConsultation);
          simulateConnection();
        }, 3000);
      }
    } catch (error) {
      console.error('Error initializing video consultation:', error);
    }
  };

  const simulateConnection = () => {
    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
      if (consultation) {
        VideoConsultationEntity.update(consultation.id, {
          session_status: 'in_progress',
          actual_start_time: new Date().toISOString()
        });
        setConsultation(prev => ({
          ...prev,
          session_status: 'in_progress',
          actual_start_time: new Date().toISOString()
        }));
      }
    }, 5000);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const endCall = async () => {
    if (consultation) {
      await VideoConsultationEntity.update(consultation.id, {
        session_status: 'completed',
        actual_end_time: new Date().toISOString()
      });
      setConsultation(prev => ({
        ...prev,
        session_status: 'completed'
      }));
    }
    setConnectionStatus('disconnected');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!consultation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse flex items-center mb-4">
            <Video className="w-8 h-8 text-blue-500 mr-2" />
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full ml-1 animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full ml-1 animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isBengali ? 'ভিডিও পরামর্শ সেটআপ করা হচ্ছে...' : 'Setting up Video Consultation...'}
          </h3>
          <p className="text-gray-600 text-center">
            {isBengali ? 
              'আমরা আপনাকে একজন ডাক্তারের সাথে ভিডিও কলের জন্য সংযুক্ত করছি।' :
              'We are connecting you with a doctor for video consultation.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">
                {isBengali ? 'ভিডিও পরামর্শ' : 'Video Consultation'}
              </span>
              <Badge className={`ml-2 ${getConnectionStatusColor(connectionStatus)}`}>
                {connectionStatus === 'connecting' && (isBengali ? 'সংযোগ করা হচ্ছে' : 'Connecting')}
                {connectionStatus === 'connected' && (isBengali ? 'সংযুক্ত' : 'Connected')}
                {connectionStatus === 'disconnected' && (isBengali ? 'সংযোগ বিচ্ছিন্ন' : 'Disconnected')}
              </Badge>
            </div>
            {consultation.session_status === 'in_progress' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(sessionDuration)}</span>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Video Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Doctor Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Dr. Emergency Specialist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
              {connectionStatus === 'connected' ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Dr. Rahman</p>
                    <p className="text-xs opacity-75">Emergency Medicine</p>
                  </div>
                </div>
              ) : (
                <div className="text-white text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">
                    {isBengali ? 'ডাক্তারের সাথে সংযোগ করা হচ্ছে...' : 'Connecting to doctor...'}
                  </p>
                </div>
              )}
              
              {connectionStatus === 'connected' && (
                <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                  {isBengali ? 'লাইভ' : 'LIVE'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              {isBengali ? 'আপনি' : 'You'} ({user?.full_name || 'Patient'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative">
              {isVideoEnabled ? (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">{user?.full_name || 'Patient'}</p>
                    <p className="text-xs opacity-75">
                      {isBengali ? 'ভিডিও চালু' : 'Video On'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-white text-center">
                  <VideoOff className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">
                    {isBengali ? 'ভিডিও বন্ধ' : 'Video Off'}
                  </p>
                </div>
              )}
              
              <div className="absolute bottom-2 right-2 flex gap-1">
                {!isVideoEnabled && (
                  <Badge variant="secondary" className="bg-red-500 text-white">
                    <VideoOff className="w-3 h-3" />
                  </Badge>
                )}
                {!isAudioEnabled && (
                  <Badge variant="secondary" className="bg-red-500 text-white">
                    <MicOff className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full w-12 h-12 p-0"
              disabled={consultation.session_status === 'completed'}
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-center mt-4 gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              {isVideoEnabled ? 
                (isBengali ? 'ভিডিও চালু' : 'Video On') : 
                (isBengali ? 'ভিডিও বন্ধ' : 'Video Off')
              }
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-4 h-4" />
              {isAudioEnabled ? 
                (isBengali ? 'অডিও চালু' : 'Audio On') : 
                (isBengali ? 'অডিও বন্ধ' : 'Audio Off')
              }
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      {consultation.session_status === 'completed' && (
        <Alert>
          <AlertDescription>
            <div className="text-center">
              <h3 className="font-semibold mb-2">
                {isBengali ? 'পরামর্শ সম্পন্ন' : 'Consultation Completed'}
              </h3>
              <p className="text-sm text-gray-600">
                {isBengali ? 
                  'আপনার ভিডিও পরামর্শ সফলভাবে সম্পন্ন হয়েছে। প্রয়োজনে আবার যোগাযোগ করুন।' :
                  'Your video consultation has been completed successfully. Contact us again if needed.'
                }
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {isBengali ? 'মোট সময়:' : 'Duration:'} {formatDuration(sessionDuration)}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}