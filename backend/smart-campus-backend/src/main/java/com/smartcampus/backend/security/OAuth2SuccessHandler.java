package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        String email = null;
        String name = null;
        String picture = null;
        String providerId = null;

        if (authentication.getPrincipal() instanceof DefaultOidcUser oidcUser) {
            email = oidcUser.getEmail();
            name = oidcUser.getFullName();
            picture = oidcUser.getPicture();
            providerId = oidcUser.getSubject();
        } else if (authentication.getPrincipal() instanceof DefaultOAuth2User oAuth2User) {
            Map<String, Object> attributes = oAuth2User.getAttributes();
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            picture = (String) attributes.get("picture");
            providerId = String.valueOf(attributes.get("sub"));
        }

        if (email == null) {
            log.error("OAuth2 login failed: could not extract email from principal");
            response.sendRedirect(frontendUrl + "/login?error=oauth2_failed");
            return;
        }

        final String finalEmail = email;
        final String finalName = name;
        final String finalPicture = picture;
        final String finalProviderId = providerId;

        String registrationId = "google";
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            registrationId = oauthToken.getAuthorizedClientRegistrationId();
        }

        User.Provider provider = User.Provider.GOOGLE;

        Optional<User> existingUser = userRepository.findByEmail(finalEmail);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update OAuth info if needed
            if (user.getProvider() == User.Provider.LOCAL) {
                user.setProvider(provider);
                user.setProviderId(finalProviderId);
            }
            if (finalPicture != null && user.getAvatar() == null) {
                user.setAvatar(finalPicture);
            }
            user.setUpdatedAt(Instant.now());
            user = userRepository.save(user);
        } else {
            // Create new user
            user = User.builder()
                    .name(finalName != null ? finalName : finalEmail.split("@")[0])
                    .email(finalEmail)
                    .role(User.Role.USER)
                    .avatar(finalPicture)
                    .provider(provider)
                    .providerId(finalProviderId)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user);
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + token;

        log.info("OAuth2 login successful for user: {}, redirecting to frontend", finalEmail);
        response.sendRedirect(redirectUrl);
    }
}
