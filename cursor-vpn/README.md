# VPN

Cursor 对话笔记：Vultr + Hiddify 在武汉无法使用的排查思路。

仓库地址：<https://github.com/wang-qin54/VPN>

本仓库内容来自 [Cursor Cloud Agent](https://cursor.com) 对话归档。

## 对话摘要

1. **环境说明**：当前 Cursor 工作区为 `wang-qin54/Qin`，未发现名为 cursor-vpn 的仓库。
2. **问题**：使用 Vultr 服务器 + Hiddify 搭建 VPN，在武汉无法使用。
3. **结论方向**：多为 GFW / 运营商 DPI 对机房 IP 与协议的识别与封锁，而非单纯客户端配置错误。

## 快速排查清单

- [ ] 确认现象：连不上 vs 连上但无法上网
- [ ] 查看 Hiddify 日志中的 timeout / handshake 错误
- [ ] 协议优先：**VLESS + Reality**、Hysteria2、TUIC
- [ ] 避免：裸 WireGuard、OpenVPN、无伪装 VMESS
- [ ] 节点地区：日本 / 新加坡 / 韩国优于美国
- [ ] Vultr IP 可能被封：重建 VPS 换 IP 或换商家
- [ ] 客户端：先全局模式测试，检查 DNS 与分流规则

## 文件

| 文件 | 说明 |
|------|------|
| [`CONVERSATION.md`](./CONVERSATION.md) | 完整对话记录 |
| [`troubleshooting.md`](./troubleshooting.md) | VPN 排查指南（结构化版） |

## 同步到本仓库（`wang-qin54/VPN`）

若 Cloud Agent 无法直接推送（权限仅限 `Qin` 仓库），可在本机执行：

```bash
git clone -b cursor/cursor-vpn-c488 --single-branch https://github.com/wang-qin54/Qin.git vpn-temp
cd vpn-temp/cursor-vpn
git init
git add .
git commit -m "Initial commit: Cursor VPN conversation archive"
git branch -M main
git remote add origin https://github.com/wang-qin54/VPN.git
git push -u origin main
cd .. && rm -rf vpn-temp
```

## 免责声明

请确保网络使用方式符合当地法律法规。本文档仅供技术连通性排查参考。
