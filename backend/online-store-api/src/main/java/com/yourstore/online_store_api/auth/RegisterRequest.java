package com.yourstore.online_store_api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]+$", message = "Phone must contain digits only")
    @Size(max = 32, message = "Phone is too long")
    private String phone;

    /** Dial code without "+" — Canada only for now. */
    @NotBlank(message = "Country code is required")
    @Pattern(regexp = "^1$", message = "Only Canada (+1) is supported for now")
    @Size(max = 8, message = "Country code is too long")
    private String countryCode;
}
