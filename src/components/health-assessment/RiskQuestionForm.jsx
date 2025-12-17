import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export default function RiskQuestionForm({ step, data, onDataChange, isBengali }) {
    const [formData, setFormData] = useState(data);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        onDataChange(newData);
    };

    const handleArrayChange = (field, item, checked) => {
        const currentArray = formData[field] || [];
        const newArray = checked 
            ? [...currentArray, item]
            : currentArray.filter(i => i !== item);
        handleChange(field, newArray);
    };

    if (step === 'personal_info') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>{isBengali ? 'বয়স' : 'Age'}</Label>
                        <Input
                            type="number"
                            value={formData.age || ''}
                            onChange={(e) => handleChange('age', parseInt(e.target.value))}
                            placeholder={isBengali ? 'আপনার বয়স' : 'Your age'}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{isBengali ? 'লিঙ্গ' : 'Gender'}</Label>
                        <Select value={formData.gender || ''} onValueChange={(value) => handleChange('gender', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={isBengali ? 'নির্বাচন করুন' : 'Select'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">{isBengali ? 'পুরুষ' : 'Male'}</SelectItem>
                                <SelectItem value="female">{isBengali ? 'মহিলা' : 'Female'}</SelectItem>
                                <SelectItem value="other">{isBengali ? 'অন্যান্য' : 'Other'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-lg font-medium">{isBengali ? 'জীবনযাত্রার অভ্যাস' : 'Lifestyle Habits'}</Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <Label className="font-medium">{isBengali ? 'ধূমপান' : 'Smoking'}</Label>
                                <Select 
                                    value={formData.lifestyle_habits?.smoking || ''} 
                                    onValueChange={(value) => handleChange('lifestyle_habits', { ...formData.lifestyle_habits, smoking: value })}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">{isBengali ? 'কখনো নয়' : 'Never'}</SelectItem>
                                        <SelectItem value="former">{isBengali ? 'আগে করতাম' : 'Former smoker'}</SelectItem>
                                        <SelectItem value="current">{isBengali ? 'এখনো করি' : 'Current smoker'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <Label className="font-medium">{isBengali ? 'ব্যায়াম' : 'Exercise'}</Label>
                                <Select 
                                    value={formData.lifestyle_habits?.exercise_frequency || ''} 
                                    onValueChange={(value) => handleChange('lifestyle_habits', { ...formData.lifestyle_habits, exercise_frequency: value })}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">{isBengali ? 'কখনো নয়' : 'Never'}</SelectItem>
                                        <SelectItem value="1-2_weekly">{isBengali ? 'সাপ্তাহে ১-২ দিন' : '1-2 times/week'}</SelectItem>
                                        <SelectItem value="3-5_weekly">{isBengali ? 'সাপ্তাহে ৩-৫ দিন' : '3-5 times/week'}</SelectItem>
                                        <SelectItem value="daily">{isBengali ? 'প্রতিদিন' : 'Daily'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <Label className="font-medium">{isBengali ? 'মদ্যপান' : 'Alcohol'}</Label>
                                <Select 
                                    value={formData.lifestyle_habits?.alcohol || ''} 
                                    onValueChange={(value) => handleChange('lifestyle_habits', { ...formData.lifestyle_habits, alcohol: value })}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">{isBengali ? 'কখনো নয়' : 'Never'}</SelectItem>
                                        <SelectItem value="occasional">{isBengali ? 'মাঝে মাঝে' : 'Occasional'}</SelectItem>
                                        <SelectItem value="regular">{isBengali ? 'নিয়মিত' : 'Regular'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{isBengali ? 'ওজনের অবস্থা' : 'Weight Status'}</Label>
                    <Select value={formData.weight_status || ''} onValueChange={(value) => handleChange('weight_status', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={isBengali ? 'নির্বাচন করুন' : 'Select'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="underweight">{isBengali ? 'কম ওজন' : 'Underweight'}</SelectItem>
                            <SelectItem value="normal">{isBengali ? 'স্বাভাবিক' : 'Normal'}</SelectItem>
                            <SelectItem value="overweight">{isBengali ? 'বেশি ওজন' : 'Overweight'}</SelectItem>
                            <SelectItem value="obese">{isBengali ? 'স্থূল' : 'Obese'}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    }

    if (step === 'family_history') {
        const conditions = [
            { value: 'diabetes', labelBn: 'ডায়াবেটিস', labelEn: 'Diabetes' },
            { value: 'heart_disease', labelBn: 'হৃদরোগ', labelEn: 'Heart Disease' },
            { value: 'hypertension', labelBn: 'উচ্চ রক্তচাপ', labelEn: 'High Blood Pressure' },
            { value: 'cancer', labelBn: 'ক্যান্সার', labelEn: 'Cancer' },
            { value: 'stroke', labelBn: 'স্ট্রোক', labelEn: 'Stroke' },
            { value: 'kidney_disease', labelBn: 'কিডনি রোগ', labelEn: 'Kidney Disease' },
            { value: 'mental_health', labelBn: 'মানসিক স্বাস্থ্য সমস্যা', labelEn: 'Mental Health Issues' }
        ];

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <Label className="text-lg font-medium">
                        {isBengali ? 'আপনার পরিবারে কোন রোগের ইতিহাস আছে?' : 'Does your family have a history of any of these conditions?'}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conditions.map((condition) => (
                            <div key={condition.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                                <Checkbox
                                    id={condition.value}
                                    checked={(formData.family_history || []).includes(condition.value)}
                                    onCheckedChange={(checked) => handleArrayChange('family_history', condition.value, checked)}
                                />
                                <Label htmlFor={condition.value} className="cursor-pointer">
                                    {isBengali ? condition.labelBn : condition.labelEn}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{isBengali ? 'অতিরিক্ত পারিবারিক স্বাস্থ্য তথ্য (ঐচ্ছিক)' : 'Additional family health information (optional)'}</Label>
                    <Textarea
                        value={formData.additional_family_info || ''}
                        onChange={(e) => handleChange('additional_family_info', e.target.value)}
                        placeholder={isBengali ? 'আপনার পরিবারের অন্য কোন স্বাস্থ্য সমস্যা উল্লেখ করুন...' : 'Mention any other family health conditions...'}
                        rows={3}
                    />
                </div>
            </div>
        );
    }

    if (step === 'symptoms') {
        const symptoms = [
            { value: 'fatigue', labelBn: 'ক্লান্তি', labelEn: 'Fatigue' },
            { value: 'headache', labelBn: 'মাথাব্যথা', labelEn: 'Headache' },
            { value: 'chest_pain', labelBn: 'বুকে ব্যথা', labelEn: 'Chest Pain' },
            { value: 'shortness_of_breath', labelBn: 'শ্বাসকষ্ট', labelEn: 'Shortness of Breath' },
            { value: 'dizziness', labelBn: 'মাথা ঘোরা', labelEn: 'Dizziness' },
            { value: 'joint_pain', labelBn: 'গাঁটে ব্যথা', labelEn: 'Joint Pain' },
            { value: 'frequent_urination', labelBn: 'ঘন ঘন প্রস্রাব', labelEn: 'Frequent Urination' },
            { value: 'weight_changes', labelBn: 'ওজনের পরিবর্তন', labelEn: 'Weight Changes' }
        ];

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    <Label className="text-lg font-medium">
                        {isBengali ? 'বর্তমানে আপনার কোন লক্ষণ আছে?' : 'Are you currently experiencing any of these symptoms?'}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {symptoms.map((symptom) => (
                            <div key={symptom.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                                <Checkbox
                                    id={symptom.value}
                                    checked={(formData.current_symptoms || []).includes(symptom.value)}
                                    onCheckedChange={(checked) => handleArrayChange('current_symptoms', symptom.value, checked)}
                                />
                                <Label htmlFor={symptom.value} className="cursor-pointer">
                                    {isBengali ? symptom.labelBn : symptom.labelEn}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{isBengali ? 'খাদ্যাভ্যাসের মান' : 'Diet Quality'}</Label>
                    <Select value={formData.diet_quality || ''} onValueChange={(value) => handleChange('diet_quality', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={isBengali ? 'নির্বাচন করুন' : 'Select'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="excellent">{isBengali ? 'খুবই ভাল' : 'Excellent'}</SelectItem>
                            <SelectItem value="good">{isBengali ? 'ভাল' : 'Good'}</SelectItem>
                            <SelectItem value="average">{isBengali ? 'মাঝারি' : 'Average'}</SelectItem>
                            <SelectItem value="poor">{isBengali ? 'খারাপ' : 'Poor'}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>{isBengali ? 'অতিরিক্ত তথ্য (ঐচ্ছিক)' : 'Additional information (optional)'}</Label>
                    <Textarea
                        value={formData.additional_info || ''}
                        onChange={(e) => handleChange('additional_info', e.target.value)}
                        placeholder={isBengali ? 'অন্য কোন স্বাস্থ্য সংক্রান্ত তথ্য যা আপনি জানাতে চান...' : 'Any other health-related information you would like to share...'}
                        rows={3}
                    />
                </div>
            </div>
        );
    }

    return null;
}