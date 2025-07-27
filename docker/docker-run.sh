#!/bin/bash

# Function to prompt the user for a yes or no response
prompt_for_clean() {
  local prompt_message=$1
  read -p "$prompt_message (y/n): " response
  case "$response" in
    [Yy]* ) return 0 ;;  # Yes
    [Nn]* ) return 1 ;;  # No
    * ) echo -e "\033[31mPlease answer yes or no.\033[0m" ; prompt_for_clean "$prompt_message" ;;  # Invalid input
  esac
}

# Stop and remove existing Docker containers if running
echo -e "\033[1;32mStopping and removing existing Docker containers...\033[0m"
docker-compose down

# Remove node_modules and dist directories if they exist
if [ -d "node_modules" ]; then
  echo -e "\033[1;32mRemoving node_modules directory...\033[0m"
  rm -rf node_modules
else
  echo -e "\033[1;32mnode_modules directory does not exist.\033[0m"
fi

if [ -d "dist" ]; then
  echo -e "\033[1;32mRemoving dist directory...\033[0m"
  rm -rf dist
else
  echo -e "\033[1;32mdist directory does not exist.\033[0m"
fi

# Prompt for Docker cache cleanup
if prompt_for_clean "Do you want to clean the Docker cache?"; then
  echo -e "\033[1;32mCleaning Docker cache...\033[0m"
  docker system prune -f
else
  echo -e "\033[1;32mSkipping Docker cache cleanup.\033[0m"
fi

# Prompt for Docker volumes cleanup
if prompt_for_clean "Do you want to clean Docker volumes?"; then
  echo -e "\033[1;32mCleaning Docker volumes...\033[0m"
  docker volume prune -f
else
  echo -e "\033[1;32mSkipping Docker volumes cleanup.\033[0m"
fi

# Prompt for Docker images cleanup
if prompt_for_clean "Do you want to clean Docker images?"; then
  echo -e "\033[1;32mCleaning Docker images...\033[0m"
  docker image prune -f
else
  echo -e "\033[1;32mSkipping Docker images cleanup.\033[0m"
fi

# Rebuild the Docker image
echo -e "\033[1;32mBuilding Docker image...\033[0m"
docker-compose build

# Start the containers
echo -e "\033[1;32mStarting Docker containers...\033[0m"
docker-compose up -d