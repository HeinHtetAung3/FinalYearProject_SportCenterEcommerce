package com.sportsecommerce.service;

import com.sportsecommerce.dto.ChatDtos;

/**
 * Pushes new messages to STOMP subscribers for a conversation.
 */
public interface ChatRealtimePublisher {

    void publishNewMessage(Long conversationId, ChatDtos.MessageResponse message);
}
