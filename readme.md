# Tencent Cloud Update SSL For CDN

该脚本适用于 Tencent Cloud 上传本地证书（推荐泛域名），并更新 CDN 证书

## 使用方法

1.安装依赖

```bash
pnpm i
```

2.填写配置

修改 `secretId` 和 `secretKey` 为你自己的，修改 `domain` 为你的域名，修改 `cert` 和 `key` 为你的证书路径

3.运行

```bash
node main.js
```
