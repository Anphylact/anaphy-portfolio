# CONTACT · 固定画面的失焦 / 对焦原型

交互预览：https://anaphy-contact-focus-reveal-preview.alightowlet66.chatgpt.site

只修改本目录。HOME、WORKS、ABOUT、PROJECT 未修改，未合并 PR。

## 固定构图与相机拍摄

已确认的最终构图保持不变。完整联系方式 DOM 从 HTML 加载起就存在，始终占据相同位置、透明度为 1。外侧四个角标、原矩形边框、顶部标题、IN FOCUS 双语标题和片尾始终清晰、固定。只有联系信息区域参与模糊对焦。

点击取景区域后按一条约 1.5 秒的时间轴拍摄：

1. 细小白色十字先轻微收缩。
2. 同一组四条 SVG 路径的控制点连续向外移动，形成四角对焦框，联系信息同时从 blur(20px) 降至 blur(0)。
3. 约 0.96 秒完成锁定，白色线条稍微加粗，状态显示 LOCKED / 已锁定。
4. 约 1.19 秒触发一次约 90ms、峰值 16% 不透明度的白色快门曝光；没有声音、霓虹或反复闪烁。
5. 快门结束后辅助框轻轻退场，1.5 秒后进入清晰定格状态。对焦辅助图形与曝光层始终绝对定位且不接收点击，不改变原版排版。

初始“直接查看”可跳过整个动画。减少动态效果设置下同样立即切换，不播放对焦或闪光。返回取景会平滑失焦；重新对焦先恢复失焦再重新拍摄。取景区重复点击不重启动画，Escape 可取消拍摄并返回失焦，返回过程不触发闪光。支持键盘 Tab、Enter / Space、触屏。资料区失焦时 inert，拍摄完成后恢复操作；联系方式本身不插入、不隐藏、不淡入、不位移。

本地可直接打开 index.html，或在本目录运行 `python3 -m http.server 8006 --bind 127.0.0.1`。

## 真实资料接口

contact-config.js 保留 email、wechat、resumeUrl、wechatQrUrl，当前均为 null。提供真实邮箱、微信号和实际存在的 PDF/二维码路径后才启用对应操作；缺失资料明确标为待接入，无虚假链接。支持 `ContactPrototype.configure(...)`，传 null 恢复空配置。剪贴板失败提示手动复制。跨域 PDF 的 download 属性取决于服务器，查看器仍可保存。

## 验证与截图

实际 Chromium 比较 1920×1080、1440×900、1366×768、390×844、320×568 的初始、动画中、完成状态元素位置与尺寸，并与修改前已确认的完成状态比较。检查十字收缩及变框的中间路径、锁定与快门阶段、辅助框最终退场、触摸、键盘、反向动画、重复操作、辅助跳过和减少动态效果。320×568 保留纵向滚动及资料区独立滚动，无横向溢出。未验证 Safari、Firefox 或真实手机硬件。

- [桌面失焦](previews/initial-desktop.png)
- [桌面清晰](previews/focused-desktop.png)
- [手机失焦](previews/initial-mobile.png)
- [手机清晰](previews/focused-mobile.png)

- [对焦锁定](previews/locked-desktop.png)
- [快门拍摄](previews/shutter-desktop.png)
