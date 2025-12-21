#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy-imbra.sh -r <registry/user> -h <host> -u <user> -p <remote_path> -e <envfile> -k <ssh-key>

function usage() {
  echo "Usage: $0 -r <registry> -h <host> -u <user> -p <remote-path> -e <env-file> -k <ssh-key>" >&2
  exit 1
}

while getopts ":r:h:u:p:e:k:" opt; do
  case ${opt} in
    r ) REGISTRY=${OPTARG};;
    h ) HOST=${OPTARG};;
    u ) USER=${OPTARG};;
    p ) REMOTE_PATH=${OPTARG};;
    e ) ENV_FILE=${OPTARG};;
    k ) SSH_KEY=${OPTARG};;
    * ) usage;;
  esac
done

if [ -z "${REGISTRY:-}" ] || [ -z "${HOST:-}" ] || [ -z "${USER:-}" ] || [ -z "${REMOTE_PATH:-}" ]; then
  usage
fi

IMAGE_TAG=${IMAGE_TAG:-latest}

echo "Building backend image..."
docker build -f Dockerfile -t ${REGISTRY}/denuel-auto-backend:${IMAGE_TAG} .

echo "Building frontend image..."
cd frontend
docker build -f Dockerfile -t ${REGISTRY}/denuel-auto-frontend:${IMAGE_TAG} .
cd -

echo "Pushing images..."
docker push ${REGISTRY}/denuel-auto-backend:${IMAGE_TAG}
docker push ${REGISTRY}/denuel-auto-frontend:${IMAGE_TAG}

echo "Copying docker-compose.prod.yml to remote host ${HOST}:${REMOTE_PATH}"
scp -i ${SSH_KEY} docker-compose.prod.yml ${USER}@${HOST}:${REMOTE_PATH}/docker-compose.prod.yml

if [ -n "${ENV_FILE:-}" ] && [ -f "${ENV_FILE}" ]; then
  echo "Uploading env file to remote host"
  scp -i ${SSH_KEY} ${ENV_FILE} ${USER}@${HOST}:${REMOTE_PATH}/.env.production
fi

echo "Deploying on remote host..."
ssh -i ${SSH_KEY} ${USER}@${HOST} <<EOF
mkdir -p ${REMOTE_PATH}
cd ${REMOTE_PATH}
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
echo 'Running prisma deploy (if needed)'
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy --schema prisma/schema.prisma || true
docker compose -f docker-compose.prod.yml ps
EOF

echo "Deployment completed."
