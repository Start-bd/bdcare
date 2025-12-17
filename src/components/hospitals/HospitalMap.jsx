import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Heart, 
  Ambulance,
  Bed,
  X
} from "lucide-react";
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController({ hospitals, selectedHospital, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedHospital && selectedHospital.latitude && selectedHospital.longitude) {
      map.setView([selectedHospital.latitude, selectedHospital.longitude], 15);
    } else if (hospitals.length > 0) {
      // Fit map to show all hospitals
      const validHospitals = hospitals.filter(h => h.latitude && h.longitude);
      if (validHospitals.length > 0) {
        const bounds = L.latLngBounds(validHospitals.map(h => [h.latitude, h.longitude]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  }, [map, hospitals, selectedHospital, userLocation]);

  return null;
}

export default function HospitalMap({ hospitals, selectedHospital, onHospitalSelect, onClose, isBengali }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]); // Dhaka default

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter([location.latitude, location.longitude]);
        },
        () => {
          // Use default Dhaka coordinates if location access fails
          console.log("Location access denied or failed");
        }
      );
    }
  }, []);

  const openDirections = (hospital) => {
    if (hospital.latitude && hospital.longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    } else {
      const addressQuery = encodeURIComponent(`${hospital.name}, ${hospital.address}, ${hospital.district}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const makeCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const validHospitals = hospitals.filter(h => h.latitude && h.longitude);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Map Section */}
          <div className="flex-1 h-[70vh]">
            <div className="relative h-full">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-lg"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="rounded-l-xl"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController 
                  hospitals={validHospitals} 
                  selectedHospital={selectedHospital} 
                  userLocation={userLocation}
                />
                
                {/* User Location Marker */}
                {userLocation && (
                  <Marker position={[userLocation.latitude, userLocation.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <strong>{isBengali ? 'আপনার অবস্থান' : 'Your Location'}</strong>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {/* Hospital Markers */}
                {validHospitals.map((hospital) => (
                  <Marker 
                    key={hospital.id} 
                    position={[hospital.latitude, hospital.longitude]}
                    eventHandlers={{
                      click: () => onHospitalSelect(hospital)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-bold text-sm mb-2">{hospital.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{hospital.district}, {hospital.upazila}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          {hospital.has_emergency && (
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-red-500" />
                              <span className="text-xs">{isBengali ? "জরুরি" : "Emergency"}</span>
                            </div>
                          )}
                          {hospital.has_ambulance && (
                            <div className="flex items-center gap-1">
                              <Ambulance className="w-3 h-3 text-blue-500" />
                              <span className="text-xs">{isBengali ? "অ্যাম্বুলেন্স" : "Ambulance"}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openDirections(hospital)}>
                            <Navigation className="w-3 h-3 mr-1" />
                            {isBengali ? "যান" : "Go"}
                          </Button>
                          {hospital.phone && (
                            <Button size="sm" variant="outline" onClick={() => makeCall(hospital.phone)}>
                              <Phone className="w-3 h-3 mr-1" />
                              {isBengali ? "কল" : "Call"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Hospital Details Panel */}
          <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              {isBengali ? 'হাসপাতালের তথ্য' : 'Hospital Details'}
            </h3>
            
            {selectedHospital ? (
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{selectedHospital.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedHospital.district}, {selectedHospital.upazila}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedHospital.total_beds && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bed className="w-4 h-4 text-blue-600" />
                      <span>{selectedHospital.available_beds || 0}/{selectedHospital.total_beds} {isBengali ? "শয্যা" : "beds"}</span>
                    </div>
                  )}
                  
                  {selectedHospital.specializations && (
                    <div>
                      <p className="text-sm font-medium mb-2">{isBengali ? "বিশেষত্ব:" : "Specializations:"}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedHospital.specializations.slice(0, 5).map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => openDirections(selectedHospital)}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      {isBengali ? "যান" : "Navigate"}
                    </Button>
                    {selectedHospital.phone && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => makeCall(selectedHospital.phone)}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {selectedHospital.emergency_phone && (
                    <Button 
                      size="sm" 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => makeCall(selectedHospital.emergency_phone)}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {isBengali ? `জরুরি: ${selectedHospital.emergency_phone}` : `Emergency: ${selectedHospital.emergency_phone}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  {isBengali ? 'ম্যাপে একটি হাসপাতাল নির্বাচন করুন' : 'Select a hospital on the map'}
                </p>
                <p className="text-xs mt-1">
                  {isBengali ? `${validHospitals.length} টি হাসপাতাল দেখানো হচ্ছে` : `Showing ${validHospitals.length} hospitals`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}