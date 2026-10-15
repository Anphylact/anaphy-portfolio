# CONTACT · THE FINAL FRAME / 最后一帧

独立预览：https://anaphy-contact-focus-reveal-preview.alightowlet66.chatgpt.site

仅修改本目录；不整合或修改 HOME、WORKS、ABOUT、PROJECT，不自动合并 PR。

## 相机状态与交互

- 初始：OUT OF FOCUS / 尚未对焦，右上 STANDBY / 待机。联系信息原位 blur(20px)，中央是清晰的细十字及紧邻的四角小框。主操作只有 CLICK TO FOCUS / 点击对焦。
- 对焦：小框与十字整体轻微收紧，信息逐渐清晰，文案 FOCUSING... / 正在对焦…。所有内容坐标保持固定。
- 锁定：小框白色线条略微加粗，文案 FOCUS LOCKED / 焦点已锁定，右上 LOCKED / 已锁定。
- 快门：自动触发一次约 90ms、峰值 16% 的白色闪光，文案 CAPTURING... / 正在拍摄…。
- 快门后：中央十字和小框完全消失，信息保持清晰。文案 IN FOCUS. LET'S CONNECT. / 已对焦，期待与你联系。，右上 FOCUSED / 已对焦。主操作只有 REFOCUS / 重新对焦，点击仅恢复未对焦状态，不自动再拍摄。

拍摄约 1.3 秒。没有大矩形边框、新面板、信息位移或信息淡入淡出。外侧四个取景角标、顶部标题和片尾始终清晰固定。小框为 48×48px 绝对定位 SVG，四角实际轨迹约 33px 宽，十字约 7px；通过控制点及整体轻微缩放收紧，不采用十字模糊变化。辅助标记在快门结束时归零透明度。

删除 VIEW NOW 和 BACK TO FRAME。单一按钮固定占位，状态文字不引起布局跳动。动画期间防重复触发；Escape 可取消并恢复未对焦。支持触屏、Tab、Enter / Space。减少动态效果下立即切换，不播放闪光。未来资料复制/邮件/简历接口不变，未配置资料保持明确的待接入状态及禁用操作。

## 资料与本地运行

contact-config.js 中 email、wechat、resumeUrl、wechatQrUrl 当前均为 null。仅接入真实资料，不创建虚假邮箱、微信号或文件。运行时可用 ContactPrototype.configure(...)；传 null 恢复占位。复制失败会提示手动复制。

直接打开 index.html；或本目录运行 `python3 -m http.server 8006 --bind 127.0.0.1` 后访问 http://127.0.0.1:8006/ 。

## 验证与截图

Chromium 实际渲染并逐阶段截图：1920×1080、1440×900、1366×768、390×844、320×568。检查初始、对焦、锁定、快门和快门后文案、标记及模糊程度，断言标题、信息、外侧角标和片尾位置与上一版一致，检查单按钮、触摸、键盘、重新对焦恢复、取消及减少动态效果。小屏允许纵向滚动以保持可读，无横向溢出。未测试 Safari、Firefox 或真实手机硬件。

- [初始](previews/initial-desktop.png)
- [对焦中](previews/focusing-desktop.png)
- [锁定](previews/locked-desktop.png)
- [快门](previews/shutter-desktop.png)
- [拍摄后](previews/focused-desktop.png)
- [手机初始](previews/initial-mobile.png)
- [手机拍摄后](previews/focused-mobile.png)
