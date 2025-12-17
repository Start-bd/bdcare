import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation,
  Heart,
  Bed,
  Stethoscope,
  Ambulance
} from "lucide-react";

export default function HospitalCard({ hospital, isBengali, onMapView }) {
  const getHospitalTypeBadge = (type) => {
    const types = {
      government: { 
        labelBn: "সরকারি", 
        labelEn: "Government", 
        className: "bg-green-100 text-green-800" 
      },
      private: { 
        labelBn: "বেসরকারি", 
        labelEn: "Private", 
        className: "bg-blue-100 text-blue-800" 
      },
      specialized: { 
        labelBn: "বিশেষায়িত", 
        labelEn: "Specialized", 
        className: "bg-purple-100 text-purple-800" 
      }
    };
    
    const typeInfo = types[type] || types.government;
    return (
      <Badge className={typeInfo.className}>
        {isBengali ? typeInfo.labelBn : typeInfo.labelEn}
      </Badge>
    );
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const openDirections = () => {
    if (hospital.latitude && hospital.longitude) {
      // Open in Google Maps with coordinates
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    } else {
      // Fallback to address search
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

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
              {hospital.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 line-clamp-1">
                {hospital.district}, {hospital.upazila}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 line-clamp-2">
                {hospital.address}
              </span>
            </div>
          </div>
          {getHospitalTypeBadge(hospital.type)}
        </div>
        
        {hospital.rating && (
          <div className="mt-2">
            {renderRating(hospital.rating)}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Services & Specializations */}
        {hospital.specializations && hospital.specializations.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">
                {isBengali ? "বিশেষত্ব" : "Specializations"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hospital.specializations.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                  {spec}
                </Badge>
              ))}
              {hospital.specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{hospital.specializations.length - 3} {isBengali ? "আরো" : "more"}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Services Available */}
        {hospital.services && hospital.services.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {isBengali ? "সেবাসমূহ" : "Services"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hospital.services.slice(0, 4).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {hospital.services.length > 4 && (
                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                  +{hospital.services.length - 4} {isBengali ? "আরো" : "more"}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="space-y-2 mb-4">
          {hospital.total_beds && (
            <div className="flex items-center gap-2 text-sm">
              <Bed className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">
                {hospital.available_beds || 0}/{hospital.total_beds} {isBengali ? "শয্যা উপলব্ধ" : "beds available"}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {hospital.has_emergency && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-600">
                  {isBengali ? "জরুরি" : "Emergency"}
                </span>
              </div>
            )}
            
            {hospital.has_ambulance && (
              <div className="flex items-center gap-1">
                <Ambulance className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-600">
                  {isBengali ? "অ্যাম্বুলেন্স" : "Ambulance"}
                </span>
              </div>
            )}
          </div>

          {hospital.operating_hours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{hospital.operating_hours}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-emerald-50 hover:border-emerald-200"
            onClick={openDirections}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isBengali ? "দিকনির্দেশনা" : "Directions"}
          </Button>
          
          {hospital.phone && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => makeCall(hospital.phone)}
            >
              <Phone className="w-4 h-4 mr-2" />
              {isBengali ? "কল করুন" : "Call"}
            </Button>
          )}

          {onMapView && (
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-gray-50"
              onClick={() => onMapView(hospital)}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Emergency Contact */}
        {hospital.emergency_phone && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {isBengali ? "জরুরি হটলাইন" : "Emergency Hotline"}
                </span>
              </div>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => makeCall(hospital.emergency_phone)}
              >
                <Phone className="w-3 h-3 mr-1" />
                {hospital.emergency_phone}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}