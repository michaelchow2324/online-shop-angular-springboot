package com.yourstore.online_store_api.instagram;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/instagram")
public class InstagramController {

    private final InstagramService instagramService;

    public InstagramController(InstagramService instagramService) {
        this.instagramService = instagramService;
    }

    @GetMapping("/feed")
    public ResponseEntity<List<InstagramPost>> getFeed() {
        try {
            return ResponseEntity.ok(instagramService.getLatestPosts());
        } catch (IllegalStateException ex) {
            return ResponseEntity.ok(List.of());
        }
    }
}
