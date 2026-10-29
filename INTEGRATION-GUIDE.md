# 全站整合 / Portfolio integration

本分支只将已确认的页面接入统一导航，不合并其他 PR、不修改作品资料。所有新增导航均有中英双语。

## 批准版来源

| 页面 | 实际来源 | 版本 |
| --- | --- | --- |
| HOME | main 的 index.html、bubbles.js | 18850917177c418cf8e3ae9d37009365167c511e |
| WORKS / PROJECT | 已合并的 PR #5，main 的正式页面、bundle 与数据 | 同上 |
| ABOUT | PR #9，about-overview-balance 的 prototypes/about-interaction/ | c2930a96a2a304e0ad1d3260ec07fa4cb173938f |
| CONTACT | PR #14，contact-focus-state-fix 的 prototypes/contact-interaction/ | 0693928d01040fdc73d13182c76481dfbd94336f |

ABOUT 与 CONTACT 的原 PR 尚未合并。本整合分支直接带入对应批准目录的完整快照；原目录中的 34 个文件与各自源分支逐字节一致。无需先合并旧原型 PR 才能审阅本分支。

bubbles.js、WORKS 的 JS/bundle/CSS、projects-data.js、PROJECT 的 JS/CSS 均保持 main 原样。index.html、works.html、project.html 只加入共享 CSS/JS 引用。新增 about.html、contact.html 引用原型目录中的既有样式和脚本，不复制或重写模块实现。左上署名转换为菜单触发按钮，ABOUT 的 CLOSE / 相关作品操作在正式入口补充中文；原型本身不改。

## 页面与导航

入口顺序：index.html → works.html → about.html → contact.html → index.html。

- 右侧固定四个章节名称，当前章节用白色长条及 aria-current 标识。手机采用窄幅竖向排版，保持主体画布的原尺寸，触摸命中范围向两侧扩展。
- 左上 GAO MINGYUAN 展开快捷导航；支持触摸、Tab、上下方向键、Home / End、Escape。点击外部或焦点离开时关闭。
- 底部白色圆形箭头为 NEXT / 下一页；CONTACT 的下一页回到 HOME。
- assets/js/site.js 只处理导航链接和 ABOUT 原有的 about:related-works 事件。相关作品入口连接作品选集，不凭空添加分类或筛选数据。
- 采用独立 HTML 页面，不引入新框架或路由库；已批准 WORKS 内既有 React bundle 原样保留。各页 CSS/脚本作用域继续分离。

## 章节过渡与冲突隔离

共享蓝色遮幕分别渐出 450ms、渐入 450ms；两个文档之间始终保持 #002FA7。真实资源加载和首次脚本执行可能增加总耗时，0.9 秒是过渡动画本身的时长。静态预取只缓存下一章节的资源，不提前执行其交互。浏览器后退/前进恢复时会清除旧遮幕与导航锁，避免 bfcache 还原后无法点击。

章节切换由明确的导航操作触发。共享层不注册 wheel、touchmove 或触屏翻章手势：WORKS 原来的滚轮、拖动、惯性和吸附继续由轮盘处理，PROFILE 继续在自身区域滚动，CONTACT 继续只由点击/键盘启动对焦。减少动态效果设置下章节切换直接完成，CONTACT 原有的无闪光处理保留。

WORKS 原有 selected URL 参数与 anaphy-selected 会话存储接口保持不变。详情返回、跨章节回到 WORKS、刷新均恢复原来的稳定作品 ID；没有改为容易错位的数组位置。

## 实际验证

Chromium 154，桌面与触屏仿真；未测试 Safari / Firefox 或真实手机硬件。

- 1440×900、390×844、320×568：实际渲染四页面并截图，均无横向溢出或脚本错误；额外检查 1920×1080、1366×768 下的导航菜单与布局。
- 五种视口比较正式 ABOUT / CONTACT 与批准原型的身份、圆环、标题、正文、取景角标及片尾位置；ABOUT 五个模块的当前可见展开 SVG 与正文均与原型一致。
- 桌面 HOME → WORKS → ABOUT → CONTACT → HOME 整圈导航、姓名快捷菜单、Escape 和浏览器历史恢复通过。
- WORKS 实际滚轮控制、拖动中实时变化、释放后的惯性和最终吸附通过，无章节跳转；原有左右键与按钮不被共享层拦截。
- 用非首个作品 placeholder-04 验证：中央作品进详情、返回、离开章节再返回、刷新均保持 04；视频仍不自动播放。实际作品视频目前为空，未声称测试不存在的真实视频。
- ABOUT 五个模块在桌面及两种手机尺寸打开/关闭；TOOLKIT 软件说明切换通过。390px 下 PROFILE 内容完整可见，无需滚动；320px 下真实触屏滑动使 PROFILE 独立滚动，页面 scrollY 保持 0。
- CONTACT 普通滚轮、真实触屏滑动不启动对焦，点击后保留锁定、快门及定格，重新对焦恢复初始状态；减少动态效果通过。
- 首页气泡按钮、重置及导航命中范围检查通过；窄屏新署名缩小以避开原有控件，主体标题与画布不缩放。
- 实测预取后完整翻章（含文档加载、绘制及测试等待）约 0.98～1.48 秒；首次冷启动 WORKS 曾约 2.15 秒，不能将动画时长等同于所有设备上的总加载时间。
- 语法、Git 差异及批准文件校验通过。临时服务、测试脚本、报告和 node_modules 均在提交范围之外。

## 截图与预览

独立审阅站点（不覆盖正式网站）：
https://anaphy-portfolio-integrated-preview.alightowlet66.chatgpt.site

使用当前 ChatGPT 账号访问。主页面截图：

| 页面 | 桌面 | 手机 |
| --- | --- | --- |
| HOME | [截图](docs/integration/previews/index-desktop.png) | [截图](docs/integration/previews/index-mobile.png) |
| WORKS | [截图](docs/integration/previews/works-desktop.png) | [截图](docs/integration/previews/works-mobile.png) |
| ABOUT | [截图](docs/integration/previews/about-desktop.png) | [截图](docs/integration/previews/about-mobile.png) |
| CONTACT | [截图](docs/integration/previews/contact-desktop.png) | [截图](docs/integration/previews/contact-mobile.png) |

本地在仓库根目录运行 `python3 -m http.server 8000 --bind 127.0.0.1`，同一设备访问 http://127.0.0.1:8000/index.html 。这是本机地址，远程用户请使用上方完整预览网址。链接按站点基址解析，可用于 GitHub Pages 的仓库子路径。

真实作品继续在 assets/js/projects-data.js 编辑；CONTACT 联系资料继续使用 prototypes/contact-interaction/contact-config.js；ABOUT 的 CV 接口继续保留。当前未接入的资料保持待接入状态，不新增假作品、邮箱或下载文件。
