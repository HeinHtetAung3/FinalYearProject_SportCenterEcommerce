package com.sportsecommerce.websocket;

import com.sportsecommerce.entity.ConversationEntity;
import com.sportsecommerce.entity.Role;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.repository.ConversationJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.security.JwtService;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String TOPIC_PREFIX = "/topic/conversations/";

    private final JwtService jwtService;
    private final UserJpaRepository userJpaRepository;
    private final ConversationJpaRepository conversationJpaRepository;

    public StompAuthChannelInterceptor(
            JwtService jwtService,
            UserJpaRepository userJpaRepository,
            ConversationJpaRepository conversationJpaRepository) {
        this.jwtService = jwtService;
        this.userJpaRepository = userJpaRepository;
        this.conversationJpaRepository = conversationJpaRepository;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String raw = firstNativeHeader(accessor, "Authorization");
            if (raw == null || !raw.startsWith("Bearer ")) {
                throw new AccessDeniedException("Missing or invalid Authorization header");
            }
            String token = raw.substring(7).trim();
            String email = jwtService.extractSubject(token);
            if (!jwtService.isAccessTokenValid(token, email)) {
                throw new AccessDeniedException("Invalid token");
            }
            String role = normalizeRole(jwtService.extractRole(token));
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    email.trim().toLowerCase(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            accessor.setUser(auth);
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String dest = accessor.getDestination();
            if (dest != null && dest.startsWith(TOPIC_PREFIX)) {
                String suffix = dest.substring(TOPIC_PREFIX.length());
                long conversationId;
                try {
                    conversationId = Long.parseLong(suffix);
                } catch (NumberFormatException e) {
                    throw new AccessDeniedException("Invalid topic");
                }
                Authentication authentication = (Authentication) accessor.getUser();
                if (authentication == null) {
                    throw new AccessDeniedException("Not authenticated");
                }
                String email = authentication.getName();
                UserEntity user = userJpaRepository.findByEmailIgnoreCase(email)
                        .orElseThrow(() -> new AccessDeniedException("User not found"));
                if (user.getRole() == Role.ADMIN) {
                    return message;
                }
                ConversationEntity conversation = conversationJpaRepository.findWithCustomerById(conversationId)
                        .orElseThrow(() -> new AccessDeniedException("Conversation not found"));
                if (!conversation.getCustomer().getId().equals(user.getId())) {
                    throw new AccessDeniedException("Not allowed to subscribe to this conversation");
                }
            }
            return message;
        }

        return message;
    }

    private static String firstNativeHeader(StompHeaderAccessor accessor, String name) {
        List<String> headers = accessor.getNativeHeader(name);
        if (headers == null || headers.isEmpty()) {
            return null;
        }
        return Optional.ofNullable(headers.getFirst()).map(String::trim).filter(s -> !s.isEmpty()).orElse(null);
    }

    private static String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "USER";
        }
        String r = role.trim().toUpperCase();
        if (r.startsWith("ROLE_")) {
            r = r.substring("ROLE_".length());
        }
        return r;
    }
}
