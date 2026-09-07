param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$previewUrl = 'http://127.0.0.1:4173/'

function Read-Preview {
    try { return (Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 2).Content }
    catch { return $null }
}

try {
    $indexPath = Join-Path $projectDir 'dist\index.html'
    if (-not (Test-Path -LiteralPath $indexPath)) { throw '未找到已构建的网页，请保留工程内的 dist 文件夹。' }
    $expectedHtml = [System.IO.File]::ReadAllText($indexPath)
    $currentHtml = Read-Preview
    $started = $false
    if ($null -ne $currentHtml -and $currentHtml -cne $expectedHtml) {
        throw '本地 4173 端口正在显示其他页面。请先关闭占用该端口的预览，再打开此入口。'
    }
    if ($null -eq $currentHtml) {
        $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
        $nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
            Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
        }
        if (-not (Test-Path -LiteralPath $nodePath)) { throw '需要本机 Node.js 才能启动网页；本入口不会自动安装软件。' }
        $logDir = Join-Path $projectDir '.cache\preview'
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        $serverPath = Join-Path $PSScriptRoot 'serve-dist.mjs'
        $previewProcess = Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $projectDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir 'server.log') -RedirectStandardError (Join-Path $logDir 'server-error.log') -PassThru
        $started = $true
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            Start-Sleep -Milliseconds 500
            $currentHtml = Read-Preview
            if ($null -ne $currentHtml) { break }
            if ($previewProcess.HasExited) { break }
        }
    }
    if ($currentHtml -cne $expectedHtml) { throw '本地网页未成功启动，请查看工程 .cache\preview 中的启动日志。' }
    if ($CheckOnly) {
        [pscustomobject]@{ status = 'PASS'; url = $previewUrl; startedServer = $started; matchesCurrentBuild = $true } | ConvertTo-Json
    } else {
        Start-Process $previewUrl
    }
} catch {
    if ($CheckOnly) { throw }
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, '打开本地网页') | Out-Null
    exit 1
}
