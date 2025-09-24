#!/bin/bash
set -e
REGION=$1

# Set buildId to hash of latest commit
buildId=$(git rev-parse --short HEAD)
cd k8s/mcp-server

sed -i "s/githubHashToBeReplaced/$buildId/g" values.yaml
sed -i "s/deploymentEnvToBeReplaced/prod/g" values.yaml
sed -i "s/main/$IMAGE_TAG/g" values.yaml

helm upgrade -i --values ./values.yaml --set region=$REGION mcp-server .
