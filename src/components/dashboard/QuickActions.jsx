import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Stethoscope, 
  Pill, 
  Droplets, 
  MessageSquare, 
  ShieldCheck,
  CalendarPlus
} from 'lucide-react';

const actions = [
  {
    labelBn: "ডাক্তার খুঁজুন",
    labelEn: "Find a Doctor",
    icon: Stethoscope,
    url: createPageUrl("Doctors"),
    color: "bg-blue-100 text-blue-600",
    hover: "hover:bg-blue-200"
  },
  {
    labelBn: "অ্যাপয়েন্টমেন্ট",
    labelEn: "Appointments",
    icon: CalendarPlus,
    url: createPageUrl("Appointments"),
    color: "bg-purple-100 text-purple-600",
    hover: "hover:bg-purple-200"
  },
  {
    labelBn: "ঔষধ পরীক্ষক",
    labelEn: "Medicine Checker",
    icon: Pill,
    url: createPageUrl("MedicineChecker"),
    color: "bg-green-100 text-green-600",
    hover: "hover:bg-green-200"
  },
  {
    labelBn: "রক্তের ব্যাংক",
    labelEn: "Blood Bank",
    icon: Droplets,
    url: createPageUrl("BloodBank"),
    color: "bg-red-100 text-red-600",
    hover: "hover:bg-red-200"
  },
  {
    labelBn: "ঝুঁকি মূল্যায়ন",
    labelEn: "Risk Assessment",
    icon: ShieldCheck,
    url: createPageUrl("HealthRiskAssessment"),
    color: "bg-yellow-100 text-yellow-600",
    hover: "hover:bg-yellow-200"
  },
  {
    labelBn: "স্বাস্থ্য ফোরাম",
    labelEn: "Health Forum",
    icon: MessageSquare,
    url: createPageUrl("Forum"),
    color: "bg-indigo-100 text-indigo-600",
    hover: "hover:bg-indigo-200"
  }
];

export default function QuickActions({ isBengali }) {
  return (
    <div className="p-6 sm:p-8 md:p-12 -mt-16 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">
            {isBengali ? "⚡ দ্রুত পদক্ষেপ" : "⚡ Quick Actions"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {actions.map((action, index) => (
              <Link key={action.labelEn} to={action.url}>
                <Card className={`group hover:shadow-2xl transition-all duration-500 border-0 ${action.color} hover:scale-110 cursor-pointer overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-white shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                      <action.icon className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-sm leading-tight">
                      {isBengali ? action.labelBn : action.labelEn}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}