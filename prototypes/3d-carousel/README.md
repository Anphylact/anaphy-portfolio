# React Bits Circular Carousel 独立适配原型

本版本替换 PR #4 的自制运动实现，直接复用 React Bits Circular Carousel 的 React 组件与 CSS。只作用于本目录，不修改正式 WORKS、首页、详情页或作品数据。

## 参考研究

- [原组件源码](https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/CircularCarousel/CircularCarousel.jsx)，读取的 Git blob：`ec16b8391b54935b79dddc11b502`（前缀）。
- [演示参数与依赖说明](https://github.com/DavidHDev/react-bits/blob/main/src/demo/Components/CircularCarouselDemo.jsx)。
- [原样式](https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/CircularCarousel/CircularCarousel.css)。
- 用户指定的网址在本环境返回 HTTP 403，未能直接验证远程演示。源码、演示参数与许可成功读取，实际运行及截图来自本地复用的组件，不是官网截图。

原组件使用 React 和 CSS 3D，不依赖 Three.js、WebGL、动画库或 Chakra UI。Chakra UI 只是参考网站演示控制面板使用的库，本原型没有引入。

原组件 cylinder 模式：

- 每个封面拆成 8 条竖向切片，各条贴合圆柱曲面；曲率为 1。不是平面矩形的自制侧向摆动。
- 圆环半径使用原公式：在相邻弦长半径与周长半径之间按 curve 插值，并设最小半径；五张卡片以 72° 等分。
- `rotateY(slotAngle) translateZ(radius)` 固定卡片；累计角度驱动整个圆环旋转。相机后移半径，再应用 tilt。
- CSS preserve-3d 和 perspective 负责真实深度遮挡；距离通过余弦朝向控制深度色罩，背面使用内侧着色。中央突出来自投影、曲率及遮挡，没有单独把中央卡片 scale 放大。
- 拖动以圆环实际投影半径把像素转换为角度，采样约 110ms 的角速度。松手后依据 momentum 预测目标位置；吸附使用 `SPRING=118`、临界阻尼 `2*sqrt(SPRING)` 和最长 1/240 秒的积分子步。保留这些原实现。
- 角度不在每一圈后归零，保证连续无限循环。只有索引和深度着色使用角度取模。

## 适配范围

源文件位于 `src/vendor/`，与上游相比仅增加以下小范围接口/行为适配：

1. 增加 `apiRef` 暴露原 `stepBy`、`focusIndex`，供外部左右按钮调用；只读状态供本地验证。
2. 支持普通竖向滚轮和 deltaMode。原组件只处理横向滚轮，且立即改变角度；本原型把相同的速度投影（30 × .12s）交给原弹簧，避免大滚轮事件造成角度突跳。
3. 减少动态效果模式下，按钮直接定位。
4. 增加版权来源注释。

原组件的几何、切片、投影适配、深度着色、拖动采样、弹簧积分和循环渲染均保留。

页面包装只保留作品名称、轮盘、编号和左右按钮。五张自制测试 SVG 封面保持 16:9，以灰度呈现，不代表真实作品。标题随原组件 onChange 同步并淡入。

官网演示默认为 10 张近正方形照片，本适配仍为 5 张 16:9 测试封面，因此不声称逐像素复刻照片或卡片数量。为避免横向封面的后排上缘突出，主原型 tilt 为 -2°，而上游默认 -5°；保留曲率 1、momentum .6、depthFade .55、innerShade .6、parallax .3、stretch .5。自动漂移关闭，以便查看和吸附。

`?reference=1` 可查看同一组件的 cardWidth=250、perspective=2500、tilt=-5 参数对照，仍使用本地五张 16:9 封面，不是远程官网演示。

## 实际验证

Chromium 软件渲染实际截图：

| 视口 | 投影图像占页面宽度 | 截图 |
| --- | --- | --- |
| 1920 × 1080 | 80.1% | [查看](previews/1920x1080.png) |
| 1440 × 900 | 80.1% | [查看](previews/1440x900.png) |
| 1366 × 768 | 80.1% | [查看](previews/1366x768.png) |
| 390 × 844 | 76.8% | [查看](previews/390x844.png) |

[旋转过程实际截图](previews/rotation.png)。

占宽通过所有切片的实际浏览器投影边界量测，不是仅以容器 CSS 宽度代替。四个视口均检查标题、图像和按钮完整显示，无页面溢出。轮盘按窗口宽高计算尺寸，只适配 3D 装置，不缩放整个网页。

验证按钮、键盘两整圈循环、滚轮、拖动及原弹簧停止后的吸附、真实触屏事件、减少动态效果；没有声称保证某个帧率或完成 Safari/Firefox/真实手机设备测试。

## 预览

已提交浏览器用的 `dist/app.js` 与 `dist/app.css`，打开原型不需要安装 React 或 npm。

下载 `prototype-3d-circular-carousel` 分支 ZIP，解压后打开本目录的 `index.html`；浏览器如限制本地脚本，可在仓库根目录运行：

```sh
python3 -m http.server 8000
```

访问 `http://localhost:8000/prototypes/3d-carousel/`。localhost 仅适用于运行服务器的设备；当前 Codex 会话没有端口转发或用户可访问的网页预览工具。

GitHub Pages：未启用 Pages 时可在 Settings → Pages 选择本原型分支与 `/ (root)`，部署完成后访问站点下的 `/prototypes/3d-carousel/`。若已有正式 Pages，不要为预览切换部署来源，可使用单独预览仓库，或审核后合并这个仅涉及独立原型的 PR。没有修改部署配置或声称已上线。

## 修改与重新打包

仅在本目录操作：

```sh
npm ci
npm run build
```

React / React DOM 19.2.0 用于独立组件，esbuild 0.25.11 只在打包时使用。正式网站仍是原生 HTML/CSS/JS。

## 许可

React Bits 为 MIT + Commons Clause，允许作为网站一部分使用，需要保留版权与许可，不可把组件本身独立售卖或再分发。上游完整许可保存在 `src/vendor/LICENSE.md`，随浏览器包分发的全部许可位于 `dist/THIRD-PARTY-LICENSES.txt`。
