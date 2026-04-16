package com.smartcampus.backend.security;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

        String token = jwtTokenProvider.generateToken(
            user.getId(),
            user.getEmail(),
            user.getRole().name()
        );

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
            .queryParam("token", token)
            .build().toUriString();

        log.info("OAuth2 login successful for user: {}", email);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

