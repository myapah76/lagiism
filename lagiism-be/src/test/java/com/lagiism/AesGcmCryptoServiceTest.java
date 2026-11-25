package com.lagiism;

import com.lagiism.email.service.AesGcmCryptoService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AesGcmCryptoServiceTest {

    @Test
    void encryptAndDecryptRoundTripWithUniqueIv() {
        AesGcmCryptoService service = new AesGcmCryptoService("0123456789abcdef0123456789abcdef");
        String secret = "super-secret-smtp-password";

        String encrypted1 = service.encrypt(secret);
        String encrypted2 = service.encrypt(secret);

        assertThat(encrypted1).isNotEqualTo(secret);
        assertThat(encrypted1).isNotEqualTo(encrypted2);
        assertThat(service.decrypt(encrypted1)).isEqualTo(secret);
        assertThat(service.decrypt(encrypted2)).isEqualTo(secret);
    }
}
