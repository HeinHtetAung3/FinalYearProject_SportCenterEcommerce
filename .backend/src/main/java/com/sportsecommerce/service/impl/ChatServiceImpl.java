package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.ChatDtos;
import com.sportsecommerce.entity.ConversationEntity;
import com.sportsecommerce.entity.ConversationStatus;
import com.sportsecommerce.entity.MessageEntity;
import com.sportsecommerce.entity.MessageSender;
import com.sportsecommerce.entity.Role;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.ConversationJpaRepository;
import com.sportsecommerce.repository.MessageJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.service.ChatRealtimePublisher;
import com.sportsecommerce.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    private final ConversationJpaRepository conversationRepository;
    private final MessageJpaRepository messageRepository;
    private final UserJpaRepository userJpaRepository;
    private final ChatRealtimePublisher chatRealtimePublisher;

    public ChatServiceImpl(
            ConversationJpaRepository conversationRepository,
            MessageJpaRepository messageRepository,
            UserJpaRepository userJpaRepository,
            ChatRealtimePublisher chatRealtimePublisher) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userJpaRepository = userJpaRepository;
        this.chatRealtimePublisher = chatRealtimePublisher;
    }

    @Override
    @Transactional
    public ChatDtos.ConversationSummaryResponse startConversation(String authenticatedEmail) {
        UserEntity customer = requireCustomerUser(authenticatedEmail);
        ConversationEntity open = conversationRepository
                .findByCustomerAndStatus(customer, ConversationStatus.OPEN)
                .orElseGet(() -> {
                    ConversationEntity c = new ConversationEntity();
                    c.setCustomer(customer);
                    c.setStatus(ConversationStatus.OPEN);
                    return conversationRepository.save(c);
                });
        return toCustomerSummary(open);
    }

    @Override
    @Transactional
    public ChatDtos.MessageResponse sendCustomerMessage(String authenticatedEmail, ChatDtos.SendMessageRequest request) {
        UserEntity customer = requireCustomerUser(authenticatedEmail);
        ConversationEntity conversation = conversationRepository.findWithCustomerById(request.conversationId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!conversation.getCustomer().getId().equals(customer.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to post to this conversation");
        }
        if (conversation.getStatus() != ConversationStatus.OPEN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Conversation is closed");
        }
        return persistAndPublish(conversation, MessageSender.CUSTOMER, request.content());
    }

    @Override
    @Transactional
    public ChatDtos.MessageResponse sendAdminMessage(String authenticatedEmail, ChatDtos.ReplyRequest request) {
        UserEntity admin = requireAdminUser(authenticatedEmail);
        ConversationEntity conversation = conversationRepository.findById(request.conversationId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (conversation.getStatus() != ConversationStatus.OPEN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Conversation is closed");
        }
        // Ensure admin user exists (authorization already at HTTP layer)
        if (admin.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return persistAndPublish(conversation, MessageSender.ADMIN, request.content());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatDtos.MessageResponse> getMessagesForUser(String authenticatedEmail, Long conversationId) {
        UserEntity customer = requireCustomerUser(authenticatedEmail);
        ConversationEntity conversation = conversationRepository.findWithCustomerById(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
        if (!conversation.getCustomer().getId().equals(customer.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to view this conversation");
        }
        return loadMessages(conversationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatDtos.MessageResponse> getMessagesForAdmin(String authenticatedEmail, Long conversationId) {
        requireAdminUser(authenticatedEmail);
        if (!conversationRepository.existsById(conversationId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Conversation not found");
        }
        return loadMessages(conversationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatDtos.ConversationSummaryResponse> listConversationsForUser(String authenticatedEmail) {
        UserEntity customer = requireCustomerUser(authenticatedEmail);
        return conversationRepository.findByCustomerOrderByCreatedAtDesc(customer).stream()
                .map(this::toCustomerSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatDtos.ConversationSummaryResponse> listAllConversations(String authenticatedEmail) {
        requireAdminUser(authenticatedEmail);
        return conversationRepository.findAllForAdminWithCustomer().stream()
                .map(this::toAdminSummary)
                .toList();
    }

    @Override
    @Transactional
    public ChatDtos.ConversationSummaryResponse updateStatus(
            String authenticatedEmail,
            Long conversationId,
            ChatDtos.UpdateConversationStatusRequest request) {
        requireAdminUser(authenticatedEmail);
        ConversationEntity conversation = conversationRepository.findWithCustomerById(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Conversation not found"));
        ConversationStatus next;
        try {
            next = ConversationStatus.valueOf(request.status().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        conversation.setStatus(next);
        return toAdminSummary(conversation);
    }

    private List<ChatDtos.MessageResponse> loadMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    private ChatDtos.MessageResponse persistAndPublish(
            ConversationEntity conversation,
            MessageSender sender,
            String content) {
        MessageEntity message = new MessageEntity();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content.trim());
        message = messageRepository.save(message);
        ChatDtos.MessageResponse dto = toMessageResponse(message);
        chatRealtimePublisher.publishNewMessage(conversation.getId(), dto);
        return dto;
    }

    private ChatDtos.MessageResponse toMessageResponse(MessageEntity message) {
        return new ChatDtos.MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().name(),
                message.getContent(),
                message.getCreatedAt()
        );
    }

    private ChatDtos.ConversationSummaryResponse toCustomerSummary(ConversationEntity c) {
        return new ChatDtos.ConversationSummaryResponse(
                c.getId(),
                c.getStatus().name(),
                c.getCreatedAt(),
                null,
                null
        );
    }

    private ChatDtos.ConversationSummaryResponse toAdminSummary(ConversationEntity c) {
        UserEntity customer = c.getCustomer();
        return new ChatDtos.ConversationSummaryResponse(
                c.getId(),
                c.getStatus().name(),
                c.getCreatedAt(),
                customer.getEmail(),
                customer.getFullName()
        );
    }

    private UserEntity requireCustomerUser(String email) {
        UserEntity user = userJpaRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getRole() != Role.USER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Customer chat is only available for user accounts");
        }
        return user;
    }

    private UserEntity requireAdminUser(String email) {
        UserEntity user = userJpaRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return user;
    }
}
