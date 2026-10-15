# CONTACT · THE FINAL FRAME / 最后一帧

独立 HTML / CSS / JavaScript 原型，无构建或第三方依赖。只修改本目录，未整合或修改正式 HOME、WORKS、ABOUT、PROJECT。

## 交互预览

新版：https://anaphy-contact-focus-reveal-preview.alightowlet66.chatgpt.site

上一版供对比：https://anaphy-contact-final-frame-preview.alightowlet66.chatgpt.site

使用当前 ChatGPT 账号访问独立私有预览。点击中央取景器或键盘 Tab 后 Enter / Space：对焦框先收缩，再连续扩展成联系信息的外框，EMAIL、WECHAT、RESUME 在框内由模糊到清晰。信息不在初始状态提前出现，也没有下方独立联系栏。

同一个始终不透明的 DOM 轮廓贯穿两个状态；共享时间进度控制框的位置、宽高、准星、文字位置及内容裁切与清晰度。返回取景沿同一路径反向播放，重新对焦完整往返。动画中可按 Escape 或点击返回，保留播放速度平滑制动后反转。鼠标跟随使用阻尼弹簧，最大位移 12 × 9px，仅在初始状态生效。

“直接查看联系方式”跳过动画，减少动态效果设置同样立即切换，手机支持触摸。原生按钮、可见键盘焦点与实时状态提示；展开完毕才允许操作内容，关闭后焦点回到取景器。所有主要英文操作附有中文。

## 本地运行

直接打开本目录 index.html；或在本目录运行 `python3 -m http.server 8006 --bind 127.0.0.1`，本机访问 http://127.0.0.1:8006/ 。复制需浏览器支持安全上下文剪贴板；失败会提供手动复制提示。

## 接入真实资料

编辑 contact-config.js 的四项配置，当前全部为 null：

```js
window.CONTACT_CONFIG = Object.freeze({
  email: null,
  wechat: null,
  resumeUrl: null,
  wechatQrUrl: null
});
```

提供真实邮箱、微信号，以及实际存在的 PDF 路径/HTTPS 地址后，对应操作才启用。二维码地址可选，未提供时不显示入口。无资料时明确显示“待接入”，复制禁用，链接没有 href。不会生成虚假文件或地址。

也支持运行时 `ContactPrototype.configure({ email, wechat, resumeUrl, wechatQrUrl })`，传 null 可恢复占位。查看 PDF 在新标签页打开，下载使用原生 download 属性；跨域服务器可能忽略该属性，此时可在 PDF 查看器保存。实际 PDF 内容和服务器响应仍需提供资料后验证。

## 实际浏览器检查

Chromium：1920×1080、1440×900、1366×768、390×844、320×568。检查初始/展开截图、连续轮廓的中间尺寸、反向关闭、动画中取消、重新对焦中取消、触摸配置、键盘及减少动态效果。测试资料仅注入测试浏览器内，验证邮件/PDF/二维码接口及复制成功、失败、重置，不写入交付页面。

常规桌面和 390×844 适应视口；320×568 保留可读尺寸，允许页面纵向滚动。联系信息区在内容较长时可独立滚动；所有尺寸无页面横向溢出。未测试真实手机硬件、Safari 或 Firefox。

- [桌面初始](previews/initial-desktop.png)
- [桌面展开](previews/focused-desktop.png)
- [手机初始](previews/initial-mobile.png)
- [手机展开](previews/focused-mobile.png)
