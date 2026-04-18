package com.stockpulse.backend.service;

import com.stockpulse.backend.entity.UserEntity;
import com.stockpulse.backend.exception.ApiException;
import com.stockpulse.backend.repository.UserRepository;
import com.stockpulse.backend.security.JwtService;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EntityResponseMapper mapper;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EntityResponseMapper mapper
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    public Map<String, Object> signup(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "An account with this email already exists");
        }

        UserEntity user = new UserEntity();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user = userRepository.save(user);

        return authPayload(user, "Signup successful");
    }

    public Map<String, Object> login(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return authPayload(user, "Login successful");
    }

    private Map<String, Object> authPayload(UserEntity user, String message) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("message", message);
        map.put("token", jwtService.generateToken(user.getId(), user.getEmail()));
        map.put("user", mapper.user(user));
        return map;
    }
}
