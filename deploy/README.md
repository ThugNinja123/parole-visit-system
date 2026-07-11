# Deploy scripts

## `push-to-ecr.ps1` / `push-to-ecr.bat`

Builds the `production` target of `backend/Dockerfile` and
`frontend/Dockerfile` and pushes both to ECR. Creates the ECR repositories on
first run if they don't exist.

Prerequisites: Docker Desktop running, AWS CLI v2 installed and configured
(`aws configure` or SSO) with ECR push permissions.

```powershell
# from repo root
.\deploy\push-to-ecr.ps1 -AwsAccountId 123456789012 -AwsRegion ap-south-1 `
    -ViteApiBaseUrl https://api.yourdomain.com/api
```

or from `cmd.exe` / double-click:

```bat
deploy\push-to-ecr.bat -AwsAccountId 123456789012 -AwsRegion ap-south-1 -ViteApiBaseUrl https://api.yourdomain.com/api
```

Useful flags:
- `-Service backend|frontend|all` (default `all`)
- `-ImageTag <tag>` (default: UTC timestamp) — use a git sha/build number for traceability
- `-DryRun` — build and tag locally, skip login/push

Outputs the final `<account>.dkr.ecr.<region>.amazonaws.com/<repo>:<tag>` URIs
to paste into the ECS task definition.
