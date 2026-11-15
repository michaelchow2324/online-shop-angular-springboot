# Lovely Dearly reliability lab — Week 1 starter

Prepared Mon Nov 9, 2026 (evening, Toronto). Agreed plan: fundamentals first
(1–2 days, text only), then Kubernetes, Kafka added inside the same lab later.
Time budget: ~5 hrs/week. LeetCode stays ~30 min/day maintenance; system design
1–2 hrs/week reading only. Do not let the lab block applications — Google L3
referral ask Tue–Wed Nov 10–11, apply Fri Nov 13.

## Your starting point (already true — do not re-prove it)

- Lovely Dearly: Java 21 / Spring Boot API, Angular storefront, PostgreSQL 15
  (Flyway), Stripe signed webhooks, JWT auth.
- Already runs as 4 Docker Compose containers on a Hetzner Linux VPS
  (`deploy/docker-compose.prod.yml`): backend on 8080 (internal), Postgres with
  `pg_isready` health check, Caddy, shared bridge network, services reach each
  other by name (`db:5432`, `backend:8080`).
- `/actuator/health` already exists — but `/actuator/**` currently needs the
  admin role. Kubernetes liveness/readiness probes cannot log in as admin, so
  Week 1 needs a public health endpoint (see step 3). Do not claim the lab is
  prod, multi-region, or high-traffic: it is local (kind/minikube), labelled
  as a lab.

## 0. Fundamentals first — 1–2 days, text only, then build

Kubernetes concepts only: container/image/registry; Pod, Deployment, Service,
Ingress, ConfigMap/Secret, Namespace; `kubectl` basics, YAML, liveness /
readiness probes.
Distributed-systems concepts only: replication, partitioning/sharding,
consistency vs availability (CAP in plain terms), what happens when a
pod / node / DB fails and how you detect it.
Stop there and start building — learn HPA, Prometheus, Terraform and chaos
drills by doing them in Weeks 2–4.

## Week 1 checklist (~5 hrs)

- [ ] 1. Install kind (or minikube) + kubectl locally. Verify with
  `kubectl get nodes` and `kubectl cluster-info`.
- [ ] 2. Create a namespace, e.g. `lovely-dearly-lab`. Put every manifest in
  git under a `k8s/` (or `lab/`) folder with a short README — the repo is the
  proof, not a screenshot.
- [ ] 3. Add a public health endpoint for probes. Smallest honest change:
  a public `/health` (and `/ready` that checks DB connectivity) that does
  NOT expose actuator internals. Keep `/actuator/**` admin-only. Verify
  with `curl` from outside the container, no token.
- [ ] 4. Postgres as a StatefulSet with a persistent volume (reuse the
  Postgres 15 image and the existing Flyway migrations — the API still runs
  them on startup). Confirm data survives a pod restart.
- [ ] 5. Backend as a Deployment with 2 replicas, a ClusterIP Service, and
  an Ingress (or port-forward for Week 1). Reuse the existing multi-stage
  Docker image; do not rebuild the app for K8s.
- [ ] 6. Wire liveness probe to `/health` and readiness probe to `/ready`.
  Confirm: `kubectl get pods` shows READY 1/1, and deleting one backend pod
  (`kubectl delete pod …`) brings a replacement up and traffic still works.
- [ ] 7. Structured logs: confirm the API logs one JSON line per request
  (method, path, status, ms) and that `kubectl logs` shows it. No log
  pipeline yet — that is Week 2 (Prometheus/Grafana).
- [ ] 8. Write the README: what runs where (2 API replicas + Postgres),
  how to start it (`kind create cluster` + `kubectl apply -k …`), the SLO
  you will set in Week 3 (99% availability — not yet measured), and one
  line stating it is a local lab, not prod scale.

## Done means (Week 1)

- `kubectl get pods -n lovely-dearly-lab` all Ready; storefront loads;
  a killed API pod is replaced automatically; README + manifests are
  committed. That alone is enough to start talking about ownership in an
  interview.

## What comes next (do not start yet)

- Week 2: Prometheus/Grafana — latency, error rate, DB pool, JVM
  dashboards + error-rate / latency alerts.
- Week 3: Terraform the setup, SLO 99% + error budget, burn-rate alert.
- Week 4: Chaos — kill a pod, fill disk, inject latency — runbook +
  1-page blameless postmortem each; automate one diagnosis (slow-query
  detector). Kafka goes inside this same lab afterwards, as order events
  through a producer/consumer — not a separate course.

## How to talk about it (honest framing)

- Resume second line, lab only: "Reliability lab — Lovely Dearly on K8s
  (local/minikube), 99% SLO, chaos drills, runbooks" — only once the SLO
  and drills actually exist (Weeks 3–4).
- In an interview, say it first: "I know a small store doesn't need K8s in
  prod — I built this locally to practice operating one."
- Never claim: prod traffic, high QPS, multi-region, or "designed
  large-scale distributed systems."

## Sources in your own files

- Lovely Dearly stack / Docker Compose / actuator detail:
  `~/workspace/user/files/cv-tools.md` (backend 8080, Postgres 15-alpine,
  `/actuator/health`, `.env.prod` not in Git).
- Lab order and time split agreed Nov 9, 2026: fundamentals first, then
  K8s, Kafka later in the same lab, ~5 hrs/week; LeetCode ~30 min/day.
