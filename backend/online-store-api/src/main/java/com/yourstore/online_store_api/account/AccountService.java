package com.yourstore.online_store_api.account;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.auth.CustomerUser;
import com.yourstore.online_store_api.auth.CustomerUserRepository;
import com.yourstore.online_store_api.auth.MeDTO;

@Service
public class AccountService {

    private static final String DEFAULT_COUNTRY = "CA";

    private final CustomerUserRepository userRepository;
    private final CustomerAddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    AccountService(
            CustomerUserRepository userRepository,
            CustomerAddressRepository addressRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public MeDTO getProfile(Long userId) {
        return toMeDTO(requireUser(userId));
    }

    @Transactional
    public MeDTO updateProfile(Long userId, UpdateProfileRequest req) {
        CustomerUser user = requireUser(userId);
        if (req.getDisplayName() != null) {
            String name = req.getDisplayName().trim();
            user.setDisplayName(name.isEmpty() ? null : name);
        }
        return toMeDTO(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        CustomerUser user = requireUser(userId);
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
    }

    @Transactional(readOnly = true)
    public List<AddressDTO> listAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).stream()
                .map(this::toAddressDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CustomerAddress> findDefaultAddress(Long userId) {
        return addressRepository.findByUserIdAndDefaultAddressTrue(userId);
    }

    @Transactional
    public AddressDTO createAddress(Long userId, UpsertAddressRequest req) {
        requireUser(userId);
        boolean makeDefault = Boolean.TRUE.equals(req.getIsDefault())
                || addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).isEmpty();

        if (makeDefault) {
            addressRepository.clearDefaultForUser(userId);
        }

        LocalDateTime now = LocalDateTime.now();
        CustomerAddress address = new CustomerAddress();
        address.setUserId(userId);
        applyAddressFields(address, req);
        address.setDefaultAddress(makeDefault);
        address.setCreatedAt(now);
        address.setUpdatedAt(now);
        return toAddressDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressDTO updateAddress(Long userId, Long addressId, UpsertAddressRequest req) {
        CustomerAddress address = requireOwnedAddress(userId, addressId);
        applyAddressFields(address, req);

        if (Boolean.TRUE.equals(req.getIsDefault()) && !address.isDefaultAddress()) {
            addressRepository.clearDefaultForUser(userId);
            address.setDefaultAddress(true);
        } else if (Boolean.FALSE.equals(req.getIsDefault())) {
            address.setDefaultAddress(false);
        }

        address.setUpdatedAt(LocalDateTime.now());
        return toAddressDTO(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        CustomerAddress address = requireOwnedAddress(userId, addressId);
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDTO setDefaultAddress(Long userId, Long addressId) {
        CustomerAddress address = requireOwnedAddress(userId, addressId);
        addressRepository.clearDefaultForUser(userId);
        address.setDefaultAddress(true);
        address.setUpdatedAt(LocalDateTime.now());
        return toAddressDTO(addressRepository.save(address));
    }

    private void applyAddressFields(CustomerAddress address, UpsertAddressRequest req) {
        String country = (req.getCountry() == null || req.getCountry().isBlank())
                ? DEFAULT_COUNTRY
                : req.getCountry().trim().toUpperCase();
        if (!DEFAULT_COUNTRY.equals(country)) {
            throw new IllegalArgumentException("Shipping country must be CA");
        }

        String province = req.getProvince().trim().toUpperCase();
        if (!CanadaProvinces.isKnown(province)) {
            throw new IllegalArgumentException("Unknown Canadian province: " + province);
        }

        address.setLabel(req.getLabel().trim());
        address.setRecipientName(req.getRecipientName().trim());
        address.setPhone(blankToNull(req.getPhone()));
        address.setLine1(req.getLine1().trim());
        address.setLine2(blankToNull(req.getLine2()));
        address.setCity(req.getCity().trim());
        address.setProvince(province);
        address.setPostal(req.getPostal().trim().toUpperCase());
        address.setCountry(country);
    }

    private CustomerUser requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private CustomerAddress requireOwnedAddress(Long userId, Long addressId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new NotFoundException("Address not found"));
    }

    private MeDTO toMeDTO(CustomerUser user) {
        return new MeDTO(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhone(),
                user.getCountryCode(),
                user.getRole(),
                user.getEmailVerifiedAt());
    }

    private AddressDTO toAddressDTO(CustomerAddress address) {
        return new AddressDTO(
                address.getId(),
                address.getLabel(),
                address.getRecipientName(),
                address.getPhone(),
                address.getLine1(),
                address.getLine2(),
                address.getCity(),
                address.getProvince(),
                address.getPostal(),
                address.getCountry(),
                address.isDefaultAddress(),
                address.getCreatedAt(),
                address.getUpdatedAt());
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
