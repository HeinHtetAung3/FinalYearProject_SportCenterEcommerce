export function formatChatTimestamp(isoString) {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        return d.toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    } catch {
        return isoString;
    }
}