import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Share2, FileText, UserCheck, X, Calendar, Eye, Shield } from 'lucide-react';
import MedicalRecordDetail from './MedicalRecordDetail';

const TYPE_LABELS = {
    lab_report: { bn: 'ল্যাব রিপোর্ট', en: 'Lab Report' },
    prescription: { bn: 'প্রেসক্রিপশন', en: 'Prescription' },
    imaging: { bn: 'ইমেজিং', en: 'Imaging' },
    diagnosis: { bn: 'ডায়াগনোসিস', en: 'Diagnosis' },
    vaccination: { bn: 'টিকাকরণ', en: 'Vaccination' },
    hospital_discharge: { bn: 'ডিসচার্জ', en: 'Discharge' },
    other: { bn: 'অন্যান্য', en: 'Other' }
};

export default function SharedRecordsManager({ userId, isBengali, refreshTrigger }) {
    const [sharedRecords, setSharedRecords] = useState([]);
    const [doctors, setDoctors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [revokingId, setRevokingId] = useState(null);

    useEffect(() => { loadData(); }, [userId, refreshTrigger]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const records = await base44.entities.MedicalRecord.filter({ user_id: userId }, '-updated_date', 200);
            const shared = records.filter(r => r.shared_with_doctors && r.shared_with_doctors.length > 0);
            setSharedRecords(shared);

            // Load doctor names for all shared doctor IDs
            const allDoctorIds = [...new Set(shared.flatMap(r => r.shared_with_doctors || []))];
            if (allDoctorIds.length > 0) {
                const doctorMap = {};
                for (const id of allDoctorIds) {
                    try {
                        const docs = await base44.entities.User.filter({ id }, 'full_name', 1);
                        if (docs[0]) doctorMap[id] = docs[0];
                    } catch (e) {}
                }
                setDoctors(doctorMap);
            }
        } catch (e) {}
        setIsLoading(false);
    };

    const revokeAccess = async (record, doctorId) => {
        setRevokingId(`${record.id}-${doctorId}`);
        try {
            const updated = (record.shared_with_doctors || []).filter(id => id !== doctorId);
            await base44.entities.MedicalRecord.update(record.id, { shared_with_doctors: updated });
            loadData();
        } catch (e) {}
        setRevokingId(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (sharedRecords.length === 0) {
        return (
            <Card className="text-center py-16 bg-white">
                <CardContent>
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {isBengali ? 'কোনো রেকর্ড শেয়ার করা হয়নি' : 'No Records Shared Yet'}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        {isBengali
                            ? 'রেকর্ড ট্যাব থেকে আপনার রেকর্ড ডাক্তারের সাথে শেয়ার করুন পরামর্শের জন্য'
                            : 'Share records from the Records tab to give doctors access for consultations'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-emerald-600">
                        <Shield className="w-3.5 h-3.5" />
                        {isBengali ? 'আপনি যেকোনো সময় অ্যাক্সেস বাতিল করতে পারবেন' : 'You can revoke access at any time'}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4 text-emerald-600" />
                {isBengali
                    ? `${sharedRecords.length}টি রেকর্ড ডাক্তারের সাথে শেয়ার করা আছে`
                    : `${sharedRecords.length} record(s) currently shared with doctors`}
            </div>

            <div className="space-y-4">
                {sharedRecords.map(record => (
                    <Card key={record.id} className="bg-white border border-blue-100">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <CardTitle className="text-sm font-semibold text-gray-800 truncate">
                                            {record.document_name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                                                {isBengali ? TYPE_LABELS[record.record_type]?.bn : TYPE_LABELS[record.record_type]?.en}
                                            </Badge>
                                            {record.record_date && (
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(record.record_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs flex-shrink-0"
                                    onClick={() => setSelectedRecord(record)}
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    {isBengali ? 'দেখুন' : 'View'}
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                {isBengali ? 'শেয়ার করা হয়েছে:' : 'Shared with:'}
                            </p>
                            <div className="space-y-2">
                                {(record.shared_with_doctors || []).map(doctorId => {
                                    const doctor = doctors[doctorId];
                                    const key = `${record.id}-${doctorId}`;
                                    return (
                                        <div key={doctorId} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-800">
                                                    {doctor?.full_name?.charAt(0)?.toUpperCase() || 'D'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {doctor?.full_name || (isBengali ? 'লোড হচ্ছে...' : 'Loading...')}
                                                    </p>
                                                    {doctor?.email && (
                                                        <p className="text-xs text-gray-500">{doctor.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                                onClick={() => revokeAccess(record, doctorId)}
                                                disabled={revokingId === key}
                                                title={isBengali ? 'অ্যাক্সেস বাতিল করুন' : 'Revoke access'}
                                            >
                                                {revokingId === key
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <X className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedRecord && (
                <MedicalRecordDetail
                    record={selectedRecord}
                    isBengali={isBengali}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </>
    );
}