# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

# Public URL baked into Angular prod build (SSR uses this for API calls)
ARG SITE_URL=https://yoursite.com
ENV SITE_URL=${SITE_URL}

COPY package.json ./
RUN npm install

COPY . .

# Replace localhost URLs in environment.ts before production build
RUN sed -i "s|http://localhost:8080/api|${SITE_URL}/api|g" \
    src/environments/environment.ts && \
    sed -i "s|http://localhost:4200/|${SITE_URL}/|g" \
    src/environments/environment.ts && \
    sed -i "s|http://localhost:4200/assets|${SITE_URL}/assets|g" \
    src/environments/environment.ts

RUN npm run build

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=build /app/dist/multikart-frontend ./dist/multikart-frontend
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/multikart-frontend/server/server.mjs"]
