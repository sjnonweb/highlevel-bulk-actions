FROM node:20-alpine

# set current directory
WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install

# bundle app source
COPY . .

# expose port
EXPOSE 3000

# start in dev mode
CMD ["pnpm", "run", "start:dev"]