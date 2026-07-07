package com.carbontrack.service;

import com.carbontrack.config.JwtService;
import com.carbontrack.dto.AuthResponse;
import com.carbontrack.dto.LoginRequest;
import com.carbontrack.dto.RegisterRequest;
import com.carbontrack.entity.Organization;
import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.repository.OrganizationRepository;
import com.carbontrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (Role.ADMIN.equals(request.getRole())) {
            throw new IllegalArgumentException("Registration for Platform Admin role is not allowed");
        }

        Organization org = null;
        if (request.getInviteCode() != null && !request.getInviteCode().isBlank()) {
            org = organizationRepository.findByInviteCode(request.getInviteCode())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid organization invite code"));
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .organization(org)
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .organizationName(org != null ? org.getName() : null)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .build();
    }

    public AuthResponse refresh(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        if (username == null) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Expired or invalid refresh token");
        }

        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(com.carbontrack.dto.GoogleLoginRequest request) {
        String idToken = request.getIdToken();
        
        // Decode the Google JWT to extract sub (Google User ID) and email
        String googleSub = null;
        String email = null;
        String name = null;
        
        try {
            // JWT has 3 parts: header.payload.signature
            String[] parts = idToken.split("\\.");
            if (parts.length >= 2) {
                String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                // Simple JSON parsing without external library
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode json = mapper.readTree(payload);
                
                googleSub = json.has("sub") ? json.get("sub").asText() : null;
                email = json.has("email") ? json.get("email").asText() : null;
                name = json.has("name") ? json.get("name").asText() : null;
            }
        } catch (Exception e) {
            // If decoding fails, use the token as-is (fallback for mock tokens)
            googleSub = idToken;
        }
        
        // Fallback if sub extraction failed
        if (googleSub == null || googleSub.isBlank()) {
            googleSub = idToken.length() > 200 ? idToken.substring(0, 200) : idToken;
        }
        
        // Resolve username from email or name
        String baseUsername = email != null ? email.split("@")[0] 
                           : name != null ? name.replaceAll("\\s+", "_").toLowerCase()
                           : "google_user";
        
        final String finalGoogleSub = googleSub;
        
        // Find or create User by googleId (stored as the short 'sub' value)
        User user = userRepository.findByGoogleId(finalGoogleSub)
                .orElseGet(() -> {
                    // Make sure username doesn't conflict
                    String resolvedUsername = baseUsername;
                    int count = 1;
                    while (userRepository.existsByUsername(resolvedUsername)) {
                        resolvedUsername = baseUsername + "_" + count++;
                    }

                    User newUser = User.builder()
                            .username(resolvedUsername)
                            .googleId(finalGoogleSub)
                            .role(Role.USER)
                            .preferredUnit("METRIC")
                            .goalsVisible(true)
                            .build();
                    return userRepository.save(newUser);
                });

        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .organizationName(user.getOrganization() != null ? user.getOrganization().getName() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public com.carbontrack.dto.UserProfileDto getProfile(User user) {
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return com.carbontrack.dto.UserProfileDto.builder()
                .username(persistentUser.getUsername())
                .preferredUnit(persistentUser.getPreferredUnit())
                .goalsVisible(persistentUser.getGoalsVisible())
                .organizationName(persistentUser.getOrganization() != null ? persistentUser.getOrganization().getName() : null)
                .role(persistentUser.getRole().name())
                .build();
    }

    @Transactional
    public com.carbontrack.dto.UserProfileDto updateProfile(User user, com.carbontrack.dto.UserProfileDto dto) {
        User persistentUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (dto.getPreferredUnit() != null) {
            persistentUser.setPreferredUnit(dto.getPreferredUnit());
        }
        if (dto.getGoalsVisible() != null) {
            persistentUser.setGoalsVisible(dto.getGoalsVisible());
        }
        
        User saved = userRepository.save(persistentUser);
        return com.carbontrack.dto.UserProfileDto.builder()
                .username(saved.getUsername())
                .preferredUnit(saved.getPreferredUnit())
                .goalsVisible(saved.getGoalsVisible())
                .organizationName(saved.getOrganization() != null ? saved.getOrganization().getName() : null)
                .role(saved.getRole().name())
                .build();
    }
}
