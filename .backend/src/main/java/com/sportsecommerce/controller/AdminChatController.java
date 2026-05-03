package com.sportsecommerce.controller;

import com.sportsecommerce.dto.ChatDtos;
import com.sportsecommerce.service.ChatService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chat")
public class AdminChatController {

    private final ChatService chatService;
    private final UserContextResolver userContextResolver;

    public AdminChatController(ChatService chatService, UserContextResolver userContextResolver) {
        this.chatService = chatService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping
    public ResponseEntity<List<ChatDtos.ConversationSummaryResponse>> listConversations() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.listAllConversations(email));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<List<ChatDtos.MessageResponse>> messages(@PathVariable Long conversationId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.getMessagesForAdmin(email, conversationId));
    }

    @PostMapping("/reply")
    public ResponseEntity<ChatDtos.MessageResponse> reply(@Valid @RequestBody ChatDtos.ReplyRequest request) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.sendAdminMessage(email, request));
    }

    @PutMapping("/{conversationId}/status")
    public ResponseEntity<ChatDtos.ConversationSummaryResponse> updateStatus(
            @PathVariable Long conversationId,
            @Valid @RequestBody ChatDtos.UpdateConversationStatusRequest request
    ) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(chatService.updateStatus(email, conversationId, request));
    }
}
