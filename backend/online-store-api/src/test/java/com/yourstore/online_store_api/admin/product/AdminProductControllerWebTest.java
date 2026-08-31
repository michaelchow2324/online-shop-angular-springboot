package com.yourstore.online_store_api.admin.product;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.yourstore.common.PagedResponse;
import com.yourstore.online_store_api.auth.CustomerPrincipal;
import com.yourstore.online_store_api.auth.JwtAuthenticationFilter;
import com.yourstore.online_store_api.auth.JwtService;
import com.yourstore.online_store_api.config.SecurityConfig;

@WebMvcTest(controllers = AdminProductController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class AdminProductControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminProductService adminProductService;

    @MockitoBean
    private CatalogImportService catalogImportService;

    @Test
    void list_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void list_asUser_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/products").with(authentication(userAuth())))
                .andExpect(status().isForbidden());
    }

    @Test
    void list_asAdmin_returnsProducts() throws Exception {
        when(adminProductService.list(0, 20, null, null))
                .thenReturn(new PagedResponse<>(List.of(sampleProduct()), 0, 20, 1, 1, false, false));

        mockMvc.perform(get("/api/admin/products").with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Floral Keychain"))
                .andExpect(jsonPath("$.content[0].status").value(true));
    }

    @Test
    void create_asAdmin_returns201() throws Exception {
        when(adminProductService.create(any(UpsertProductRequest.class))).thenReturn(sampleProduct());

        mockMvc.perform(post("/api/admin/products")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Floral Keychain","price":12.00,"categoryIds":[8]}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("floral-keychain"));
    }

    @Test
    void setStatus_asAdmin_returnsUpdatedProduct() throws Exception {
        AdminProductDTO disabled = sampleProduct();
        disabled.setStatus(false);
        when(adminProductService.setActive(21L, false)).thenReturn(disabled);

        mockMvc.perform(patch("/api/admin/products/21/status")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(false));
    }

    @Test
    void addImage_asAdmin_returns201() throws Exception {
        when(adminProductService.addImage(eq(21L), any())).thenReturn(sampleProduct());
        MockMultipartFile file = new MockMultipartFile(
                "file", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/api/admin/products/21/images")
                        .file(file)
                        .with(authentication(adminAuth())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(21));
    }

    @Test
    void addImage_withoutToken_returns401() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/api/admin/products/21/images").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void export_asAdmin_returnsCsv() throws Exception {
        when(adminProductService.exportCatalogCsv()).thenReturn("id,sku,slug\n21,MB-1,floral-keychain\n");

        mockMvc.perform(get("/api/admin/products/export").with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("catalog-export.csv")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("floral-keychain")));
    }

    @Test
    void export_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/products/export"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void import_asAdmin_returnsSummary() throws Exception {
        CatalogImportResult result = new CatalogImportResult();
        result.setCreated(1);
        result.setUpdated(0);
        result.setImagesUploaded(2);
        when(catalogImportService.importCatalog(any(), any())).thenReturn(result);

        MockMultipartFile csv = new MockMultipartFile(
                "csv", "products.csv", "text/csv", "sku,name,price\nA,Bag,9.00\n".getBytes());
        MockMultipartFile image = new MockMultipartFile(
                "images", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/api/admin/products/import")
                        .file(csv)
                        .file(image)
                        .with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.created").value(1))
                .andExpect(jsonPath("$.imagesUploaded").value(2));
    }

    @Test
    void import_withoutToken_returns401() throws Exception {
        MockMultipartFile csv = new MockMultipartFile(
                "csv", "products.csv", "text/csv", "sku,name,price\nA,Bag,9.00\n".getBytes());

        mockMvc.perform(multipart("/api/admin/products/import").file(csv))
                .andExpect(status().isUnauthorized());
    }

    private static UsernamePasswordAuthenticationToken adminAuth() {
        CustomerPrincipal principal = new CustomerPrincipal(1L, "admin@localhost", "ADMIN");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private static UsernamePasswordAuthenticationToken userAuth() {
        CustomerPrincipal principal = new CustomerPrincipal(2L, "user@example.com", "USER");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private static AdminProductDTO sampleProduct() {
        AdminProductDTO dto = new AdminProductDTO();
        dto.setId(21L);
        dto.setName("Floral Keychain");
        dto.setSlug("floral-keychain");
        dto.setPrice(new BigDecimal("12.00"));
        dto.setStatus(true);
        return dto;
    }
}
