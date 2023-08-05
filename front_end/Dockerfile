FROM node:16.15.1 as build
WORKDIR /front-end

COPY package*.json .
RUN npm install --force
COPY . .

RUN npm run build
FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /front-end/build /usr/share/nginx/html
