# Lovely Dearly — Online Shop

Canadian e-commerce shop: **Angular** storefront, **Spring Boot** API, **Stripe** checkout, and Docker on a VPS.

The UI started from a [ThemeForest Multikart](https://themeforest.net/item/multikart-responsive-angular-ecommerce-template/23621181) Angular theme. Catalog, checkout, payments, auth, admin fulfillment, email, and production deploy are original.

## Features

- Catalog, cart, guest and account checkout
- Stripe Checkout + signed webhooks; admin full refunds
- JWT auth (register, login, email verification); guest orders can be claimed after verify
- Account: profile, order history, address book
- Admin: list orders, ship with tracking, refund
- GST/HST by destination province; shipping zones (Ontario / rest of Canada / remote)
- Transactional email: verify, paid, shipped, refunded
- Angular SSR; i18n (English, French, Traditional Chinese)
- Abandoned unpaid checkouts auto-cancel after 24 hours

**Order flow:** `PENDING_PAYMENT` → `PAID` → `SHIPPED` / `REFUNDED`

## Architecture

```text
Browser
   │ HTTPS
   ▼
Caddy ──► Angular SSR (storefront)
   │
   └── /api/* ──► Spring Boot ──► PostgreSQL
                      │
                      ├── Stripe (Checkout, webhooks, refunds)
                      └── Cloudflare R2 (product images)
```

Locally, Postgres, MinIO, and Mailhog run in Docker; the API and Angular app run on the host.

## Tech stack

| | |
|---|---|
| Frontend | Angular 21, SSR, NGXS, Bootstrap 5 |
| Backend | Java 21, Spring Boot 3.5, Spring Security, JPA, Mail |
| Payments | Stripe Checkout + Refunds |
| Data | PostgreSQL 15, Flyway |
| Storage | MinIO (local) / Cloudflare R2 (prod) |
| Infra | Docker Compose, Caddy, Hetzner VPS |

## Layout

```text
├── frontend/my-website/       Angular storefront + SSR
├── backend/online-store-api/  Spring Boot API, Flyway, tests
└── deploy/                    Production Compose
```

## Run locally

Prereqs: Java 21, Node 20+, Docker.

```bash
# 1. Postgres, MinIO, Mailhog
cd backend/online-store-api
docker compose up -d

# 2. API — copy the template, fill DB / MinIO / Stripe test keys
cp src/main/resources/application-dev.properties.template src/main/resources/application-dev.properties
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Storefront
cd frontend/my-website
npm install
npm start
```

| | URL |
|---|---|
| Shop | http://localhost:4200 |
| API health | http://localhost:8080/actuator/health |
| Mailhog | http://localhost:8025 |

Stripe webhooks: `stripe listen --forward-to localhost:8080/api/payments/stripe/webhook`

```bash
cd backend/online-store-api && ./mvnw test
```
