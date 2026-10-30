# Run the downloaded harness with data isolated from any existing Raven installation.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$env:RAVEN_HOME = Join-Path $projectRoot '.raven-local'
$workRoot = Join-Path $projectRoot 'work'
New-Item -ItemType Directory -Force -Path $workRoot | Out-Null
Set-Location $workRoot
if (-not (Test-Path (Join-Path $projectRoot 'upstream-raven/pyproject.toml'))) {
    throw 'Download Raven first; see README.md.'
}
uv run --project (Join-Path $projectRoot 'upstream-raven') --no-sync raven serve --port 18792
