import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Send, Mail, MessageSquare, Phone, ArrowLeft } from 'lucide-react';
import { sendNotification } from '../services/api';
import Navbar from '../components/Navbar';
import React from 'react';
const schema = z.object({
    channel: z.enum(['email', 'sms', 'whatsapp'], {
        required_error: 'Please select a channel',
    }),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().min(10, 'Invalid phone number').optional(),
    subject: z.string().optional(),
    body: z.string().min(1, 'Message body is required'),
}).refine((data) => {
    if (data.channel === 'email' && !data.email) return false;
    if ((data.channel === 'sms' || data.channel === 'whatsapp') && !data.phone) return false;
    return true;
}, {
    message: 'Required field based on selected channel',
});

export default function SendNotification() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            channel: 'email',
        },
    });

    const selectedChannel = watch('channel');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = {
                channel: data.channel,
                recipient: {},
                content: {},
            };

            // Set recipient based on channel
            if (data.channel === 'email') {
                payload.recipient.email = data.email;
            } else {
                payload.recipient.phone = data.phone;
            }

            // Set content
            payload.content.body = data.body;
            if (data.subject) {
                payload.content.subject = data.subject;
            }

            const response = await sendNotification(payload);

            if (response.success) {
                toast.success('Notification sent successfully!');
                navigate('/notifications');
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getChannelIcon = () => {
        const icons = {
            email: <Mail className="w-5 h-5" />,
            sms: <MessageSquare className="w-5 h-5" />,
            whatsapp: <Phone className="w-5 h-5" />,
        };
        return icons[selectedChannel];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Send Notification</h1>
                    <p className="text-gray-600 mt-1">Create and send a new notification</p>
                </div>

                {/* Form Card */}
                <div className="card">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Channel Selection */}
                        <div>
                            <label className="label">Select Channel</label>
                            <div className="grid grid-cols-3 gap-4">
                                <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-500">
                                    <input
                                        {...register('channel')}
                                        type="radio"
                                        value="email"
                                        className="sr-only"
                                    />
                                    <div className={`flex-1 flex items-center gap-3 ${selectedChannel === 'email' ? 'text-primary-600' : 'text-gray-600'}`}>
                                        <Mail className="w-5 h-5" />
                                        <span className="font-medium">Email</span>
                                    </div>
                                    {selectedChannel === 'email' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full"></div>
                                    )}
                                </label>

                                <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-500">
                                    <input
                                        {...register('channel')}
                                        type="radio"
                                        value="sms"
                                        className="sr-only"
                                    />
                                    <div className={`flex-1 flex items-center gap-3 ${selectedChannel === 'sms' ? 'text-primary-600' : 'text-gray-600'}`}>
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="font-medium">SMS</span>
                                    </div>
                                    {selectedChannel === 'sms' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full"></div>
                                    )}
                                </label>

                                <label className="relative flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-500">
                                    <input
                                        {...register('channel')}
                                        type="radio"
                                        value="whatsapp"
                                        className="sr-only"
                                    />
                                    <div className={`flex-1 flex items-center gap-3 ${selectedChannel === 'whatsapp' ? 'text-primary-600' : 'text-gray-600'}`}>
                                        <Phone className="w-5 h-5" />
                                        <span className="font-medium">WhatsApp</span>
                                    </div>
                                    {selectedChannel === 'whatsapp' && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full"></div>
                                    )}
                                </label>
                            </div>
                            {errors.channel && (
                                <p className="text-red-500 text-sm mt-1">{errors.channel.message}</p>
                            )}
                        </div>

                        {/* Recipient Fields */}
                        {selectedChannel === 'email' ? (
                            <div>
                                <label className="label">Recipient Email</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="input-field"
                                    placeholder="recipient@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="label">Recipient Phone</label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className="input-field"
                                    placeholder="+1234567890"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                                )}
                            </div>
                        )}

                        {/* Subject (Email only) */}
                        {selectedChannel === 'email' && (
                            <div>
                                <label className="label">Subject (Optional)</label>
                                <input
                                    {...register('subject')}
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter email subject"
                                />
                            </div>
                        )}

                        {/* Message Body */}
                        <div>
                            <label className="label">Message</label>
                            <textarea
                                {...register('body')}
                                rows={6}
                                className="input-field resize-none"
                                placeholder="Enter your message..."
                            />
                            {errors.body && (
                                <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {getChannelIcon()}
                                {isLoading ? 'Sending...' : 'Send Notification'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
