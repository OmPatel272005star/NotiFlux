import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn, Bell } from 'lucide-react';
import { getClientInfo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import React from 'react';
const schema = z.object({
    email: z.string().email('Invalid email address'),
    apiKey: z.string().min(10, 'API key is required'),
});

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
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
            // Store credentials temporarily
            localStorage.setItem('apiKey', data.apiKey);
            localStorage.setItem('userEmail', data.email);

            // Verify by fetching client info
            const response = await getClientInfo();

            if (response.success) {
                // Login successful
                login(data.apiKey, data.email);
                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            // Clear invalid credentials
            localStorage.removeItem('apiKey');
            localStorage.removeItem('userEmail');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl mb-4 shadow-lg">
                        <Bell className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Login to access your dashboard</p>
                </div>

                {/* Form Card */}
                <div className="card">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                        <div>
                            <label className="label">API Key</label>
                            <input
                                {...register('apiKey')}
                                type="password"
                                className="input-field font-mono"
                                placeholder="Enter your API key"
                            />
                            {errors.apiKey && (
                                <p className="text-red-500 text-sm mt-1">{errors.apiKey.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Your API key was provided during registration
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
