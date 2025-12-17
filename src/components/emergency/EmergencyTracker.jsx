import React, { useState, useEffect } from 'react';
import { EmergencyResponse } from '@/entities/EmergencyResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Clock, Ambulance, Route, 
  Heart, Activity, Thermometer
} from 'lucide-react';

export default function EmergencyTracker({ emergencyRequest, isBengali }) {
  const [response, setResponse] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmergencyResponse();
    const interval = setInterval(updateLocation, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [emergencyRequest]);

  const loadEmergencyResponse = async () => {
    try {
      const responses = await EmergencyResponse.filter({ 
        emergency_request_id: emergencyRequest.id 
      });
      
      if (responses.length > 0) {
        setResponse(responses[0]);
        simulateLocationUpdates(responses[0]);
      }
    } catch (error) {
      console.error('Error loading emergency response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateLocationUpdates = (emergencyResponse) => {
    // Simulate ambulance movement for demo
    const updateInterval = setInterval(() => {
      setCurrentLocation(prev => ({
        latitude: (prev?.latitude || 23.8103) + (Math.random() - 0.5) * 0.001,
        longitude: (prev?.longitude || 90.4125) + (Math.random() - 0.5) * 0.001,
        address: "En route to patient location",
        lastUpdated: new Date()
      }));
    }, 5000);

    // Clean up after 60 seconds
    setTimeout(() => clearInterval(updateInterval), 60000);
  };

  const updateLocation = async () => {
    if (response) {
      // In a real implementation, this would fetch live GPS data
      // For demo, we'll simulate movement
      const newLocation = {
        latitude: 23.8103 + Math.random() * 0.01,
        longitude: 90.4125 + Math.random() * 0.01,
        address: "Moving towards destination"
      };
      
      try {
        await EmergencyResponse.update(response.id, {
          current_location: newLocation
        });
        setCurrentLocation(newLocation);
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const getStatusProgress = (status) => {
    const statusMap = {
      'dispatched': 25,
      'en_route': 50,
      'arrived': 75,
      'transporting': 90,
      'completed': 100
    };
    return statusMap[status] || 0;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'dispatched': 'bg-blue-100 text-blue-800',
      'en_route': 'bg-yellow-100 text-yellow-800',
      'arrived': 'bg-green-100 text-green-800',
      'transporting': 'bg-purple-100 text-purple-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const textMap = {
      'dispatched': isBengali ? 'পাঠানো হয়েছে' : 'Dispatched',
      'en_route': isBengali ? 'পথে আছে' : 'En Route',
      'arrived': isBengali ? 'পৌঁছেছে' : 'Arrived',
      'transporting': isBengali ? 'হাসপাতালে নিয়ে যাচ্ছে' : 'Transporting',
      'completed': isBengali ? 'সম্পন্ন' : 'Completed'
    };
    return textMap[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mr-3"></div>
          <span>{isBengali ? 'জরুরি তথ্য লোড হচ্ছে...' : 'Loading emergency data...'}</span>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Ambulance className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {isBengali ? 'জরুরি সাড়া প্রক্রিয়াধীন' : 'Emergency Response Processing'}
          </h3>
          <p className="text-gray-500">
            {isBengali ? 
              'আপনার জরুরি অনুরোধ প্রক্রিয়া করা হচ্ছে। শীঘ্রই সাহায্য পাঠানো হবে।' :
              'Your emergency request is being processed. Help will be dispatched soon.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency Response Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-red-600" />
            {isBengali ? 'জরুরি সাড়া ট্র্যাকিং' : 'Emergency Response Tracking'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{response.responder_name}</h3>
              <p className="text-gray-600 capitalize">{response.responder_type}</p>
              {response.ambulance_unit && (
                <p className="text-sm text-gray-500">
                  {isBengali ? 'অ্যাম্বুলেন্স:' : 'Ambulance:'} {response.ambulance_unit}
                </p>
              )}
            </div>
            <Badge className={getStatusColor(response.response_status)}>
              {getStatusText(response.response_status)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{isBengali ? 'অগ্রগতি' : 'Progress'}</span>
              <span>{getStatusProgress(response.response_status)}%</span>
            </div>
            <Progress value={getStatusProgress(response.response_status)} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                getStatusProgress(response.response_status) >= 25 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={getStatusProgress(response.response_status) >= 25 ? 'text-green-700' : 'text-gray-500'}>
                {isBengali ? 'জরুরি টিম পাঠানো হয়েছে' : 'Emergency team dispatched'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                getStatusProgress(response.response_status) >= 50 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={getStatusProgress(response.response_status) >= 50 ? 'text-green-700' : 'text-gray-500'}>
                {isBengali ? 'আপনার দিকে আসছে' : 'En route to your location'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                getStatusProgress(response.response_status) >= 75 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={getStatusProgress(response.response_status) >= 75 ? 'text-green-700' : 'text-gray-500'}>
                {isBengali ? 'অবস্থানে পৌঁছেছে' : 'Arrived at location'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-3 h-3 rounded-full ${
                getStatusProgress(response.response_status) >= 100 ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={getStatusProgress(response.response_status) >= 100 ? 'text-green-700' : 'text-gray-500'}>
                {isBengali ? 'চিকিৎসা সম্পন্ন' : 'Treatment completed'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Arrival */}
      {response.estimated_arrival && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">
                  {isBengali ? 'আনুমানিক পৌঁছানোর সময়' : 'Estimated Arrival Time'}
                </p>
                <p className="text-blue-700">
                  {new Date(response.estimated_arrival).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {' '}({Math.max(0, Math.floor((new Date(response.estimated_arrival) - new Date()) / 60000))} {isBengali ? 'মিনিট' : 'minutes'})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Location */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              {isBengali ? 'লাইভ অবস্থান' : 'Live Location'}
              <Badge className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                {isBengali ? 'লাইভ' : 'LIVE'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{currentLocation.address}</span>
              </div>
              
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">
                  {isBengali ? 'সর্বশেষ আপডেট:' : 'Last updated:'} {
                    currentLocation.lastUpdated ? 
                      currentLocation.lastUpdated.toLocaleTimeString() : 
                      'Just now'
                  }
                </p>
                <div className="text-xs font-mono text-gray-700">
                  Lat: {currentLocation.latitude?.toFixed(6)}<br/>
                  Lng: {currentLocation.longitude?.toFixed(6)}
                </div>
              </div>
              
              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${currentLocation.latitude},${currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isBengali ? 'ম্যাপে দেখুন' : 'View on Map'}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs (if available) */}
      {response.vital_signs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              {isBengali ? 'জীবনী শক্তির তথ্য' : 'Vital Signs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {response.vital_signs.blood_pressure && (
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <Activity className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">{isBengali ? 'রক্তচাপ' : 'Blood Pressure'}</p>
                  <p className="font-semibold">{response.vital_signs.blood_pressure}</p>
                </div>
              )}
              
              {response.vital_signs.heart_rate && (
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">{isBengali ? 'হৃদস্পন্দন' : 'Heart Rate'}</p>
                  <p className="font-semibold">{response.vital_signs.heart_rate} bpm</p>
                </div>
              )}
              
              {response.vital_signs.temperature && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Thermometer className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">{isBengali ? 'তাপমাত্রা' : 'Temperature'}</p>
                  <p className="font-semibold">{response.vital_signs.temperature}°F</p>
                </div>
              )}
              
              {response.vital_signs.oxygen_level && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">{isBengali ? 'অক্সিজেন' : 'Oxygen'}</p>
                  <p className="font-semibold">{response.vital_signs.oxygen_level}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}