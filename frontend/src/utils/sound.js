import notificationSound from '../assets/sound/notification.mp3';

class SoundManager {
    constructor() {
        this.audio = new Audio(notificationSound);
        this.audio.volume = 0.5;
        this.initialized = false;
    }

    // Call this on a user interaction (click/touch) to unlock audio on mobile
    initialize() {
        if (this.initialized) return;

        // Play and immediately pause to unlock the audio context
        this.audio.play().then(() => {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.initialized = true;
        }).catch(error => {
            console.log("Audio unlock failed (will retry on next interaction):", error);
        });
    }

    playNotification() {
        // Clone the node to allow overlapping sounds if messages come in fast
        const sound = this.audio.cloneNode();
        sound.volume = 0.5;
        sound.play().catch(error => {
            console.log("Notification sound failed:", error);
        });

        // Vibrate for 200ms if supported (Android/Mobile)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(200);
            } catch (e) {
                console.log("Vibration failed:", e);
            }
        }
    }
}

export const soundManager = new SoundManager();
