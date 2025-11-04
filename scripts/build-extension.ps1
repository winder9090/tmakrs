# 构建并打包浏览器插件
# 用法: .\scripts\build-extension.ps1

Write-Host "🔨 开始构建浏览器插件..." -ForegroundColor Cyan

# 进入 tab 目录并构建
Set-Location -Path "tab"
Write-Host "📦 正在构建插件..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

Write-Host "✅ 构建成功！" -ForegroundColor Green

# 压缩 dist 目录
Write-Host "📦 正在打包插件..." -ForegroundColor Yellow
$destPath = "..\tmarks\public\tmarks-extension.zip"
Compress-Archive -Path "dist\*" -DestinationPath $destPath -Force

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 打包失败！" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

# 返回根目录
Set-Location -Path ".."

# 获取文件信息
$zipFile = Get-Item "tmarks\public\tmarks-extension.zip"
$sizeKB = [math]::Round($zipFile.Length / 1KB, 2)
$sizeMB = [math]::Round($zipFile.Length / 1MB, 2)

Write-Host "✅ 打包成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📊 文件信息:" -ForegroundColor Cyan
Write-Host "  路径: tmarks\public\tmarks-extension.zip"
Write-Host "  大小: $sizeKB KB ($sizeMB MB)"
Write-Host "  时间: $($zipFile.LastWriteTime)"
Write-Host ""
Write-Host "🎉 插件已准备就绪，可以提供下载！" -ForegroundColor Green
