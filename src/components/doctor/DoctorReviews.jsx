import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Loader2, CheckCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DoctorReviews({ doctorId, isBengali, currentUser }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        loadReviews();
    }, [doctorId]);

    const loadReviews = async () => {
        setIsLoading(true);
        try {
            const allReviews = await base44.entities.DoctorReview.filter(
                { doctor_id: doctorId },
                '-created_date',
                100
            );
            setReviews(allReviews);
            
            if (allReviews.length > 0) {
                const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
                setAverageRating(avg);
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        }
        setIsLoading(false);
    };

    const handleSubmitReview = async () => {
        if (!currentUser) {
            alert(isBengali ? 'রিভিউ দিতে লগইন করুন' : 'Please login to submit a review');
            return;
        }

        if (!reviewText.trim()) {
            alert(isBengali ? 'রিভিউ লিখুন' : 'Please write a review');
            return;
        }

        setIsSubmitting(true);
        try {
            await base44.entities.DoctorReview.create({
                doctor_id: doctorId,
                patient_id: currentUser.id,
                patient_name: currentUser.full_name,
                rating: rating,
                review_text: reviewText,
                visit_date: new Date().toISOString().split('T')[0]
            });

            setReviewText('');
            setRating(5);
            setShowReviewForm(false);
            await loadReviews();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert(isBengali ? 'রিভিউ সাবমিট ব্যর্থ' : 'Failed to submit review');
        }
        setIsSubmitting(false);
    };

    const renderStars = (rating, interactive = false, onRate = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${
                            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={() => interactive && onRate && onRate(star)}
                    />
                ))}
            </div>
        );
    };

    const hasUserReviewed = reviews.some(r => r.patient_id === currentUser?.id);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            {isBengali ? 'রোগীদের রিভিউ' : 'Patient Reviews'}
                        </CardTitle>
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                                <div>
                                    {renderStars(Math.round(averageRating))}
                                    <p className="text-sm text-gray-600">
                                        {reviews.length} {isBengali ? 'টি রিভিউ' : 'reviews'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {currentUser && !hasUserReviewed && (
                        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                            <DialogTrigger asChild>
                                <Button className="bg-emerald-600 hover:bg-emerald-700">
                                    {isBengali ? '📝 রিভিউ লিখুন' : '📝 Write Review'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{isBengali ? 'আপনার রিভিউ লিখুন' : 'Write Your Review'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            {isBengali ? 'রেটিং' : 'Rating'}
                                        </label>
                                        {renderStars(rating, true, setRating)}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            {isBengali ? 'আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share Your Experience'}
                                        </label>
                                        <Textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder={isBengali 
                                                ? 'ডাক্তারের সাথে আপনার অভিজ্ঞতা বর্ণনা করুন...'
                                                : 'Describe your experience with the doctor...'}
                                            rows={5}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={isSubmitting}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        {isBengali ? 'সাবমিট করুন' : 'Submit Review'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                            {isBengali ? 'এখনও কোনো রিভিউ নেই' : 'No reviews yet'}
                        </p>
                        {currentUser && (
                            <p className="text-sm text-gray-400 mt-2">
                                {isBengali ? 'প্রথম রিভিউ লিখুন' : 'Be the first to write a review'}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold flex items-center gap-2">
                                                    {review.patient_name}
                                                    {review.is_verified && (
                                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            {isBengali ? 'যাচাইকৃত' : 'Verified'}
                                                        </Badge>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(review.created_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                                                </p>
                                            </div>
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}