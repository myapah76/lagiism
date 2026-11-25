package com.lagiism.email.mapper;

import com.lagiism.email.dto.SmtpConfigDto;
import com.lagiism.email.dto.UpdateSmtpConfigRequest;
import com.lagiism.email.entity.SmtpConfig;
import org.springframework.stereotype.Component;

@Component
public class SmtpConfigMapper {

    public SmtpConfigDto toDto(SmtpConfig config) {
        return new SmtpConfigDto(
                config.getId(),
                config.getHost(),
                config.getPort(),
                config.getUsername(),
                config.getEncryptedPassword() != null && !config.getEncryptedPassword().isBlank(),
                config.getFromEmail(),
                config.getFromName(),
                config.isUseTls(),
                config.isUseSsl(),
                config.isEnabled(),
                config.getUpdatedAt()
        );
    }

    public void applyRequest(SmtpConfig config, UpdateSmtpConfigRequest req) {
        config.setHost(req.host().trim());
        config.setPort(req.port());
        config.setUsername(req.username().trim());
        config.setFromEmail(req.fromEmail().trim());
        config.setFromName(req.fromName().trim());
        config.setUseTls(req.useTls());
        config.setUseSsl(req.useSsl());
        config.setEnabled(req.enabled());
    }
}
