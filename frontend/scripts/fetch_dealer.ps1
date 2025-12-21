try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3001/dealer-template' -UseBasicParsing -TimeoutSec 10
  Write-Host "HTTP: $($r.StatusCode)"
  if ($r.Content) {
    $len = [Math]::Min(800, $r.Content.Length)
    Write-Host $r.Content.Substring(0,$len)
  }
} catch {
  Write-Host "ERR: $($_.Exception.Message)"
}
