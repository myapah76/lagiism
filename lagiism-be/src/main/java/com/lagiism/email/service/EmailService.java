package com.lagiism.email.service;

import com.lagiism.account.service.AuditLogService;
import com.lagiism.email.dto.SmtpConfigDto;
import com.lagiism.email.dto.UpdateSmtpConfigRequest;
import com.lagiism.email.entity.SmtpConfig;
import com.lagiism.email.mapper.SmtpConfigMapper;
import com.lagiism.email.repository.SmtpConfigRepository;
import com.lagiism.shared.BadRequestException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final SmtpConfigRepository smtpConfigRepository;
    private final AesGcmCryptoService cryptoService;
    private final TemplateEngine templateEngine;
    private final AuditLogService auditLogService;
    private final SmtpConfigMapper smtpConfigMapper;

    @Transactional(readOnly = true)
    public Optional<SmtpConfigDto> getConfig() {
        return smtpConfigRepository.findTopByOrderByIdAsc().map(smtpConfigMapper::toDto);
    }

    @Transactional
    public SmtpConfigDto saveConfig(UpdateSmtpConfigRequest request, String actorEmail) {
        SmtpConfig config = smtpConfigRepository.findTopByOrderByIdAsc().orElseGet(SmtpConfig::new);
        smtpConfigMapper.applyRequest(config, request);
        if (request.password() != null && !request.password().isBlank()) {
            config.setEncryptedPassword(cryptoService.encrypt(request.password()));
        } else if (config.getEncryptedPassword() == null || config.getEncryptedPassword().isBlank()) {
            throw new BadRequestException("SMTP password is required for initial configuration");
        }

        SmtpConfig saved = smtpConfigRepository.save(config);
        auditLogService.record(actorEmail, "SMTP_CONFIG_UPDATED", "SMTP_CONFIG", String.valueOf(saved.getId()),
                "Updated SMTP host=" + saved.getHost() + ", enabled=" + saved.isEnabled());
        return smtpConfigMapper.toDto(saved);
    }

    public void sendTestEmail(String toEmail) {
        SmtpConfig config = smtpConfigRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new BadRequestException("SMTP configuration has not been saved yet"));
        JavaMailSenderImpl mailSender = buildMailSender(config);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(config.getFromEmail(), config.getFromName());
            helper.setTo(toEmail.trim());
            helper.setSubject("LAGIISM // SMTP Connection Test");
            helper.setText("<p>LAGIISM dynamic SMTP configuration is working properly.</p>", true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("SMTP test email failed for {}", toEmail, e);
            throw new BadRequestException("SMTP test failed: " + e.getMessage());
        }
    }

    public void sendPasswordResetOtp(String toEmail, String otpCode, int expiryMinutes) {
        Optional<SmtpConfig> configOpt = smtpConfigRepository.findTopByOrderByIdAsc();
        if (configOpt.isEmpty() || !configOpt.get().isEnabled()) {
            log.warn("SMTP is not configured or disabled; skipping OTP email dispatch for {}", toEmail);
            return;
        }

        SmtpConfig config = configOpt.get();
        JavaMailSenderImpl mailSender = buildMailSender(config);

        Context ctx = new Context();
        ctx.setVariable("otpCode", otpCode);
        ctx.setVariable("expiryMinutes", expiryMinutes);
        String htmlBody = templateEngine.process("email/otp-reset", ctx);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(config.getFromEmail(), config.getFromName());
            helper.setTo(toEmail);
            helper.setSubject("LAGIISM // Admin Password Recovery Code");
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new BadRequestException("Unable to send recovery email. Please verify SMTP settings.");
        }
    }

    private JavaMailSenderImpl buildMailSender(SmtpConfig config) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getHost());
        sender.setPort(config.getPort());
        sender.setUsername(config.getUsername());
        sender.setPassword(cryptoService.decrypt(config.getEncryptedPassword()));

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(config.isUseTls()));
        props.put("mail.smtp.ssl.enable", String.valueOf(config.isUseSsl()));
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        return sender;
    }
}
