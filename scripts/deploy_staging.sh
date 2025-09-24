#!/bin/bash
set -e

# Set buildId to hash of latest commit
buildId=$(git rev-parse --short HEAD)
cd k8s/mcp-server

sed -i "s/githubHashToBeReplaced/$buildId/g" values.yaml
sed -i "s/deploymentEnvToBeReplaced/staging/g" values.yaml
sed -i "s/main/$buildId/g" values.yaml

helm upgrade -i --values ./values.yaml --set region="us-east-1" mcp-server .
