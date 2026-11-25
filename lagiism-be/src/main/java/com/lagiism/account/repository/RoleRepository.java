package com.lagiism.account.repository;

import com.lagiism.account.entity.Role;
import com.lagiism.account.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
