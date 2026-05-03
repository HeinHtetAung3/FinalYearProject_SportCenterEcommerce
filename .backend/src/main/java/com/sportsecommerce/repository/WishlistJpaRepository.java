package com.sportsecommerce.repository;

import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.entity.WishlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistJpaRepository extends JpaRepository<WishlistEntity, Long> {

    List<WishlistEntity> findByUserOrderByCreatedAtDesc(UserEntity user);

    Optional<WishlistEntity> findByUserAndProductId(UserEntity user, Long productId);

    void deleteByUserAndProductId(UserEntity user, Long productId);

    int countByUser(UserEntity user);
}
