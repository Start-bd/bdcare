import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp, Send, X } from 'lucide-react';

export default function ReviewPrompt({ consultation, user, isBengali, onComplete, onSkip }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const isPatient = user.user_type !== 'doctor' && user.role !== 'doctor';

    // Only show for patients
    if (!isPatient) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            alert(isBengali ? 'অনুগ্রহ করে রেটিং দিন' : 'Please provide a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            await base44.entities.DoctorReview.create({
                doctor_id: consultation.doctor_id,
                patient_id: user.id,
                patient_name: user.full_name,
                rating: rating,
                review_text: reviewText,
                appointment_id: consultation.appointment_id,
                is_verified: true // Verified because it's from actual consultation
            });
            setSubmitted(true);
            setTimeout(() => {
                onComplete();
            }, 2000);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert(isBengali ? 'রিভিউ জমা দিতে ব্যর্থ' : 'Failed to submit review');
        }
        setIsSubmitting(false);
    };

    if (submitted) {
        return (
            <Card className="max-w-2xl mx-auto shadow-xl border-0">
                <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ThumbsUp className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">
                        {isBengali ? 'ধন্যবাদ!' : 'Thank You!'}
                    </h2>
                    <p className="text-gray-600">
                        {isBengali 
                            ? 'আপনার মূল্যবান মতামত জমা দেওয়ার জন্য ধন্যবাদ।'
                            : 'Your valuable feedback has been submitted.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-xl border-0 mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Star className="w-6 h-6" />
                        {isBengali ? 'আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share Your Experience'}
                    </CardTitle>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={onSkip}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-purple-100 text-sm">
                    {isBengali 
                        ? 'ডাক্তার এবং অন্যান্য রোগীদের সাহায্য করতে আপনার মতামত দিন'
                        : 'Help the doctor and other patients with your feedback'}
                </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Rating */}
                <div className="text-center">
                    <p className="text-lg font-medium mb-3">
                        {isBengali ? 'আপনার পরামর্শ কেমন ছিল?' : 'How was your consultation?'}
                    </p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-12 h-12 ${
                                        star <= (hoveredRating || rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                            {rating === 5 && (isBengali ? '🌟 চমৎকার!' : '🌟 Excellent!')}
                            {rating === 4 && (isBengali ? '😊 ভালো' : '😊 Good')}
                            {rating === 3 && (isBengali ? '😐 গড়' : '😐 Average')}
                            {rating === 2 && (isBengali ? '😕 খারাপ' : '😕 Poor')}
                            {rating === 1 && (isBengali ? '😞 খুবই খারাপ' : '😞 Very Poor')}
                        </p>
                    )}
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {isBengali ? 'আপনার মতামত (ঐচ্ছিক)' : 'Your Review (Optional)'}
                    </label>
                    <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={isBengali 
                            ? 'ডাক্তারের পেশাদারিত্ব, যোগাযোগ, চিকিৎসা সম্পর্কে লিখুন...'
                            : 'Share details about the doctor\'s professionalism, communication, treatment...'}
                        rows={4}
                        className="resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button 
                        onClick={onSkip}
                        variant="outline"
                        className="flex-1"
                    >
                        {isBengali ? 'পরে করব' : 'Skip for Now'}
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        {isSubmitting ? (
                            <span>{isBengali ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {isBengali ? 'রিভিউ জমা দিন' : 'Submit Review'}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}