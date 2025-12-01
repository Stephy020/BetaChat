import React, { useState, useEffect } from 'react';
import { IoNotifications, IoNotificationsOff } from "react-icons/io5";
import toast from 'react-hot-toast';
import { soundManager } from '../../utils/sound';

const NotificationButton = () => {
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        // Update state if permission changes externally
        if (typeof Notification !== 'undefined') {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') {
            toast.error("Notifications not supported on this device");
            return;
        }

        try {
            // Request permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast.success("Notifications enabled!");

                // Initialize sound manager (unlock audio context)
                soundManager.initialize();

                // Send a test notification
                soundManager.playNotification();

                new Notification("Notifications Enabled", {
                    body: "You will now receive messages in the background",
                    icon: "/vite.svg"
                });
            } else if (result === 'denied') {
                toast.error("Notifications blocked. Please enable them in browser settings.");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            toast.error("Failed to enable notifications");
        }
    };

    if (permission === 'granted') return null;

    return (
        <button
            onClick={requestPermission}
            className="btn btn-sm btn-ghost gap-2 text-warning hover:bg-warning/10"
            title="Enable Notifications"
        >
            <IoNotificationsOff className="w-5 h-5" />
            <span className="hidden md:inline text-xs">Enable Notifications</span>
        </button>
    );
};

export default NotificationButton;
