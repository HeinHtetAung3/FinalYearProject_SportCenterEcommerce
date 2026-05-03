package com.sportsecommerce.repository;

import com.sportsecommerce.entity.UserAddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAddressJpaRepository extends JpaRepository<UserAddressEntity, Long> {

    List<UserAddressEntity> findByUser_IdOrderByDefaultShippingDescIdAsc(Long userId);

    List<UserAddressEntity> findByUser_IdOrderByIdAsc(Long userId);

    long countByUser_Id(Long userId);

    Optional<UserAddressEntity> findFirstByUser_IdAndDefaultShippingTrue(Long userId);

    @Modifying
    @Query("UPDATE UserAddressEntity u SET u.defaultShipping = false WHERE u.user.id = :userId")
    void clearDefaultForUser(@Param("userId") Long userId);
}
