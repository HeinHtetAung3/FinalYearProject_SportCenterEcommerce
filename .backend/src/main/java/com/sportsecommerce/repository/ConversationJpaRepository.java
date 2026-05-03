package com.sportsecommerce.repository;

import com.sportsecommerce.entity.ConversationEntity;
import com.sportsecommerce.entity.ConversationStatus;
import com.sportsecommerce.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationJpaRepository extends JpaRepository<ConversationEntity, Long> {

    Optional<ConversationEntity> findByCustomerAndStatus(UserEntity customer, ConversationStatus status);

    List<ConversationEntity> findByCustomerOrderByCreatedAtDesc(UserEntity customer);

    @Query("""
            SELECT c FROM ConversationEntity c
            JOIN FETCH c.customer
            ORDER BY c.createdAt DESC
            """)
    List<ConversationEntity> findAllForAdminWithCustomer();

    @Query("""
            SELECT c FROM ConversationEntity c
            JOIN FETCH c.customer
            WHERE c.id = :id
            """)
    Optional<ConversationEntity> findWithCustomerById(@Param("id") Long id);
}
