import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DoctorClinicLocations({ doctor, isBengali }) {
    const clinics = doctor.clinic_addresses || [];
    const slots = doctor.appointment_slots || [];

    if (clinics.length === 0) {
        return null;
    }

    const getClinicSlots = (clinicName) => {
        return slots.filter(slot => slot.clinic_name === clinicName);
    };

    const formatTimeSlot = (slot) => {
        return `${slot.day}: ${slot.start_time} - ${slot.end_time}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    {isBengali ? '🏢 ক্লিনিক ঠিকানা' : '🏢 Clinic Locations'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {clinics.map((clinic, idx) => {
                        const clinicSlots = getClinicSlots(clinic.name);
                        
                        return (
                            <div key={idx} className="p-4 border rounded-lg hover:shadow-lg transition-all">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{clinic.name}</h3>
                                        <p className="text-gray-700 text-sm mb-2">{clinic.address}</p>
                                        {clinic.district && (
                                            <Badge variant="outline" className="text-xs mb-2">
                                                📍 {clinic.district}
                                            </Badge>
                                        )}
                                        {clinic.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${clinic.phone}`} className="hover:text-blue-600">
                                                    {clinic.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Appointment Slots for this clinic */}
                                {clinicSlots.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-emerald-600" />
                                            <h4 className="font-semibold text-sm">
                                                {isBengali ? 'ভিজিট সময়' : 'Visiting Hours'}
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {clinicSlots.map((slot, slotIdx) => (
                                                <div key={slotIdx} className="text-sm bg-emerald-50 p-2 rounded">
                                                    <span className="font-medium">{slot.day}:</span>
                                                    <span className="ml-2 text-gray-700">
                                                        {slot.start_time} - {slot.end_time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Map Preview */}
                                {clinic.latitude && clinic.longitude && (
                                    <div className="mt-3">
                                        <a
                                            href={`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full"
                                        >
                                            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                                                <img
                                                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+3b82f6(${clinic.longitude},${clinic.latitude})/${clinic.longitude},${clinic.latitude},14,0/600x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                                                    alt={clinic.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://via.placeholder.com/600x300/f0f0f0/999999?text=${encodeURIComponent(clinic.name)}`;
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                                                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            🗺️ {isBengali ? 'ম্যাপে দেখুন' : 'View on Map'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {doctor.consultation_fee && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    {isBengali ? 'পরামর্শ ফি' : 'Consultation Fee'}
                                </p>
                                <p className="text-2xl font-bold text-emerald-700">
                                    ৳{doctor.consultation_fee}
                                </p>
                            </div>
                            <div className="text-xs text-gray-500 text-right">
                                {isBengali ? 'প্রতি পরামর্শ' : 'Per Consultation'}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}