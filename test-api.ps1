try {
    $response = Invoke-WebRequest -Uri "https://tawjih-net.netlify.app/api/health" -Method Get
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Content:"
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

try {
    $setupResponse = Invoke-WebRequest -Uri "https://tawjih-net.netlify.app/api/admin/setup" -Method Get
    Write-Host "`nSetup Status Code: $($setupResponse.StatusCode)"
    Write-Host "Setup Content:"
    Write-Host $setupResponse.Content
} catch {
    Write-Host "Setup Error: $($_.Exception.Message)"
}