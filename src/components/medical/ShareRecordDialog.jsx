import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share2, X, Search, UserCheck, Loader2, CheckCircle, Users } from 'lucide-react';

export default function ShareRecordDialog({ record, isBengali, onClose, onSuccess }) {
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState(record.shared_with_doctors || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => { loadDoctors(); }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered(doctors);
        } else {
            const q = searchQuery.toLowerCase();
            setFiltered(doctors.filter(d =>
                d.full_name?.toLowerCase().includes(q) ||
                d.email?.toLowerCase().includes(q) ||
                d.specialization?.toLowerCase().includes(q)
            ));
        }
    }, [searchQuery, doctors]);

    const loadDoctors = async () => {
        setIsLoadingDoctors(true);
        try {
            const allDoctors = await base44.entities.User.filter({ role: 'doctor' }, 'full_name', 100);
            setDoctors(allDoctors);
            setFiltered(allDoctors);
        } catch (e) {}
        setIsLoadingDoctors(false);
    };

    const toggleDoctor = (doctorId) => {
        setSelectedDoctors(prev =>
            prev.includes(doctorId)
                ? prev.filter(id => id !== doctorId)
                : [...prev, doctorId]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await base44.entities.MedicalRecord.update(record.id, {
                shared_with_doctors: selectedDoctors
            });
            setSuccess(true);
            setTimeout(() => onSuccess(), 1200);
        } catch (e) {}
        setIsSaving(false);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-600" />
                        {isBengali ? 'ডাক্তারের সাথে শেয়ার করুন' : 'Share with Doctor'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Record Info */}
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📄</span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-800 truncate">{record.document_name}</p>
                            <p className="text-xs text-gray-500">{record.record_type?.replace('_', ' ')}</p>
                        </div>
                    </div>

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700">
                                {isBengali ? 'সফলভাবে শেয়ার করা হয়েছে!' : 'Successfully shared!'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Selected Doctors */}
                    {selectedDoctors.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">
                                {isBengali ? `${selectedDoctors.length} জন ডাক্তার নির্বাচিত` : `${selectedDoctors.length} doctor(s) selected`}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedDoctors.map(id => {
                                    const doc = doctors.find(d => d.id === id);
                                    return doc ? (
                                        <Badge key={id} className="bg-blue-50 text-blue-700 border border-blue-200 pr-1 gap-1">
                                            <UserCheck className="w-3 h-3" />
                                            {doc.full_name}
                                            <button onClick={() => toggleDoctor(id)} className="hover:text-red-600 ml-1">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={isBengali ? 'ডাক্তার খুঁজুন...' : 'Search doctors...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Doctor List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 border rounded-lg p-2 bg-gray-50">
                        {isLoadingDoctors ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">{isBengali ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors found'}</p>
                            </div>
                        ) : (
                            filtered.map(doctor => {
                                const isSelected = selectedDoctors.includes(doctor.id);
                                return (
                                    <button
                                        key={doctor.id}
                                        onClick={() => toggleDoctor(doctor.id)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                                            isSelected
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'bg-white border border-transparent hover:border-gray-200 hover:bg-white'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                                            isSelected ? 'bg-blue-500 text-white' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {isSelected ? <UserCheck className="w-4 h-4" /> : (doctor.full_name?.charAt(0)?.toUpperCase() || 'D')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800">{doctor.full_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{doctor.email}</p>
                                        </div>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>
                            {isBengali ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || success}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                            {isBengali ? 'শেয়ার আপডেট করুন' : 'Update Sharing'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}