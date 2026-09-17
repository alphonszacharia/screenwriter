package com.screenwriter.controller;

import com.screenwriter.dto.LoginRequest;
import com.screenwriter.dto.LoginResponse;
import com.screenwriter.dto.RegisterRequest;
import com.screenwriter.dto.UserResponse;
import com.screenwriter.entity.User;
import com.screenwriter.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.registerUser(request);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        String token = userService.loginUser(request);

        User user = userService
                .findByUsername(request.getUsername());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getUsername(),
                token
        );

        return ResponseEntity.ok(response);
    }
    @GetMapping("/profile")
    public ResponseEntity<String> profile(
            org.springframework.security.core.Authentication authentication) {

        String username = authentication.getName();

        return ResponseEntity.ok(
                "Welcome " + username + "! You are authenticated."
        );
    }
}