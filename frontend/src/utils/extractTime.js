function timeAgo(createdAt) {
    const date = new Date(createdAt);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return 'just now';
    } else if (minutes < 60) {
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} d${days > 1 ? 's' : ''} ago`;
    } else if (weeks < 4) {
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (months < 12) {
        return `${months} month${months > 1 ? 's' : ''}`;
    } else {
        return `${years} year${years > 1 ? 's' : ''}`;
    }
}

export default timeAgo;
// Example usage:
 // Output will vary depending on the current date
