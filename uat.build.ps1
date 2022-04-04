# COMMON PATHS
param ($v)
$version=$v

docker build --no-cache -t mt-recording-uat:$version .

#Push image to docker registry
docker tag mt-recording-uat:$version 172.16.16.110:5000/mt-recording-uat:$version
docker push 172.16.16.110:5000/mt-recording-uat:$version

docker rmi mt-recording-uat:$version -f
docker rmi 172.16.16.110:5000/mt-recording-uat:$version -f