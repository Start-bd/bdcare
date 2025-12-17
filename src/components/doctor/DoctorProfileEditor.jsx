import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Upload, FileText, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DoctorProfileEditor({ user, isBengali, onUpdate }) {
    const [formData, setFormData] = useState({
        doctor_specializations: user.doctor_specializations || [],
        years_experience: user.years_experience || 0,
        education: user.education || [],
        languages_spoken: user.languages_spoken || ['Bengali', 'English'],
        clinic_addresses: user.clinic_addresses || [],
        appointment_slots: user.appointment_slots || [],
        consultation_fee: user.consultation_fee || 0,
        doctor_license_number: user.doctor_license_number || '',
        hospital_name: user.hospital_name || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newSpec, setNewSpec] = useState('');
    const [newEdu, setNewEdu] = useState('');
    const [newLang, setNewLang] = useState('');

    const addItem = (field, value, setter) => {
        if (value.trim()) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
            setter('');
        }
    };

    const removeItem = (field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const addClinic = () => {
        setFormData(prev => ({
            ...prev,
            clinic_addresses: [...prev.clinic_addresses, { name: '', address: '', district: '', phone: '' }]
        }));
    };

    const updateClinic = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            clinic_addresses: prev.clinic_addresses.map((clinic, i) => 
                i === index ? { ...clinic, [field]: value } : clinic
            )
        }));
    };

    const removeClinic = (index) => {
        setFormData(prev => ({
            ...prev,
            clinic_addresses: prev.clinic_addresses.filter((_, i) => i !== index)
        }));
    };

    const addSlot = () => {
        setFormData(prev => ({
            ...prev,
            appointment_slots: [...prev.appointment_slots, { day: 'Monday', start_time: '09:00', end_time: '17:00', clinic_name: '' }]
        }));
    };

    const updateSlot = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            appointment_slots: prev.appointment_slots.map((slot, i) => 
                i === index ? { ...slot, [field]: value } : slot
            )
        }));
    };

    const removeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            appointment_slots: prev.appointment_slots.filter((_, i) => i !== index)
        }));
    };

    const handleCertificateUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            await base44.auth.updateMe({
                verification_certificates: [...(user.verification_certificates || []), file_url],
                verification_status: 'pending'
            });
            onUpdate();
        } catch (error) {
            console.error('Upload failed:', error);
        }
        setIsUploading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await base44.auth.updateMe(formData);
            onUpdate();
        } catch (error) {
            console.error('Save failed:', error);
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>{isBengali ? '🏥 প্রাথমিক তথ্য' : '🏥 Basic Information'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{isBengali ? 'লাইসেন্স নম্বর' : 'License Number'}</Label>
                            <Input 
                                value={formData.doctor_license_number}
                                onChange={(e) => setFormData({...formData, doctor_license_number: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>{isBengali ? 'অভিজ্ঞতা (বছর)' : 'Experience (Years)'}</Label>
                            <Input 
                                type="number"
                                value={formData.years_experience}
                                onChange={(e) => setFormData({...formData, years_experience: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{isBengali ? 'হাসপাতালের নাম' : 'Hospital Name'}</Label>
                            <Input 
                                value={formData.hospital_name}
                                onChange={(e) => setFormData({...formData, hospital_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>{isBengali ? 'পরামর্শ ফি (টাকা)' : 'Consultation Fee (BDT)'}</Label>
                            <Input 
                                type="number"
                                value={formData.consultation_fee}
                                onChange={(e) => setFormData({...formData, consultation_fee: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
                <CardHeader>
                    <CardTitle>{isBengali ? '🎯 বিশেষজ্ঞতা' : '🎯 Specializations'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input 
                            placeholder={isBengali ? 'যেমন: Cardiology' : 'e.g., Cardiology'}
                            value={newSpec}
                            onChange={(e) => setNewSpec(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addItem('doctor_specializations', newSpec, setNewSpec)}
                        />
                        <Button onClick={() => addItem('doctor_specializations', newSpec, setNewSpec)}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.doctor_specializations.map((spec, idx) => (
                            <Badge key={idx} className="bg-blue-100 text-blue-800">
                                {spec}
                                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeItem('doctor_specializations', idx)} />
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Education */}
            <Card>
                <CardHeader>
                    <CardTitle>{isBengali ? '🎓 শিক্ষাগত যোগ্যতা' : '🎓 Education'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input 
                            placeholder={isBengali ? 'যেমন: MBBS, Dhaka Medical College' : 'e.g., MBBS, Dhaka Medical College'}
                            value={newEdu}
                            onChange={(e) => setNewEdu(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addItem('education', newEdu, setNewEdu)}
                        />
                        <Button onClick={() => addItem('education', newEdu, setNewEdu)}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {formData.education.map((edu, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{edu}</span>
                                <X className="w-4 h-4 cursor-pointer text-red-500" onClick={() => removeItem('education', idx)} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Languages */}
            <Card>
                <CardHeader>
                    <CardTitle>{isBengali ? '🗣️ ভাষা' : '🗣️ Languages Spoken'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex gap-2">
                        <Input 
                            placeholder={isBengali ? 'যেমন: Hindi' : 'e.g., Hindi'}
                            value={newLang}
                            onChange={(e) => setNewLang(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addItem('languages_spoken', newLang, setNewLang)}
                        />
                        <Button onClick={() => addItem('languages_spoken', newLang, setNewLang)}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.languages_spoken.map((lang, idx) => (
                            <Badge key={idx} className="bg-green-100 text-green-800">
                                {lang}
                                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => removeItem('languages_spoken', idx)} />
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Clinic Addresses */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{isBengali ? '🏢 ক্লিনিক ঠিকানা' : '🏢 Clinic Addresses'}</CardTitle>
                        <Button size="sm" onClick={addClinic}>
                            <Plus className="w-4 h-4 mr-1" /> {isBengali ? 'যোগ করুন' : 'Add'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formData.clinic_addresses.map((clinic, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-3">
                            <div className="flex justify-between items-start">
                                <h4 className="font-medium">{isBengali ? `ক্লিনিক ${idx + 1}` : `Clinic ${idx + 1}`}</h4>
                                <Button size="sm" variant="ghost" onClick={() => removeClinic(idx)}>
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <Input 
                                placeholder={isBengali ? 'ক্লিনিকের নাম' : 'Clinic Name'}
                                value={clinic.name}
                                onChange={(e) => updateClinic(idx, 'name', e.target.value)}
                            />
                            <Textarea 
                                placeholder={isBengali ? 'ঠিকানা' : 'Address'}
                                value={clinic.address}
                                onChange={(e) => updateClinic(idx, 'address', e.target.value)}
                                rows={2}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input 
                                    placeholder={isBengali ? 'জেলা' : 'District'}
                                    value={clinic.district}
                                    onChange={(e) => updateClinic(idx, 'district', e.target.value)}
                                />
                                <Input 
                                    placeholder={isBengali ? 'ফোন' : 'Phone'}
                                    value={clinic.phone}
                                    onChange={(e) => updateClinic(idx, 'phone', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Appointment Slots */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{isBengali ? '📅 অ্যাপয়েন্টমেন্ট স্লট' : '📅 Appointment Slots'}</CardTitle>
                        <Button size="sm" onClick={addSlot}>
                            <Plus className="w-4 h-4 mr-1" /> {isBengali ? 'যোগ করুন' : 'Add'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {formData.appointment_slots.map((slot, idx) => (
                        <div key={idx} className="p-3 border rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-sm">{isBengali ? `স্লট ${idx + 1}` : `Slot ${idx + 1}`}</h4>
                                <Button size="sm" variant="ghost" onClick={() => removeSlot(idx)}>
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select 
                                    className="w-full p-2 border rounded"
                                    value={slot.day}
                                    onChange={(e) => updateSlot(idx, 'day', e.target.value)}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                                <Input 
                                    placeholder={isBengali ? 'ক্লিনিক' : 'Clinic'}
                                    value={slot.clinic_name}
                                    onChange={(e) => updateSlot(idx, 'clinic_name', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input 
                                    type="time"
                                    value={slot.start_time}
                                    onChange={(e) => updateSlot(idx, 'start_time', e.target.value)}
                                />
                                <Input 
                                    type="time"
                                    value={slot.end_time}
                                    onChange={(e) => updateSlot(idx, 'end_time', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Verification Certificates */}
            <Card>
                <CardHeader>
                    <CardTitle>{isBengali ? '📄 ভেরিফিকেশন সার্টিফিকেট' : '📄 Verification Certificates'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Alert>
                        <AlertDescription>
                            {isBengali 
                                ? 'আপনার মেডিকেল ডিগ্রি, লাইসেন্স, এবং অন্যান্য সার্টিফিকেট আপলোড করুন। আপলোডের পর আপনার প্রোফাইল যাচাইয়ের জন্য পাঠানো হবে।'
                                : 'Upload your medical degrees, licenses, and other certificates. Your profile will be submitted for verification after upload.'}
                        </AlertDescription>
                    </Alert>
                    
                    <div>
                        <Label htmlFor="certificate-upload" className="cursor-pointer">
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            {isBengali ? 'ক্লিক করে ফাইল আপলোড করুন' : 'Click to upload file'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                                    </>
                                )}
                            </div>
                            <input 
                                id="certificate-upload"
                                type="file" 
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleCertificateUpload}
                                disabled={isUploading}
                            />
                        </Label>
                    </div>

                    {user.verification_certificates && user.verification_certificates.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{isBengali ? 'আপলোড করা সার্টিফিকেট:' : 'Uploaded Certificates:'}</p>
                            {user.verification_certificates.map((cert, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <a href={cert} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex-1">
                                        {isBengali ? `সার্টিফিকেট ${idx + 1}` : `Certificate ${idx + 1}`}
                                    </a>
                                    {user.verification_status === 'verified' && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {user.verification_status && (
                        <Badge className={
                            user.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                            user.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }>
                            {user.verification_status === 'verified' && '✓ '}
                            {isBengali ? 
                                (user.verification_status === 'verified' ? 'যাচাইকৃত' :
                                 user.verification_status === 'pending' ? 'যাচাই প্রক্রিয়াধীন' : 'অযাচাইকৃত') :
                                user.verification_status.toUpperCase()
                            }
                        </Badge>
                    )}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700"
                >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isBengali ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </Button>
            </div>
        </div>
    );
}