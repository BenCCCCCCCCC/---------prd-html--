$ErrorActionPreference = 'Stop'
$workspaceDir = 'F:\html'
$projectDir = Join-Path $workspaceDir '网易云优化项目_Batch2_启动包_v1.1'
$archiveDir = Join-Path $workspaceDir '历史归档'
$recordDir = $PSScriptRoot
$records = [System.Collections.Generic.List[object]]::new()

function Assert-WorkspacePath([string]$path) {
    $absolute = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $path).ProviderPath)
    if (-not $absolute.StartsWith($workspaceDir + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "路径超出工作区：$absolute" }
    if ((Get-Item -LiteralPath $absolute -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "不处理链接路径：$absolute" }
    return $absolute
}

# Only the redundant outer input is removed; every file must exist unchanged inside the project.
$duplicateDir = Assert-WorkspacePath (Join-Path $workspaceDir 'finalization_input')
foreach ($file in Get-ChildItem -LiteralPath $duplicateDir -File -Recurse -Force) {
    $relative = $file.FullName.Substring($duplicateDir.Length + 1)
    $retained = Join-Path $projectDir ('finalization_input\' + $relative)
    if (-not (Test-Path -LiteralPath $retained) -or (Get-FileHash -LiteralPath $file.FullName).Hash -ne (Get-FileHash -LiteralPath $retained).Hash) { throw "输入副本不一致：$relative" }
}

$moves = @(
    'Batch2_交付','Batch2.1_交付','Batch2.1_备份_修改前','Batch2.1_收尾_交付_v0.2.3',
    'Batch2.1_收尾_备份_v0.2.2_20260906','Batch3_交付_v0.3.0','Batch3_备份_v0.2.3_20260906',
    'Batch3.1_交付_v0.3.1','Batch3.1_备份_v0.3.0_20260906','Batch3.2_备份_v0.3.1_20260906',
    'Batch2.1_CODEX_视觉对齐修正指令.md'
)
foreach ($name in $moves) {
    $source = Assert-WorkspacePath (Join-Path $workspaceDir $name)
    $group = if ($name -like '*备份*') { '历次备份' } elseif ($name -like '*交付*') { '历次交付' } else { '旧指令' }
    $parent = Join-Path $archiveDir $group
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    $target = [IO.Path]::GetFullPath((Join-Path $parent $name))
    if (-not $target.StartsWith($archiveDir + '\', [StringComparison]::OrdinalIgnoreCase) -or (Test-Path -LiteralPath $target)) { throw "归档目标不安全或已存在：$target" }
    $records.Add([pscustomobject]@{action='move';from=$source;to=$target})
    $records | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $recordDir '文件整理清单.json') -Encoding UTF8
    Move-Item -LiteralPath $source -Destination $target
}

$deletions = @(
    $duplicateDir,
    (Join-Path $projectDir '.cache'),
    (Join-Path $projectDir 'node_modules\.vite'),
    (Join-Path $projectDir 'node_modules\.vite-temp'),
    (Join-Path $projectDir 'test-results'),
    (Join-Path $projectDir 'artifacts\batch3-2\office-lock-check.tmp')
)
foreach ($path in $deletions) {
    if (-not (Test-Path -LiteralPath $path)) { continue }
    $safePath = Assert-WorkspacePath $path
    $item = Get-Item -LiteralPath $safePath -Force
    $files = if ($item.PSIsContainer) { @(Get-ChildItem -LiteralPath $safePath -Recurse -Force -File) } else { @($item) }
    if ($item.PSIsContainer -and @(Get-ChildItem -LiteralPath $safePath -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw "清理目录内有链接：$safePath" }
    $inventory = @($files | ForEach-Object { [pscustomobject]@{path=$_.FullName;bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName).Hash} })
    $records.Add([pscustomobject]@{action='delete_redundant_or_regenerable';path=$safePath;files=$inventory;bytes=($files | Measure-Object Length -Sum).Sum})
    $records | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $recordDir '文件整理清单.json') -Encoding UTF8
    Remove-Item -LiteralPath $safePath -Recurse -Force
}

$launcher = Join-Path $projectDir 'scripts\open-preview.ps1'
[IO.File]::WriteAllText($launcher, [IO.File]::ReadAllText($launcher), [Text.UTF8Encoding]::new($true))
$shell = New-Object -ComObject WScript.Shell
$link = $shell.CreateShortcut((Join-Path $workspaceDir '打开网页.lnk'))
$link.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$link.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $launcher + '"'
$link.WorkingDirectory = $projectDir
$link.WindowStyle = 7
$link.Description = '打开网易云推荐控制 PRD 与交互原型（本地）'
$link.IconLocation = (Join-Path $env:SystemRoot 'System32\shell32.dll') + ',13'
$link.Save()
[pscustomobject]@{status='PASS';moved=$moves.Count;cleanedBytes=($records | Where-Object action -eq 'delete_redundant_or_regenerable' | Measure-Object bytes -Sum).Sum;shortcut=$link.FullName} | ConvertTo-Json
