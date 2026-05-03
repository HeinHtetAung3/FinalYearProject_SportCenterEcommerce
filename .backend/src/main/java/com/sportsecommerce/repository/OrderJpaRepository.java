package com.sportsecommerce.repository;

import com.sportsecommerce.entity.OrderEntity;
import com.sportsecommerce.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderJpaRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByUserOrderByCreatedAtDesc(UserEntity user);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();
}
