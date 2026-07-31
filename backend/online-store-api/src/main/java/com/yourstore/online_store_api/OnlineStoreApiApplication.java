package com.yourstore.online_store_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// scan com.yourstore so beans in com.yourstore.common (e.g. GlobalExceptionHandler) are picked up
@SpringBootApplication(scanBasePackages = "com.yourstore")
public class OnlineStoreApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnlineStoreApiApplication.class, args);
	}

}
