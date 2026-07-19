package com.carbontrack.config;

import com.carbontrack.entity.Role;
import com.carbontrack.entity.User;
import com.carbontrack.repository.UserRepository;
import com.carbontrack.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByUsername("admin").orElse(null);

        if (admin == null) {
            System.out.println("[Admin Init] No platform admin user found. Initializing default admin user...");
            admin = User.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .organization(organizationRepository.findAll().stream().findFirst().orElse(null))
                    .build();
            userRepository.save(admin);
            System.out.println("[Admin Init] Default platform admin user created successfully! Username: 'admin', Password: 'admin123'");
        } else {
            if (admin.getOrganization() == null) {
                System.out.println("[Admin Init] Admin user exists but has no organization. Assigning default organization...");
                admin.setOrganization(organizationRepository.findAll().stream().findFirst().orElse(null));
                userRepository.save(admin);
            }
            System.out.println("[Admin Init] Platform admin user already exists and is configured.");
        }
    }
}
