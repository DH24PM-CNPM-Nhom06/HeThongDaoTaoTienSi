FROM nginx:stable-alpine

COPY ["DTMS_Frontend/index.html", "/usr/share/nginx/html/index.html"]
COPY ["DTMS_Frontend/reset.html", "/usr/share/nginx/html/reset.html"]
COPY ["DTMS_Frontend/assets/", "/usr/share/nginx/html/assets/"]
COPY ["DTMS_Frontend/css/", "/usr/share/nginx/html/css/"]
COPY ["DTMS_Frontend/js/", "/usr/share/nginx/html/js/"]
COPY ["DTMS_Frontend/pages/", "/usr/share/nginx/html/pages/"]
COPY ["DTMS_Frontend/docker/nginx.conf", "/etc/nginx/conf.d/default.conf"]
COPY ["DTMS_Frontend/docker/runtime-config.js", "/usr/share/nginx/html/js/runtime-config.js"]

EXPOSE 80
