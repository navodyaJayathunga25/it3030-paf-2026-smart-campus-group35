package com.smartcampus.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.error("OAuth2 authentication failed: {}", exception.getMessage());

        String errorMessage = exception.getLocalizedMessage();
        String normalized = exception.getMessage() == null ? "" : exception.getMessage().toLowerCase();
        if (normalized.contains("invalid_token_response") || normalized.contains("invalid_grant") || normalized.contains("invalid_client")) {
            errorMessage = "Google OAuth configuration error. Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and authorized redirect URI http://localhost:8080/login/oauth2/code/google in Google Cloud Console.";
        }

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/error")
            .queryParam("error", errorMessage)
            .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

