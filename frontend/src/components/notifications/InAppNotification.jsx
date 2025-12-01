import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const InAppNotification = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-dismiss after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 min-w-[300px] max-w-[90vw]">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <span className="text-2xl">💬</span>
                    </div>
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm">{notification.title}</p>
                    <p className="text-sm opacity-90 truncate">{notification.body}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                    <IoClose size={20} />
                </button>
            </div>
        </div>
    );
};

export default InAppNotification;
