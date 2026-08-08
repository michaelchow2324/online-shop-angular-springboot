package com.yourstore.online_store_api.account;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.auth.CustomerUser;
import com.yourstore.online_store_api.auth.CustomerUserRepository;

/**
 * Guide 09 — profile password + address book ownership / single default.
 */
@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private CustomerUserRepository userRepository;

    @Mock
    private CustomerAddressRepository addressRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    @Test
    void changePassword_rejectsWrongCurrentPassword() {
        CustomerUser user = user(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("wrong");
        req.setNewPassword("newpassword1");

        assertThatThrownBy(() -> accountService.changePassword(1L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Current password is incorrect");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void changePassword_hashesNewPasswordWhenCurrentMatches() {
        CustomerUser user = user(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldpass12", "hash")).thenReturn(true);
        when(passwordEncoder.encode("newpassword1")).thenReturn("new-hash");

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("oldpass12");
        req.setNewPassword("newpassword1");

        accountService.changePassword(1L, req);

        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
    }

    @Test
    void updateAddress_otherUsersId_throwsNotFound() {
        when(addressRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        UpsertAddressRequest req = addressRequest();

        assertThatThrownBy(() -> accountService.updateAddress(1L, 99L, req))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Address not found");
    }

    @Test
    void setDefault_twice_clearsPreviousAndKeepsOneDefault() {
        CustomerAddress existing = new CustomerAddress();
        existing.setId(11L);
        existing.setUserId(1L);
        existing.setLabel("Work");
        existing.setRecipientName("Alex");
        existing.setLine1("2 Work St");
        existing.setCity("Toronto");
        existing.setProvince("ON");
        existing.setPostal("M5V 1A1");
        existing.setCountry("CA");
        existing.setDefaultAddress(false);
        when(addressRepository.findByIdAndUserId(11L, 1L)).thenReturn(Optional.of(existing));
        when(addressRepository.save(any(CustomerAddress.class))).thenAnswer(inv -> inv.getArgument(0));

        AddressDTO secondDefault = accountService.setDefaultAddress(1L, 11L);

        assertThat(secondDefault.isDefault()).isTrue();
        assertThat(existing.isDefaultAddress()).isTrue();
        verify(addressRepository).clearDefaultForUser(1L);
        verify(addressRepository).save(existing);
    }

    private static CustomerUser user(Long id) {
        CustomerUser user = new CustomerUser();
        user.setId(id);
        user.setEmail("user@example.com");
        user.setPasswordHash("hash");
        user.setRole("USER");
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    private static UpsertAddressRequest addressRequest() {
        UpsertAddressRequest req = new UpsertAddressRequest();
        req.setLabel("Home");
        req.setRecipientName("Alex");
        req.setLine1("1 King St");
        req.setCity("Toronto");
        req.setProvince("ON");
        req.setPostal("M5H 1A1");
        req.setCountry("CA");
        req.setIsDefault(true);
        return req;
    }
}
