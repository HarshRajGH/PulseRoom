FROM node:18-alpine AS base
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

RUN mkdir -p logs uploads

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
