# 独立 CSS 3D 环形轮盘原型

本目录是视觉评审原型，不会替换正式 WORKS 页面。五张 SVG 测试封面均为本次绘制的抽象场景，不代表真实作品。参考用户上传的前排三张、后排遮挡的环形轮盘截图；保留本项目的 16:9、克莱因蓝和白色。

## 立即在自己的浏览器预览

下载 GitHub 上 `prototype-3d-circular-carousel` 分支的 ZIP（Code → Download ZIP），解压后打开本目录的 `index.html`。资源均在本目录中，不需要安装依赖或运行构建。

如浏览器限制本地文件，在仓库根目录运行：

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

访问 `http://localhost:8000/prototypes/3d-carousel/`。这里的 localhost 只适用于运行服务器的设备，不能从另一台设备访问 Codex 云环境。

## GitHub Pages 方案

当前 Codex 会话没有可调用的网页预览或端口转发工具；本次读取 GitHub Pages 状态也未成功。因此没有已验证的在线交互预览地址，以下步骤需要在 GitHub 完成。

- 如果仓库尚未启用 Pages：Settings → Pages → Build and deployment → Deploy from a branch，选择 `prototype-3d-circular-carousel` 分支和 `/ (root)`，保存，等待 Pages 构建完成。
- 部署成功后，在 GitHub 返回的站点地址后追加 `/prototypes/3d-carousel/`。普通项目 Pages 的预期地址为 `https://anphylact.github.io/anaphy-portfolio/prototypes/3d-carousel/`；如有自定义域名，以 Pages 界面返回的域名为准。
- 如果已有正式 Pages 网站，不要为预览切换其部署来源。可以把本目录中的 HTML、CSS、JS 和 covers 目录复制到一个单独的预览仓库，启用该仓库的 Pages；或者审核并合并这个只新增原型的 PR，再通过现有主站的 `/prototypes/3d-carousel/` 访问。合并原型不等于将其整合进正式 WORKS。

上述预期网址不是已经部署成功的声明。本次未修改 Pages 配置或添加自动部署流程。

## 空间实现

- 五张永久卡片以 72° 等分固定在同一个圆环上，使用 `rotateY(slotAngle) translateZ(radius)`。
- 圆环以未取模的累计角度整体旋转，连续超过 360° 后也不重新定位卡片。
- 相机俯视 12°，使用 CSS `perspective` 与 `preserve-3d`；前后遮挡由浏览器处理，无手动 z-index 排序、循环替换或卡片隐藏。
- 卡片有正反两面。背面为较暗的同一测试封面，转到后方仍然存在。
- 连续正弦函数控制轻微侧卡朝向补偿，让封面更易辨认；其中心仍固定在圆环上。
- 卡片宽度同时受 vw、svh 和最大宽度限制。只调整装置尺寸，不缩放整个网页。

## 交互与范围

拖动、触屏滑动、滚轮、左右按钮和方向键可旋转圆环，松手后减速并吸附。标题与编号跟随当前前方作品。减少动态效果模式不使用惯性与缓动。

点击中央卡片打开明确标注的测试说明，Escape 或关闭按钮返回，圆环选择不变。URL 的 `selected=0` 到 `selected=4` 可恢复选中位置。

本原型没有接入正式作品数据或正式详情页；待视觉确认后再评估接入。正式详情页及返回位置功能均保持原样。

## 实际截图

以下是 Chromium 浏览器实际渲染，使用软件渲染模式获得稳定截图，不是设计稿：

- [1920 × 1080](previews/1920x1080.png)
- [1440 × 900](previews/1440x900.png)
- [1366 × 768](previews/1366x768.png)
- [390 × 844](previews/390x844.png)

本次只验证 Chromium，没有声称完成 Firefox、Safari 或真实手机设备测试。
