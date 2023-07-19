# COMMON PATHS
param ($v)
$version=$v

docker build --no-cache -t mt-recording-prod:$version .

#Push image to docker registry
docker tag mt-recording-prod:$version docker-registry.metechvn.com/mt-recording-prod:$version
docker push docker-registry.metechvn.com/mt-recording-prod:$version

docker rmi mt-recording-prod:$version -f
docker rmi docker-registry.metechvn.com/mt-recording-prod:$version -f