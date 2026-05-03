package com.sportsecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ChatDtos {

    private ChatDtos() {
    }

    public record ConversationSummaryResponse(
            Long id,
            String status,
            Instant createdAt,
            String customerEmail,
            String customerFullName
    ) {
    }

    public record MessageResponse(
            Long id,
            Long conversationId,
            String sender,
            String content,
            Instant createdAt
    ) {
    }

    public record SendMessageRequest(
            @NotNull Long conversationId,
            @NotBlank @Size(max = 4000) String content
    ) {
    }

    public record ReplyRequest(
            @NotNull Long conversationId,
            @NotBlank @Size(max = 4000) String content
    ) {
    }

    public record UpdateConversationStatusRequest(
            @NotBlank String status
    ) {
    }
}
