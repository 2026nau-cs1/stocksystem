$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Push-Location $projectRoot
try {
    $mvn = Get-Command mvn -ErrorAction SilentlyContinue
    if (-not $mvn) {
        throw "Global Maven was not found. Open a new terminal and run 'mvn -version' to confirm it is on PATH."
    }
    & $mvn.Source spring-boot:run
} finally {
    Pop-Location
}
