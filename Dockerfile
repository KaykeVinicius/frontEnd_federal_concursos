ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SHOW_DEPOIMENTOS
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SHOW_DEPOIMENTOS=${NEXT_PUBLIC_SHOW_DEPOIMENTOS}

RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production

CMD ["node_modules/.bin/next", "start"]
