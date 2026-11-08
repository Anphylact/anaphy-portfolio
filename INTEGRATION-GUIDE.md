# 全站整合 / Portfolio integration · PR #15

本轮继续更新同一分支 integrate-approved-portfolio 和同一 PR #15，不创建重复 PR，不合并 main。

预览：https://anaphy-portfolio-integrated-preview.alightowlet66.chatgpt.site/?v=integration-fixes-3

## 本轮功能修复（integration-fixes-3）

- **NEXT 就绪死锁**：旧桥接在 `DOMContentLoaded` 后再等两次 `requestAnimationFrame` 才发 ready；当浏览器暂停屏外 iframe 绘制时，外层等待下一章 ready，下一章又要等进入视口后才能绘制。现在 DOM 就绪即可通信，另有 iframe load/connect 握手，不依赖屏外绘制。受控浏览器复现中，暂停屏外 rAF 的旧版点击 NEXT 后仍停留 HOME/moving；新版正常进入 WORKS 并结束 moving。这个测试验证暂停条件下的死锁，并不声称已复现每种线上浏览器的所有故障。
- NEXT 使用独立原生 button 和直接 click 绑定，圆、文字、间距与边缘留白共享明确命中区域；键盘 Enter/Space 与触屏均可触发。翻章继续使用 1000ms 真实纵向位移，没有 opacity 替代。
- 手机端移除 `left:12px; transform:none` 覆盖，控件以视口 50% 和自身宽度居中，支持安全区域。CONTACT 单独避让拍摄按钮和片尾；800px 以下短手机视口为固定导航留出 76px 区域，原 CONTACT 文档在其 iframe 内按原响应式布局滚动，不移动其信息模块或修改内部 CSS。
- ABOUT 展开模块和 PROJECT 共用同一白色 SVG X、48×48 点击区域、右上角边距、悬停与焦点反馈。仅关闭控件换装，原关闭/返回处理保留。普通四章节没有新增 X。
- CONTACT 同一信息 DOM 的 blur 连续经过 `20 → 4.5 → 12 → 0px`，先寻找焦点、再锁定；小对焦框收紧/放松，锁定后白色短闪，最后辅助标记消失。完整拍摄约 1.53 秒；重置/中途 Escape 保持连续，减少动态效果直接清晰且无闪光。
- 未修改首页泡泡、轮盘源组件与参数、ABOUT 模块代码、作品数据或视频信息功能。入口 HTML 只更新共享资源版本参数。

### 本轮实际验证

Chromium，本地 HTTP；1920×1080、1440×900、1366×768、390×844、320×568。手机为触屏仿真，不是真机。

- 真实鼠标点击 NEXT 中文文字、控件边缘，以及手机 tap、键盘 Space/Enter；确认 HOME→WORKS、WORKS→ABOUT、CONTACT→HOME，结束后完整吸附；中途测量两章相接边缘误差 <0.1px、轨道 opacity=1。
- 右侧直接跳转 CONTACT、唯一横杠 DOM 持续存在、历史前进/后退、允许区域向上滚轮返回 HOME、轮盘滚轮不翻章。
- 320/390 控件中心等于视口中心，左右边缘命中；CONTACT NEXT 不与拍摄控件或片尾文本相交。
- ABOUT 五模块打开关闭、TOOLKIT 软件切换、PROFILE 内部滚动；详情关闭与 ABOUT 关闭的 48×48 位置一致，作品 03 的中央卡片真实点击进入详情，X 返回后仍选中作品 03。
- 拍摄过程逐帧采样验证第二次失焦、锁定、闪光和最终状态；前后 `.contact-grid` 的几何完全一致。初始 OUT OF FOCUS，过程中 FOCUSING，最终 IN FOCUS；最终十字/小框 opacity=0。
- 减少动态效果、三种尺寸的详情返回和五模块关闭，以及 JS 语法与 Git 差异检查通过。临时服务、自动化脚本、报告不提交。旧轮次测试记录如下，适用范围按该轮说明；未声称测试 Safari、Firefox 或真实手机。

本轮截图：[CONTACT 桌面](docs/integration/previews/fixes-3/contact-desktop.png) · [手机失焦](docs/integration/previews/fixes-3/contact-standby-mobile.png) · [手机定格](docs/integration/previews/fixes-3/contact-focused-mobile.png) · [320px 短屏](docs/integration/previews/fixes-3/contact-short-mobile.png) · [ABOUT 关闭](docs/integration/previews/fixes-3/about-close-mobile.png) · [详情关闭](docs/integration/previews/fixes-3/project-close-mobile.png)。

## 原有轨道导航方式

四个入口路径保持不变：index.html → works.html → about.html → contact.html → index.html。它们现在共用一个常驻外层文档、一条真实纵向轨道和一份固定导航。原有内容文档位于 chapters/home.html、works.html、about.html、contact.html，在同源 iframe 内保持独立样式和脚本作用域。

- NEXT：轨道整体 translate3d，当前章节移出、相邻章节从下方进入，动画 1000ms，缓动 cubic-bezier(.22,.61,.36,1)。结束时准确停在一个完整视口位置。
- 允许区域的鼠标滚轮：向下进入下一章，向上返回上一章。累计阈值和吸附后的短冷却阻止一次惯性滚动连续翻多章。
- CONTACT → HOME 的 NEXT 同样向上移动：将原 HOME 槽位临时放到 CONTACT 下方，完成后无可见跳动地归位。向上从 HOME 返回 CONTACT 使用相同原理；不复制页面或重建 iframe。
- 右侧章节名称、姓名菜单、ABOUT 相关作品：直接定位目标，不播放跨多个章节的长距离动画。
- 页面位移不使用 opacity、页面快照或蓝色淡入淡出。中间时刻同时可见相接的两个真实页面，所有页面与轨道底色为 #002FA7。
- 右侧仅有一个持久的 #site-indicator 元素，固定在轨道之外。横杠不替换、不淡出，以 420ms transform 过渡移到对应章节。手机仍使用水平横杠，窄幅竖排名称不挤压原画布。
- URL 使用原来的四个 HTML 路径，history.pushState / popstate 支持直接访问、刷新、后退和前进；点击当前章节不增加重复历史记录。

减少动态效果下直接吸附，不播放轨道或指示条过渡，CONTACT 既有的无闪光处理保留。根页面和共享资源加入版本参数，避免沿用上一版淡入淡出脚本的缓存。

## 滚轮与触屏的优先级

| 当前区域 | 行为 |
| --- | --- |
| HOME 普通画布区域的滚轮 | 切换相邻章节；泡泡拖动/弹动/点破保持原逻辑 |
| WORKS 轮盘区域 | 滚轮和拖动优先交给轮盘，不翻章 |
| WORKS 标题上方等非交互留白 | 允许滚轮翻章 |
| ABOUT 初始页非控件留白 | 允许滚轮翻章 |
| ABOUT 任意展开模块 | 不用滚轮翻章；PROFILE 在自身区域滚动，到边界也不串章 |
| CONTACT 小屏有内容可滚动时 | 优先滚动该章节内容；到边界后的允许区域可用鼠标滚轮翻章，滚轮不触发对焦 |
| 按钮、链接、输入区、固定导航 | 不将其滚轮用于翻章；Ctrl 滚轮和横向手势不用于翻章 |
| 手机手指滑动 | 保留组件原有手势，不增加全局翻章手势；通过 NEXT 体验连续上滑或点击章节直达 |

原始页面自身仍拥有触摸事件和滚动区域。外层只接收经过区域规则筛选的滚轮消息，不抢 WORKS 拖动、PROFILE 手势或 CONTACT 点击。

## 批准版与修改边界

| 页面 | 批准版实际来源 |
| --- | --- |
| HOME | main 1885091 的首页和 bubbles.js |
| WORKS / PROJECT | main 1885091，已合并 PR #5 |
| ABOUT | PR #9 / about-overview-balance，c2930a9 |
| CONTACT | PR #14 / contact-focus-state-fix，0693928 |

原轨道整合提交为 869299c（基于 7514c5c）。当时将其四个内容文档原样移入 chapters，仅补充 base 路径、章节标识和资源版本；内部 body 标记不变。bubbles.js、ABOUT 的原型文件、作品数据、视频详情脚本/样式、WORKS 视觉 CSS 和原轮盘组件源码保持原样。本轮只在共享整合层统一关闭控件，并调整 CONTACT 脚本中的光学时间曲线，未改 CONTACT 的布局、DOM、资料或样式。

WORKS 源码仅在已有详情跳转处加入导航桥接，避免在子文档里打开详情；重新构建现有 bundle，未改变卡片尺寸、曲率、透视、滚轮、惯性或吸附参数。详情仍在原 project.html 中正常打开，返回 WORKS 后以稳定作品 ID 恢复位置。URL selected 与原有 sessionStorage 状态同步到外层，非首个作品、跨章节返回及刷新均验证保持。

HOME 离开视口时通过既有暂停按钮暂停后台漂动，返回时只恢复由导航暂停的漂动。用户手动暂停不会被覆盖，核心气泡代码与已经绘制的泡泡不重建。其他章节也保留自身模块状态。

## 实际测试

测试环境：本地 HTTP + Chromium 154，触屏为浏览器仿真，不是真实手机硬件。未验证 Safari / Firefox。

- 1920×1080、1440×900、1366×768、390×844、320×568：实际截图并检查 HOME → WORKS 的中间形态。旧页底边与新页顶边误差小于 0.1px，轨道透明度始终为 1，效果时长为 1000ms。端到端一次记录约 1.28 秒，包含章节就绪等待和绘制，不将动画时长等同于所有设备上的总加载时间。
- 验证唯一指示条 DOM 身份不变、opacity 始终为 1、横向尺寸不变为竖线、切换期间存在真实 transform 中间值。
- 点击 CONTACT 后轨道立即位于 -3 × 视口高度，没有轨道动画，也不经过中间章节；只有同一个指示条继续平滑移动。
- NEXT 正向循环、向上循环、移动中点击导航中断、窗口变化后的吸附、浏览器后退/前进均通过。
- 三个桌面尺寸测试 HOME 普通滚轮、WORKS 内部滚轮只切作品、WORKS 留白向上返回。轮盘视觉与行为沿用批准组件。
- 两种手机尺寸使用真实 touchStart/touchMove/touchEnd 事件验证轮盘拖动、PROFILE 独立滚动、CONTACT 滑动不误对焦/翻章、NEXT 和菜单点击。
- 五种尺寸对比 iframe 内 ABOUT / CONTACT 与批准原型：主体几何、iframe 的真实视口尺寸、ABOUT 五模块可见展开 SVG 和正文一致。
- 验证作品 04 的详情返回、跨章节返回、刷新恢复，以及 CONTACT 拍摄/重新对焦、TOOLKIT 切换、五模块打开关闭、减少动态效果。
- 验证同章节点击不堆叠历史、姓名菜单 Escape、HOME 手动暂停跨章节保留。
- 在 /anaphy-portfolio/ 仓库子路径实测资源加载、作品 03 ↔ 04 的历史恢复、浏览器前进以及从详情页浏览器后退。恢复子文档时使用 replace 导航，避免插入额外历史或截断前进记录。
- 语法、Git 差异、原始内容及资源路径检查通过。临时服务、测试脚本、报告和 node_modules 不提交。

## 截图

| 内容 | 桌面 | 手机 |
| --- | --- | --- |
| HOME | [截图](docs/integration/previews/index-desktop.png) | [截图](docs/integration/previews/index-mobile.png) |
| WORKS | [截图](docs/integration/previews/works-desktop.png) | [截图](docs/integration/previews/works-mobile.png) |
| ABOUT | [截图](docs/integration/previews/about-desktop.png) | [截图](docs/integration/previews/about-mobile.png) |
| CONTACT | [截图](docs/integration/previews/contact-desktop.png) | [截图](docs/integration/previews/contact-mobile.png) |
| NEXT 移动中 | [截图](docs/integration/previews/next-mid-desktop.png) | [截图](docs/integration/previews/next-mid-mobile.png) |
| CONTACT 定格 | [截图](docs/integration/previews/contact-focused-desktop.png) | [截图](docs/integration/previews/contact-focused-mobile.png) |

[同一指示条移动中](docs/integration/previews/indicator-motion-desktop.png) · [手机快捷导航](docs/integration/previews/menu-mobile.png)

为清楚截取中间形态，NEXT 中间截图将浏览器中正在运行的原动画暂停于 250ms；另有未暂停的实时时长测试。截图来自实际渲染，没有拼接两个页面。

## 本地预览与后续修改

在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，访问 http://127.0.0.1:8000/index.html 。远程请使用上方完整交互预览。部署时保留 chapters/、assets/、prototypes/ 等完整运行目录；章节同源承载，不能只上传四个入口文件。

修改页面内容时编辑 chapters/ 对应文档或既有模块脚本，不把旧页面内容放回轨道入口。作品仍编辑 assets/js/projects-data.js，CONTACT 资料仍在 prototypes/contact-interaction/contact-config.js；全部占位保持原样，没有新增真实资料或虚假下载链接。
