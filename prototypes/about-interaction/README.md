# ABOUT 独立交互原型

本次仅完善本目录。首页、泡泡、正式 WORKS、详情页和原有样式/脚本均不修改。纯 HTML、CSS、JavaScript 与 SVG，无依赖、构建流程、照片、渐变、卡片面板或阴影。

## 直接打开

下载 GitHub 分支 `about-filming-directing` 的 ZIP，解压后打开 `prototypes/about-interaction/index.html`。本目录全部资源为相对路径，不需要安装依赖或访问第三方服务。

如果浏览器限制本地文件，可在**本目录**运行：

```sh
python3 -m http.server 8001 --bind 127.0.0.1
```

然后在同一台设备访问 `http://127.0.0.1:8001/`。这不是可从外部访问 Codex 云环境的链接。

如果已有 GitHub Pages 主站，审核并合并本 PR 后，可通过该主站的 `/prototypes/about-interaction/` 访问。本次没有修改 Pages 设置或声明已经上线。

## 视觉与操作

初始界面以姓名为左侧重心，五个不同尺寸、非对称分布的圆环作为创作方向。圆环和标签共同进行最多约 5px/4px 的视差；悬停或键盘聚焦轻微扩张圆环并显示 EXPLORE 提示。

EDITING、FILMING、DIRECTING 可展开。TOOLKIT 和 PROFILE 仅展示圆环，标记为 aria-disabled，不会打开新内容。

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
