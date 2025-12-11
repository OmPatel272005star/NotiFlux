import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Send, CheckCircle, XCircle, Clock, Mail, MessageSquare, Phone } from 'lucide-react';
import { getNotifications, getClientInfo } from '../services/api';
import { formatDate, getStatusColor, getChannelColor } from '../utils/helpers';
import Navbar from '../components/Navbar';
import React from 'react';
export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        sent: 0,
        failed: 0,
    });
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [clientInfo, setClientInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch client info and recent notifications
            const [clientResponse, notificationsResponse] = await Promise.all([
                getClientInfo(),
                getNotifications({ limit: 5 }),
            ]);

            if (clientResponse.success) {
                setClientInfo(clientResponse.data);
            }

            if (notificationsResponse.success) {
                const notifications = notificationsResponse.data;
                setRecentNotifications(notifications);

                // Calculate stats
                const stats = {
                    total: notificationsResponse.pagination.total,
                    pending: notifications.filter((n) => n.status === 'PENDING').length,
                    sent: notifications.filter((n) => n.status === 'SENT').length,
                    failed: notifications.filter((n) => n.status === 'FAILED').length,
                };
                setStats(stats);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getChannelIcon = (channel) => {
        const icons = {
            email: <Mail className="w-5 h-5" />,
            sms: <MessageSquare className="w-5 h-5" />,
            whatsapp: <Phone className="w-5 h-5" />,
        };
        return icons[channel] || <Bell className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back{clientInfo?.name ? `, ${clientInfo.name}` : ''}!
                    </h1>
                    <p className="text-gray-600 mt-1">Here's what's happening with your notifications</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Notifications</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <Bell className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Sent</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Failed</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/send')}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all"
                        >
                            <Send className="w-5 h-5" />
                            <span className="font-medium">Send Notification</span>
                        </button>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="font-medium">View All Notifications</span>
                        </button>
                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-all"
                        >
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Refresh Data</span>
                        </button>
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                            View All →
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-600 mt-2">Loading...</p>
                        </div>
                    ) : recentNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No notifications yet</p>
                            <button
                                onClick={() => navigate('/send')}
                                className="btn-primary mt-4"
                            >
                                Send Your First Notification
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => navigate(`/notification/${notification._id}`)}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${getChannelColor(notification.channel)}`}>
                                        {getChannelIcon(notification.channel)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {notification.content.subject || notification.content.body?.substring(0, 50)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                        {notification.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
