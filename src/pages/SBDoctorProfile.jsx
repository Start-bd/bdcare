import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import TopNav from '../components/sb/TopNav';
import BottomNav from '../components/sb/BottomNav';
import PaymentModal from '../components/sb/PaymentModal';
import { Star, Users, Video, Mic, MapPin, ChevronLeft, Check } from 'lucide-react';
import { SPECIALTY_LABELS } from '../components/sb/DoctorCard';

const TIME_SLOTS = ['৯:০০', '৯:৩০', '১০:০০', '১১:০০', '১১:৩০', '২:০০', '২:৩০', '৪:০০', '৫:০০', '৬:০০'];
const TIME_SLOTS_EN = ['9:00', '9:30', '10:00', '11:00', '11:30', '2:00', '2:30', '4:00', '5:00', '6:00'];

function getDays(isBn) {
    const days = [];
    const now = new Date();
    const dayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        days.push({
            label: isBn ? dayNamesBn[d.getDay()] : dayNamesEn[d.getDay()],
            dateNum: isBn ? toBengaliNum(d.getDate()) : d.getDate().toString(),
            value: d.toISOString().split('T')[0],
        });
    }
    return days;
}

function toBengaliNum(n) {
    return String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

function DoctorProfileContent() {
    const { isBn } = useLang();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [consultType, setConsultType] = useState('video');
    const [showPayment, setShowPayment] = useState(false);
    const [booked, setBooked] = useState(false);

    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('id');

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
        if (doctorId) {
            base44.entities.Doctor.get(doctorId).then(d => { setDoctor(d); setLoading(false); }).catch(() => setLoading(false));
        } else {
            base44.entities.Doctor.list('-rating', 1).then(([d]) => { setDoctor(d); setLoading(false); }).catch(() => setLoading(false));
        }
    }, [doctorId]);

    const days = getDays(isBn);
    const spec = doctor ? (SPECIALTY_LABELS[doctor.specialty] || { bn: doctor.specialty, en: doctor.specialty }) : null;
    const fee = consultType === 'video' ? doctor?.consultation_fee_video : consultType === 'audio' ? doctor?.consultation_fee_audio : doctor?.consultation_fee_inperson;

    const handleBook = async () => {
        if (!selectedSlot) return;
        setShowPayment(true);
    };

    const handlePaymentSuccess = async () => {
        if (user && doctor) {
            await base44.entities.Appointment.create({
                user_id: user.id,
                doctor_id: doctor.id,
                type: consultType,
                date_time: new Date(days[selectedDay].value + 'T' + (selectedSlot || '09:00')).toISOString(),
                status: 'confirmed',
                fee: fee,
                payment_status: 'paid',
            }).catch(() => {});
        }
        setShowPayment(false);
        setBooked(true);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!doctor) return (
        <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center text-gray-400">
            {isBn ? 'ডাক্তার পাওয়া যায়নি' : 'Doctor not found'}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8faf9] pb-20 md:pb-0">
            <TopNav user={user} />

            {booked ? (
                <div className="max-w-md mx-auto px-4 py-16 text-center">
                    <div className="w-20 h-20 green-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{isBn ? 'অ্যাপয়েন্টমেন্ট নিশ্চিত!' : 'Appointment Confirmed!'}</h2>
                    <p className="text-gray-500 text-sm mb-6">{isBn ? 'আপনার বুকিং সফলভাবে সম্পন্ন হয়েছে।' : 'Your booking has been successfully completed.'}</p>
                    <button onClick={() => navigate(createPageUrl('SBDashboard'))} className="btn-primary px-8 py-3 rounded-[10px]">
                        {isBn ? 'হোমে যান' : 'Go Home'}
                    </button>
                </div>
            ) : (
                <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0F6E56]">
                        <ChevronLeft className="w-4 h-4" /> {isBn ? 'ফিরে যান' : 'Back'}
                    </button>

                    {/* Profile card */}
                    <div className="card-sb p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-20 h-20 rounded-2xl green-gradient flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                                {(isBn ? doctor.name_bn : doctor.name_en)?.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-gray-900">{isBn ? doctor.name_bn : doctor.name_en}</h1>
                                <p className="text-[#0F6E56] font-medium text-sm">{isBn ? spec?.bn : spec?.en}</p>
                                <p className="text-xs text-gray-500">{doctor.qualifications}</p>
                                {doctor.hospital && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" /> {doctor.hospital}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#e0e8e4]">
                            <div className="text-center">
                                <p className="font-bold text-gray-900">{doctor.rating?.toFixed(1)} ⭐</p>
                                <p className="text-xs text-gray-500">{isBn ? 'রেটিং' : 'Rating'}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-900">{(doctor.patient_count / 1000)?.toFixed(1)}k</p>
                                <p className="text-xs text-gray-500">{isBn ? 'রোগী' : 'Patients'}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-gray-900">{doctor.experience_years}+</p>
                                <p className="text-xs text-gray-500">{isBn ? 'বছর' : 'Years'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Consultation type */}
                    <div className="card-sb p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">{isBn ? 'পরামর্শের ধরন' : 'Consultation Type'}</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { key: 'video', icon: Video, labelBn: 'ভিডিও', labelEn: 'Video', fee: doctor.consultation_fee_video },
                                { key: 'audio', icon: Mic, labelBn: 'অডিও', labelEn: 'Audio', fee: doctor.consultation_fee_audio },
                                { key: 'inperson', icon: MapPin, labelBn: 'সরাসরি', labelEn: 'In-person', fee: doctor.consultation_fee_inperson },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setConsultType(t.key)}
                                    className={`p-3 rounded-[10px] border-2 flex flex-col items-center gap-1 transition-all ${consultType === t.key ? 'border-[#0F6E56] bg-[#eefaf5]' : 'border-[#e0e8e4] bg-white'}`}
                                >
                                    <t.icon className={`w-5 h-5 ${consultType === t.key ? 'text-[#0F6E56]' : 'text-gray-400'}`} />
                                    <span className="text-xs font-semibold text-gray-700">{isBn ? t.labelBn : t.labelEn}</span>
                                    <span className="text-xs font-bold text-[#0F6E56]">৳{t.fee}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="card-sb p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">{isBn ? 'সময়সূচি' : 'Schedule'}</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                            {days.map((d, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                                    className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-[10px] border transition-all ${selectedDay === i ? 'border-[#0F6E56] bg-[#eefaf5] text-[#0F6E56]' : 'border-[#e0e8e4] text-gray-600'}`}
                                >
                                    <span className="text-[10px]">{d.label}</span>
                                    <span className="font-bold">{d.dateNum}</span>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {(isBn ? TIME_SLOTS : TIME_SLOTS_EN).map((slot, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 rounded-[8px] text-xs font-medium border transition-all ${selectedSlot === slot ? 'bg-[#0F6E56] text-white border-[#0F6E56]' : 'border-[#e0e8e4] text-gray-600 hover:border-[#0F6E56]/40'}`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Book button */}
                    <button
                        onClick={handleBook}
                        disabled={!selectedSlot}
                        className={`w-full py-4 rounded-[14px] font-bold text-base transition-all ${selectedSlot ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                        {selectedSlot
                            ? (isBn ? `৳${fee} পরিশোধ করে বুক করুন` : `Book & Pay ৳${fee}`)
                            : (isBn ? 'একটি সময় বেছে নিন' : 'Select a time slot')
                        }
                    </button>
                </main>
            )}

            {showPayment && (
                <PaymentModal
                    amount={fee}
                    onClose={() => setShowPayment(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}

            <BottomNav />
        </div>
    );
}

export default function SBDoctorProfile() {
    return <LanguageProvider><DoctorProfileContent /></LanguageProvider>;
}