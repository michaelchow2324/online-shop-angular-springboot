package com.yourstore.online_store_api.account;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileRequest {

    /** Null = leave unchanged; blank string clears display name. */
    @Size(max = 255)
    private String displayName;
}
