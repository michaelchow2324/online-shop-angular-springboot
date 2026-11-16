package com.yourstore.online_store_api.admin.category;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.yourstore.common.PagedResponse;
import com.yourstore.online_store_api.auth.CustomerPrincipal;
import com.yourstore.online_store_api.auth.JwtAuthenticationFilter;
import com.yourstore.online_store_api.auth.JwtService;
import com.yourstore.online_store_api.config.SecurityConfig;
import com.yourstore.online_store_api.ratelimit.AuthRateLimitConfig;

@WebMvcTest(controllers = AdminCategoryController.class)
@Import({
    SecurityConfig.class,
    JwtAuthenticationFilter.class,
    JwtService.class,
    AuthRateLimitConfig.class
})
class AdminCategoryControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminCategoryService adminCategoryService;

    @Test
    void list_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/categories"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void list_asUser_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/categories").with(authentication(userAuth())))
                .andExpect(status().isForbidden());
    }

    @Test
    void list_asAdmin_returnsCategories() throws Exception {
        when(adminCategoryService.list(0, 20, null, null))
                .thenReturn(new PagedResponse<>(
                        List.of(sampleCategory()),
                        0, 20, 1, 1, false, false));

        mockMvc.perform(get("/api/admin/categories").with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Coin Pouches"))
                .andExpect(jsonPath("$.content[0].status").value(true));
    }

    @Test
    void create_asAdmin_returns201() throws Exception {
        when(adminCategoryService.create(any(UpsertCategoryRequest.class))).thenReturn(sampleCategory());

        mockMvc.perform(post("/api/admin/categories")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Coin Pouches","active":true,"sortOrder":10}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("coin-pouches"));
    }

    @Test
    void setStatus_asAdmin_updatesActive() throws Exception {
        AdminCategoryDTO disabled = new AdminCategoryDTO(
                1L, "Coin Pouches", "coin-pouches", null, 10, null, false, null, null);
        when(adminCategoryService.setActive(eq(1L), eq(false))).thenReturn(disabled);

        mockMvc.perform(patch("/api/admin/categories/1/status")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(false));
    }

    private static AdminCategoryDTO sampleCategory() {
        return new AdminCategoryDTO(
                1L,
                "Coin Pouches",
                "coin-pouches",
                "Cute coin pouches",
                10,
                new AdminCategoryDTO.CategoryImage(9L, "https://cdn.example/categories/1.jpg"),
                true,
                null,
                null);
    }

    private static UsernamePasswordAuthenticationToken adminAuth() {
        return new UsernamePasswordAuthenticationToken(
                new CustomerPrincipal(1L, "admin@example.com", "ADMIN"),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private static UsernamePasswordAuthenticationToken userAuth() {
        return new UsernamePasswordAuthenticationToken(
                new CustomerPrincipal(2L, "user@example.com", "USER"),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
