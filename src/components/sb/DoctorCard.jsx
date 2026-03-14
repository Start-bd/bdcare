import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLang } from './LanguageContext';
import { Star, Video, Calendar, Users } from 'lucide-react';

const SPECIALTY_LABELS = {
    general: { bn: 'সাধারণ চিকিৎসা', en: 'General Medicine' },
    cardiology: { bn: 'হৃদরোগ', en: 'Cardiology' },
    pediatrics: { bn: 'শিশু রোগ', en: 'Pediatrics' },
    dermatology: { bn: 'চর্মরোগ', en: 'Dermatology' },
    orthopedics: { bn: 'অর্থোপেডিক', en: 'Orthopedics' },
    psychiatry: { bn: 'মানসিক স্বাস্থ্য', en: 'Psychiatry' },
    gynecology: { bn: 'গাইনোকোলজি', en: 'Gynecology' },
    neurology: { bn: 'নিউরোলজি', en: 'Neurology' },
    diabetes: { bn: 'ডায়াবেটিস', en: 'Diabetes' },
    eye: { bn: 'চক্ষু', en: 'Eye' },
};

export default function DoctorCard({ doctor, compact = false }) {
    const { isBn } = useLang();
    const spec = SPECIALTY_LABELS[doctor.specialty] || { bn: doctor.specialty, en: doctor.specialty };

    return (
        <div className="card-sb p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full green-gradient flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {(isBn ? doctor.name_bn : doctor.name_en)?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {isBn ? doctor.name_bn : doctor.name_en}
                        </h3>
                        {doctor.is_available && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                {isBn ? 'অনলাইন' : 'Online'}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[#0F6E56] font-medium">{isBn ? spec.bn : spec.en}</p>
                    {doctor.qualifications && (
                        <p className="text-xs text-gray-500 truncate">{doctor.qualifications}</p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1 star-rating">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-gray-700 font-medium">{doctor.rating?.toFixed(1)}</span>
                </span>
                <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {(doctor.patient_count / 1000)?.toFixed(1)}k {isBn ? 'রোগী' : 'patients'}
                </span>
                <span>{doctor.experience_years} {isBn ? 'বছর' : 'yrs'}</span>
            </div>

            {/* Fee */}
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-500">{isBn ? 'ভিডিও পরামর্শ' : 'Video consult'}</span>
                    <p className="font-bold text-[#0F6E56] text-base">৳{doctor.consultation_fee_video}</p>
                </div>
                {!compact && (
                    <div className="flex gap-2">
                        <Link
                            to={`${createPageUrl('SBDoctorProfile')}?id=${doctor.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#eefaf5] text-[#0F6E56] rounded-[10px] text-xs font-semibold hover:bg-[#0F6E56] hover:text-white transition-colors"
                        >
                            <Video className="w-3 h-3" />
                            {isBn ? 'পরামর্শ' : 'Consult'}
                        </Link>
                        <Link
                            to={`${createPageUrl('SBDoctorProfile')}?id=${doctor.id}&tab=book`}
                            className="flex items-center gap-1 px-3 py-1.5 border border-[#0F6E56] text-[#0F6E56] rounded-[10px] text-xs font-semibold hover:bg-[#eefaf5] transition-colors"
                        >
                            <Calendar className="w-3 h-3" />
                            {isBn ? 'বুক' : 'Book'}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export { SPECIALTY_LABELS };