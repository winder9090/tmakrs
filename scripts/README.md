# 构建脚本说明

## 浏览器插件构建

### 自动构建脚本

使用 PowerShell 脚本自动构建并打包插件：

```powershell
.\scripts\build-extension.ps1
```

这个脚本会：
1. 构建 `tab` 目录中的浏览器插件
2. 将 `dist` 目录压缩为 `tmarks-extension.zip`
3. 复制到 `tmarks/public/` 目录
4. 显示文件大小和更新时间

### 手动构建步骤

如果需要手动构建：

```powershell
# 1. 进入插件目录
cd tab

# 2. 构建插件
pnpm run build

# 3. 压缩 dist 目录
Compress-Archive -Path "dist\*" -DestinationPath "..\tmarks\public\tmarks-extension.zip" -Force

# 4. 返回根目录
cd ..
```

### 验证构建结果

```powershell
# 查看文件信息
Get-Item "tmarks\public\tmarks-extension.zip" | Select-Object Name, Length, LastWriteTime
```

## 更新插件下载页面

构建完成后，记得更新 `tmarks/src/pages/extension/ExtensionPage.tsx` 中的版本信息：

```typescript
版本：1.0.0 | 大小：约 270 KB | 更新时间：2024-10-26
```

## 注意事项

1. **构建前确保依赖已安装**
   ```powershell
   cd tab
   pnpm install
   ```

2. **测试插件**
   - 解压 `tmarks-extension.zip`
   - 在浏览器中加载解压后的文件夹
   - 测试所有功能是否正常

3. **版本管理**
   - 每次发布新版本时，更新 `tab/manifest.json` 中的版本号
   - 同步更新下载页面的版本信息

4. **文件大小**
   - 当前压缩后约 270 KB
   - 如果大小变化较大，记得更新页面说明
