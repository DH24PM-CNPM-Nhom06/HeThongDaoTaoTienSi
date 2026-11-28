$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot
$envLocalPath = Join-Path $repoRoot '.env.local'
$sharedEnvPath = Join-Path $repoRoot '.env'
$templatePath = Join-Path $repoRoot '.env.example'
$databaseSeedPath = Join-Path $repoRoot 'DTMS_BACKUP/DTMS_DuLieuGoc_Va_KiemThu.sql'

if (-not (Test-Path -LiteralPath $templatePath)) {
    throw 'Missing .env.example. Run this script from a complete DTMS checkout.'
}
if (-not (Test-Path -LiteralPath $databaseSeedPath)) {
    throw 'Missing DTMS_BACKUP/DTMS_DuLieuGoc_Va_KiemThu.sql. Include the SQL seed when sharing the repo.'
}

$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
$dockerPath = if ($dockerCommand) { $dockerCommand.Source } else { $null }
if (-not $dockerPath) {
    $candidates = @()
    if ($env:ProgramFiles) { $candidates += Join-Path $env:ProgramFiles 'Docker/Docker/resources/bin/docker.exe' }
    if ($env:LOCALAPPDATA) { $candidates += Join-Path $env:LOCALAPPDATA 'Programs/DockerDesktop/resources/bin/docker.exe' }
    $dockerPath = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if (-not $dockerPath) {
    throw 'Docker CLI was not found. Install Docker Desktop, open it, wait for Engine running, then retry.'
}

$engineVersion = & $dockerPath info --format '{{.ServerVersion}}' 2>$null
if ($LASTEXITCODE -ne 0 -or -not $engineVersion) {
    throw 'Docker Engine is not ready. Open Docker Desktop, wait for Engine running, then retry.'
}

function Read-EnvValues([string[]]$Lines) {
    $values = @{}
    foreach ($line in $Lines) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$') {
            $values[$Matches[1]] = $Matches[2]
        }
    }
    return $values
}

function New-RandomHex([int]$ByteCount) {
    $bytes = New-Object byte[] $ByteCount
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
    }
    finally {
        $rng.Dispose()
    }
    return ([BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
}

function Test-LocalPortAvailable([int]$Port) {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    try {
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        $listener.Stop()
    }
}

if (Test-Path -LiteralPath $envLocalPath) {
    $sourcePath = $envLocalPath
    $configSource = 'existing .env.local'
}
elseif (Test-Path -LiteralPath $sharedEnvPath) {
    $sourcePath = $sharedEnvPath
    $configSource = 'existing local .env'
}
else {
    $sourcePath = $templatePath
    $configSource = 'shared template'
}

$lines = [System.Collections.Generic.List[string]]::new()
foreach ($line in [System.IO.File]::ReadAllLines($sourcePath, [System.Text.Encoding]::UTF8)) {
    $lines.Add($line)
}
$values = Read-EnvValues $lines.ToArray()
$fallbackValues = @{}
if ($sourcePath -ne $sharedEnvPath -and (Test-Path -LiteralPath $sharedEnvPath)) {
    $fallbackLines = [System.IO.File]::ReadAllLines($sharedEnvPath, [System.Text.Encoding]::UTF8)
    $fallbackValues = Read-EnvValues $fallbackLines
}

$secretSizes = [ordered]@{
    MARIADB_PASSWORD = 24
    MARIADB_ROOT_PASSWORD = 24
    JWT_KEY = 32
}
$missingSecrets = @(
    foreach ($key in $secretSizes.Keys) {
        $value = $values[$key]
        if ([string]::IsNullOrWhiteSpace($value) -and -not [string]::IsNullOrWhiteSpace($fallbackValues[$key])) {
            $value = $fallbackValues[$key]
        }
        if ([string]::IsNullOrWhiteSpace($value)) { $key }
    }
)

if ($missingSecrets.Count -gt 0) {
    $volumeName = 'hethongdaotaotiensi_dtms_db_data'
    & $dockerPath volume inspect $volumeName *> $null
    if ($LASTEXITCODE -eq 0) {
        throw 'The DTMS database volume already exists but its local secrets are missing. Restore .env.local or .env before starting; new passwords cannot unlock an existing DB volume.'
    }
}

foreach ($key in $secretSizes.Keys) {
    $value = $values[$key]
    if ([string]::IsNullOrWhiteSpace($value) -and -not [string]::IsNullOrWhiteSpace($fallbackValues[$key])) {
        $value = $fallbackValues[$key]
    }
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = New-RandomHex $secretSizes[$key]
    }
    $values[$key] = $value
}

$hostPorts = [ordered]@{
    FRONTEND_HOST_PORT = 4174
    API_HOST_PORT = 8080
    MARIADB_HOST_PORT = 3307
}
if ($configSource -eq 'shared template') {
    $reservedPorts = @()
    foreach ($key in $hostPorts.Keys) {
        $preferredPort = 0
        if ($values.ContainsKey($key)) { [void][int]::TryParse($values[$key], [ref]$preferredPort) }
        if ($preferredPort -lt 1 -or $preferredPort -gt 65535) { $preferredPort = $hostPorts[$key] }
        $port = $preferredPort
        while (($reservedPorts -contains $port) -or -not (Test-LocalPortAvailable $port)) {
            $port++
            if ($port -gt 65535) { throw "No available local port found for $key." }
        }
        $values[$key] = [string]$port
        $reservedPorts += $port
    }
}

$keysToWrite = @($secretSizes.Keys)
if ($configSource -eq 'shared template') { $keysToWrite += @($hostPorts.Keys) }
$seenKeys = @{}
$updatedLines = [System.Collections.Generic.List[string]]::new()
foreach ($line in $lines) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') {
        $key = $Matches[1]
        if ($keysToWrite -contains $key) {
            $updatedLines.Add("$key=$($values[$key])")
            $seenKeys[$key] = $true
            continue
        }
    }
    $updatedLines.Add($line)
}
foreach ($key in $keysToWrite) {
    if (-not $seenKeys.ContainsKey($key)) { $updatedLines.Add("$key=$($values[$key])") }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$envContents = [string]::Join([Environment]::NewLine, $updatedLines) + [Environment]::NewLine
[System.IO.File]::WriteAllText($envLocalPath, $envContents, $utf8NoBom)
Write-Host "Prepared per-machine .env.local from $configSource; secret values were not displayed."

Push-Location $repoRoot
try {
    & $dockerPath compose --env-file $envLocalPath up --build -d
    if ($LASTEXITCODE -ne 0) { throw 'Docker Compose failed to start DTMS.' }
    & $dockerPath compose --env-file $envLocalPath ps
    $frontendPort = if ($values.ContainsKey('FRONTEND_HOST_PORT')) { $values['FRONTEND_HOST_PORT'] } else { '4174' }
    $apiPort = if ($values.ContainsKey('API_HOST_PORT')) { $values['API_HOST_PORT'] } else { '8080' }
    Write-Host "Frontend: http://localhost:$frontendPort"
    Write-Host "Swagger:  http://localhost:$apiPort/swagger"
}
finally {
    Pop-Location
}
