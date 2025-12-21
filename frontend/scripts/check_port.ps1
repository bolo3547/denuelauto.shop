Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Format-List -Force

try {
  $r = Invoke-WebRequest -Uri http://localhost:3001/hq/login -UseBasicParsing -TimeoutSec 10
  Write-Host "HTTP_STATUS: $($r.StatusCode) $($r.StatusDescription)"
  if ($r.Content) {
    $len = [Math]::Min(1000, $r.Content.Length)
    Write-Host "SNIPPET:"
    Write-Host $r.Content.Substring(0,$len)
  }
} catch {
  Write-Host "HTTP_ERROR: $($_.Exception.Message)"
}
