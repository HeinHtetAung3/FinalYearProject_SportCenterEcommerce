package com.sportsecommerce.websocket;

import com.sportsecommerce.dto.ChatDtos;
import com.sportsecommerce.service.ChatRealtimePublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class StompChatRealtimePublisher implements ChatRealtimePublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public StompChatRealtimePublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publishNewMessage(Long conversationId, ChatDtos.MessageResponse message) {
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, message);
    }
}
