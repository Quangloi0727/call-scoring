# COMMON PATHS
param ($v)
$version=$v

docker build --no-cache -t mt-recording-prod:$version .

#Push image to docker registry
docker tag mt-recording-prod:$version 172.16.16.110:5000/mt-recording-prod:$version
docker push 172.16.16.110:5000/mt-recording-prod:$version

docker rmi mt-recording-prod:$version -f
docker rmi 172.16.16.110:5000/mt-recording-prod:$version -f