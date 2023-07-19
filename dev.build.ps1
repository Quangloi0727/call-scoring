# COMMON PATHS
param ($v)
$version=$v

docker build --no-cache -t mt-recording:$version .

#Push image to docker registry
docker tag mt-recording:$version docker-registry.metechvn.com/mt-recording:$version
docker push docker-registry.metechvn.com/mt-recording:$version

docker rmi mt-recording:$version -f
docker rmi docker-registry.metechvn.com/mt-recording:$version -f