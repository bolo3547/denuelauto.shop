$registry = $null
$host = $null
$user = $null
$remotePath = $null
$envFile = $null
$sshKey = $null

param(
    [Parameter(Mandatory=$true)][string]$Registry,
    [Parameter(Mandatory=$true)][string]$Host,
    [Parameter(Mandatory=$true)][string]$User,
    [Parameter(Mandatory=$true)][string]$RemotePath,
    [string]$EnvFile,
    [string]$SshKey,
    [switch]$UseWsl
)

# Preflight checks
$sshKeyPath = if ($SshKey) { $SshKey } else { Join-Path $env:USERPROFILE ".ssh\id_rsa" }
if (-not (Test-Path $sshKeyPath)) {
  Write-Error "SSH key not found: $sshKeyPath. Please specify correct -SshKey or ensure the default key exists."
  exit 2
}

# Check remote SSH connectivity
$reachable = Test-NetConnection -ComputerName $Host -Port 22
if (-not $reachable.TcpTestSucceeded) {
  Write-Error "Cannot reach $Host:22 from this machine. Check network / firewall and the host status."
  exit 3
}

Write-Host "Building backend image..."
docker build -f Dockerfile -t $Registry/denuel-auto-backend:latest .
if ($LASTEXITCODE -ne 0) {
  Write-Error "docker build failed for backend. Ensure Docker is installed and daemon is running."
  exit 8
}

Write-Host "Building frontend image..."
Push-Location frontend
docker build -f Dockerfile -t $Registry/denuel-auto-frontend:latest .
Pop-Location
if ($LASTEXITCODE -ne 0) {
  Write-Error "docker build failed for frontend. Ensure Docker is installed and daemon is running."
  exit 9
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)){
    Write-Error "Docker not found in PATH. Install Docker Desktop or CLI and ensure daemon is running."
    exit 10
}
if (-not (Get-Command scp -ErrorAction SilentlyContinue)){
    Write-Error "scp not found in PATH. Install OpenSSH or use WSL."
    exit 11
}

Write-Host "Pushing images..."
docker push $Registry/denuel-auto-backend:latest
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to push backend image to $Registry. Check docker login and registry access."; exit 6 }
docker push $Registry/denuel-auto-frontend:latest
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to push frontend image to $Registry. Check docker login and registry access."; exit 7 }

if ($SshKey) {
  $scpKey = "-i $SshKey"
} else { $scpKey = "-i $sshKeyPath" }

Write-Host "Ensuring remote path $RemotePath exists on $Host"
& ssh $scpKey "$User@$Host" "mkdir -p '$RemotePath'"

Write-Host "Copying docker-compose.prod.yml to remote host $Host:$RemotePath"
& scp $scpKey "docker-compose.prod.yml" "$User@$Host:${RemotePath}/docker-compose.prod.yml"
if ($LASTEXITCODE -ne 0 -and $UseWsl) {
  Write-Host "scp failed (Windows). Trying WSL scp fallback..."
  $wslKeyPath = ($sshKeyPath -replace '\\','/') -replace 'C:','/mnt/c'
  $wslSrc = "/mnt/c/$(Split-Path -NoQualifiers (Resolve-Path 'docker-compose.prod.yml'))"
  wsl scp -i $wslKeyPath "$wslSrc" "$User@$Host:$RemotePath/docker-compose.prod.yml"
  if ($LASTEXITCODE -ne 0) {
    Write-Error "WSL scp fallback also failed. Aborting."
    exit 4
  }
}

if (-not $EnvFile) { $EnvFile = Join-Path (Get-Location) ".env.production" }
if ($EnvFile -and (Test-Path $EnvFile)) {
  Write-Host "Uploading env file to remote host"
  & scp $scpKey "$EnvFile" "$User@$Host:${RemotePath}/.env.production"
  if ($LASTEXITCODE -ne 0 -and $UseWsl) {
    Write-Host "scp env failed; trying WSL scp fallback..."
    $wslKeyPath = ($sshKeyPath -replace '\\','/') -replace 'C:','/mnt/c'
    $wslSrc = "/mnt/c/$(Split-Path -NoQualifiers (Resolve-Path $EnvFile))"
    wsl scp -i $wslKeyPath "$wslSrc" "$User@$Host:$RemotePath/.env.production"
    if ($LASTEXITCODE -ne 0) {
      Write-Error "WSL scp for env file also failed. Aborting."
      exit 5
    }
  }
}
else { Write-Host "No .env.production found and -EnvFile not supplied. Proceeding without uploading env file." }

Write-Host "Deploying on remote host..."
& ssh $scpKey "$User@$Host" @"
mkdir -p $RemotePath
cd $RemotePath
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy --schema prisma/schema.prisma || true
docker compose -f docker-compose.prod.yml ps
"@

Write-Host "Deployment completed."
