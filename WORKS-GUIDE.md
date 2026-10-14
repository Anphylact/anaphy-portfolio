# 作品展示系统

首页 `index.html` 与 `bubbles.js` 保持原样。新增页面不加载首页动画，也不依赖任何框架或构建工具。

## 预览

直接用浏览器打开 `works.html`。也可以在仓库目录运行：

```sh
python3 -m http.server 8000
```

然后访问 `http://localhost:8000/works.html`。当前首页未增加入口，需直接访问作品页。

## 页面与资源

- `works.html`：弧形作品轮盘。
- `project.html?id=placeholder-01`：通用详情模板。
- `assets/css/works.css`、`assets/js/works.js`：轮盘样式与交互。
- `assets/css/project.css`、`assets/js/project.js`：详情页样式与逻辑。
- `assets/js/projects-data.js`：所有作品数据。

## 替换占位作品

编辑 `assets/js/projects-data.js` 中的对象。所有初始作品均为占位内容，不代表真实经历。

```js
{
  id: 'your-project-id',
  title: '真实作品名称',
  year: '实际年份',
  type: '实际作品类型',
  role: '实际承担的职责',
  description: '真实作品简介',
  cover: 'assets/images/your-cover.jpg',
  video: 'assets/videos/your-video.mp4'
}
```

自行创建图片、视频目录并放入对应文件。路径相对于根目录的 HTML 页面，不是相对于数据文件。也可以使用允许直接访问的 HTTPS 图片或视频地址。视频字段需为浏览器可播放的媒体文件地址，不是视频网站的观看页面；推荐 MP4（H.264 视频 / AAC 音频）。

部署视频时，媒体服务器应支持 HTTP 字节范围请求（Range / 206），以便进度条可以可靠定位。

保持 `id` 唯一且稳定，已有详情链接和返回位置依赖它。增加作品时，在数组中新增同样结构的对象即可，轮盘数量及编号自动更新。调整数组顺序即可调整展示顺序。

`cover` 或 `video` 留空时显示占位状态；封面加载失败会回退占位，视频加载失败会显示说明。年份等信息尚未准备好时可留空。

## 交互

- 拖动鼠标或横向触屏滑动，松手后减速并吸附。
- 在轮盘区域使用滚轮，或聚焦轮盘后使用左右方向键。
- 点击两侧作品先居中，再点击中央作品进入详情。
- 详情页通过 URL 参数读取作品；返回按钮携带作品 ID，并辅以会话存储恢复选择。
- 视频采用原生控件，不自动播放，支持播放、暂停、进度和全屏（以浏览器支持为准）。
- 减少动态效果模式关闭惯性和标题过渡；切换直接到位。
- 手机端详情改为上下排列。

不要将新页面 CSS 或 JS 引入首页。以后需要添加首页导航时，再独立评估该修改。
