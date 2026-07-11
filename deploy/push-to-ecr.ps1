<#
.SYNOPSIS
    Builds the backend/frontend production images and pushes them to ECR.

.DESCRIPTION
    Uses the `production` target (the default target) in backend/Dockerfile
    and frontend/Dockerfile. Creates the ECR repositories if they don't exist
    yet, tags each image with both a unique tag and `latest`, and pushes both.

.PARAMETER AwsAccountId
    12-digit AWS account id. Auto-detected via `aws sts get-caller-identity`
    if omitted.

.PARAMETER AwsRegion
    AWS region for ECR. Defaults to $env:AWS_REGION, then "us-east-1".

.PARAMETER RepoPrefix
    Prefix for the two ECR repository names: "<prefix>-backend" and
    "<prefix>-frontend".

.PARAMETER ImageTag
    Tag applied alongside `latest`. Defaults to a UTC timestamp
    (yyyyMMddHHmmss). Use your CI build number / git sha for traceability.

.PARAMETER ViteApiBaseUrl
    Vite bakes VITE_* vars in at build time, so the frontend image must be
    built per-environment with the backend's public URL, e.g.
    https://api.yourdomain.com/api. Required when building the frontend.

.PARAMETER Service
    Which image(s) to build/push: backend, frontend, or all (default).

.PARAMETER DryRun
    Build and tag locally but skip docker login/push. Useful to sanity-check
    the build before pushing.

.EXAMPLE
    .\deploy\push-to-ecr.ps1 -AwsAccountId 123456789012 -AwsRegion ap-south-1 `
        -ViteApiBaseUrl https://api.yourdomain.com/api

.EXAMPLE
    .\deploy\push-to-ecr.ps1 -Service backend -ImageTag (git rev-parse --short HEAD)
#>

[CmdletBinding()]
param(
    [string]$AwsAccountId,

    [string]$AwsRegion = $(if ($env:AWS_REGION) { $env:AWS_REGION } elseif ($env:AWS_DEFAULT_REGION) { $env:AWS_DEFAULT_REGION } else { "us-east-1" }),

    [string]$RepoPrefix = "parole-visit-portal",

    [string]$ImageTag = (Get-Date -Format "yyyyMMddHHmmss"),

    [string]$ViteApiBaseUrl,

    [ValidateSet("backend", "frontend", "all")]
    [string]$Service = "all",

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

function Assert-CommandExists {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name is required on PATH but was not found."
    }
}

function Ensure-EcrRepository {
    param([string]$RepoName, [string]$Region)
    aws ecr describe-repositories --repository-names $RepoName --region $Region *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating ECR repository '$RepoName' in $Region ..." -ForegroundColor Yellow
        aws ecr create-repository `
            --repository-name $RepoName `
            --region $Region `
            --image-scanning-configuration scanOnPush=true | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Failed to create ECR repository '$RepoName'." }
    }
}

function Build-AndPushImage {
    param(
        [string]$Context,
        [string]$RepoName,
        [string]$Registry,
        [string]$Tag,
        [string[]]$BuildArgs = @()
    )

    Ensure-EcrRepository -RepoName $RepoName -Region $AwsRegion

    $imageUri = "$Registry/$RepoName"
    $taggedImage = "${imageUri}:${Tag}"
    $latestImage = "${imageUri}:latest"

    $buildArgFlags = @()
    foreach ($arg in $BuildArgs) { $buildArgFlags += @("--build-arg", $arg) }

    Write-Host ""
    Write-Host "==> Building $taggedImage" -ForegroundColor Cyan
    docker build @buildArgFlags -t $taggedImage -t $latestImage $Context
    if ($LASTEXITCODE -ne 0) { throw "docker build failed for '$RepoName'." }

    if ($DryRun) {
        Write-Host "==> DryRun set, skipping push for $RepoName" -ForegroundColor Yellow
        return $taggedImage
    }

    Write-Host "==> Pushing $taggedImage" -ForegroundColor Cyan
    docker push $taggedImage
    if ($LASTEXITCODE -ne 0) { throw "docker push failed for '$taggedImage'." }

    docker push $latestImage
    if ($LASTEXITCODE -ne 0) { throw "docker push failed for '$latestImage'." }

    return $taggedImage
}

Assert-CommandExists -Name "docker"
Assert-CommandExists -Name "aws"

if ($Service -in @("frontend", "all") -and -not $ViteApiBaseUrl) {
    Write-Warning "ViteApiBaseUrl not set - the frontend image will be built with an empty API base URL. Pass -ViteApiBaseUrl https://api.yourdomain.com/api."
}

if (-not $AwsAccountId) {
    Write-Host "Resolving AWS account id via 'aws sts get-caller-identity' ..."
    $AwsAccountId = (aws sts get-caller-identity --query Account --output text).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $AwsAccountId) { throw "Could not resolve AWS account id. Pass -AwsAccountId explicitly." }
}

$registry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"

Write-Host "AWS account : $AwsAccountId"
Write-Host "AWS region  : $AwsRegion"
Write-Host "Registry    : $registry"
Write-Host "Image tag   : $ImageTag"
Write-Host "Service(s)  : $Service"
Write-Host "Dry run     : $($DryRun.IsPresent)"

if (-not $DryRun) {
    Write-Host ""
    Write-Host "==> Logging in to ECR ..." -ForegroundColor Cyan
    aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $registry
    if ($LASTEXITCODE -ne 0) { throw "docker login to ECR failed." }
}

$pushedImages = @{}

if ($Service -in @("backend", "all")) {
    $pushedImages["backend"] = Build-AndPushImage `
        -Context (Join-Path $RepoRoot "backend") `
        -RepoName "$RepoPrefix-backend" `
        -Registry $registry `
        -Tag $ImageTag
}

if ($Service -in @("frontend", "all")) {
    $pushedImages["frontend"] = Build-AndPushImage `
        -Context (Join-Path $RepoRoot "frontend") `
        -RepoName "$RepoPrefix-frontend" `
        -Registry $registry `
        -Tag $ImageTag `
        -BuildArgs @("VITE_API_BASE_URL=$ViteApiBaseUrl")
}

Write-Host ""
Write-Host "==> Done. Image URI(s) for the ECS task definition:" -ForegroundColor Green
foreach ($key in $pushedImages.Keys) {
    Write-Host "  $key : $($pushedImages[$key])"
}
