import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Copy, Check, Bell } from 'lucide-react';
import { registerClient } from '../services/api';
import { copyToClipboard } from '../utils/helpers';
import React from 'react';
const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
});

export default function Register() {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await registerClient(data);

            if (response.success) {
                setApiKey(response.data.apiKey);
                toast.success('Registration successful! Please save your API key.');
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(apiKey);
        if (success) {
            setCopied(true);
            toast.success('API key copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleProceedToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl mb-4 shadow-lg">
                        <Bell className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Register to get started with notifications</p>
                </div>

                {/* Form Card */}
                <div className="card">
                    {!apiKey ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter your full name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="input-field"
                                    placeholder="Enter your email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Register'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-5">
                            {/* Success Message */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                                    <div>
                                        <h3 className="font-semibold text-green-900">Registration Successful!</h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            Your account has been created. Save your API key below.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* API Key Display */}
                            <div>
                                <label className="label text-orange-700">
                                    🔑 Your API Key (copy and save securely)
                                </label>
                                <div className="bg-gray-50 border-2 border-orange-300 rounded-lg p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <code className="text-sm font-mono text-gray-900 break-all flex-1">
                                            {apiKey}
                                        </code>
                                        <button
                                            onClick={handleCopy}
                                            className="flex-shrink-0 p-2 hover:bg-white rounded-lg transition-colors"
                                            title="Copy API key"
                                        >
                                            {copied ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-orange-600 mt-2 font-medium">
                                    ⚠️ Warning: This key will not be shown again! Save it now.
                                </p>
                            </div>

                            {/* Proceed Button */}
                            <button onClick={handleProceedToLogin} className="btn-primary w-full">
                                Proceed to Login
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
