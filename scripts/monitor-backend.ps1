# ================================================
# HUMANIQ AI - MONITOR DE CONECTIVIDADE BACKEND
# ================================================
# Script para monitorar continuamente a conectividade
# com o backend Render e notificar mudanças de status
# ================================================

param(
    [int]$IntervalMinutes = 2,
    # URL padrão do backend em produção (Render)
    [string]$BackendUrl = "https://h2-8xej.onrender.com",
    [switch]$Verbose
)

# Configurações
$ErrorActionPreference = "SilentlyContinue"
$ProgressPreference = "SilentlyContinue"

# Variáveis de estado
$LastStatus = $null
$CheckCount = 0
$StartTime = Get-Date

# Endpoints para testar
$Endpoints = @(
    @{ Path = "/api/health"; Name = "Health Check"; Critical = $true },
    @{ Path = "/api/auth/check"; Name = "Auth Check"; Critical = $true },
    @{ Path = "/api"; Name = "API Root"; Critical = $false }
)

# Função para exibir cabeçalho
function Show-Header {
    Clear-Host
    Write-Host "MONITOR DE CONECTIVIDADE BACKEND RENDER" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "Backend: $BackendUrl" -ForegroundColor White
    Write-Host "Intervalo: $IntervalMinutes minutos" -ForegroundColor White
    Write-Host "Iniciado: $($StartTime.ToString('HH:mm:ss dd/MM/yyyy'))" -ForegroundColor White
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
}

# Função para testar conectividade
function Test-BackendConnectivity {
    $Results = @()
    
    foreach ($Endpoint in $Endpoints) {
        $Url = "$BackendUrl$($Endpoint.Path)"
        $Result = @{
            Endpoint = $Endpoint.Name
            Path = $Endpoint.Path
            Url = $Url
            Status = "Unknown"
            StatusCode = 0
            ResponseTime = 0
            Error = $null
            Critical = $Endpoint.Critical
        }
        
        try {
            $StartTest = Get-Date
            $Response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -UseBasicParsing
            $EndTest = Get-Date
            
            $Result.Status = "Online"
            $Result.StatusCode = $Response.StatusCode
            $Result.ResponseTime = ($EndTest - $StartTest).TotalMilliseconds
            
        } catch {
            $Result.Status = "Offline"
            $Result.Error = $_.Exception.Message
            
            # Extrair código de status se disponível
            if ($_.Exception.Response) {
                $Result.StatusCode = $_.Exception.Response.StatusCode.value__
            }
        }
        
        $Results += $Result
    }
    
    return $Results
}

# Função para determinar status geral
function Get-OverallStatus {
    param($Results)
    
    $CriticalEndpoints = $Results | Where-Object { $_.Critical -eq $true }
    $OnlineCritical = $CriticalEndpoints | Where-Object { $_.Status -eq "Online" }
    
    if ($OnlineCritical.Count -eq $CriticalEndpoints.Count) {
        return "Online"
    } elseif ($OnlineCritical.Count -gt 0) {
        return "Parcial"
    } else {
        return "Offline"
    }
}

# Função para exibir resultados
function Show-Results {
    param($Results, $OverallStatus)
    
    $script:CheckCount++
    $CurrentTime = Get-Date
    
    Write-Host "VERIFICACAO #$CheckCount - $($CurrentTime.ToString('HH:mm:ss'))" -ForegroundColor Yellow
    Write-Host ""
    
    # Status geral
    $StatusColor = switch ($OverallStatus) {
        "Online" { "Green" }
        "Parcial" { "Yellow" }
        "Offline" { "Red" }
    }
    
    Write-Host "STATUS GERAL: " -NoNewline
    Write-Host $OverallStatus.ToUpper() -ForegroundColor $StatusColor
    Write-Host ""
    
    # Detalhes por endpoint
    foreach ($Result in $Results) {
        $Icon = if ($Result.Status -eq "Online") { "[OK]" } else { "[ERRO]" }
        $Color = if ($Result.Status -eq "Online") { "Green" } else { "Red" }
        
        Write-Host "$Icon $($Result.Endpoint)" -ForegroundColor $Color
        Write-Host "   Path: $($Result.Path)" -ForegroundColor Gray
        
        if ($Result.Status -eq "Online") {
            Write-Host "   Status: $($Result.StatusCode) | Tempo: $([math]::Round($Result.ResponseTime))ms" -ForegroundColor Gray
        } else {
            Write-Host "   Erro: $($Result.Error)" -ForegroundColor Red
            if ($Result.StatusCode -gt 0) {
                Write-Host "   Codigo: $($Result.StatusCode)" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}

# Função para notificar mudança de status
function Notify-StatusChange {
    param($OldStatus, $NewStatus, $Results)
    
    Write-Host "MUDANCA DE STATUS DETECTADA!" -ForegroundColor Magenta
    Write-Host "   Anterior: $OldStatus" -ForegroundColor Gray
    Write-Host "   Atual: $NewStatus" -ForegroundColor White
    Write-Host ""
    
    if ($NewStatus -eq "Online") {
        Write-Host "BACKEND RENDER ESTA ONLINE!" -ForegroundColor Green
        Write-Host "   Todos os endpoints criticos estao funcionando" -ForegroundColor Green
        Write-Host "   Voce pode usar o sistema normalmente" -ForegroundColor Green
    } elseif ($NewStatus -eq "Offline") {
        Write-Host "BACKEND RENDER ESTA OFFLINE!" -ForegroundColor Red
        Write-Host "   Endpoints criticos nao estao respondendo" -ForegroundColor Red
        Write-Host "   Continuando monitoramento..." -ForegroundColor Yellow
    } else {
        Write-Host "BACKEND RENDER PARCIALMENTE ONLINE" -ForegroundColor Yellow
        Write-Host "   Alguns endpoints funcionando, outros nao" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
}

# Loop principal de monitoramento
try {
    Show-Header
    
    Write-Host "Iniciando monitoramento continuo..." -ForegroundColor Yellow
    Write-Host "   Pressione Ctrl+C para parar" -ForegroundColor Gray
    Write-Host ""
    
    while ($true) {
        # Testar conectividade
        $Results = Test-BackendConnectivity
        $CurrentStatus = Get-OverallStatus -Results $Results
        
        # Verificar mudança de status
        if ($LastStatus -ne $null -and $LastStatus -ne $CurrentStatus) {
            Notify-StatusChange -OldStatus $LastStatus -NewStatus $CurrentStatus -Results $Results
        }
        
        # Exibir resultados
        Show-Results -Results $Results -OverallStatus $CurrentStatus
        
        # Atualizar status anterior
        $LastStatus = $CurrentStatus
        
        # Aguardar próxima verificação
        Write-Host "Proxima verificacao em $IntervalMinutes minutos..." -ForegroundColor Gray
        Write-Host "   Pressione Ctrl+C para parar o monitoramento" -ForegroundColor DarkGray
        Write-Host ""
        
        Start-Sleep -Seconds ($IntervalMinutes * 60)
        
        # Limpar tela para próxima verificação (manter histórico das últimas 3)
        if ($CheckCount % 3 -eq 0) {
            Show-Header
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "Monitoramento interrompido pelo usuario" -ForegroundColor Yellow
    Write-Host "Total de verificacoes: $CheckCount" -ForegroundColor White
    Write-Host "Tempo de execucao: $((Get-Date) - $StartTime)" -ForegroundColor White
    Write-Host ""
    Write-Host "Obrigado por usar o Monitor de Conectividade HumaniQ AI!" -ForegroundColor Cyan
}