import apiClient from './apiClient';

export async function startCustomerConversation() {
    const {
        data
    } = await apiClient.post('/api/chat/start');
    return data;
}

export async function fetchMyConversations() {
    const {
        data
    } = await apiClient.get('/api/chat/my');
    return data;
}

export async function fetchCustomerMessages(conversationId) {
    const {
        data
    } = await apiClient.get(`/api/chat/${conversationId}`);
    return data;
}

export async function sendCustomerMessage(payload) {
    const {
        data
    } = await apiClient.post('/api/chat/message', payload);
    return data;
}

export async function fetchAdminConversations() {
    const {
        data
    } = await apiClient.get('/api/admin/chat');
    return data;
}

export async function fetchAdminMessages(conversationId) {
    const {
        data
    } = await apiClient.get(`/api/admin/chat/${conversationId}`);
    return data;
}

export async function sendAdminReply(payload) {
    const {
        data
    } = await apiClient.post('/api/admin/chat/reply', payload);
    return data;
}

export async function updateConversationStatus(conversationId, status) {
    const {
        data
    } = await apiClient.put(`/api/admin/chat/${conversationId}/status`, {
        status
    });
    return data;
}