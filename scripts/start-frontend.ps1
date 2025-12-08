#!/usr/bin/env pwsh
# Script de inicialização obrigatório do frontend HumaniQ na porta 5000
# Este script garante que o frontend rode exclusivamente na porta 5000

param(
    [Parameter(Mandatory = $false)]
    [switch]$SkipPortCheck,
    
    [Parameter(Mandatory = $false)]
    [switch]$Force,
    
    [Parameter(Mandatory = $false)]
    [switch]$NoBrowser
)

# Cores para output
$Colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
    Default = "White"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "Default"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-PortAvailability {
    param([int]$Port)
    
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

function Get-ProcessByPort {
    param([int]$Port)
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    $processes = @()
    
    foreach ($conn in $connections) {
        if ($conn.OwningProcess) {
            try {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    $processes += [PSCustomObject]@{
                        PID       = $process.Id
                        Name      = $process.ProcessName
                        StartTime = $process.StartTime
                        Port      = $Port
                    }
                }
            }
            catch {
                Write-ColorOutput "[WARN] Nao foi possivel obter informacoes do processo $($conn.OwningProcess)" "Warning"
            }
        }
    }
    
    return $processes
}

function Stop-ProcessByPort {
    param(
        [int]$Port,
        [switch]$Force
    )
    
    $processes = Get-ProcessByPort -Port $Port
    
    if ($processes.Count -eq 0) {
        Write-ColorOutput "[OK] Nenhum processo encontrado na porta $Port" "Success"
        return $true
    }
    
    Write-ColorOutput ("Processos encontrados na porta {0}:" -f $Port) "Info"
    $processes | Format-Table -AutoSize
    
    if (!$Force) {
        $confirm = Read-Host "Deseja encerrar estes processos? (S/N)"
        if ($confirm -ne 'S' -and $confirm -ne 's') {
            Write-ColorOutput "[ERROR] Operacao cancelada pelo usuario" "Error"
            return $false
        }
    }
    
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.PID -Force -ErrorAction Stop
            Write-ColorOutput "[OK] Processo $($proc.Name) (PID: $($proc.PID)) encerrado" "Success"
        }
        catch {
            Write-ColorOutput "[ERROR] Erro ao encerrar processo $($proc.Name) (PID: $($proc.PID)): $_" "Error"
            return $false
        }
    }
    
    # Aguardar liberação da porta
    Start-Sleep -Seconds 2
    
    # Verificar se ainda há processos
    $remaining = Get-ProcessByPort -Port $Port
    if ($remaining.Count -gt 0) {
        Write-ColorOutput "[WARN] Ainda ha processos na porta $Port apos tentativa de encerramento" "Warning"
        return $false
    }
    
    Write-ColorOutput "[OK] Porta $Port liberada com sucesso!" "Success"
    return $true
}

function Write-StartupLog {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message"
    
    # Criar diretório de logs se não existir
    $logDir = Join-Path $PSScriptRoot "..\logs"
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    $logFile = Join-Path $logDir "frontend-startup.log"
    Add-Content -Path $logFile -Value $logEntry
    
    # Escrever no console com cores baseadas no tipo
    switch ($Type) {
        "ERROR" { Write-ColorOutput $Message "Error" }
        "WARN" { Write-ColorOutput $Message "Warning" }
        "SUCCESS" { Write-ColorOutput $Message "Success" }
        default { Write-ColorOutput $Message "Info" }
    }
}

function Show-StartupBanner {
    Write-ColorOutput "HUMANIQ FRONTEND - Inicializando na porta 5000..." "Info"
}

function Start-FrontendDevelopment {
    Write-StartupLog "Iniciando frontend HumaniQ em modo desenvolvimento"
    Write-StartupLog "Porta obrigatoria: 5000"
    
    # Verificar se node_modules existe
    $nodeModulesPath = Join-Path (Split-Path $PSScriptRoot -Parent) "node_modules"
    if (!(Test-Path $nodeModulesPath)) {
        Write-ColorOutput "[ERROR] node_modules nao encontrado. Execute 'npm install' primeiro." "Error"
        exit 1
    }
    
    # Preparar ambiente
    $projectRoot = Split-Path $PSScriptRoot -Parent
    Set-Location $projectRoot
    
    Write-StartupLog "Diretorio do projeto: $projectRoot"
    
    # Executar comando npm
    try {
        Write-StartupLog "Executando: npm run dev -- --port 5000 --host 0.0.0.0 --strictPort"
        
        # Usar Start-Process para melhor controle
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "npm.cmd"
        $processInfo.Arguments = "run dev -- --port 5000 --host 0.0.0.0 --strictPort"
        $processInfo.WorkingDirectory = $projectRoot
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.CreateNoWindow = $false
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        
        $process.Start() | Out-Null

        # Registrar início
        Write-StartupLog "Frontend iniciado com sucesso na porta 5000" "SUCCESS"
        Write-StartupLog "Processo PID: $($process.Id)"
        Write-StartupLog "URL: http://localhost:5000"
        
        if (!$NoBrowser) {
            Write-StartupLog "Abrindo navegador..."
            Start-Process "http://localhost:5000"
        }
        
        # Aguardar processo
        $process.WaitForExit()
        
        # Registrar término
        Write-StartupLog "Frontend encerrado (PID: $($process.Id))" "WARN"
        
        if ($process.ExitCode -ne 0) {
            Write-StartupLog "Frontend encerrado com erro (codigo: $($process.ExitCode))" "ERROR"
        }
    }
    catch {
        Write-StartupLog "Erro ao iniciar frontend: $_" "ERROR"
        exit 1
    }
}

# Função principal
function Main {
    Show-StartupBanner
    
    Write-ColorOutput "[CONFIG] Configuracao obrigatoria: Frontend deve rodar na porta 5000" "Info"
    Write-ColorOutput "[CHECK] Verificando disponibilidade da porta 5000..." "Info"
    
    # Verificar disponibilidade da porta 5000
    $portAvailable = Test-PortAvailability -Port 5000
    
    if (!$portAvailable -and !$SkipPortCheck) {
        Write-ColorOutput "[ERROR] Porta 5000 esta ocupada!" "Error"
        
        $processes = Get-ProcessByPort -Port 5000
        if ($processes.Count -gt 0) {
            Write-ColorOutput "[WARN] Processos encontrados:" "Warning"
            $processes | Format-Table -AutoSize
        }
        
        Write-ColorOutput "[RETRY] Tentando liberar porta 5000..." "Info"
        $success = Stop-ProcessByPort -Port 5000 -Force:$Force
        
        if (!$success) {
            Write-ColorOutput "[ERROR] Nao foi possivel liberar a porta 5000. Encerrando..." "Error"
            Write-ColorOutput "[TIP] Dica: Execute com -Force para forcar encerramento" "Info"
            exit 1
        }
        
        # Aguardar liberação completa
        Start-Sleep -Seconds 3
        
        # Verificar novamente
        if (!(Test-PortAvailability -Port 5000)) {
            Write-ColorOutput "[ERROR] Porta 5000 ainda ocupada apos tentativa de liberacao" "Error"
            exit 1
        }
    }
    
    Write-ColorOutput "[OK] Porta 5000 esta disponivel!" "Success"
    Write-ColorOutput "[START] Iniciando frontend HumaniQ..." "Info"
    
    # Registrar evento de inicialização
    Write-StartupLog "=== INICIALIZACAO DO FRONTEND HUMANIQ ===" "SUCCESS"
    Write-StartupLog "Porta: 5000 (obrigatoria)"
    Write-StartupLog "Data/Hora: $(Get-Date)"
    Write-StartupLog "Usuario: $env:USERNAME"
    Write-StartupLog "Maquina: $env:COMPUTERNAME"
    
    # Iniciar desenvolvimento
    Start-FrontendDevelopment
    
    # Registrar término
    Write-StartupLog "=== FRONTEND ENCERRADO ===" "WARN"
}

# Executar função principal
Main