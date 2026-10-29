# 高明媛 · GAO MINGYUAN Portfolio

克莱因蓝 #002FA7 与白色视觉体系的个人作品集。本分支将已确认的 HOME、WORKS、ABOUT、CONTACT 接入统一导航，保留原有视觉与交互。

## 打开

在仓库根目录运行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

同一设备访问 http://127.0.0.1:8000/index.html 。日常预览无需安装 npm 依赖。页面为静态 HTML；WORKS 已包含批准版浏览器 bundle。部署时应上传完整运行目录，不要只上传首页三个文件。

## 页面

- index.html：HOME，原有标题、气泡漂动、弹动、画圆及点破。
- works.html：WORKS，已确认的 3D 轮盘、惯性、吸附和作品状态恢复。
- project.html：原有作品详情和视频播放器。
- about.html：复用批准版五圆环交互与内容。
- contact.html：复用最新批准版对焦、锁定、快门和定格。
- assets/css/site.css、assets/js/site.js：共享章节导航、快捷菜单和蓝色过渡。

页面顺序为 HOME → WORKS → ABOUT → CONTACT → HOME。通过右侧章节栏、左上姓名快捷菜单或底部 NEXT / 下一页浏览。鼠标滚轮和触摸滑动保留给各页原有功能，不触发章节翻页。

## 修改与审阅

[整合说明、批准版来源、测试结果与截图](INTEGRATION-GUIDE.md)

[作品数据与构建说明](WORKS-GUIDE.md)

日常作品内容只需编辑 assets/js/projects-data.js，当前数据仍为已明确标注的占位作品。CONTACT 真实资料接口位于 prototypes/contact-interaction/contact-config.js，未接入的邮箱、微信号和简历保留待接入状态。

独立整合预览（使用当前 ChatGPT 账号）：
https://anaphy-portfolio-integrated-preview.alightowlet66.chatgpt.site

该预览不覆盖正式网站或既有独立原型预览。开发分支通过 PR 审阅，不自动合并。

## 许可与参考

气泡效果参考 Yichen Xie 的技术说明，bubbles.js 为原有实现，整合不修改其代码：
https://tympanus.net/codrops/2026/10/06/yichen-xie-portfolio/

3D WORKS 沿用已批准的 React Bits 组件及既有适配，完整第三方许可保留在 assets/js/works-LICENSES.txt 与 prototypes/3d-carousel/ 中。
