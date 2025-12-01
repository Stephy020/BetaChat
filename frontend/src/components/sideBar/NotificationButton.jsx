import React, { useState, useEffect } from 'react';
import { IoNotifications, IoNotificationsOff } from "react-icons/io5";
import toast from 'react-hot-toast';
import notificationSound from '../../assets/sound/notification.mp3';

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

                // "Unlock" audio context for mobile browsers by playing a silent/short sound on user interaction
                const audio = new Audio(notificationSound);
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio unlock failed:", e));

                // Send a test notification
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

    // Don't show button if already granted or denied (unless we want to allow re-checking, but usually browser handles that)
    // Actually, showing it when 'default' is the most important. 
    // If 'denied', clicking it won't do much in most browsers, but we can show a toast.
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
