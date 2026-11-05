package com.civicpulse.backend.service;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:no-reply@civicpulse.com}")
    private String fromEmail;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendStatusUpdateEmail(String toEmail, String userName, String issueTitle,
                                       String oldStatus, String newStatus) {
        if (!mailEnabled) {
            log.debug("Email notifications disabled. Skipping email to: {}", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CivicPulse — Issue Status Updated: " + issueTitle);
            message.setText(buildEmailBody(userName, issueTitle, oldStatus, newStatus));

            mailSender.send(message);
            log.info("Status update email sent to: {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send status update email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private String buildEmailBody(String userName, String issueTitle,
                                   String oldStatus, String newStatus) {
        return String.format(
                """
                Hello %s,

                Your reported civic issue has been updated.

                Issue: %s
                Previous Status: %s
                New Status: %s

                Thank you for helping improve your community!

                — CivicPulse Team
                """,
                userName, issueTitle, oldStatus, newStatus
        );
    }
}
