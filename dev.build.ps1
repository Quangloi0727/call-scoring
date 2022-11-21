# COMMON PATHS
param ($v)
$version=$v

docker build --no-cache -t mt-recording:$version .

#Push image to docker registry
docker tag mt-recording:$version 192.168.15.112:5000/mt-recording:$version
docker push 192.168.15.112:5000/mt-recording:$version

docker rmi mt-recording:$version -f
docker rmi 192.168.15.112:5000/mt-recording:$version -f