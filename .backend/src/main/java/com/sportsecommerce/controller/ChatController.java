package com.sportsecommerce.controller;

import com.sportsecommerce.dto.ChatDtos;
import com.sportsecommerce.service.ChatService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final UserContextResolver userContextResolver;

    public ChatController(ChatService chatService, UserContextResolver userContextResolver) {
        this.chatService = chatService;
        this.userContextResolver = userContextResolver;
    }

    @PostMapping("/start")
    public ResponseEntity<ChatDtos.ConversationSummaryResponse> start() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.startConversation(email));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ChatDtos.ConversationSummaryResponse>> myConversations() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.listConversationsForUser(email));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<List<ChatDtos.MessageResponse>> messages(@PathVariable Long conversationId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.getMessagesForUser(email, conversationId));
    }

    @PostMapping("/message")
    public ResponseEntity<ChatDtos.MessageResponse> sendMessage(@Valid @RequestBody ChatDtos.SendMessageRequest request) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.sendCustomerMessage(email, request));
    }
}
