import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, MessageSquare, Search, User as UserIcon, Pin, Shield, Users, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import ProfessionalVerification from '../components/forum/ProfessionalVerification';
import NewPostForm from '../components/forum/NewPostForm';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";


const categoryColors = {
    general_health: "bg-blue-100 text-blue-800",
    dengue_fever: "bg-red-100 text-red-800",
    diabetes: "bg-purple-100 text-purple-800",
    heart_disease: "bg-pink-100 text-pink-800",
    maternal_health: "bg-indigo-100 text-indigo-800",
    child_health: "bg-green-100 text-green-800",
    mental_health: "bg-yellow-100 text-yellow-800",
    emergency_medicine: "bg-orange-100 text-orange-800",
    research: "bg-gray-100 text-gray-800",
    other: "bg-gray-100 text-gray-800",
};

function PostCard({ post, isBengali, user }) {
    const categoryLabel = post.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const isAuthor = user && post.created_by === user.email;
    
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {post.is_pinned && (
                            <div className="flex items-center gap-2 text-sm text-yellow-600 mb-2">
                                <Pin className="w-4 h-4" />
                                {isBengali ? 'পিন করা পোস্ট' : 'Pinned Post'}
                            </div>
                        )}
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                                {post.author_type === 'doctor' ? <Shield className="w-3 h-3 text-blue-500" /> : <UserIcon className="w-3 h-3" />}
                                <span>{post.created_by}</span>
                                {post.author_type === 'doctor' && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1">
                                        {isBengali ? 'ডাক্তার' : 'Doctor'}
                                    </Badge>
                                )}
                            </div>
                            <span>•</span>
                            <span>{format(new Date(post.created_date), 'MMM d, yyyy')}</span>
                            {isAuthor && (
                                <>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-xs">
                                        {isBengali ? 'আপনার পোস্ট' : 'Your post'}
                                    </Badge>
                                </>
                            )}
                        </div>
                    </div>
                    <Badge className={categoryColors[post.category]}>{categoryLabel}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 line-clamp-3">{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {post.replies_count}
                    </Button>
                </div>
                {post.is_professional_only && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Shield className="w-3 h-3 mr-1" />
                        {isBengali ? 'পেশাদার' : 'Professional'}
                    </Badge>
                )}
            </CardFooter>
        </Card>
    );
}

export default function ForumPage() {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBengali, setIsBengali] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [showNewPostDialog, setShowNewPostDialog] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        sortBy: 'recent'
    });

    const categories = [
        { value: 'all', labelBn: 'সব বিষয়', labelEn: 'All Topics' },
        { value: 'general_health', labelBn: 'সাধারণ স্বাস্থ্য', labelEn: 'General Health' },
        { value: 'dengue_fever', labelBn: 'ডেঙ্গু জ্বর', labelEn: 'Dengue Fever' },
        { value: 'diabetes', labelBn: 'ডায়াবেটিস', labelEn: 'Diabetes' },
        { value: 'heart_disease', labelBn: 'হৃদরোগ', labelEn: 'Heart Disease' },
        { value: 'maternal_health', labelBn: 'মাতৃস্বাস্থ্য', labelEn: 'Maternal Health' },
        { value: 'child_health', labelBn: 'শিশুস্বাস্থ্য', labelEn: 'Child Health' },
        { value: 'mental_health', labelBn: 'মানসিক স্বাস্থ্য', labelEn: 'Mental Health' },
        { value: 'emergency_medicine', labelBn: 'জরুরি ঔষধ', labelEn: 'Emergency Medicine' },
        { value: 'research', labelBn: 'গবেষণা', labelEn: 'Research' },
        { value: 'other', labelBn: 'অন্যান্য', labelEn: 'Other' },
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
        } catch(e) { /* not logged in */ }
        
        const data = await base44.entities.ForumPost.list('-created_date');
        setPosts(data);
        applyFilters(data, filters, activeTab);
        setIsLoading(false);
    };

    const applyFilters = (allPosts, currentFilters, tab) => {
        let filtered = [...allPosts];

        // Tab filtering
        if (tab === 'professional' && user?.user_type === 'doctor') {
            filtered = filtered.filter(post => post.is_professional_only || post.author_type === 'doctor');
        } else if (tab === 'public') {
            filtered = filtered.filter(post => !post.is_professional_only);
        }

        // Search filtering
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(searchTerm) || 
                post.content.toLowerCase().includes(searchTerm) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        // Category filtering
        if (currentFilters.category !== 'all') {
            filtered = filtered.filter(post => post.category === currentFilters.category);
        }

        // Sorting
        switch (currentFilters.sortBy) {
            case 'popular':
                filtered.sort((a, b) => (b.likes_count + b.replies_count) - (a.likes_count + a.replies_count));
                break;
            case 'recent':
            default:
                filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
                break;
        }

        // Pin priority
        const pinned = filtered.filter(post => post.is_pinned);
        const regular = filtered.filter(post => !post.is_pinned);
        setFilteredPosts([...pinned, ...regular]);
    };

    useEffect(() => {
        applyFilters(posts, filters, activeTab);
    }, [filters, activeTab, posts]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const isDoctor = user?.user_type === 'doctor';
    const isVerified = user?.verification_status === 'verified';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <MessageSquare className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {isBengali ? 'স্বাস্থ্য ফোরাম' : 'Health Forum'}
                    </h1>
                    <p className="text-lg text-gray-600">{isBengali ? 'জ্ঞান শেয়ার করুন, প্রশ্ন করুন, শিখুন' : 'Share knowledge, ask questions, learn together'}</p>
                </div>
                
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* User Status / Verification */}
                        {user && isDoctor && !isVerified && (
                            <ProfessionalVerification 
                                user={user} 
                                isBengali={isBengali}
                                onVerificationSubmit={() => window.location.reload()}
                            />
                        )}

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Search className="w-5 h-5" />
                                    {isBengali ? 'খুঁজুন ও ছাঁকুন' : 'Search & Filter'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder={isBengali ? 'পোস্ট খুঁজুন...' : 'Search posts...'}
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                                
                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        {isBengali ? 'বিষয়' : 'Category'}
                                    </label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => handleFilterChange('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
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
                                    <label className="text-sm font-medium mb-2 block">
                                        {isBengali ? 'সাজান' : 'Sort By'}
                                    </label>
                                    <Select
                                        value={filters.sortBy}
                                        onValueChange={(value) => handleFilterChange('sortBy', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="recent">{isBengali ? 'সাম্প্রতিক' : 'Recent'}</SelectItem>
                                            <SelectItem value="popular">{isBengali ? 'জনপ্রিয়' : 'Popular'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{isBengali ? 'পরিসংখ্যান' : 'Statistics'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>{isBengali ? 'মোট পোস্ট:' : 'Total Posts:'}</span>
                                    <span className="font-semibold">{posts.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{isBengali ? 'আজকের পোস্ট:' : 'Today:'}</span>
                                    <span className="font-semibold">
                                        {posts.filter(p => new Date(p.created_date).toDateString() === new Date().toDateString()).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{isBengali ? 'ডাক্তারদের পোস্ট:' : 'Doctor Posts:'}</span>
                                    <span className="font-semibold">{posts.filter(p => p.author_type === 'doctor').length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="space-y-6">
                            {/* Tabs and Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList>
                                        <TabsTrigger value="all" className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {isBengali ? 'সব পোস্ট' : 'All Posts'}
                                        </TabsTrigger>
                                        <TabsTrigger value="public" className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            {isBengali ? 'পাবলিক' : 'Public'}
                                        </TabsTrigger>
                                        {isDoctor && (
                                            <TabsTrigger value="professional" className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                {isBengali ? 'পেশাদার' : 'Professional'}
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                </Tabs>
                                
                                <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
                                    <DialogTrigger asChild>
                                        <Button disabled={!user}>
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            {isBengali ? 'নতুন পোস্ট' : 'New Post'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <NewPostForm 
                                            user={user} 
                                            isBengali={isBengali} 
                                            onPostCreated={() => {
                                                setShowNewPostDialog(false);
                                                loadData();
                                            }} 
                                        />
                                    </DialogContent>
                                </Dialog>

                            </div>

                            {/* Posts */}
                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                                        <p className="mt-4">{isBengali ? 'পোস্ট লোড হচ্ছে...' : 'Loading posts...'}</p>
                                    </div>
                                ) : filteredPosts.length > 0 ? (
                                    filteredPosts.map(post => <PostCard key={post.id} post={post} isBengali={isBengali} user={user} />)
                                ) : (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                            {isBengali ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No posts found'}
                                        </h3>
                                        <p className="text-gray-500">
                                            {isBengali ? 'আপনার অনুসন্ধানের শর্ত পরিবর্তন করে চেষ্টা করুন।' : 'Try adjusting your search criteria.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}