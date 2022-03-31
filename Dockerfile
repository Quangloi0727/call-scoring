FROM node:12.16.3
WORKDIR /home/sources/app
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 6868
COPY . .
RUN chmod +x run.sh

ENTRYPOINT ["sh", "/home/sources/app/run.sh" ]