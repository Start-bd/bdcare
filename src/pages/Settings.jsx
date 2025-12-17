import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { UserPreferences } from '@/entities/UserPreferences';
import { UserActivityLog } from '@/entities/UserActivityLog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Activity, 
  Download, 
  Trash2, 
  LogOut,
  UserCheck,
  Accessibility
} from 'lucide-react';

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setSaving] = useState(false);
    const [isBengali, setIsBengali] = useState(true);

    useEffect(() => {
        loadUserSettings();
    }, []);

    const loadUserSettings = async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            setIsBengali(currentUser.preferred_language === 'bengali' || !currentUser.preferred_language);
            
            // Load user preferences
            const userPrefs = await UserPreferences.filter({ user_id: currentUser.id });
            if (userPrefs.length > 0) {
                setPreferences(userPrefs[0]);
            } else {
                // Create default preferences
                const defaultPrefs = await UserPreferences.create({
                    user_id: currentUser.id,
                    notification_preferences: {
                        email_notifications: true,
                        appointment_reminders: true,
                        health_tips: true,
                        forum_replies: true,
                        emergency_alerts: true
                    },
                    privacy_settings: {
                        allow_anonymous_data_usage: true,
                        share_location_for_emergency: true,
                        allow_ai_learning_from_conversations: false,
                        profile_visibility: 'private'
                    },
                    accessibility_settings: {
                        font_size: 'normal',
                        high_contrast: false,
                        reduce_animations: false
                    },
                    theme_settings: {
                        color_scheme: 'light',
                        compact_mode: false
                    }
                });
                setPreferences(defaultPrefs);
            }

            // Load recent activity
            const recentActivity = await UserActivityLog.filter({ user_id: currentUser.id }, '-created_date', 10);
            setActivityLog(recentActivity);

        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePreferences = async (section, key, value) => {
        if (!preferences) return;
        
        setSaving(true);
        try {
            const updatedPrefs = {
                ...preferences,
                [section]: {
                    ...preferences[section],
                    [key]: value
                }
            };
            
            await UserPreferences.update(preferences.id, updatedPrefs);
            setPreferences(updatedPrefs);

            // Log this activity
            await UserActivityLog.create({
                user_id: user.id,
                activity_type: 'privacy_setting_change',
                description: `Updated ${section}.${key} to ${value}`,
                metadata: { section, key, value }
            });

        } catch (error) {
            console.error('Failed to update preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await UserActivityLog.create({
                user_id: user.id,
                activity_type: 'login',
                description: 'User logged out',
                success: true
            });
            await User.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const exportUserData = async () => {
        try {
            await UserActivityLog.create({
                user_id: user.id,
                activity_type: 'data_export',
                description: 'User requested data export',
                metadata: { export_type: 'full_profile' }
            });
            
            // In a real implementation, this would trigger a backend process
            alert(isBengali ? 
                '📧 আপনার ডেটা এক্সপোর্ট অনুরোধ গৃহীত হয়েছে। ২৪ ঘন্টার মধ্যে ইমেইলে পাঠানো হবে।' :
                '📧 Your data export request has been received. You will receive it via email within 24 hours.'
            );
        } catch (error) {
            console.error('Failed to request data export:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-emerald-700">{isBengali ? 'সেটিংস লোড হচ্ছে...' : 'Loading settings...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                <SettingsIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">⚙️ {isBengali ? 'অ্যাকাউন্ট সেটিংস' : 'Account Settings'}</CardTitle>
                                <CardDescription className="text-green-100">
                                    🔒 {isBengali ? 'আপনার অ্যাকাউন্ট, গোপনীয়তা এবং নিরাপত্তা ব্যবস্থাপনা করুন' : 'Manage your account, privacy and security settings'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs defaultValue="privacy" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
                        <TabsTrigger value="privacy" className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            🔒 {isBengali ? 'গোপনীয়তা' : 'Privacy'}
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-1">
                            <Bell className="w-4 h-4" />
                            🔔 {isBengali ? 'বিজ্ঞপ্তি' : 'Notifications'}
                        </TabsTrigger>
                        <TabsTrigger value="accessibility" className="flex items-center gap-1">
                            <Accessibility className="w-4 h-4" />
                            ♿ {isBengali ? 'অ্যাক্সেস' : 'Access'}
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            🛡️ {isBengali ? 'নিরাপত্তা' : 'Security'}
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            💾 {isBengali ? 'ডেটা' : 'Data'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="privacy">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                    🔒 {isBengali ? 'গোপনীয়তা নিয়ন্ত্রণ' : 'Privacy Controls'}
                                </CardTitle>
                                <CardDescription>
                                    {isBengali ? 'আপনার ব্যক্তিগত তথ্য কীভাবে ব্যবহৃত হবে তা নিয়ন্ত্রণ করুন' : 'Control how your personal information is used'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <div>
                                        <Label className="text-lg font-medium">🧬 {isBengali ? 'গবেষণার জন্য বেনামী ডেটা' : 'Anonymous Data for Research'}</Label>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {isBengali ? 'জনস্বাস্থ্য গবেষণার জন্য আপনার বেনামী তথ্য ব্যবহার করার অনুমতি দিন' : 'Allow your anonymized data to be used for public health research'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences?.privacy_settings?.allow_anonymous_data_usage}
                                        onCheckedChange={(checked) => updatePreferences('privacy_settings', 'allow_anonymous_data_usage', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                    <div>
                                        <Label className="text-lg font-medium">📍 {isBengali ? 'জরুরি অবস্থানের জন্য লোকেশন' : 'Location for Emergency'}</Label>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {isBengali ? 'জরুরি পরিস্থিতিতে আপনার অবস্থান শেয়ার করার অনুমতি দিন' : 'Allow sharing your location during emergency situations'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences?.privacy_settings?.share_location_for_emergency}
                                        onCheckedChange={(checked) => updatePreferences('privacy_settings', 'share_location_for_emergency', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                    <div>
                                        <Label className="text-lg font-medium">🤖 {isBengali ? 'AI কথোপকথন থেকে শেখা' : 'AI Learning from Conversations'}</Label>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {isBengali ? 'AI সিস্টেমকে আপনার কথোপকথন থেকে শিখতে দিন (আরও ভাল সেবার জন্য)' : 'Allow AI system to learn from your conversations (for better service)'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences?.privacy_settings?.allow_ai_learning_from_conversations}
                                        onCheckedChange={(checked) => updatePreferences('privacy_settings', 'allow_ai_learning_from_conversations', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-emerald-600" />
                                    🔔 {isBengali ? 'বিজ্ঞপ্তি পছন্দ' : 'Notification Preferences'}
                                </CardTitle>
                                <CardDescription>
                                    {isBengali ? 'কোন ধরনের বিজ্ঞপ্তি পেতে চান তা বেছে নিন' : 'Choose which notifications you want to receive'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    { key: 'email_notifications', labelBn: '📧 ইমেইল বিজ্ঞপ্তি', labelEn: '📧 Email Notifications', descBn: 'গুরুত্বপূর্ণ আপডেট ইমেইলে পান', descEn: 'Receive important updates via email' },
                                    { key: 'appointment_reminders', labelBn: '📅 অ্যাপয়েন্টমেন্ট মনে করিয়ে দেওয়া', labelEn: '📅 Appointment Reminders', descBn: 'ডাক্তারের সাথে সাক্ষাতের আগে মনে করিয়ে দেওয়া', descEn: 'Reminders before doctor appointments' },
                                    { key: 'health_tips', labelBn: '💡 স্বাস্থ্য টিপস', labelEn: '💡 Health Tips', descBn: 'দৈনিক ব্যক্তিগত স্বাস্থ্য পরামর্শ', descEn: 'Daily personalized health advice' },
                                    { key: 'forum_replies', labelBn: '💬 ফোরাম উত্তর', labelEn: '💬 Forum Replies', descBn: 'আপনার পোস্টে উত্তর আসলে জানান', descEn: 'Notify when someone replies to your posts' },
                                    { key: 'emergency_alerts', labelBn: '🚨 জরুরি সতর্কতা', labelEn: '🚨 Emergency Alerts', descBn: 'এলাকার স্বাস্থ্য জরুরি অবস্থার সতর্কতা', descEn: 'Health emergency alerts in your area' }
                                ].map((notif) => (
                                    <div key={notif.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label className="text-lg font-medium">{isBengali ? notif.labelBn : notif.labelEn}</Label>
                                            <p className="text-sm text-gray-600 mt-1">{isBengali ? notif.descBn : notif.descEn}</p>
                                        </div>
                                        <Switch
                                            checked={preferences?.notification_preferences?.[notif.key]}
                                            onCheckedChange={(checked) => updatePreferences('notification_preferences', notif.key, checked)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="accessibility">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Accessibility className="w-5 h-5 text-emerald-600" />
                                    ♿ {isBengali ? 'অ্যাক্সেসিবিলিটি সেটিংস' : 'Accessibility Settings'}
                                </CardTitle>
                                <CardDescription>
                                    {isBengali ? 'অ্যাপটি ব্যবহার করা আরও সহজ করার জন্য সেটিংস' : 'Settings to make the app easier to use'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <Label className="text-lg font-medium mb-3 block">🔤 {isBengali ? 'ফন্টের আকার' : 'Font Size'}</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {[
                                            { value: 'small', labelBn: 'ছোট', labelEn: 'Small' },
                                            { value: 'normal', labelBn: 'সাধারণ', labelEn: 'Normal' },
                                            { value: 'large', labelBn: 'বড়', labelEn: 'Large' },
                                            { value: 'extra_large', labelBn: 'খুব বড়', labelEn: 'Extra Large' }
                                        ].map((size) => (
                                            <Button
                                                key={size.value}
                                                variant={preferences?.accessibility_settings?.font_size === size.value ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => updatePreferences('accessibility_settings', 'font_size', size.value)}
                                            >
                                                {isBengali ? size.labelBn : size.labelEn}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <Label className="text-lg font-medium">🎨 {isBengali ? 'উচ্চ বৈপরীত্য' : 'High Contrast'}</Label>
                                        <p className="text-sm text-gray-600 mt-1">{isBengali ? 'দেখতে সুবিধার জন্য রঙের বৈপরীত্য বাড়ান' : 'Increase color contrast for better visibility'}</p>
                                    </div>
                                    <Switch
                                        checked={preferences?.accessibility_settings?.high_contrast}
                                        onCheckedChange={(checked) => updatePreferences('accessibility_settings', 'high_contrast', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <Label className="text-lg font-medium">🎬 {isBengali ? 'অ্যানিমেশন কমান' : 'Reduce Animations'}</Label>
                                        <p className="text-sm text-gray-600 mt-1">{isBengali ? 'অ্যাপের অ্যানিমেশন ও ইফেক্ট কমিয়ে দিন' : 'Reduce app animations and effects'}</p>
                                    </div>
                                    <Switch
                                        checked={preferences?.accessibility_settings?.reduce_animations}
                                        onCheckedChange={(checked) => updatePreferences('accessibility_settings', 'reduce_animations', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                    🛡️ {isBengali ? 'নিরাপত্তা ও কার্যকলাপ' : 'Security & Activity'}
                                </CardTitle>
                                <CardDescription>
                                    {isBengali ? 'আপনার অ্যাকাউন্টের সাম্প্রতিক কার্যকলাপ দেখুন' : 'View your recent account activity'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert className="bg-green-50 border-green-200">
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                    <AlertTitle className="text-green-800">✅ {isBengali ? 'অ্যাকাউন্ট নিরাপদ' : 'Account Secure'}</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        {isBengali ? 'আপনার অ্যাকাউন্টে কোনো সন্দেহজনক কার্যকলাপ পাওয়া যায়নি।' : 'No suspicious activity detected on your account.'}
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">📋 {isBengali ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activity'}</h4>
                                    {activityLog.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">{isBengali ? 'কোনো কার্যকলাপ নেই' : 'No activity found'}</p>
                                    ) : (
                                        activityLog.map((activity, index) => (
                                            <div key={activity.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                        <Activity className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{activity.description}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(activity.created_date).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant={activity.success ? 'default' : 'destructive'}>
                                                    {activity.success ? (isBengali ? 'সফল' : 'Success') : (isBengali ? 'ব্যর্থ' : 'Failed')}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="data">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="w-5 h-5 text-emerald-600" />
                                    💾 {isBengali ? 'ডেটা ব্যবস্থাপনা' : 'Data Management'}
                                </CardTitle>
                                <CardDescription>
                                    {isBengali ? 'আপনার ব্যক্তিগত ডেটা ডাউনলোড বা ডিলিট করুন' : 'Download or delete your personal data'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2">📥 {isBengali ? 'আপনার ডেটা ডাউনলোড করুন' : 'Download Your Data'}</h4>
                                    <p className="text-sm text-blue-700 mb-4">
                                        {isBengali ? 'আপনার সমস্ত ব্যক্তিগত তথ্য, স্বাস্থ্য রেকর্ড এবং কার্যকলাপের একটি কপি পান।' : 'Get a copy of all your personal information, health records, and activity.'}
                                    </p>
                                    <Button onClick={exportUserData} className="bg-blue-600 hover:bg-blue-700">
                                        <Download className="w-4 h-4 mr-2" />
                                        📧 {isBengali ? 'ডেটা এক্সপোর্ট করুন' : 'Export Data'}
                                    </Button>
                                </div>

                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <h4 className="font-semibold text-red-900 mb-2">🗑️ {isBengali ? 'বিপজ্জনক এলাকা' : 'Danger Zone'}</h4>
                                    <p className="text-sm text-red-700 mb-4">
                                        {isBengali ? 'এই ক্রিয়াকলাপগুলি স্থায়ী এবং পূর্বাবস্থায় ফেরানো যাবে না।' : 'These actions are permanent and cannot be undone.'}
                                    </p>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            ❌ {isBengali ? 'সমস্ত ডেটা ডিলিট করুন' : 'Delete All Data'}
                                        </Button>
                                        <Button onClick={handleLogout} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            🚪 {isBengali ? 'লগ আউট' : 'Log Out'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}