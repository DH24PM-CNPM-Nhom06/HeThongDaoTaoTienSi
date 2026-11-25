FROM nginx:stable-alpine

COPY ["Demo Frontend/index.html", "/usr/share/nginx/html/index.html"]
COPY ["Demo Frontend/reset.html", "/usr/share/nginx/html/reset.html"]
COPY ["Demo Frontend/assets/", "/usr/share/nginx/html/assets/"]
COPY ["Demo Frontend/css/", "/usr/share/nginx/html/css/"]
COPY ["Demo Frontend/js/", "/usr/share/nginx/html/js/"]
COPY ["Demo Frontend/pages/", "/usr/share/nginx/html/pages/"]
COPY ["Demo Frontend/docker/nginx.conf", "/etc/nginx/conf.d/default.conf"]
COPY ["Demo Frontend/docker/runtime-config.js", "/usr/share/nginx/html/js/runtime-config.js"]

EXPOSE 80
