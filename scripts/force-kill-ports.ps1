
$ports = @(3001, 10000, 5000)
Write-Host "Starting cleanup..."
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            if ($proc.OwningProcess) {
                try {
                    Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-Host "Killed process $($proc.OwningProcess) on port $port"
                }
                catch {
                    Write-Host "Failed to kill process $($proc.OwningProcess)"
                }
            }
        }
    }
    else {
        Write-Host "No process on $port"
    }
}
Write-Host "Done"
