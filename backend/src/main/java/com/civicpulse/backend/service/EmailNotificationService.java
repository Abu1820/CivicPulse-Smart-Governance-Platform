package com.civicpulse.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

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
        log.info("📧 Initiating email verification dispatch for [{}] to: {}", userName, toEmail);

        if (!mailEnabled) {
            log.warn("SMTP mail sending is disabled (app.mail.enabled=false). Please configure SMTP credentials to deliver emails.");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "CivicPulse Smart Governance");
            helper.setTo(toEmail);
            helper.setSubject("CivicPulse — Verify Your Email Address (" + code + ")");

            String htmlBody = buildVerificationHtml(userName, code);
            String plainText = String.format(
                    """
                    Hello %s,

                    Welcome to CivicPulse!

                    Your 6-digit email verification code is: %s

                    This code expires in 15 minutes. Please enter it in the app to activate your account.

                    If you did not sign up for CivicPulse, please ignore this email.

                    — CivicPulse Smart Governance Team
                    """,
                    userName, code
            );

            helper.setText(plainText, htmlBody);

            mailSender.send(mimeMessage);
            log.info("✅ Verification email successfully delivered via SMTP to: {}", toEmail);
        } catch (Exception ex) {
            log.error("❌ Failed to deliver verification email to {}: {}", toEmail, ex.getMessage());
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
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "CivicPulse Smart Governance");
            helper.setTo(toEmail);
            helper.setSubject("CivicPulse — Issue Status Updated: " + issueTitle);

            String htmlBody = buildStatusUpdateHtml(userName, issueTitle, oldStatus, newStatus);
            String plainText = String.format(
                    """
                    Hello %s,

                    Your reported civic issue has been updated:

                    Issue: %s
                    Previous Status: %s
                    New Status: %s

                    Thank you for helping improve your community!

                    — CivicPulse Team
                    """,
                    userName, issueTitle, oldStatus, newStatus
            );

            helper.setText(plainText, htmlBody);

            mailSender.send(mimeMessage);
            log.info("✅ Status update email sent via SMTP to: {}", toEmail);
        } catch (Exception ex) {
            log.error("❌ Failed to send status update email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private String buildVerificationHtml(String userName, String code) {
        return String.format(
                """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
                    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    .header { background: linear-gradient(135deg, #0d9488, #0f766e); padding: 28px 24px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
                    .header p { color: #ccfbf1; margin: 4px 0 0; font-size: 13px; }
                    .content { padding: 32px 28px; line-height: 1.6; }
                    .otp-box { text-align: center; margin: 26px 0; padding: 22px; background: #f0fdf4; border: 2px dashed #14b8a6; border-radius: 12px; }
                    .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0d9488; font-family: 'Courier New', monospace; display: inline-block; }
                    .timer-note { font-size: 13px; color: #64748b; margin-top: 10px; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #f8fafc; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h1>CivicPulse</h1>
                      <p>Smart Governance Platform</p>
                    </div>
                    <div class="content">
                      <p style="font-size: 16px; margin-top: 0;">Hello <strong>%s</strong>,</p>
                      <p>Thank you for joining CivicPulse. Please enter the following 6-digit verification code to complete your registration and activate your account:</p>
                      <div class="otp-box">
                        <div class="otp-code">%s</div>
                        <div class="timer-note">⏱ Valid for <strong>15 minutes</strong></div>
                      </div>
                      <p style="font-size: 13px; color: #64748b;">If you did not request this verification code, please disregard this email.</p>
                    </div>
                    <div class="footer">
                      &copy; CivicPulse Smart Governance Platform
                    </div>
                  </div>
                </body>
                </html>
                """,
                userName, code
        );
    }

    private String buildStatusUpdateHtml(String userName, String issueTitle,
                                          String oldStatus, String newStatus) {
        return String.format(
                """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
                    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
                    .header { background: linear-gradient(135deg, #0d9488, #0f766e); padding: 28px 24px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; }
                    .content { padding: 32px 28px; line-height: 1.6; }
                    .status-box { background: #f8fafc; border-left: 4px solid #14b8a6; padding: 14px 18px; border-radius: 4px; margin: 18px 0; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #f8fafc; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="header">
                      <h1>CivicPulse</h1>
                      <p style="color: #ccfbf1; margin: 4px 0 0; font-size: 13px;">Issue Status Notification</p>
                    </div>
                    <div class="content">
                      <p>Hello <strong>%s</strong>,</p>
                      <p>The status of your civic report has been updated:</p>
                      <div class="status-box">
                        <strong>Issue:</strong> %s<br/>
                        <strong>Previous Status:</strong> %s<br/>
                        <strong>New Status:</strong> <span style="color: #0d9488; font-weight: bold;">%s</span>
                      </div>
                      <p>Thank you for contributing to your community!</p>
                    </div>
                    <div class="footer">
                      &copy; CivicPulse Smart Governance Platform
                    </div>
                  </div>
                </body>
                </html>
                """,
                userName, issueTitle, oldStatus, newStatus
        );
    }
}
