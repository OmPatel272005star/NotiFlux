import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Phone, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getNotificationById } from '../services/api';
import { formatDate, getStatusColor, getChannelColor } from '../utils/helpers';
import Navbar from '../components/Navbar';
import React from 'react';
export default function NotificationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotification();
    }, [id]);

    const fetchNotification = async () => {
        try {
            const response = await getNotificationById(id);
            if (response.success) {
                setNotification(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch notification:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getChannelIcon = (channel) => {
        const icons = {
            email: <Mail className="w-6 h-6" />,
            sms: <MessageSquare className="w-6 h-6" />,
            whatsapp: <Phone className="w-6 h-6" />,
        };
        return icons[channel] || <Mail className="w-6 h-6" />;
    };

    const getStatusIcon = (status) => {
        const icons = {
            PENDING: <Clock className="w-6 h-6 text-yellow-600" />,
            PROCESSING: <AlertCircle className="w-6 h-6 text-blue-600" />,
            SENT: <CheckCircle className="w-6 h-6 text-green-600" />,
            FAILED: <XCircle className="w-6 h-6 text-red-600" />,
        };
        return icons[status] || <Clock className="w-6 h-6" />;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 mt-2">Loading notification...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!notification) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                        <p className="text-gray-600">Notification not found</p>
                        <button onClick={() => navigate('/notifications')} className="btn-primary mt-4">
                            Back to Notifications
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/notifications')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Notifications
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Notification Details</h1>
                    <p className="text-gray-600 mt-1">ID: {notification._id}</p>
                </div>

                {/* Status Card */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {getStatusIcon(notification.status)}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                    {notification.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-medium text-gray-900">{formatDate(notification.createdAt)}</p>
                        </div>
                    </div>
                    {notification.errorMessage && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-900">Error Message:</p>
                            <p className="text-sm text-red-700 mt-1">{notification.errorMessage}</p>
                        </div>
                    )}
                </div>

                {/* Channel & Recipient */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Channel & Recipient</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Channel</p>
                            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getChannelColor(notification.channel)}`}>
                                {getChannelIcon(notification.channel)}
                                <span className="font-medium capitalize">{notification.channel}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Recipient</p>
                            <p className="font-medium text-gray-900">
                                {notification.recipient.email || notification.recipient.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Content</h2>
                    {notification.content.subject && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-1">Subject</p>
                            <p className="font-medium text-gray-900">{notification.content.subject}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Message</p>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-900 whitespace-pre-wrap">{notification.content.body}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
