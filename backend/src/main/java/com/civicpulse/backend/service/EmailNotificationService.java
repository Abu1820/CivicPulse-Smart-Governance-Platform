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

    public boolean isMailEnabled() {
        return mailEnabled;
    }

    @Async
    public void sendVerificationEmail(String toEmail, String userName, String code) {
        log.info("==================================================================");
        log.info("📧 EMAIL VERIFICATION CODE FOR [{}] ({}): {}", userName, toEmail, code);
        log.info("==================================================================");

        if (!mailEnabled) {
            log.info("SMTP mail sending is disabled (app.mail.enabled=false). Code logged above.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CivicPulse — Verify Your Email Address");
            message.setText(String.format(
                    """
                    Hello %s,

                    Welcome to CivicPulse!

                    Your 6-digit email verification code is:

                        %s

                    This code is valid for 15 minutes. Please enter it in the app to activate your account.

                    If you did not sign up for CivicPulse, please ignore this email.

                    — CivicPulse Smart Governance Team
                    """,
                    userName, code
            ));

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send verification email to {}: {}", toEmail, ex.getMessage());
        }
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
