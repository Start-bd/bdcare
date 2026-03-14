import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LanguageProvider, useLang } from '../components/sb/LanguageContext';
import LangToggle from '../components/sb/LangToggle';
import {
    Stethoscope, Pill, FlaskConical, Heart, PhoneCall, Home, Shield, Bot,
    Star, ChevronRight, MapPin, Phone, MessageCircle, Instagram, Facebook, Twitter
} from 'lucide-react';

const services = [
    { icon: Stethoscope, bn: 'ডাক্তার পরামর্শ', en: 'Doctor Consult', color: 'bg-emerald-50 text-emerald-600', page: 'SBDoctors' },
    { icon: Pill, bn: 'ওষুধ ডেলিভারি', en: 'Medicine Delivery', color: 'bg-blue-50 text-blue-600', page: 'SBMedicine' },
    { icon: FlaskConical, bn: 'ল্যাব টেস্ট', en: 'Lab Test', color: 'bg-purple-50 text-purple-600', page: 'SBDashboard' },
    { icon: Heart, bn: 'হেলথ প্যাকেজ', en: 'Health Packages', color: 'bg-pink-50 text-pink-600', page: 'SBDashboard' },
    { icon: PhoneCall, bn: 'জরুরি সেবা', en: 'Emergency', color: 'bg-red-50 text-red-600', page: 'SBEmergency' },
    { icon: Home, bn: 'হোম কেয়ার', en: 'Home Care', color: 'bg-orange-50 text-orange-600', page: 'SBDashboard' },
    { icon: Shield, bn: 'হেলথ ভল্ট', en: 'Health Vault', color: 'bg-indigo-50 text-indigo-600', page: 'SBVault' },
    { icon: Bot, bn: 'AI ডাক্তার', en: 'Ask AI Doctor', color: 'bg-teal-50 text-teal-600', page: 'SBAIDoctor' },
];

const stats = [
    { valueBn: '২৪৭+', valueEn: '247+', labelBn: 'ডাক্তার', labelEn: 'Doctors' },
    { valueBn: '৬৪', valueEn: '64', labelBn: 'জেলা', labelEn: 'Districts' },
    { valueBn: '৫০K+', valueEn: '50K+', labelBn: 'রোগী', labelEn: 'Patients' },
    { valueBn: '২৪/৭', valueEn: '24/7', labelBn: 'সেবা', labelEn: 'Available' },
];

const steps = [
    { num: '১', numEn: '1', titleBn: 'খুঁজুন', titleEn: 'Search', descBn: 'আপনার প্রয়োজন অনুযায়ী ডাক্তার বা সেবা খুঁজুন', descEn: 'Find doctors or services as per your need' },
    { num: '২', numEn: '2', titleBn: 'বুক করুন', titleEn: 'Book', descBn: 'পছন্দের সময়ে অ্যাপয়েন্টমেন্ট নিন', descEn: 'Schedule an appointment at your preferred time' },
    { num: '৩', numEn: '3', titleBn: 'পরামর্শ নিন', titleEn: 'Consult', descBn: 'ভিডিও/অডিও কলে ডাক্তারের সাথে কথা বলুন', descEn: 'Talk to doctor via video/audio call' },
];

const sampleDoctors = [
    { name_bn: 'ডা. রাহেলা খানম', name_en: 'Dr. Rahela Khanam', specialty_bn: 'শিশু বিশেষজ্ঞ', specialty_en: 'Pediatrics', rating: 4.9, fee: 600, exp: 12 },
    { name_bn: 'ডা. মোহাম্মদ আলী', name_en: 'Dr. Mohammad Ali', specialty_bn: 'হৃদরোগ বিশেষজ্ঞ', specialty_en: 'Cardiologist', rating: 4.8, fee: 900, exp: 18 },
    { name_bn: 'ডা. সুমাইয়া বেগম', name_en: 'Dr. Sumaiya Begum', specialty_bn: 'সাধারণ চিকিৎসক', specialty_en: 'General Physician', rating: 4.7, fee: 450, exp: 8 },
];

function LandingContent() {
    const { isBn } = useLang();

    return (
        <div className="min-h-screen bg-[#f8faf9] font-bengali">
            {/* Top bar */}
            <header className="bg-white border-b border-[#e0e8e4] sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg green-gradient flex items-center justify-center">
                            <span className="text-white font-bold text-sm">স্</span>
                        </div>
                        <span className="font-bold text-[#0F6E56] text-base">স্বাস্থ্য বন্ধু</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <LangToggle />
                        <Link to={createPageUrl('SBDashboard')} className="btn-primary text-sm px-4 py-2 rounded-[10px]">
                            {isBn ? 'শুরু করুন' : 'Get Started'}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="green-gradient text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        🇧🇩 বাংলাদেশের প্রথম AI স্বাস্থ্য সহায়ক
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                        আপনার স্বাস্থ্য বন্ধু
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-2">
                        {isBn ? 'যেকোনো সময়, যেকোনো জায়গা থেকে বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন' : 'Get expert doctor consultation anytime, anywhere in Bangladesh'}
                    </p>
                    <p className="text-sm text-white/70 mb-8">Shasthya Bondhu · bdcare.app</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to={createPageUrl('SBDashboard')} className="bg-white text-[#0F6E56] font-bold px-8 py-3 rounded-[10px] text-base hover:bg-[#eefaf5] transition-colors">
                            {isBn ? 'শুরু করুন' : 'Get Started'}
                        </Link>
                        <a href="#services" className="border-2 border-white text-white font-bold px-8 py-3 rounded-[10px] text-base hover:bg-white/10 transition-colors">
                            {isBn ? 'আরো জানুন' : 'Learn More'}
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-white border-b border-[#e0e8e4]">
                <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <p className="text-2xl font-bold text-[#0F6E56]">{isBn ? s.valueBn : s.valueEn}</p>
                            <p className="text-sm text-gray-500">{isBn ? s.labelBn : s.labelEn}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{isBn ? 'আমাদের সেবা' : 'Our Services'}</h2>
                    <p className="text-gray-500 text-center text-sm mb-8">{isBn ? 'আপনার স্বাস্থ্য সেবার সমাধান এক জায়গায়' : 'All your healthcare needs in one place'}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {services.map((s, i) => (
                            <Link key={i} to={createPageUrl(s.page)} className="card-sb p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
                                <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center`}>
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">{isBn ? s.bn : s.en}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-12 px-4 bg-[#eefaf5]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-8">{isBn ? 'কিভাবে কাজ করে' : 'How It Works'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {steps.map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 green-gradient rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                                    {isBn ? s.num : s.numEn}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{isBn ? s.titleBn : s.titleEn}</h3>
                                <p className="text-sm text-gray-500">{isBn ? s.descBn : s.descEn}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Doctors */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{isBn ? 'বিশেষজ্ঞ ডাক্তার' : 'Featured Doctors'}</h2>
                        <Link to={createPageUrl('SBDoctors')} className="text-sm text-[#0F6E56] font-semibold flex items-center gap-1">
                            {isBn ? 'সব দেখুন' : 'View all'} <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {sampleDoctors.map((d, i) => (
                            <div key={i} className="card-sb p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center text-white font-bold text-lg">
                                        {(isBn ? d.name_bn : d.name_en).charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">{isBn ? d.name_bn : d.name_en}</p>
                                        <p className="text-xs text-[#0F6E56]">{isBn ? d.specialty_bn : d.specialty_en}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-yellow-500 flex items-center gap-1"><Star className="w-3 h-3 fill-current" />{d.rating}</span>
                                    <span className="text-gray-500">{d.exp} {isBn ? 'বছর' : 'yrs'}</span>
                                    <span className="font-bold text-[#0F6E56]">৳{d.fee}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payment logos */}
            <section className="py-8 px-4 bg-white border-t border-b border-[#e0e8e4]">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-sm text-gray-500 mb-4">{isBn ? 'পেমেন্ট গ্রহণ করা হয়' : 'We accept payments via'}</p>
                    <div className="flex items-center justify-center gap-6 text-lg font-bold">
                        <span className="text-pink-600">bKash 🩷</span>
                        <span className="text-orange-500">Nagad 🟠</span>
                        <span className="text-blue-600">Rocket 💙</span>
                        <span className="text-gray-700">💳 Card</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0F6E56] text-white py-10 px-4">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <span className="font-bold text-sm">স্</span>
                            </div>
                            <span className="font-bold">স্বাস্থ্য বন্ধু</span>
                        </div>
                        <p className="text-sm text-white/70">{isBn ? 'বাংলাদেশের AI স্বাস্থ্য সহায়ক' : "Bangladesh's AI health companion"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">{isBn ? 'সেবা' : 'Services'}</h4>
                        <ul className="space-y-1 text-sm text-white/70">
                            <li>{isBn ? 'ডাক্তার পরামর্শ' : 'Doctor Consult'}</li>
                            <li>{isBn ? 'ওষুধ ডেলিভারি' : 'Medicine Delivery'}</li>
                            <li>AI {isBn ? 'ডাক্তার' : 'Doctor'}</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">{isBn ? 'যোগাযোগ' : 'Contact'}</h4>
                        <ul className="space-y-1 text-sm text-white/70">
                            <li className="flex items-center gap-1"><Phone className="w-3 h-3" /> 16789</li>
                            <li className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Dhaka, Bangladesh</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3">{isBn ? 'জরুরি হটলাইন' : 'Emergency'}</h4>
                        <a href="tel:999" className="text-2xl font-bold text-yellow-300">999</a>
                        <p className="text-xs text-white/70 mt-1">24/7</p>
                    </div>
                </div>
                <div className="border-t border-white/20 pt-6 text-center text-xs text-white/50">
                    © 2026 স্বাস্থ্য বন্ধু · bdcare.app · {isBn ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved'}
                </div>
            </footer>
        </div>
    );
}

export default function SBLanding() {
    return (
        <LanguageProvider>
            <LandingContent />
        </LanguageProvider>
    );
}