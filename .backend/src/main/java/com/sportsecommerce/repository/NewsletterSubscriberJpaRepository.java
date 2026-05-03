package com.sportsecommerce.repository;

import com.sportsecommerce.entity.NewsletterSubscriberEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NewsletterSubscriberJpaRepository extends JpaRepository<NewsletterSubscriberEntity, Long> {

    Optional<NewsletterSubscriberEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
