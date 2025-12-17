
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { InvokeLLM } from '@/integrations/Core';
import { 
  Activity, 
  Thermometer, 
  Brain, 
  Frown, // Changed Stomach to Frown
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const commonSymptoms = {
  general: [
    { id: 'fever', labelBn: 'জ্বর', labelEn: 'Fever', icon: Thermometer },
    { id: 'headache', labelBn: 'মাথাব্যথা', labelEn: 'Headache', icon: Brain },
    { id: 'fatigue', labelBn: 'ক্লান্তি', labelEn: 'Fatigue', icon: Activity },
    { id: 'nausea', labelBn: 'বমি বমি ভাব', labelEn: 'Nausea', icon: Frown } // Changed Stomach to Frown
  ],
  respiratory: [
    { id: 'cough', labelBn: 'কাশি', labelEn: 'Cough' },
    { id: 'shortness_of_breath', labelBn: 'শ্বাসকষ্ট', labelEn: 'Shortness of breath' },
    { id: 'chest_pain', labelBn: 'বুকে ব্যথা', labelEn: 'Chest pain' }
  ],
  digestive: [
    { id: 'stomach_pain', labelBn: 'পেটে ব্যথা', labelEn: 'Stomach pain' },
    { id: 'diarrhea', labelBn: 'ডায়রিয়া', labelEn: 'Diarrhea' },
    { id: 'vomiting', labelBn: 'বমি', labelEn: 'Vomiting' }
  ],
  neurological: [
    { id: 'dizziness', labelBn: 'মাথা ঘোরা', labelEn: 'Dizziness' },
    { id: 'confusion', labelBn: 'বিভ্রান্তি', labelEn: 'Confusion' },
    { id: 'memory_problems', labelBn: 'স্মৃতি সমস্যা', labelEn: 'Memory problems' }
  ]
};

export default function SymptomChecker({ onAssessment, isBengali }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState(null);

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setIsAnalyzing(true);
    const symptomLabels = selectedSymptoms.map(id => {
      for (const category of Object.values(commonSymptoms)) {
        const symptom = category.find(s => s.id === id);
        if (symptom) return isBengali ? symptom.labelBn : symptom.labelEn;
      }
      return id;
    }).join(', ');

    const prompt = `As an AI Health Agent for Bangladesh, analyze these symptoms: ${symptomLabels}
    
    Language: ${isBengali ? 'Bengali' : 'English'}
    
    Provide a response in the following JSON format:
    {
      "severity": "low|medium|high|emergency",
      "possibleCauses": ["cause1", "cause2", "cause3"],
      "recommendations": ["rec1", "rec2", "rec3"],
      "whenToSeeDoctor": "description of when to seek medical care",
      "disclaimer": "medical disclaimer in appropriate language"
    }
    
    Consider common health conditions in Bangladesh including dengue, malaria, typhoid, etc.
    Always emphasize seeking professional medical care for concerning symptoms.`;

    try {
      const result = await InvokeLLM({ 
        prompt, 
        response_json_schema: {
          type: "object",
          properties: {
            severity: { type: "string" },
            possibleCauses: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            whenToSeeDoctor: { type: "string" },
            disclaimer: { type: "string" }
          }
        }
      });
      setAssessment(result);
      if (onAssessment) onAssessment(result);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'emergency' || severity === 'high') return AlertTriangle;
    return CheckCircle;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            🔍 {isBengali ? 'লক্ষণ পরীক্ষক' : 'Symptom Checker'}
          </CardTitle>
          <p className="text-sm text-gray-600">
            ✅ {isBengali 
              ? 'আপনার লক্ষণগুলি নির্বাচন করুন এবং প্রাথমিক মূল্যায়ন পান।'
              : 'Select your symptoms and get a preliminary assessment.'
            } 🩺
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(commonSymptoms).map(([category, symptoms]) => (
            <div key={category}>
              <h4 className="font-medium mb-3 capitalize text-gray-700">
                📋 {category.replace('_', ' ')} {isBengali ? 'লক্ষণ' : 'Symptoms'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {symptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom.id}
                      checked={selectedSymptoms.includes(symptom.id)}
                      onCheckedChange={() => handleSymptomToggle(symptom.id)}
                    />
                    <label 
                      htmlFor={symptom.id} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      {symptom.icon && <symptom.icon className="w-4 h-4 text-gray-500" />}
                      {isBengali ? symptom.labelBn : symptom.labelEn}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button 
            onClick={analyzeSymptoms} 
            disabled={selectedSymptoms.length === 0 || isAnalyzing}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            🔬 {isBengali ? 'লক্ষণ বিশ্লেষণ করুন' : 'Analyze Symptoms'}
          </Button>
        </CardContent>
      </Card>

      {assessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(getSeverityIcon(assessment.severity), {
                className: `w-5 h-5 ${assessment.severity === 'emergency' || assessment.severity === 'high' ? 'text-red-600' : 'text-green-600'}`
              })}
              📊 {isBengali ? 'লক্ষণ মূল্যায়ন' : 'Symptom Assessment'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className={getSeverityColor(assessment.severity)}>
                🚨 {isBengali ? 
                  { low: 'নিম্ন', medium: 'মাঝারি', high: 'উচ্চ', emergency: 'জরুরি' }[assessment.severity] :
                  assessment.severity.toUpperCase()
                }
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                🔍 {isBengali ? 'সম্ভাব্য কারণ:' : 'Possible Causes:'}
              </h4>
              <ul className="space-y-1">
                {assessment.possibleCauses.map((cause, index) => (
                  <li key={index} className="text-sm text-gray-700">• {cause}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                💡 {isBengali ? 'সুপারিশ:' : 'Recommendations:'}
              </h4>
              <ul className="space-y-1">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                👨‍⚕️ {isBengali ? 'কখন ডাক্তার দেখাবেন:' : 'When to See a Doctor:'}
              </h4>
              <p className="text-sm text-gray-700">{assessment.whenToSeeDoctor}</p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">⚠️ {assessment.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
