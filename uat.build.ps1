# COMMON PATHS
param ($v)
$version=$v

docker build --no-cache -t mt-recording-uat:$version .

#Push image to docker registry
docker tag mt-recording-uat:$version docker-registry.metechvn.com/mt-recording-uat:$version
docker push docker-registry.metechvn.com/mt-recording-uat:$version

docker rmi mt-recording-uat:$version -f
docker rmi docker-registry.metechvn.com/mt-recording-uat:$version -f