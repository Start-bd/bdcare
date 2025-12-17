import React, { useState } from 'react';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Stethoscope
} from 'lucide-react';

const specializations = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Gynecology', 'Orthopedics',
  'General Surgery', 'Internal Medicine', 'Emergency Medicine', 'Radiology',
  'Pathology', 'Anesthesiology', 'Dermatology', 'Psychiatry', 'Oncology'
];

export default function ProfessionalVerification({ user, onVerificationSubmit, isBengali }) {
  const [verificationData, setVerificationData] = useState({
    license_number: user?.doctor_license_number || '',
    specialization: user?.doctor_specialization || '',
    hospital_name: user?.hospital_name || '',
    years_experience: user?.years_experience || ''
  });
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(user?.verification_status || 'not_submitted');

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const submitVerification = async () => {
    setIsSubmitting(true);
    try {
      // Update user profile with verification data
      await User.updateMyUserData({
        ...verificationData,
        user_type: 'doctor',
        verification_status: 'pending'
      });
      
      setVerificationStatus('pending');
      if (onVerificationSubmit) onVerificationSubmit();
    } catch (error) {
      console.error('Verification submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      not_submitted: {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        labelBn: 'জমা দেওয়া হয়নি',
        labelEn: 'Not Submitted'
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        labelBn: 'পর্যালোচনায়',
        labelEn: 'Under Review'
      },
      verified: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        labelBn: 'যাচাইকৃত',
        labelEn: 'Verified'
      },
      rejected: {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        labelBn: 'প্রত্যাখ্যাত',
        labelEn: 'Rejected'
      }
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {isBengali ? config.labelBn : config.labelEn}
      </Badge>
    );
  };

  if (verificationStatus === 'verified') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          {isBengali ? 
            'আপনার পেশাগত যোগ্যতা যাচাই সম্পন্ন হয়েছে। আপনি এখন পেশাদার ফোরামে অংশগ্রহণ করতে পারেন।' :
            'Your professional credentials have been verified. You can now participate in professional forums.'
          }
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          {isBengali ? 'পেশাগত যাচাইকরণ' : 'Professional Verification'}
          {getStatusBadge(verificationStatus)}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isBengali ? 
            'চিকিৎসক হিসেবে যাচাই হতে আপনার তথ্য প্রদান করুন।' :
            'Verify your credentials as a medical professional.'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {verificationStatus === 'pending' && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {isBengali ? 
                'আপনার যাচাইকরণ পর্যালোচনায় রয়েছে। আমরা ২-৩ কার্যদিবসের মধ্যে আপনাকে জানাবো।' :
                'Your verification is under review. We will notify you within 2-3 business days.'
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="license_number">
              {isBengali ? 'চিকিৎসক নিবন্ধন নম্বর' : 'Medical License Number'}
            </Label>
            <Input
              id="license_number"
              value={verificationData.license_number}
              onChange={(e) => setVerificationData({...verificationData, license_number: e.target.value})}
              placeholder={isBengali ? 'BMDC নিবন্ধন নম্বর' : 'BMDC Registration Number'}
              disabled={verificationStatus === 'pending'}
            />
          </div>

          <div>
            <Label htmlFor="specialization">
              {isBengali ? 'বিশেষত্ব' : 'Specialization'}
            </Label>
            <select
              id="specialization"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={verificationData.specialization}
              onChange={(e) => setVerificationData({...verificationData, specialization: e.target.value})}
              disabled={verificationStatus === 'pending'}
            >
              <option value="">{isBengali ? 'বিশেষত্ব নির্বাচন করুন' : 'Select Specialization'}</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="hospital_name">
              {isBengali ? 'হাসপাতাল/ক্লিনিকের নাম' : 'Hospital/Clinic Name'}
            </Label>
            <Input
              id="hospital_name"
              value={verificationData.hospital_name}
              onChange={(e) => setVerificationData({...verificationData, hospital_name: e.target.value})}
              placeholder={isBengali ? 'আপনার কর্মস্থল' : 'Your workplace'}
              disabled={verificationStatus === 'pending'}
            />
          </div>

          <div>
            <Label htmlFor="years_experience">
              {isBengali ? 'অভিজ্ঞতার বছর' : 'Years of Experience'}
            </Label>
            <Input
              id="years_experience"
              type="number"
              value={verificationData.years_experience}
              onChange={(e) => setVerificationData({...verificationData, years_experience: e.target.value})}
              placeholder="0"
              disabled={verificationStatus === 'pending'}
            />
          </div>

          {verificationStatus !== 'pending' && (
            <div>
              <Label>
                {isBengali ? 'সহায়ক নথি' : 'Supporting Documents'}
              </Label>
              <div className="mt-2 space-y-2">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {isBengali ? 'নথি আপলোড করুন' : 'Upload Documents'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isBengali ? 'BMDC সার্টিফিকেট, ডিগ্রি' : 'BMDC Certificate, Degrees'}
                    </p>
                  </div>
                </label>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDocument(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {verificationStatus === 'not_submitted' && (
          <Button
            onClick={submitVerification}
            disabled={isSubmitting || !verificationData.license_number || !verificationData.specialization}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                {isBengali ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 mr-2" />
                {isBengali ? 'যাচাইকরণের জন্য জমা দিন' : 'Submit for Verification'}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}