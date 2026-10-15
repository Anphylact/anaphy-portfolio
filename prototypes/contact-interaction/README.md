# CONTACT 独立交互原型 · THE FINAL FRAME / 最后一帧

仅新增本目录，不连接或修改正式 HOME、WORKS、PROJECT，也不修改已确认 ABOUT。纯 HTML、CSS、JavaScript，无框架、构建工具或外部字体依赖。

## 预览与操作

在本目录运行：

```sh
python3 -m http.server 8005 --bind 127.0.0.1
```

同一设备访问 `http://127.0.0.1:8005/`。本地址是本机服务，不是远程设备可访问的链接。资源全部采用相对路径；本环境浏览器限制 file://，实际验证通过 HTTP 完成。

四角线条进入时逐渐绘制，标题柔和出现。桌面鼠标在取景器中移动，中央对焦框沿保留速度的临界阻尼弹簧轻微跟随，最大目标位移为横向 12px、纵向 9px；文字不跟随移动。点击画面或用 Tab 聚焦后按 Enter / Space，对焦框约 0.82 秒收缩并轻微回弹，完成后显示中英双语“已对焦，期待与你联系”。可再次点击重试；播放期间重复点击不重启动画。

手机可直接触摸点击。prefers-reduced-motion 下不播放入场、跟随与收缩动画，点击直接呈现已对焦状态；运行中开启该设置也立即结束动画。联系方式从进入页面起始终可见，与对焦结果无关。

英文标题、按钮、操作提示及摄影机状态均配有中文；主要中文为 14～18px，辅助状态为 12px，摄影机界面小字为 11～12px。

## 替换真实联系方式

真实邮箱及简历目前均未提供，`contact-config.js` 中保留：

```js
window.CONTACT_CONFIG = Object.freeze({
  email: null,
  resumeUrl: null
});
```

以后将 email 改为本人真实邮箱，将 resumeUrl 改为实际简历文件的相对路径或 HTTPS 地址。必须同时提供对应文件，原型不会创建简历文件，也不会假设占位文件存在。

也保留运行时 `ContactPrototype.configure({ email, resumeUrl })` 接口。传 null 可恢复待接入状态。未配置时 EMAIL / RESUME 没有 href，COPY EMAIL 禁用并有明确中文说明。配置真实邮箱后启用 mailto 和复制；复制成功才显示“邮箱已复制”，剪贴板受限时提示手动复制。简历入口只在实际配置地址后启用，拒绝 javascript: 等脚本 URL。

## 实际截图与验证

- [桌面初始状态](previews/initial-desktop.png)
- [桌面对焦完成](previews/focused-desktop.png)
- [手机初始状态](previews/initial-mobile.png)
- [手机对焦完成](previews/focused-mobile.png)

截图来自实际 Chromium 渲染。检查了 1920×1080、1440×900、1366×768、390×844、320×568，标题、取景器、联系方式和片尾均在视口内，无页面溢出。验证了弹簧跟随的中间位置、连续收缩、重复触发保护、真实鼠标/触屏点击、键盘操作、减少动态效果及运行中切换设置。

未来数据接口另以仅存在测试浏览器内的保留测试域名验证复制成功/失败、非法简历 URL 拒绝与恢复空配置；未将测试地址写入原型或交付截图。未声称测试 Safari / Firefox 或真实手机硬件。

## 独立交互预览

https://anaphy-contact-final-frame-preview.alightowlet66.chatgpt.site

使用当前 ChatGPT 账号访问。这是新的独立 Sites 站点，不覆盖正式网站或之前的 ABOUT 预览。点击中央取景区域即可测试完整对焦动画。
