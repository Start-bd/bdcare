import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone, RefreshCw } from 'lucide-react';

export default function WebRTCVideo({ consultation, user, onCallEnd, isBengali }) {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [connectionState, setConnectionState] = useState('new');

    useEffect(() => {
        initializeMedia();
        return () => {
            cleanup();
        };
    }, []);

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });
            
            localStream.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize peer connection
            initializePeerConnection(stream);
        } catch (error) {
            console.error('Failed to get media devices:', error);
            alert(isBengali 
                ? 'ক্যামেরা/মাইক্রোফোন অ্যাক্সেস করা যায়নি। অনুগ্রহ করে অনুমতি দিন।'
                : 'Failed to access camera/microphone. Please grant permissions.');
        }
    };

    const initializePeerConnection = (stream) => {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        const pc = new RTCPeerConnection(configuration);
        
        // Add local stream tracks
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Monitor connection state
        pc.onconnectionstatechange = () => {
            setConnectionState(pc.connectionState);
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                console.log('Connection lost, attempting to reconnect...');
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // In production, send this to the other peer via signaling server
                console.log('ICE Candidate:', event.candidate);
            }
        };

        peerConnection.current = pc;

        // Auto-create offer for simplicity (in production, coordinate via signaling)
        createOffer();
    };

    const createOffer = async () => {
        try {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            // In production, send offer to other peer via signaling server
            console.log('Created offer:', offer);
        } catch (error) {
            console.error('Failed to create offer:', error);
        }
    };

    const toggleVideo = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const handleEndCall = () => {
        cleanup();
        onCallEnd();
    };

    const cleanup = () => {
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
    };

    const reconnect = () => {
        cleanup();
        initializeMedia();
    };

    return (
        <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
            {/* Remote Video (Main) */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-xl">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                />
                {!videoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <VideoOff className="w-8 h-8 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Connection Status */}
            <div className="absolute top-4 left-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    connectionState === 'connected' ? 'bg-green-500 text-white' :
                    connectionState === 'connecting' ? 'bg-yellow-500 text-white animate-pulse' :
                    'bg-red-500 text-white'
                }`}>
                    {connectionState === 'connected' && '● Live'}
                    {connectionState === 'connecting' && '○ Connecting...'}
                    {(connectionState === 'failed' || connectionState === 'disconnected') && '✕ Disconnected'}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-center items-center gap-3">
                    <Button
                        size="lg"
                        variant={videoEnabled ? "default" : "destructive"}
                        onClick={toggleVideo}
                        className="rounded-full w-14 h-14"
                        title={videoEnabled ? (isBengali ? 'ভিডিও বন্ধ করুন' : 'Turn off video') : (isBengali ? 'ভিডিও চালু করুন' : 'Turn on video')}
                    >
                        {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                    
                    <Button
                        size="lg"
                        variant={audioEnabled ? "default" : "destructive"}
                        onClick={toggleAudio}
                        className="rounded-full w-14 h-14"
                        title={audioEnabled ? (isBengali ? 'মাইক বন্ধ করুন' : 'Mute') : (isBengali ? 'মাইক চালু করুন' : 'Unmute')}
                    >
                        {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    {(connectionState === 'failed' || connectionState === 'disconnected') && (
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={reconnect}
                            className="rounded-full w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white"
                            title={isBengali ? 'পুনরায় সংযোগ করুন' : 'Reconnect'}
                        >
                            <RefreshCw className="w-6 h-6" />
                        </Button>
                    )}
                    
                    <Button
                        size="lg"
                        variant="destructive"
                        onClick={handleEndCall}
                        className="rounded-full w-14 h-14"
                        title={isBengali ? 'কল শেষ করুন' : 'End call'}
                    >
                        <Phone className="w-6 h-6 rotate-135" />
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}