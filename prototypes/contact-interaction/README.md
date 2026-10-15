# CONTACT · 固定画面的失焦 / 对焦原型

交互预览：https://anaphy-contact-focus-reveal-preview.alightowlet66.chatgpt.site

只修改本目录。HOME、WORKS、ABOUT、PROJECT 未修改，未合并 PR。

## 固定画面

以已确认的对焦完成版为最终画面。完整联系方式 DOM 从 HTML 加载起就存在，始终占据相同位置，透明度始终为 1。四角取景标记、矩形边框、标题及片尾不参与动画。没有中央十字框、形变、插入面板、隐藏联系方式或高度动画。

只有 `.focus-content`（IN FOCUS 双语标题和三列联系信息）的 CSS filter 从 `blur(20px)` 在约 1 秒内变为 `blur(0px)`。不移动、不缩放、不裁切内容。返回取景反向失焦；重新对焦先失焦再清晰。重复点击取景区不会重启动画；Escape 可取消并恢复失焦。减少动态效果设置下立即切换。

初始底部“点击对焦”及取景区均可点击，右侧“直接查看”跳过动画。清晰后恢复原有“返回取景 / 重新对焦”。两个按钮固定占位，文字切换不改变布局。支持 Tab、Enter / Space、触屏。资料区初始 inert 防止误触，清晰后恢复操作；内容始终渲染，辅助入口始终可用。

本地可直接打开 index.html，或在本目录运行 `python3 -m http.server 8006 --bind 127.0.0.1`。

## 真实资料接口

contact-config.js 保留 email、wechat、resumeUrl、wechatQrUrl，当前均为 null。提供真实邮箱、微信号和实际存在的 PDF/二维码路径后才启用对应操作；缺失资料明确标为待接入，无虚假链接。支持 `ContactPrototype.configure(...)`，传 null 恢复空配置。剪贴板失败提示手动复制。跨域 PDF 的 download 属性取决于服务器，查看器仍可保存。

## 验证与截图

实际 Chromium 比较 1920×1080、1440×900、1366×768、390×844、320×568 的初始、动画中、完成状态元素位置与尺寸，并与修改前已确认的完成状态比较。检查触摸、键盘、反向动画、重复操作、辅助跳过和减少动态效果。320×568 保留纵向滚动及资料区独立滚动，无横向溢出。未验证 Safari、Firefox 或真实手机硬件。

- [桌面失焦](previews/initial-desktop.png)
- [桌面清晰](previews/focused-desktop.png)
- [手机失焦](previews/initial-mobile.png)
- [手机清晰](previews/focused-mobile.png)
