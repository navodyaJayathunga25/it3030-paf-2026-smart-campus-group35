package com.smartcampus.backend.security;

import com.smartcampus.backend.model.Notification.NotificationType;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.model.UserStatus;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String providerId = (String) attributes.get("sub");

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Register new user from OAuth2
            user = User.builder()
                .email(email)
                .name(name)
                .picture(picture)
                .provider(provider)
                .providerId(providerId)
                .role(UserRole.USER)
                .status(UserStatus.PENDING)
                .active(false)
                .build();
            user = userRepository.save(user);
            log.info("New OAuth2 user registered (pending approval): {}", email);

            notificationService.notifyAdmins(
                NotificationType.USER,
                "New signup awaiting approval",
                name + " (" + email + ") signed up and is waiting for role assignment.",
                user.getId(),
                "/admin/users"
            );
        } else {
            // Update existing user's profile
            user.setName(name);
            user.setPicture(picture);
            if (user.getProvider() == null) {
                user.setProvider(provider);
                user.setProviderId(providerId);
            }
            user = userRepository.save(user);
        }

        return new DefaultOAuth2User(
            oAuth2User.getAuthorities(),
            attributes,
            "sub"
        );
    }
}

