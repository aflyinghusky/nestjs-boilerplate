# Stage 1: Build
FROM --platform=linux/amd64 node:18-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN yarn install

COPY . ./
RUN yarn run build

# Stage 2: Production
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN yarn install --production && yarn cache clean

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

RUN chown -R node:node /app

USER node
EXPOSE 80
ENTRYPOINT ["./entrypoint.sh"]
