# 高明媛 · GAO MINGYUAN Portfolio

克莱因蓝 #002FA7 与白色视觉体系。本分支在 PR #15 内继续整合已批准的四个页面，使用真实纵向轨道与固定导航，不重设计页面内部内容。

## 预览

https://anaphy-portfolio-integrated-preview.alightowlet66.chatgpt.site/?v=details-6

使用当前 ChatGPT 账号访问；该独立预览不覆盖正式网站或旧原型。

本地在仓库根目录运行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

访问 http://127.0.0.1:8000/index.html 。日常预览无需 npm；部署时上传完整运行目录，不能只上传首页。

## 页面与操作

- index.html / works.html / about.html / contact.html：四个直接访问入口，共用同一个常驻轨道；浏览器地址、刷新和历史记录仍保留这些路径。
- chapters/：实际批准版内容文档，保留各自 CSS 和脚本作用域。
- project.html：原作品详情和视频播放器；返回时恢复选中作品。
- assets/css/site.css、assets/js/site.js：纵向位移、吸附、单一固定指示横杠、双语导航及页面桥接。

NEXT 使用双层白色小折角；左上角只保留品牌文字，不再有加号或重复菜单。桌面轮盘统一缩小至原视觉尺寸的 90%，手机尺寸不变。

顺序 HOME → WORKS → ABOUT → CONTACT → HOME。NEXT 和允许区域的鼠标滚轮播放约 1 秒整页位移；CONTACT 的按钮显示 BACK TO HOME / 返回首页，沿现有轨道约 1 秒向上回卷经过 ABOUT、WORKS 到 HOME；右侧导航直接定位目标，只有指示横杠平滑移动。向上滚轮可返回上一章。

WORKS 轮盘和 ABOUT 展开模块优先处理自己的滚轮；PROFILE 独立滚动。手机保留组件手势，使用 NEXT 或章节名称翻章，避免误触。支持减少动态效果。

[批准版来源、实施边界、实际测试与截图](INTEGRATION-GUIDE.md)

[此前性能记录与复现](docs/integration/performance/RUNTIME-5.md)

[作品数据与现有构建说明](WORKS-GUIDE.md)

作品和联系方式仍为原有占位，不增加假作品、邮箱、微信号或简历文件。保留已确认的页面布局和动画图形。运行层按需加载章节、隐藏时暂停，轮盘停稳后不再空转；软件 WebGL 单独降低绘制负载，正常硬件保持原画质与节奏。

气泡参考原始说明：https://tympanus.net/codrops/2026/10/06/yichen-xie-portfolio/

原轮盘第三方许可继续保留在 assets/js/works-LICENSES.txt 与 prototypes/3d-carousel/。不自动合并 main。
