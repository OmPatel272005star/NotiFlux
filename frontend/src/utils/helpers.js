// Helper function to format dates
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

// Helper function to get status badge color
export const getStatusColor = (status) => {
    const colors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PROCESSING: 'bg-blue-100 text-blue-800',
        SENT: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get channel badge color
export const getChannelColor = (channel) => {
    const colors = {
        email: 'bg-purple-100 text-purple-800',
        sms: 'bg-indigo-100 text-indigo-800',
        whatsapp: 'bg-green-100 text-green-800',
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
};

// Copy to clipboard helper
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};
