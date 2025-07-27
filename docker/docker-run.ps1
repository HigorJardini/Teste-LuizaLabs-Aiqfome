# Function to prompt for user input
function Prompt-ForCleanup {
    param (
        [string]$Message
    )
    $response = Read-Host $Message
    if ($response -eq "y") {
        return $true
    } elseif ($response -eq "n") {
        return $false
    } else {
        Write-Host "Please answer 'y' or 'n'."
        return (Prompt-ForCleanup $Message)
    }
}

# Prompt for Docker cache cleanup
$cleanCache = Prompt-ForCleanup "Do you want to clean the Docker cache? (y/n)"

# Prompt for Docker volumes cleanup
$cleanVolumes = Prompt-ForCleanup "Do you want to clean Docker volumes? (y/n)"

# Prompt for Docker images cleanup
$cleanImages = Prompt-ForCleanup "Do you want to clean Docker images? (y/n)"

# Stop and remove existing Docker containers if running
Write-Host "Stopping and removing existing Docker containers..."
docker-compose down

# Remove node_modules and dist directories if they exist
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules directory..."
    Remove-Item -Recurse -Force "node_modules"
} else {
    Write-Host "node_modules directory does not exist."
}

if (Test-Path "dist") {
    Write-Host "Removing dist directory..."
    Remove-Item -Recurse -Force "dist"
} else {
    Write-Host "dist directory does not exist."
}

# Clean Docker cache if prompted
if ($cleanCache) {
    Write-Host "Cleaning Docker cache..."
    docker system prune -f
} else {
    Write-Host "Skipping Docker cache cleanup."
}

# Clean Docker volumes if prompted
if ($cleanVolumes) {
    Write-Host "Cleaning Docker volumes..."
    docker volume prune -f
} else {
    Write-Host "Skipping Docker volumes cleanup."
}

# Clean Docker images if prompted
if ($cleanImages) {
    Write-Host "Cleaning Docker images..."
    docker image prune -f
} else {
    Write-Host "Skipping Docker images cleanup."
}

# Rebuild and start Docker containers
Write-Host "Building Docker image..."
docker-compose build

Write-Host "Starting Docker containers..."
docker-compose up