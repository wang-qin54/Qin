# Vultr + Hiddify 在武汉无法使用 — 排查指南

## 现象对照

| 现象 | 可能原因 |
|------|----------|
| 一直连接中 / 超时 | IP 被封、端口被拦、协议被识别 |
| 显示已连接，网页打不开 | DNS、路由、分流规则 |
| 只有部分 App 不行 | 分流规则、UDP 被拦 |

## 推荐协议（国内环境）

### 优先使用

1. **VLESS + Reality**
2. **Hysteria2**
3. **TUIC**

### 尽量避免单独使用

- WireGuard
- OpenVPN
- 无伪装的 VMESS / VLESS
- 老版 Shadowsocks

## VLESS + Reality 配置要点

- `dest` / `serverNames`：使用真实可访问的大站（如 `www.microsoft.com`）
- 端口尽量使用 **443**
- 客户端与服务端参数必须完全一致

## Vultr 节点选择

优先尝试：

- 日本东京
- 新加坡
- 韩国

美国节点在武汉往往更不稳定。同一地区可销毁重建 VPS 以更换 IP。

## Hiddify 客户端设置

- 测试时使用 **全局模式**
- DNS：远程 DNS 或 `8.8.8.8` / `1.1.1.1`（在代理内解析）
- 保持客户端为最新版本
- Android：关闭对该 App 的省电限制
- iOS：注意后台刷新设置

## 基础连通性测试

在武汉本地（不开启 VPN）执行：

```bash
ping 你的VultrIP
```

若 ping 全丢或极不稳定，优先换 IP 或换机房/商家，而非继续微调客户端。

## 待补充信息（便于进一步诊断）

1. 具体协议：VLESS-Reality / Hysteria2 / WireGuard / 其他？
2. Vultr 机房：哪个国家/城市？
3. 客户端：Android / iOS / Windows？
4. 现象：连不上，还是连上不能上网？
5. Hiddify 日志最后几行报错内容？

## 若 Vultr 长期不稳定

1. 保留 Vultr，增加国内中转（relay）
2. 换对亚洲线路更好的 VPS 商家（需实测）
3. 多节点 + 自动切换
