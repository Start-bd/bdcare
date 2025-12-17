import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Eye, Calendar, User, Building } from 'lucide-react';
import MedicalRecordDetail from './MedicalRecordDetail';

export default function MedicalRecordsList({ userId, isBengali, refreshTrigger }) {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        loadRecords();
    }, [userId, refreshTrigger]);

    const loadRecords = async () => {
        setIsLoading(true);
        try {
            const fetchedRecords = await base44.entities.MedicalRecord.filter(
                { user_id: userId },
                '-record_date',
                100
            );
            setRecords(fetchedRecords);
        } catch (error) {
            console.error('Failed to load records:', error);
        }
        setIsLoading(false);
    };

    const getRecordTypeLabel = (type) => {
        const labels = {
            lab_report: { bn: 'ল্যাব রিপোর্ট', en: 'Lab Report' },
            prescription: { bn: 'প্রেসক্রিপশন', en: 'Prescription' },
            imaging: { bn: 'ইমেজিং', en: 'Imaging' },
            diagnosis: { bn: 'ডায়াগনোসিস', en: 'Diagnosis' },
            vaccination: { bn: 'টিকাকরণ', en: 'Vaccination' },
            hospital_discharge: { bn: 'ডিসচার্জ', en: 'Discharge' },
            other: { bn: 'অন্যান্য', en: 'Other' }
        };
        return isBengali ? labels[type]?.bn : labels[type]?.en;
    };

    const getRecordColor = (type) => {
        const colors = {
            lab_report: 'bg-blue-100 text-blue-800',
            prescription: 'bg-green-100 text-green-800',
            imaging: 'bg-purple-100 text-purple-800',
            diagnosis: 'bg-red-100 text-red-800',
            vaccination: 'bg-yellow-100 text-yellow-800',
            hospital_discharge: 'bg-gray-100 text-gray-800',
            other: 'bg-slate-100 text-slate-800'
        };
        return colors[type] || colors.other;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <Card className="text-center py-12">
                <CardContent>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        {isBengali ? 'কোনো রেকর্ড নেই' : 'No Records Found'}
                    </h3>
                    <p className="text-gray-500">
                        {isBengali 
                            ? 'আপনার মেডিকেল রেকর্ড আপলোড করে শুরু করুন'
                            : 'Upload your medical records to get started'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map((record) => (
                    <Card key={record.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Badge className={`${getRecordColor(record.record_type)} mb-2`}>
                                        {getRecordTypeLabel(record.record_type)}
                                    </Badge>
                                    <CardTitle className="text-base">
                                        {record.document_name}
                                    </CardTitle>
                                </div>
                                <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(record.record_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                            </div>

                            {record.extracted_data?.doctor_name && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <User className="w-4 h-4 mr-2" />
                                    {record.extracted_data.doctor_name}
                                </div>
                            )}

                            {record.extracted_data?.hospital_name && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Building className="w-4 h-4 mr-2" />
                                    {record.extracted_data.hospital_name}
                                </div>
                            )}

                            {record.extracted_data?.summary && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {record.extracted_data.summary}
                                </p>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => setSelectedRecord(record)}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    {isBengali ? 'দেখুন' : 'View'}
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => window.open(record.document_url, '_blank')}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
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