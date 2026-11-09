# AeroTrack Pro - Lightweight Local Web Server & OpenSky ADS-B Proxy
$baseDir = $PSScriptRoot
$configPath = Join-Path $baseDir "config.json"

$port = 8080
$openSkyUser = ""
$openSkyPass = ""

if (Test-Path $configPath) {
    try {
        $jsonCfg = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($jsonCfg.port) { $port = $jsonCfg.port }
        if ($jsonCfg.openSky -and $jsonCfg.openSky.username) {
            $openSkyUser = $jsonCfg.openSky.username
            $openSkyPass = $jsonCfg.openSky.password
        }
    } catch {}
}

$prefix = "http://localhost:$port/"

if (-not [System.Net.HttpListener]::IsSupported) {
    Write-Error "HttpListener is not supported on this Windows machine."
    exit 1
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Port $port might be in use, trying port 8085..." -ForegroundColor Yellow
    $port = 8085
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AEROTRACK PRO - FLIGHT TRACKER LOCAL SERVER & PROXY" -ForegroundColor Green
Write-Host "  URL: $prefix" -ForegroundColor White
Write-Host "  Live OpenSky ADS-B Proxy: Enabled at /api/live-flights" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Launch browser
Start-Process $prefix

# Cache for OpenSky requests to comply with rate limits (10s cache)
$global:lastOpenSkyFetch = [DateTime]::MinValue
$global:cachedOpenSkyData = $null

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        $rawQuery = $request.Url.Query

        # CORS Headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # 1. OpenSky ADS-B Live Proxy Endpoint
        if ($urlPath -eq "/api/live-flights") {
            $now = [DateTime]::UtcNow
            $age = ($now - $global:lastOpenSkyFetch).TotalSeconds

            $response.ContentType = "application/json; charset=utf-8"

            if ($age -gt 8 -or $null -eq $global:cachedOpenSkyData) {
                try {
                    $targetUrl = "https://opensky-network.org/api/states/all"
                    if (-not [string]::IsNullOrEmpty($rawQuery)) {
                        $targetUrl += $rawQuery
                    }

                    Write-Host "[API] Fetching fresh ADS-B state vectors from OpenSky..." -ForegroundColor Gray
                    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                    $webClient = New-Object System.Net.WebClient
                    $webClient.Headers.Add("User-Agent", "AeroTrackPro/1.0 (FlightTrackerApp)")

                    if (-not [string]::IsNullOrEmpty($openSkyUser) -and -not [string]::IsNullOrEmpty($openSkyPass)) {
                        $authString = "${openSkyUser}:${openSkyPass}"
                        $base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($authString))
                        $webClient.Headers.Add("Authorization", "Basic $base64Auth")
                    }

                    $jsonContent = $webClient.DownloadString($targetUrl)

                    $global:cachedOpenSkyData = $jsonContent
                    $global:lastOpenSkyFetch = $now
                } catch {
                    Write-Host "[API Error] OpenSky Network: $($_.Exception.Message)" -ForegroundColor Red
                    if ($null -eq $global:cachedOpenSkyData) {
                        $global:cachedOpenSkyData = '{"time":0,"states":[]}'
                    }
                }
            }

            $buffer = [System.Text.Encoding]::UTF8.GetBytes($global:cachedOpenSkyData)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()
            continue
        }

        # 2. Static File Server
        $relPath = $urlPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($relPath) -or $relPath -eq "index.html") {
            $relPath = "index.html"
        }

        $filePath = Join-Path $baseDir ($relPath -replace '/', '\')

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }

            $response.ContentType = $mime
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentLength64 = $notFoundBytes.Length
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }

        $response.Close()
    }
} finally {
    $listener.Stop()
}

