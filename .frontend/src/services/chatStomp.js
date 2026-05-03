import SockJS from 'sockjs-client';
import {
    Client
} from '@stomp/stompjs';
import {
    getApiBaseUrl
} from '../utils/apiBase';

/**
 * Subscribe to new messages for a conversation. Returns a teardown function.
 */
export function subscribeToConversationMessages({
    accessToken,
    conversationId,
    onMessage
}) {
    if (!accessToken || !conversationId) {
        return () => {};
    }

    const client = new Client({
        webSocketFactory: () => new SockJS(`${getApiBaseUrl()}/ws`),
        connectHeaders: {
            Authorization: `Bearer ${accessToken}`
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            client.subscribe(`/topic/conversations/${conversationId}`, (message) => {
                try {
                    const body = JSON.parse(message.body);
                    onMessage(body);
                } catch {
                    // ignore malformed frames
                }
            });
        }
    });

    client.activate();

    return () => {
        client.deactivate();
    };
}