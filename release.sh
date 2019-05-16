set -ex
# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=boyney123
# image name
IMAGE=performance-budgets
# run build
docker build -t $USERNAME/$IMAGE:latest .
# tag it
git tag -a "$1" -m "version $1"
git push
git push --tags

docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$1
# push it
docker push $USERNAME/$IMAGE:latest
docker push $USERNAME/$IMAGE:$1