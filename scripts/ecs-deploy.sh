#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <cluster> <service> <backend-image> <container-backend-name> [frontend-image] [container-frontend-name]"
  exit 1
fi

CLUSTER=$1
SERVICE=$2
BACKEND_IMAGE=$3
CONTAINER_BACKEND_NAME=$4
FRONTEND_IMAGE=${5:-}
CONTAINER_FRONTEND_NAME=${6:-}

REGION=${AWS_REGION:-us-east-1}

echo "Using cluster: ${CLUSTER}, service: ${SERVICE}"
TASKDEF_ARN=$(aws ecs describe-services --cluster ${CLUSTER} --services ${SERVICE} --query 'services[0].taskDefinition' --output text --region ${REGION})
echo "Current task definition: ${TASKDEF_ARN}"

echo "Fetching task definition JSON..."
TASKDEF_JSON=$(aws ecs describe-task-definition --task-definition ${TASKDEF_ARN} --query 'taskDefinition' --output json --region ${REGION})

TEMPFILE=$(mktemp /tmp/ecs-taskdef.XXXX.json)
echo "$TASKDEF_JSON" > ${TEMPFILE}

# Remove read-only fields
jq 'del(.status, .revision, .taskDefinitionArn, .requiresAttributes, .compatibilities)' ${TEMPFILE} > ${TEMPFILE}.tmp && mv ${TEMPFILE}.tmp ${TEMPFILE}

# Update container images
if [ -n "${BACKEND_IMAGE}" ]; then
  jq --arg name "${CONTAINER_BACKEND_NAME}" --arg image "${BACKEND_IMAGE}" '(.containerDefinitions[] | select(.name == $name) ).image = $image' ${TEMPFILE} > ${TEMPFILE}.tmp && mv ${TEMPFILE}.tmp ${TEMPFILE}
fi
if [ -n "${FRONTEND_IMAGE}" ] && [ -n "${CONTAINER_FRONTEND_NAME}" ]; then
  jq --arg name "${CONTAINER_FRONTEND_NAME}" --arg image "${FRONTEND_IMAGE}" '(.containerDefinitions[] | select(.name == $name) ).image = $image' ${TEMPFILE} > ${TEMPFILE}.tmp && mv ${TEMPFILE}.tmp ${TEMPFILE}
fi

echo "Registering new task definition..."
NEW_TASKDEF_ARN=$(aws ecs register-task-definition --cli-input-json file://${TEMPFILE} --query 'taskDefinition.taskDefinitionArn' --output text --region ${REGION})
echo "Registered new task definition: ${NEW_TASKDEF_ARN}"

echo "Updating service to new task definition..."
aws ecs update-service --cluster ${CLUSTER} --service ${SERVICE} --task-definition ${NEW_TASKDEF_ARN} --region ${REGION}
echo "Service update initiated."

rm -f ${TEMPFILE}
