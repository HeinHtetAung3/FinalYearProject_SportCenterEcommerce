package com.sportsecommerce.service;

import com.sportsecommerce.dto.ChatDtos;

import java.util.List;

public interface ChatService {

    ChatDtos.ConversationSummaryResponse startConversation(String authenticatedEmail);

    ChatDtos.MessageResponse sendCustomerMessage(String authenticatedEmail, ChatDtos.SendMessageRequest request);

    ChatDtos.MessageResponse sendAdminMessage(String authenticatedEmail, ChatDtos.ReplyRequest request);

    List<ChatDtos.MessageResponse> getMessagesForUser(String authenticatedEmail, Long conversationId);

    List<ChatDtos.MessageResponse> getMessagesForAdmin(String authenticatedEmail, Long conversationId);

    List<ChatDtos.ConversationSummaryResponse> listConversationsForUser(String authenticatedEmail);

    List<ChatDtos.ConversationSummaryResponse> listAllConversations(String authenticatedEmail);

    ChatDtos.ConversationSummaryResponse updateStatus(
            String authenticatedEmail,
            Long conversationId,
            ChatDtos.UpdateConversationStatusRequest request
    );
}
