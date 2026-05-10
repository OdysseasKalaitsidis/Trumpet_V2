# Stage 1: Build the Vite application
FROM node:20-alpine as build-stage
WORKDIR /app
COPY ./Frontend/package*.json ./
RUN npm install
COPY ./Frontend .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx/trumpet.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
