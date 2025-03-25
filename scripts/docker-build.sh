SCRIPT_PATH=$(dirname "$(realpath $0)")

docker build -t take-a-seat-backend:latest -f $SCRIPT_PATH/../backend/Dockerfile $SCRIPT_PATH/../backend
docker build -t take-a-seat-frontend:latest -f $SCRIPT_PATH/../frontend/Dockerfile $SCRIPT_PATH/../frontend
