import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Eye, FileText, Shield, User, Award, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function DoctorVerification({ isBengali }) {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setIsLoading(true);
        try {
            const allUsers = await base44.entities.User.list('-created_date', 1000);
            const doctorUsers = allUsers.filter(u => u.user_type === 'doctor' || u.role === 'doctor');
            setDoctors(doctorUsers);
        } catch (error) {
            console.error('Failed to load doctors:', error);
        }
        setIsLoading(false);
    };

    const updateVerificationStatus = async (doctorId, status, reason = '') => {
        setIsProcessing(true);
        try {
            const doctor = doctors.find(d => d.id === doctorId);
            
            await base44.entities.User.update(doctorId, {
                verification_status: status
            });

            // Send email notification
            const statusText = status === 'verified' 
                ? (isBengali ? 'যাচাই হয়েছে' : 'Verified')
                : (isBengali ? 'প্রত্যাখ্যাত' : 'Rejected');

            let emailBody = `${isBengali ? 'প্রিয়' : 'Dear'} ${doctor.full_name},\n\n`;
            
            if (status === 'verified') {
                emailBody += isBengali 
                    ? `আপনার ডাক্তার প্রোফাইল সফলভাবে যাচাই হয়েছে! 🎉\n\nআপনি এখন স্বাস্থ্য বন্ধু প্ল্যাটফর্মে একজন যাচাইকৃত চিকিৎসক হিসেবে কাজ শুরু করতে পারেন।\n\n- রোগীরা আপনার প্রোফাইলে "যাচাইকৃত" ব্যাজ দেখতে পাবেন\n- আপনি অ্যাপয়েন্টমেন্ট গ্রহণ শুরু করতে পারবেন\n- টেলিমেডিসিন সেবা প্রদান করতে পারবেন\n\nধন্যবাদ,\nস্বাস্থ্য বন্ধু টিম`
                    : `Your doctor profile has been successfully verified! 🎉\n\nYou can now start practicing on the Shasthya Bondhu platform as a verified medical professional.\n\n- Patients will see the "Verified" badge on your profile\n- You can start accepting appointments\n- You can provide telemedicine services\n\nThank you,\nShasthya Bondhu Team`;
            } else {
                emailBody += isBengali
                    ? `দুঃখিত, আপনার ডাক্তার প্রোফাইল যাচাই প্রত্যাখ্যাত হয়েছে।\n\nকারণ: ${reason || 'তথ্য যাচাইয়ে সমস্যা'}\n\nআপনি আপনার তথ্য আপডেট করে পুনরায় যাচাইয়ের জন্য আবেদন করতে পারেন।\n\nধন্যবাদ,\nস্বাস্থ্য বন্ধু টিম`
                    : `Unfortunately, your doctor profile verification has been rejected.\n\nReason: ${reason || 'Issues with verification documents'}\n\nYou can update your information and reapply for verification.\n\nThank you,\nShasthya Bondhu Team`;
            }

            await base44.integrations.Core.SendEmail({
                to: doctor.email,
                subject: `${isBengali ? 'প্রোফাইল যাচাইয়ের আপডেট' : 'Profile Verification Update'} - ${statusText}`,
                body: emailBody
            });

            setSelectedDoctor(null);
            setRejectionReason('');
            await loadDoctors();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(isBengali ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Failed to update status');
        }
        setIsProcessing(false);
    };

    const DoctorCard = ({ doctor, status }) => {
        const hasRequiredInfo = doctor.doctor_license_number && 
                               doctor.verification_certificates?.length > 0;
        
        return (
            <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{doctor.full_name}</h3>
                                <p className="text-sm text-gray-500">{doctor.email}</p>
                            </div>
                        </div>
                        <Badge className={
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'verified' ? 'bg-green-100 text-green-800' :
                            status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }>
                            {status}
                        </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                        {doctor.doctor_specializations?.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <Award className="w-4 h-4 text-gray-400" />
                                <span>{doctor.doctor_specializations.join(', ')}</span>
                            </div>
                        )}
                        {doctor.doctor_license_number && (
                            <div className="flex items-center gap-2 text-sm">
                                <Shield className="w-4 h-4 text-gray-400" />
                                <span>{isBengali ? 'লাইসেন্স:' : 'License:'} {doctor.doctor_license_number}</span>
                            </div>
                        )}
                        {doctor.years_experience && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{doctor.years_experience} {isBengali ? 'বছর অভিজ্ঞতা' : 'years experience'}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span>{doctor.verification_certificates?.length || 0} {isBengali ? 'সার্টিফিকেট' : 'certificates'}</span>
                        </div>
                    </div>

                    {!hasRequiredInfo && (
                        <Alert className="mb-4 bg-orange-50 border-orange-200">
                            <AlertDescription className="text-sm text-orange-800">
                                {isBengali ? '⚠️ প্রয়োজনীয় তথ্য অসম্পূর্ণ' : '⚠️ Required information incomplete'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button 
                        onClick={() => setSelectedDoctor(doctor)}
                        className="w-full"
                        variant="outline"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {isBengali ? 'বিস্তারিত দেখুন' : 'View Details'}
                    </Button>
                </CardContent>
            </Card>
        );
    };

    const pendingDoctors = doctors.filter(d => d.verification_status === 'pending');
    const verifiedDoctors = doctors.filter(d => d.verification_status === 'verified');
    const rejectedDoctors = doctors.filter(d => d.verification_status === 'rejected');
    const unverifiedDoctors = doctors.filter(d => !d.verification_status || d.verification_status === 'unverified');

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    {isBengali ? '👨‍⚕️ ডাক্তার যাচাইকরণ' : '👨‍⚕️ Doctor Verification'}
                </h2>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-yellow-50">
                        {pendingDoctors.length} {isBengali ? 'অপেক্ষমাণ' : 'Pending'}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                        {verifiedDoctors.length} {isBengali ? 'যাচাইকৃত' : 'Verified'}
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pending">
                        {isBengali ? 'অপেক্ষমাণ' : 'Pending'} ({pendingDoctors.length})
                    </TabsTrigger>
                    <TabsTrigger value="unverified">
                        {isBengali ? 'অযাচাইকৃত' : 'Unverified'} ({unverifiedDoctors.length})
                    </TabsTrigger>
                    <TabsTrigger value="verified">
                        {isBengali ? 'যাচাইকৃত' : 'Verified'} ({verifiedDoctors.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected">
                        {isBengali ? 'প্রত্যাখ্যাত' : 'Rejected'} ({rejectedDoctors.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingDoctors.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    {isBengali ? 'কোনো অপেক্ষমাণ যাচাইকরণ নেই' : 'No pending verifications'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingDoctors.map(doctor => (
                                <DoctorCard key={doctor.id} doctor={doctor} status="pending" />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="unverified" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unverifiedDoctors.map(doctor => (
                            <DoctorCard key={doctor.id} doctor={doctor} status="unverified" />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="verified" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {verifiedDoctors.map(doctor => (
                            <DoctorCard key={doctor.id} doctor={doctor} status="verified" />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rejectedDoctors.map(doctor => (
                            <DoctorCard key={doctor.id} doctor={doctor} status="rejected" />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Detail Modal */}
            {selectedDoctor && (
                <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                {selectedDoctor.full_name}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="font-semibold mb-3">{isBengali ? 'প্রাথমিক তথ্য' : 'Basic Information'}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">{isBengali ? 'ইমেইল' : 'Email'}</p>
                                        <p className="font-medium">{selectedDoctor.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{isBengali ? 'ফোন' : 'Phone'}</p>
                                        <p className="font-medium">{selectedDoctor.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{isBengali ? 'লাইসেন্স নম্বর' : 'License Number'}</p>
                                        <p className="font-medium">{selectedDoctor.doctor_license_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">{isBengali ? 'অভিজ্ঞতা' : 'Experience'}</p>
                                        <p className="font-medium">{selectedDoctor.years_experience || 0} {isBengali ? 'বছর' : 'years'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Specializations */}
                            {selectedDoctor.doctor_specializations?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">{isBengali ? 'বিশেষজ্ঞতা' : 'Specializations'}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDoctor.doctor_specializations.map((spec, idx) => (
                                            <Badge key={idx} className="bg-blue-100 text-blue-800">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {selectedDoctor.education?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">{isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Education'}</h3>
                                    <ul className="space-y-1">
                                        {selectedDoctor.education.map((edu, idx) => (
                                            <li key={idx} className="text-sm">• {edu}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Certificates */}
                            <div>
                                <h3 className="font-semibold mb-3">{isBengali ? 'যাচাইকরণ সার্টিফিকেট' : 'Verification Certificates'}</h3>
                                {selectedDoctor.verification_certificates?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedDoctor.verification_certificates.map((cert, idx) => (
                                            <a 
                                                key={idx}
                                                href={cert}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <FileText className="w-5 h-5 text-blue-500" />
                                                <span className="text-sm font-medium">
                                                    {isBengali ? 'সার্টিফিকেট' : 'Certificate'} {idx + 1}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert className="bg-orange-50 border-orange-200">
                                        <AlertDescription className="text-orange-800">
                                            {isBengali ? 'কোনো সার্টিফিকেট আপলোড করা হয়নি' : 'No certificates uploaded'}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {/* Actions */}
                            {selectedDoctor.verification_status === 'pending' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => updateVerificationStatus(selectedDoctor.id, 'verified')}
                                            disabled={isProcessing}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                            )}
                                            {isBengali ? 'অনুমোদন করুন' : 'Approve'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                if (!rejectionReason.trim()) {
                                                    alert(isBengali ? 'প্রত্যাখ্যানের কারণ লিখুন' : 'Please provide rejection reason');
                                                    return;
                                                }
                                                updateVerificationStatus(selectedDoctor.id, 'rejected', rejectionReason);
                                            }}
                                            disabled={isProcessing}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            {isBengali ? 'প্রত্যাখ্যান করুন' : 'Reject'}
                                        </Button>
                                    </div>
                                    <Textarea
                                        placeholder={isBengali ? 'প্রত্যাখ্যানের কারণ লিখুন (ঐচ্ছিক)' : 'Rejection reason (optional)'}
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}