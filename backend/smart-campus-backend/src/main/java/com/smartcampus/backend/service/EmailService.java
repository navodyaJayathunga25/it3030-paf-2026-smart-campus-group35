package com.smartcampus.backend.service;

import com.smartcampus.backend.model.UserRole;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.mail.enabled:true}")
    private boolean enabled;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(@Nullable JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    void logMailState() {
        log.info("EmailService initialised — enabled={}, mailSender present={}, from={}",
            enabled, mailSender != null, fromAddress);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String name, UserRole role) {
        log.info("sendWelcomeEmail invoked for {} (role={}) — enabled={}, mailSender={}",
            toEmail, role, enabled, mailSender != null ? "present" : "NULL");
        if (!enabled || mailSender == null) {
            log.warn("Mail disabled or JavaMailSender missing — skipping welcome email to {}. " +
                "Check that spring-boot-starter-mail is on the classpath (Maven reload) and app.mail.enabled=true.", toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(toEmail);
            helper.setSubject("Welcome to SmartCampus — your account has been approved");
            helper.setText(buildWelcomeHtml(name, role), true);

            mailSender.send(message);
            log.info("Welcome email sent to {} (role={})", toEmail, role);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildWelcomeHtml(String name, UserRole role) {
        String loginUrl = frontendUrl + "/login";
        String roleLabel = prettyRole(role);
        String roleDescription = roleDescription(role);
        String safeName = escape(name);
        String firstName = safeName.contains(" ") ? safeName.substring(0, safeName.indexOf(' ')) : safeName;

        return "<!doctype html>"
            + "<html lang=\"en\"><head><meta charset=\"utf-8\"/>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
            + "<meta name=\"color-scheme\" content=\"light\"/>"
            + "<title>Welcome to SmartCampus</title></head>"
            + "<body style=\"margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;\">"
            + "<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;\">Your SmartCampus account has been approved. Sign in to get started.</div>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#eef2f7;padding:40px 16px;\">"
            + "<tr><td align=\"center\">"

            // Brand row above the card
            + "<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;margin-bottom:16px;\">"
            + "<tr><td style=\"padding:0 4px 12px;\">"
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr>"
            + "<td style=\"vertical-align:middle;\">"
            + "<div style=\"width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);color:#ffffff;font-weight:700;font-size:16px;text-align:center;line-height:36px;\">SC</div>"
            + "</td>"
            + "<td style=\"vertical-align:middle;padding-left:10px;font-size:15px;font-weight:600;color:#0f172a;letter-spacing:0.2px;\">SmartCampus</td>"
            + "</tr></table>"
            + "</td></tr></table>"

            // Main card
            + "<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;\">"

            // Accent bar
            + "<tr><td style=\"height:4px;background:linear-gradient(90deg,#2563eb 0%,#4f46e5 100%);font-size:0;line-height:0;\">&nbsp;</td></tr>"

            // Hero
            + "<tr><td style=\"padding:40px 40px 8px;text-align:left;\">"
            + "<p style=\"margin:0 0 8px;font-size:12px;font-weight:700;color:#2563eb;letter-spacing:1.2px;text-transform:uppercase;\">Account Approved</p>"
            + "<h1 style=\"margin:0 0 12px;color:#0f172a;font-size:26px;line-height:1.3;font-weight:700;\">Welcome to SmartCampus, " + firstName + ".</h1>"
            + "<p style=\"margin:0;font-size:15px;line-height:1.6;color:#475569;\">"
            + "Your administrator has reviewed and approved your registration. Your account is now active and ready to use."
            + "</p>"
            + "</td></tr>"

            // Account details
            + "<tr><td style=\"padding:24px 40px 8px;\">"
            + "<p style=\"margin:0 0 10px;font-size:12px;font-weight:600;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;\">Account details</p>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #e2e8f0;border-radius:10px;\">"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:35%;\">Name</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:500;\">" + safeName + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;\">Role</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;\">"
            + "<span style=\"display:inline-block;background:" + roleBadgeBg(role) + ";color:" + roleBadgeFg(role) + ";border:1px solid " + roleBadgeBorder(role) + ";border-radius:999px;padding:3px 11px;font-size:12px;font-weight:600;letter-spacing:0.3px;\">"
            + roleLabel + "</span>"
            + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;font-size:13px;color:#64748b;vertical-align:top;\">Access</td>"
            + "<td style=\"padding:14px 18px;font-size:13px;color:#475569;line-height:1.55;\">" + roleDescription + "</td></tr>"
            + "</table>"
            + "</td></tr>"

            // CTA
            + "<tr><td style=\"padding:28px 40px 8px;\">"
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"border-radius:10px;background:#2563eb;\">"
            + "<a href=\"" + loginUrl + "\" style=\"display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 30px;border-radius:10px;\">Sign in to your account &rarr;</a>"
            + "</td></tr></table>"
            + "<p style=\"margin:14px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;\">"
            + "Or paste this link into your browser: <a href=\"" + loginUrl + "\" style=\"color:#2563eb;text-decoration:none;word-break:break-all;\">" + loginUrl + "</a>"
            + "</p>"
            + "</td></tr>"

            // Divider
            + "<tr><td style=\"padding:28px 40px 0;\"><div style=\"height:1px;background:#e2e8f0;font-size:0;line-height:0;\">&nbsp;</div></td></tr>"

            // Getting started
            + "<tr><td style=\"padding:24px 40px 36px;\">"
            + "<p style=\"margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;\">Getting started</p>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"
            + gettingStartedRow("1", "Sign in with the Google account used during registration.")
            + gettingStartedRow("2", "Complete your profile and review your dashboard.")
            + gettingStartedRow("3", "Explore the features available to your role.")
            + "</table>"
            + "</td></tr>"

            // Footer
            + "<tr><td style=\"background:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 40px;\">"
            + "<p style=\"margin:0 0 4px;font-size:12px;color:#64748b;line-height:1.6;\">"
            + "Need help? Contact your campus administrator — they can answer questions about your access and role."
            + "</p>"
            + "<p style=\"margin:0;font-size:11px;color:#94a3b8;line-height:1.6;\">"
            + "This is an automated message from SmartCampus. If you didn't request this account, please reply to let us know."
            + "</p>"
            + "</td></tr>"

            + "</table>"

            // Legal line under card
            + "<p style=\"margin:16px 0 0;font-size:11px;color:#94a3b8;\">&copy; SmartCampus &middot; Campus operations platform</p>"

            + "</td></tr></table>"
            + "</body></html>";
    }

    @Async
    public void sendTicketReceivedEmail(String toEmail, String userName, String ticketId,
                                        String category, String description) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("sendTicketReceivedEmail skipped — no recipient email for ticket {}", ticketId);
            return;
        }
        if (!enabled || mailSender == null) {
            log.warn("Mail disabled or JavaMailSender missing — skipping ticket email to {}", toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(toEmail);
            helper.setSubject("We've received your ticket — SmartCampus #" + shortId(ticketId));
            helper.setText(buildTicketReceivedHtml(userName, ticketId, category, description), true);

            mailSender.send(message);
            log.info("Ticket-received email sent to {} for ticket {}", toEmail, ticketId);
        } catch (Exception e) {
            log.error("Failed to send ticket-received email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildTicketReceivedHtml(String userName, String ticketId, String category, String description) {
        String ticketUrl = frontendUrl + "/tickets/" + ticketId;
        String safeName = escape(userName);
        String firstName = safeName.contains(" ") ? safeName.substring(0, safeName.indexOf(' ')) : safeName;
        String safeCategory = escape(category == null ? "—" : category);
        String safeDescription = escape(description == null ? "" : description);
        String shortId = shortId(ticketId);

        return "<!doctype html>"
            + "<html lang=\"en\"><head><meta charset=\"utf-8\"/>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
            + "<title>Ticket received</title></head>"
            + "<body style=\"margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#eef2f7;padding:40px 16px;\">"
            + "<tr><td align=\"center\">"
            + "<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;\">"
            + "<tr><td style=\"height:4px;background:linear-gradient(90deg,#2563eb 0%,#4f46e5 100%);font-size:0;line-height:0;\">&nbsp;</td></tr>"
            + "<tr><td style=\"padding:40px 40px 8px;\">"
            + "<p style=\"margin:0 0 8px;font-size:12px;font-weight:700;color:#2563eb;letter-spacing:1.2px;text-transform:uppercase;\">Ticket Received</p>"
            + "<h1 style=\"margin:0 0 12px;color:#0f172a;font-size:24px;line-height:1.3;font-weight:700;\">Hi " + firstName + ", we're on it.</h1>"
            + "<p style=\"margin:0;font-size:15px;line-height:1.6;color:#475569;\">"
            + "Thanks for reaching out. Our team has received your ticket and is reviewing it. Please allow up to <strong>2 business days</strong> for us to look into the issue and get back to you."
            + "</p>"
            + "</td></tr>"
            + "<tr><td style=\"padding:24px 40px 8px;\">"
            + "<p style=\"margin:0 0 10px;font-size:12px;font-weight:600;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;\">Ticket details</p>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #e2e8f0;border-radius:10px;\">"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:35%;\">Reference</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;\">#" + shortId + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;\">Category</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;\">" + safeCategory + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;font-size:13px;color:#64748b;vertical-align:top;\">Description</td>"
            + "<td style=\"padding:14px 18px;font-size:13px;color:#475569;line-height:1.55;\">" + safeDescription + "</td></tr>"
            + "</table>"
            + "</td></tr>"
            + "<tr><td style=\"padding:28px 40px 8px;\">"
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"border-radius:10px;background:#2563eb;\">"
            + "<a href=\"" + ticketUrl + "\" style=\"display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 30px;border-radius:10px;\">View your ticket &rarr;</a>"
            + "</td></tr></table>"
            + "</td></tr>"
            + "<tr><td style=\"padding:28px 40px 0;\"><div style=\"height:1px;background:#e2e8f0;font-size:0;line-height:0;\">&nbsp;</div></td></tr>"
            + "<tr><td style=\"padding:24px 40px 32px;\">"
            + "<p style=\"margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;\">Haven't heard back after 2 days?</p>"
            + "<p style=\"margin:0;font-size:13px;line-height:1.65;color:#475569;\">"
            + "If you don't receive an update within 2 business days, please contact the <strong>University Service Section</strong> directly at "
            + "<a href=\"tel:0774646464\" style=\"color:#2563eb;text-decoration:none;font-weight:600;\">0774646464</a> and quote reference <strong>#" + shortId + "</strong>."
            + "</p>"
            + "</td></tr>"
            + "<tr><td style=\"background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;\">"
            + "<p style=\"margin:0;font-size:11px;color:#94a3b8;line-height:1.6;\">"
            + "This is an automated confirmation from SmartCampus. Please do not reply to this email."
            + "</p>"
            + "</td></tr>"
            + "</table>"
            + "<p style=\"margin:16px 0 0;font-size:11px;color:#94a3b8;\">&copy; SmartCampus &middot; Campus operations platform</p>"
            + "</td></tr></table></body></html>";
    }

    @Async
    public void sendTicketResolvedEmail(String toEmail, String userName, String ticketId,
                                        String category, String resolutionNotes, boolean closed) {
        if (toEmail == null || toEmail.isBlank()) return;
        if (!enabled || mailSender == null) {
            log.warn("Mail disabled or JavaMailSender missing — skipping resolved email to {}", toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(toEmail);
            String subject = closed
                ? "Your ticket is closed — SmartCampus #" + shortId(ticketId)
                : "Your ticket has been resolved — SmartCampus #" + shortId(ticketId);
            helper.setSubject(subject);
            helper.setText(buildTicketResolvedHtml(userName, ticketId, category, resolutionNotes, closed), true);
            mailSender.send(message);
            log.info("Ticket-resolved email sent to {} for ticket {} (closed={})", toEmail, ticketId, closed);
        } catch (Exception e) {
            log.error("Failed to send ticket-resolved email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Async
    public void sendTicketRejectedEmail(String toEmail, String userName, String ticketId,
                                        String category, String rejectionReason) {
        if (toEmail == null || toEmail.isBlank()) return;
        if (!enabled || mailSender == null) {
            log.warn("Mail disabled or JavaMailSender missing — skipping rejected email to {}", toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(toEmail);
            helper.setSubject("Update on your ticket — SmartCampus #" + shortId(ticketId));
            helper.setText(buildTicketRejectedHtml(userName, ticketId, category, rejectionReason), true);
            mailSender.send(message);
            log.info("Ticket-rejected email sent to {} for ticket {}", toEmail, ticketId);
        } catch (Exception e) {
            log.error("Failed to send ticket-rejected email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildTicketResolvedHtml(String userName, String ticketId, String category,
                                           String resolutionNotes, boolean closed) {
        String ticketUrl = frontendUrl + "/tickets/" + ticketId;
        String safeName = escape(userName);
        String firstName = safeName.contains(" ") ? safeName.substring(0, safeName.indexOf(' ')) : safeName;
        String safeCategory = escape(category == null ? "—" : category);
        String safeNotes = escape(resolutionNotes == null || resolutionNotes.isBlank()
            ? "No additional notes were provided."
            : resolutionNotes);
        String shortId = shortId(ticketId);
        String badgeLabel = closed ? "Ticket Closed" : "Ticket Resolved";
        String heading = closed
            ? "All done — your ticket is closed."
            : "Good news — your issue has been resolved.";
        String intro = closed
            ? "Your ticket has been completed and marked as closed. Thank you for helping us keep the campus running smoothly."
            : "Our team has resolved the issue you reported. If everything looks good on your side, no further action is needed — the ticket will be closed shortly.";

        return "<!doctype html>"
            + "<html lang=\"en\"><head><meta charset=\"utf-8\"/>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
            + "<title>" + badgeLabel + "</title></head>"
            + "<body style=\"margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#eef2f7;padding:40px 16px;\">"
            + "<tr><td align=\"center\">"
            + "<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;\">"
            + "<tr><td style=\"height:4px;background:linear-gradient(90deg,#059669 0%,#10b981 100%);font-size:0;line-height:0;\">&nbsp;</td></tr>"
            + "<tr><td style=\"padding:40px 40px 8px;\">"
            + "<p style=\"margin:0 0 8px;font-size:12px;font-weight:700;color:#059669;letter-spacing:1.2px;text-transform:uppercase;\">" + badgeLabel + "</p>"
            + "<h1 style=\"margin:0 0 12px;color:#0f172a;font-size:24px;line-height:1.3;font-weight:700;\">Hi " + firstName + ", " + heading + "</h1>"
            + "<p style=\"margin:0;font-size:15px;line-height:1.6;color:#475569;\">" + intro + "</p>"
            + "</td></tr>"
            + "<tr><td style=\"padding:24px 40px 8px;\">"
            + "<p style=\"margin:0 0 10px;font-size:12px;font-weight:600;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;\">Summary</p>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #e2e8f0;border-radius:10px;\">"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:35%;\">Reference</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;\">#" + shortId + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;\">Category</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;\">" + safeCategory + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;\">Status</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;\">"
            + "<span style=\"display:inline-block;background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;border-radius:999px;padding:3px 11px;font-size:12px;font-weight:600;\">"
            + (closed ? "Closed" : "Resolved") + "</span>"
            + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;font-size:13px;color:#64748b;vertical-align:top;\">Resolution</td>"
            + "<td style=\"padding:14px 18px;font-size:13px;color:#475569;line-height:1.55;\">" + safeNotes + "</td></tr>"
            + "</table>"
            + "</td></tr>"
            + "<tr><td style=\"padding:28px 40px 8px;\">"
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"border-radius:10px;background:#059669;\">"
            + "<a href=\"" + ticketUrl + "\" style=\"display:inline-block;background:linear-gradient(135deg,#059669 0%,#10b981 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 30px;border-radius:10px;\">View ticket details &rarr;</a>"
            + "</td></tr></table>"
            + "</td></tr>"
            + "<tr><td style=\"padding:28px 40px 0;\"><div style=\"height:1px;background:#e2e8f0;font-size:0;line-height:0;\">&nbsp;</div></td></tr>"
            + "<tr><td style=\"padding:24px 40px 32px;\">"
            + "<p style=\"margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;\">Thank you for reaching out.</p>"
            + "<p style=\"margin:0 0 10px;font-size:13px;line-height:1.65;color:#475569;\">"
            + "Reports like yours help us keep the campus running well. If the issue returns or you have feedback on how it was handled, reply to this email or open a new ticket anytime."
            + "</p>"
            + "<p style=\"margin:0;font-size:13px;line-height:1.65;color:#475569;\">"
            + "Still need help? Contact the <strong>University Service Section</strong> at "
            + "<a href=\"tel:0774646464\" style=\"color:#2563eb;text-decoration:none;font-weight:600;\">0774646464</a> with reference <strong>#" + shortId + "</strong>."
            + "</p>"
            + "</td></tr>"
            + "<tr><td style=\"background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;\">"
            + "<p style=\"margin:0;font-size:11px;color:#94a3b8;line-height:1.6;\">"
            + "This is an automated message from SmartCampus. Please do not reply to this email."
            + "</p>"
            + "</td></tr>"
            + "</table>"
            + "<p style=\"margin:16px 0 0;font-size:11px;color:#94a3b8;\">&copy; SmartCampus &middot; Campus operations platform</p>"
            + "</td></tr></table></body></html>";
    }

    private String buildTicketRejectedHtml(String userName, String ticketId, String category, String rejectionReason) {
        String ticketUrl = frontendUrl + "/tickets/" + ticketId;
        String safeName = escape(userName);
        String firstName = safeName.contains(" ") ? safeName.substring(0, safeName.indexOf(' ')) : safeName;
        String safeCategory = escape(category == null ? "—" : category);
        String safeReason = escape(rejectionReason == null || rejectionReason.isBlank()
            ? "No reason was provided."
            : rejectionReason);
        String shortId = shortId(ticketId);

        return "<!doctype html>"
            + "<html lang=\"en\"><head><meta charset=\"utf-8\"/>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
            + "<title>Ticket update</title></head>"
            + "<body style=\"margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;\">"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#eef2f7;padding:40px 16px;\">"
            + "<tr><td align=\"center\">"
            + "<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;\">"
            + "<tr><td style=\"height:4px;background:linear-gradient(90deg,#b91c1c 0%,#ef4444 100%);font-size:0;line-height:0;\">&nbsp;</td></tr>"
            + "<tr><td style=\"padding:40px 40px 8px;\">"
            + "<p style=\"margin:0 0 8px;font-size:12px;font-weight:700;color:#b91c1c;letter-spacing:1.2px;text-transform:uppercase;\">Ticket Update</p>"
            + "<h1 style=\"margin:0 0 12px;color:#0f172a;font-size:24px;line-height:1.3;font-weight:700;\">Hi " + firstName + ", we weren't able to proceed.</h1>"
            + "<p style=\"margin:0;font-size:15px;line-height:1.6;color:#475569;\">"
            + "After reviewing your request, our team wasn't able to take this ticket forward. The details are below so you know where things stand and what to do next."
            + "</p>"
            + "</td></tr>"
            + "<tr><td style=\"padding:24px 40px 8px;\">"
            + "<p style=\"margin:0 0 10px;font-size:12px;font-weight:600;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;\">Summary</p>"
            + "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border:1px solid #e2e8f0;border-radius:10px;\">"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;width:35%;\">Reference</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;font-weight:600;\">#" + shortId + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;\">Category</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;\">" + safeCategory + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;\">Status</td>"
            + "<td style=\"padding:14px 18px;border-bottom:1px solid #e2e8f0;\">"
            + "<span style=\"display:inline-block;background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:999px;padding:3px 11px;font-size:12px;font-weight:600;\">Rejected</span>"
            + "</td></tr>"
            + "<tr><td style=\"padding:14px 18px;font-size:13px;color:#64748b;vertical-align:top;\">Reason</td>"
            + "<td style=\"padding:14px 18px;font-size:13px;color:#475569;line-height:1.55;\">" + safeReason + "</td></tr>"
            + "</table>"
            + "</td></tr>"
            + "<tr><td style=\"padding:28px 40px 8px;\">"
            + "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\"><tr><td style=\"border-radius:10px;background:#2563eb;\">"
            + "<a href=\"" + ticketUrl + "\" style=\"display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 30px;border-radius:10px;\">View ticket details &rarr;</a>"
            + "</td></tr></table>"
            + "</td></tr>"
            + "<tr><td style=\"padding:28px 40px 0;\"><div style=\"height:1px;background:#e2e8f0;font-size:0;line-height:0;\">&nbsp;</div></td></tr>"
            + "<tr><td style=\"padding:24px 40px 32px;\">"
            + "<p style=\"margin:0 0 8px;font-size:14px;font-weight:600;color:#0f172a;\">What you can do next</p>"
            + "<p style=\"margin:0 0 10px;font-size:13px;line-height:1.65;color:#475569;\">"
            + "If you believe this was closed in error, or you have more information that could help us reconsider, you're welcome to submit a new ticket with the additional details."
            + "</p>"
            + "<p style=\"margin:0 0 10px;font-size:13px;line-height:1.65;color:#475569;\">"
            + "For urgent matters, please contact the <strong>University Service Section</strong> at "
            + "<a href=\"tel:0774646464\" style=\"color:#2563eb;text-decoration:none;font-weight:600;\">0774646464</a> with reference <strong>#" + shortId + "</strong>."
            + "</p>"
            + "<p style=\"margin:0;font-size:13px;line-height:1.65;color:#475569;\">"
            + "Thank you for reaching out — we appreciate you taking the time to report this."
            + "</p>"
            + "</td></tr>"
            + "<tr><td style=\"background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;\">"
            + "<p style=\"margin:0;font-size:11px;color:#94a3b8;line-height:1.6;\">"
            + "This is an automated message from SmartCampus. Please do not reply to this email."
            + "</p>"
            + "</td></tr>"
            + "</table>"
            + "<p style=\"margin:16px 0 0;font-size:11px;color:#94a3b8;\">&copy; SmartCampus &middot; Campus operations platform</p>"
            + "</td></tr></table></body></html>";
    }

    private String shortId(String id) {
        if (id == null) return "";
        String compact = id.replace("-", "");
        return compact.length() <= 7 ? compact.toUpperCase() : compact.substring(0, 7).toUpperCase();
    }

    private String gettingStartedRow(String num, String text) {
        return "<tr>"
            + "<td style=\"width:28px;vertical-align:top;padding:0 0 10px;\">"
            + "<div style=\"width:22px;height:22px;border-radius:50%;background:#eef2ff;color:#4f46e5;font-size:12px;font-weight:700;text-align:center;line-height:22px;\">" + num + "</div>"
            + "</td>"
            + "<td style=\"padding:2px 0 10px 10px;font-size:13px;color:#475569;line-height:1.6;\">" + text + "</td>"
            + "</tr>";
    }

    private String prettyRole(UserRole role) {
        return switch (role) {
            case ADMIN -> "Administrator";
            case TECHNICIAN -> "Technician";
            case LECTURER -> "Lecturer";
            case USER -> "Student / Staff";
        };
    }

    private String roleDescription(UserRole role) {
        return switch (role) {
            case ADMIN -> "You have full access — manage users, resources, bookings, and tickets across the campus.";
            case TECHNICIAN -> "You can view and resolve maintenance tickets assigned to you.";
            case LECTURER -> "You can book facilities, manage your reservations, and raise support tickets.";
            case USER -> "You can browse facilities, request bookings, and submit support tickets.";
        };
    }

    // Role badge colors — mirror the frontend roleBadgeStyles in AdminUsers.tsx
    private String roleBadgeBg(UserRole role) {
        return switch (role) {
            case ADMIN -> "#f3e8ff";       // purple-100
            case TECHNICIAN -> "#d1fae5";  // emerald-100
            case LECTURER -> "#fef3c7";    // amber-100
            case USER -> "#dbeafe";        // blue-100
        };
    }

    private String roleBadgeFg(UserRole role) {
        return switch (role) {
            case ADMIN -> "#6b21a8";       // purple-800
            case TECHNICIAN -> "#065f46";  // emerald-800
            case LECTURER -> "#92400e";    // amber-800
            case USER -> "#1e40af";        // blue-800
        };
    }

    private String roleBadgeBorder(UserRole role) {
        return switch (role) {
            case ADMIN -> "#e9d5ff";       // purple-200
            case TECHNICIAN -> "#a7f3d0";  // emerald-200
            case LECTURER -> "#fde68a";    // amber-200
            case USER -> "#bfdbfe";        // blue-200
        };
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
