# COMMON PATHS
version=$1

docker build -t mt-recording:$version .
#docker buildx build --platform=linux/amd64 -t mt-recording:$version . chạy trên máy mac

#Push image to docker registry
docker tag mt-recording:$version 172.16.16.110:5000/mt-recording:$version
docker push 172.16.16.110:5000/mt-recording:$version

docker rmi mt-recording:$version -f
docker rmi 172.16.16.110:5000/mt-recording:$version -f