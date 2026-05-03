Write-Host "[release-check] backend tests"
Push-Location ".backend"
mvn -q test
Pop-Location

Write-Host "[release-check] frontend build"
Push-Location ".frontend"
npm install
npm run build
Pop-Location

Write-Host "[release-check] docker compose validation"
docker compose config | Out-Null

Write-Host "[release-check] done"
