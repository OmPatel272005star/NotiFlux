import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import React from 'react';
export default function Navbar() {
    const navigate = useNavigate();
    const { userEmail, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-lg flex items-center justify-center shadow-md">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">
                            Notification System
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/send')}
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            Send Notification
                        </button>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                        >
                            All Notifications
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">{userEmail}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    navigate('/dashboard');
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/send');
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                Send Notification
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/notifications');
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                All Notifications
                            </button>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Logged in as:</p>
                                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
