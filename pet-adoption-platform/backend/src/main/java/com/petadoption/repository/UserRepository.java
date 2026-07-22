package com.petadoption.repository;

import com.petadoption.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(String email, String password);

    List<User> findByRole(String role);

    List<User> findByUserType(String userType);

    List<User> findByActive(Boolean active);

    Optional<User> findByPhone(String phone);

    List<User> findByOrganizationName(String organizationName);

}
