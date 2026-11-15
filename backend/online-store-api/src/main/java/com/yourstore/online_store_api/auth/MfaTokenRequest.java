package com.yourstore.online_store_api.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MfaTokenRequest {

    @NotBlank(message = "MFA token is required")
    private String mfaToken;
}
