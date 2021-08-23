FROM node:14
WORKDIR /app
COPY package.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run prisma:dev
ENTRYPOINT ["npm", "run", "dev"]
