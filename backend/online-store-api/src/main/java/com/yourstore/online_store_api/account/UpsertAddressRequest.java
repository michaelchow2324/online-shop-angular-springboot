package com.yourstore.online_store_api.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpsertAddressRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 64)
    private String label;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 255)
    private String recipientName;

    @Size(max = 64)
    private String phone;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @NotBlank(message = "City is required")
    @Size(max = 128)
    private String city;

    @NotBlank(message = "Province is required")
    @Size(max = 8)
    private String province;

    @NotBlank(message = "Postal code is required")
    @Size(max = 16)
    private String postal;

    /** Defaults to CA in the service if blank. */
    @Size(max = 2)
    private String country;

    /** Optional; when true, clears previous default for this user. */
    private Boolean isDefault;
}
