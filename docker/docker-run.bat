@echo off
:: Function to prompt for cache cleanup
set /p response="Do you want to clean the Docker cache? (y/n): "
if /i "%response%"=="y" (
  set clean_cache=true
) else (
  set clean_cache=false
)

:: Function to prompt for volumes cleanup
set /p response="Do you want to clean Docker volumes? (y/n): "
if /i "%response%"=="y" (
  set clean_volumes=true
) else (
  set clean_volumes=false
)

:: Function to prompt for images cleanup
set /p response="Do you want to clean Docker images? (y/n): "
if /i "%response%"=="y" (
  set clean_images=true
) else (
  set clean_images=false
)

:: Stop and remove existing Docker containers if running
echo Stopping and removing existing Docker containers...
docker-compose down

:: Remove node_modules and dist directories if they exist
if exist "node_modules" (
  echo Removing node_modules directory...
  rmdir /s /q node_modules
) else (
  echo node_modules directory does not exist.
)

if exist "dist" (
  echo Removing dist directory...
  rmdir /s /q dist
) else (
  echo dist directory does not exist.
)

:: Clean Docker cache if prompted
if "%clean_cache%"=="true" (
  echo Cleaning Docker cache...
  docker system prune -f
) else (
  echo Skipping Docker cache cleanup.
)

:: Clean Docker volumes if prompted
if "%clean_volumes%"=="true" (
  echo Cleaning Docker volumes...
  docker volume prune -f
) else (
  echo Skipping Docker volumes cleanup.
)

:: Clean Docker images if prompted
if "%clean_images%"=="true" (
  echo Cleaning Docker images...
  docker image prune -f
) else (
  echo Skipping Docker images cleanup.
)

:: Rebuild and start Docker containers
echo Building Docker image...
docker-compose build

echo Starting Docker containers...
docker-compose up