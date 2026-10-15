# ABOUT 独立交互原型

本次仅完善本目录。首页、泡泡、正式 WORKS、详情页和原有样式/脚本均不修改。纯 HTML、CSS、JavaScript 与 SVG，无依赖、构建流程、照片、渐变、卡片面板或阴影。

## 直接打开

下载 GitHub 分支 `about-toolkit-profile` 的 ZIP，解压后打开 `prototypes/about-interaction/index.html`。本目录全部资源为相对路径，不需要安装依赖或访问第三方服务。

如果浏览器限制本地文件，可在**本目录**运行：

```sh
python3 -m http.server 8001 --bind 127.0.0.1
```

然后在同一台设备访问 `http://127.0.0.1:8001/`。这不是可从外部访问 Codex 云环境的链接。

如果已有 GitHub Pages 主站，审核并合并本 PR 后，可通过该主站的 `/prototypes/about-interaction/` 访问。本次没有修改 Pages 设置或声明已经上线。

## 视觉与操作

初始界面以姓名为左侧重心，五个不同尺寸、非对称分布的圆环作为创作方向。圆环和标签共同进行最多约 5px/4px 的视差；悬停或键盘聚焦轻微扩张圆环并显示 EXPLORE 提示。

五个模块均可展开。TOOLKIT 提供软件说明切换；PROFILE 的经历区域可独立滚动。

点击 EDITING 后，其他模块移动到边缘并减弱、姓名缩小移至左上角、圆环向中下部移动并展开成时间轴；介绍文字随过程出现。右上角 CLOSE 或 Escape 反向恢复。展开和关闭均约 1.1 秒，播放期间锁定再次触发，完成后恢复焦点。

VIEW RELATED WORKS 仅显示交互反馈，不跳转、不连接正式作品页。点击会派发可冒泡的 `about:related-works` 自定义事件，`detail` 包含 `module`（editing / filming / directing）和零起始 `index`，供后续接入真实作品。介绍文字原样采用用户提供内容，本原型没有新增作品经历。

## 连续变形方法

`#morph-line` 是贯穿整个动画的**同一个 SVG path**。它始终保持白色实线，计算过程不替换、不隐藏，也不降低它的透明度。

路径的 129 个点由弧长 L、角度 θ 和参数 s（-.5 到 .5）计算：

```text
x = (L / θ) × sin(θ × s)
y = (L / θ) × [cos(θ × s) − sinc(θ / 2)]
```

θ 从 2π 连续降至 0，L 从圆周长度连续增加到时间轴长度。初始端点重合成为圆环，随后开口展开、曲率下降，最终退化为直线。接近零角度时使用极限 x=L×s、y=0，避免浮点不稳定。

页面排版和路径均由同一个 progress 驱动。关闭只反向推进 progress，不刷新页面或替换路径。素材框、刻度和播放头在主路径接近直线时逐步出现，再在返回时退去。

减少动态效果模式关闭视差及主要动画，直接呈现对应布局；不会强制播放长时间变形。

## 实际截图

- [桌面初始状态](previews/initial-desktop.png)
- [桌面 EDITING 展开](previews/editing-desktop.png)
- [圆环打开的中间状态](previews/morph-midpoint.png)
- [手机初始状态](previews/initial-mobile.png)
- [手机 EDITING 展开](previews/editing-mobile.png)

截图来自实际 Chromium 软件渲染，不是设计稿。验证了 1920×1080、1440×900、1366×768、390×844、320×568：初始和展开界面无页面溢出，文字与时间轴/操作区分离。还验证了真实触屏点击、键盘关闭、重复触发保护、减少动态效果。

逐帧采样验证同一主路径始终存在、透明度为 1、多个可见的中间形态，以及反向关闭恢复。没有声称完成 Safari/Firefox 或真实手机设备测试。

## FILMING 与 DIRECTING

FILMING 与 DIRECTING 沿用 EDITING 的姓名缩放、内容位置、分阶段缓动和 1.1 秒双向动画。没有修改初始五环位置或 EDITING 的展开公式。

- **FILMING**：同一条 `#filming-shape` 路径保留四段圆角弧与四段直线的命令结构。初始直线长度为零、四段圆弧组成圆；动画中宽高连续增加到 16:9，圆角半径逐渐减为零。定位线和准星在主轮廓接近取景框时出现。准星只在鼠标位于框内时平滑跟随，最大位移 4px。取景框的尺寸同时受视口宽高限制。
- **DIRECTING**：`#directing-shape` 的三条持久路径，初始各占 120°、首尾连接为完整圆环。动画中每段的圆心向不同位置分离、半径连续调整，弧度从 120° 增至 360°，最终成为三个大小不同的完整节点。连接线终止于节点边缘，标签在变形后段进入。节点保持稳定，不加入持续摇摆。

主要描边在变形过程中透明度始终为 1，没有淡出圆环再淡入图形。CLOSE / Escape 反向推动同一进度，因此原路径沿原过程恢复。动画中锁定重复触发；关闭后焦点返回对应模块。

### 新增实际截图

- [FILMING 桌面展开](previews/filming-desktop.png)
- [DIRECTING 桌面展开](previews/directing-desktop.png)
- [FILMING 手机展开](previews/filming-mobile.png)
- [DIRECTING 手机展开](previews/directing-mobile.png)

本次使用实际 Chromium 检查 1920×1080、1440×900、1366×768、390×844、320×568 的三个模块展开和关闭，均无页面级溢出。比较批准版与本版的初始身份/按钮几何及 EDITING 主路径、时间轴、正文，结果一致。受控时钟采样验证新模块有多个连续中间形态、同一图形元素持续存在、主描边不淡出，并能反向恢复；另外验证触屏点击、重复触发保护、自定义作品事件、Escape 和减少动态效果。未测试真实手机或 Safari / Firefox。

## TOOLKIT 与 PROFILE

本轮沿用原有 progress、分阶段缓动、1.1 秒动画与焦点恢复。前三个模块的布局参数和图形公式不变，新模块通过 `toolkit-profile.js` / `toolkit-profile.css` 独立补充。

### 连续变形

- TOOLKIT：原圆环由八段首尾相接的 45° 圆弧表示。每段圆心连续移动到非对称矩阵中的目标位置，半径从原半径收缩为 1.5px，弧度从 45° 增长到 360°，描边同时轻微加厚成为白色小圆点。八条路径全程不淡出，软件文字在后段进入。CLOSE 反向推动同一参数，小圆点扩大并回聚为首尾相接的圆环。
- PROFILE：同一条 129 点路径由圆周逐渐打开，转为纵向直线。使用与 EDITING 相同的弧长/曲率极限方法，但旋转坐标轴；不替换成另一条直线。滚动只发生于 `#profile-scroll`，主时间轴的下端随滚动进度从内容区域高度的 88% 延伸到 100%（内容可全部显示时直接覆盖完整区域）。关闭时保留滚动对应的长度，沿当前形态反向恢复圆环，完成后才重置内容。

未展开时继续使用批准版原来的原生 SVG 圆环；新模块启动时，将相同几何轮廓表示为可变形路径；复原后交回原圆环。没有淡出旧圆环再淡入矩阵或时间轴。

### 内容与接口

八种软件及能力说明完全来自用户提供内容，没有熟练度百分比或额外软件。点击软件名称会更新按下状态、平滑切换正文，快速连续点击只保留最新选择。键盘 Tab / Enter 同样可用。

PROFILE 采用用户提供的学校、学科、学位与兴趣。项目经历是明确的占位文字，可直接在 `toolkit-profile.js` 的 `.profile-placeholder` 所在区域编辑真实经历；未编造公司、职位或日期。

简历初始为无 `href` 的待接入状态，显示“简历文件待接入”，没有生成或下载虚假文件。以后提供真实文件后可调用：

```js
AboutPrototype.setResume('./真实简历文件.pdf');
// 或传入真实的 HTTPS 文件地址；传 null 恢复待接入状态。
```

只接受 HTTP(S) 地址，或以 file:// 打开原型时的本地文件路径；不接受脚本 URL。原有 `about:related-works` 事件继续可用，TOOLKIT / PROFILE 的 module 分别为 toolkit / profile，index 分别为 3 / 4。

### 截图

- [TOOLKIT 桌面](previews/toolkit-desktop.png)
- [PROFILE 桌面](previews/profile-desktop.png)
- [TOOLKIT 手机](previews/toolkit-mobile.png)
- [PROFILE 手机](previews/profile-mobile.png)
- [PROFILE 窄屏滑动后](previews/profile-scrolled-mobile.png)

本轮实际 Chromium 检查了 1920×1080、1440×900、1366×768、390×844、320×568 的打开、关闭、连续中间形态、软件切换和 PROFILE 独立滚动，未出现页面级溢出；另使用真实鼠标/触屏事件检查操作、重复触发保护、Escape、减少动态效果与简历待接入状态。初始布局及前三个模块在精确相同的 progress（0.2 / 0.5 / 0.8 / 1）下，几何、主路径和正文与批准版一致；初始状态的桌面和手机截图像素一致。

测试通过仅提供此原型目录的本机 HTTP 服务完成。本环境浏览器策略阻止 `file://` 导航，因此未声称实际验证直接打开本地文件。资源仍全部采用相对路径、无外部依赖；如本地浏览器也限制直接打开，请按上文启动本目录 HTTP 服务。未测试 Safari / Firefox 或真实手机硬件，也没有发布在线托管预览。
