FROM node:current-alpine AS builder

WORKDIR /usr/src/app

COPY --chown=node:node *.json *.js *.ts *.yml *.pem .env.test ./
COPY --chown=node:node ./src ./src

RUN npm i -g npm@latest
RUN npm ci
RUN npm audit fix
# RUN npm run build

FROM cgr.dev/chainguard/node:latest AS runner
# FROM gcr.io/distroless/nodejs:latest

WORKDIR /app

COPY --chown=node:node --from=builder /usr/src/app .

ENV NODE_ENV=production

USER node

EXPOSE 8080 8443 80 443

ENTRYPOINT ["npm", "start"]