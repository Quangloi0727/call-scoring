# COMMON PATHS
version=$1

docker build -t mt-recording:$version .

#Push image to docker registry
docker tag mt-recording:$version 172.16.16.110:5000/mt-recording:$version
docker push 172.16.16.110:5000/mt-recording:$version

docker rmi mt-recording:$version -f
docker rmi 172.16.16.110:5000/mt-recording:$version -f