# 高明媛 · Anaphy Portfolio

当前首页源代码：克莱因蓝 #002FA7，5 个初始白色气泡，高明媛 / GAO MINGYUAN。

## 打开
解压整个文件夹，双击 index.html，用 Chrome 或 Edge 打开即可。
不需要安装依赖，不需要 npm，不需要登录。

## 文件
- index.html：文字、排版及 CSS 样式
- bubbles.js：WebGL 气泡绘制、漂动及交互；不支持 WebGL 时使用简化 Canvas 效果

## 编辑
用 VS Code 等编辑器打开文件夹。修改后保存，再刷新浏览器。
初始气泡的位置和数量在 bubbles.js 的 const base 中修改。

## 上传 GitHub
把 index.html、bubbles.js 和 README.md 放在仓库根目录即可。
这是静态网页，无构建命令，也不需要 package.json。

## 交互
单击弹动，拖动画圆，双击点破。右上角可暂停漂动或重置。

## 参考
气泡效果参考 Yichen Xie 在 Codrops 的技术说明，代码为本项目重新实现。
https://tympanus.net/codrops/2026/10/06/yichen-xie-portfolio/

此包只包含当前动态首页，不含排版编辑器或其他对话规划中的作品轮播页。
