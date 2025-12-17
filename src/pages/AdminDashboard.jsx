import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                if (user.role !== 'admin') {
                    navigate('/'); // Redirect non-admins
                    return;
                }
                fetchUsers();
            } catch (e) {
                navigate('/'); // Redirect if not logged in
            }
        };
        checkAdmin();
    }, [navigate]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const allUsers = await User.list();
            setUsers(allUsers);
        } catch (err) {
            setError('Failed to fetch users.');
            console.error(err);
        }
        setIsLoading(false);
    };

    const handleVerificationChange = async (userId, status) => {
        try {
            await User.update(userId, { verification_status: status });
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert('Failed to update verification status.');
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await User.update(userId, { role: role });
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert('Failed to update role.');
        }
    };
    
    const handleUserTypeChange = async (userId, user_type) => {
        try {
            await User.update(userId, { user_type: user_type });
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert('Failed to update user type.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
                    <CardDescription>Manage users, verify doctors, and monitor the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Verification (Doctors)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                defaultValue={user.role}
                                                onValueChange={(value) => handleRoleChange(user.id, value)}
                                                disabled={user.id === currentUser.id}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                             <Select
                                                defaultValue={user.user_type}
                                                onValueChange={(value) => handleUserTypeChange(user.id, value)}
                                            >
                                                <SelectTrigger className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="patient">Patient</SelectItem>
                                                    <SelectItem value="doctor">Doctor</SelectItem>
                                                    <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            {user.user_type === 'doctor' && (
                                                 <Select
                                                    defaultValue={user.verification_status || 'unverified'}
                                                    onValueChange={(value) => handleVerificationChange(user.id, value)}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="verified">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-4 h-4 text-green-600" /> Verified
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="pending">
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" /> Pending
                                                            </div>
                                                        </SelectItem>
                                                         <SelectItem value="unverified">
                                                            <div className="flex items-center gap-2">
                                                                <UserX className="w-4 h-4 text-gray-600" /> Unverified
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="rejected">
                                                            <div className="flex items-center gap-2">
                                                                <UserX className="w-4 h-4 text-red-600" /> Rejected
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}