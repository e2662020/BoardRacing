# MOB Broadcast System - 启动脚本
# 用于启动开发服务器

$projectPath = "c:\Users\Administrator\Desktop\MOB_Package\mob-broadcast-system"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MOB Broadcast System 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "$projectPath\package.json")) {
    Write-Host "错误: 未找到 package.json 文件" -ForegroundColor Red
    Write-Host "请确保在正确的项目目录中运行此脚本" -ForegroundColor Red
    exit 1
}

# 切换到项目目录
Set-Location $projectPath
Write-Host "工作目录: $projectPath" -ForegroundColor Green
Write-Host ""

# 检查 node_modules 是否存在
if (-not (Test-Path "$projectPath\node_modules")) {
    Write-Host "检测到 node_modules 不存在，正在安装依赖..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "依赖安装失败，请检查网络连接或 npm 配置" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    Write-Host "依赖安装完成!" -ForegroundColor Green
    Write-Host ""
}

# 启动开发服务器
Write-Host "正在启动开发服务器..." -ForegroundColor Cyan
Write-Host "服务器将在 http://localhost:5173 运行" -ForegroundColor Cyan
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

npm run dev

# 如果服务器异常退出
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "服务器启动失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "请检查: " -ForegroundColor Yellow
    Write-Host "  1. 端口 5173 是否被占用" -ForegroundColor Yellow
    Write-Host "  2. package.json 中的脚本配置是否正确" -ForegroundColor Yellow
    Write-Host "  3. 项目文件是否完整" -ForegroundColor Yellow
}
