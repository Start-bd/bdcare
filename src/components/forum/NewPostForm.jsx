import React, { useState } from 'react';
import { ForumPost } from '@/entities/ForumPost';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';

const categories = [
    { value: 'general_health', labelBn: 'সাধারণ স্বাস্থ্য', labelEn: 'General Health' },
    { value: 'dengue_fever', labelBn: 'ডেঙ্গু জ্বর', labelEn: 'Dengue Fever' },
    { value: 'diabetes', labelBn: 'ডায়াবেটিস', labelEn: 'Diabetes' },
    { value: 'heart_disease', labelBn: 'হৃদরোগ', labelEn: 'Heart Disease' },
    { value: 'maternal_health', labelBn: 'মাতৃস্বাস্থ্য', labelEn: 'Maternal Health' },
    { value: 'child_health', labelBn: 'শিশুস্বাস্থ্য', labelEn: 'Child Health' },
    { value: 'mental_health', labelBn: 'মানসিক স্বাস্থ্য', labelEn: 'Mental Health' }
];

export default function NewPostForm({ user, isBengali, onPostCreated }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general_health',
        tags: '',
        is_professional_only: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) return;
        setIsSubmitting(true);
        try {
            await ForumPost.create({
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                author_type: user.user_type
            });
            onPostCreated();
        } catch (error) {
            console.error("Failed to create post", error);
        }
        setIsSubmitting(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isBengali ? 'নতুন পোস্ট তৈরি করুন' : 'Create a New Post'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="title">{isBengali ? 'শিরোনাম' : 'Title'}</Label>
                    <Input id="title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="content">{isBengali ? 'বিস্তারিত' : 'Content'}</Label>
                    <Textarea id="content" value={formData.content} onChange={e => handleInputChange('content', e.target.value)} rows={6} />
                </div>
                <div>
                    <Label htmlFor="category">{isBengali ? 'বিষয়' : 'Category'}</Label>
                    <Select value={formData.category} onValueChange={v => handleInputChange('category', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {isBengali ? cat.labelBn : cat.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="tags">{isBengali ? 'ট্যাগ (কমা দ্বারা বিভক্ত)' : 'Tags (comma-separated)'}</Label>
                    <Input id="tags" value={formData.tags} onChange={e => handleInputChange('tags', e.target.value)} />
                </div>
                {user.user_type === 'doctor' && (
                    <div className="flex items-center space-x-2">
                        <Switch id="professional-only" checked={formData.is_professional_only} onCheckedChange={v => handleInputChange('is_professional_only', v)} />
                        <Label htmlFor="professional-only">{isBengali ? 'শুধুমাত্র পেশাদারদের জন্য' : 'For Professionals Only'}</Label>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="ml-auto">
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Send className="w-4 h-4 mr-2" />
                    {isBengali ? 'পোস্ট করুন' : 'Submit Post'}
                </Button>
            </CardFooter>
        </Card>
    );
}