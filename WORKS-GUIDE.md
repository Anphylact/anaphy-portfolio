# 作品展示系统

首页 `index.html` 与 `bubbles.js` 保持原样。作品页不加载首页动画。正式轮盘沿用已确认的 React Bits 原型；React 仅打包到作品页，首页和详情页不加载它。浏览已提交页面不需要安装依赖。

## 预览

直接用浏览器打开 `works.html`。也可以在仓库目录运行：

```sh
python3 -m http.server 8000
```

然后访问 `http://localhost:8000/works.html`。当前首页未增加入口，需直接访问作品页。

## 页面与资源

- `works.html`：弧形作品轮盘。
- `project.html?id=placeholder-01`：通用详情模板。
- `assets/css/works.css`：与已确认原型相同的页面构图。
- `assets/css/works-carousel.css`、`assets/js/works.js`：已打包的轮盘引擎与运行代码。
- `assets/js/works-source.jsx`：读取作品数据、恢复选择、封面占位与详情跳转的源代码。
- `assets/js/works-LICENSES.txt`：浏览器包的完整第三方许可。
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

`cover` 或 `video` 留空时显示占位状态；封面加载失败会回退编号占位，视频加载失败会显示说明。年份等信息尚未准备好时可留空。数据修改后刷新即可，不必重新打包。封面沿用已确认的灰度呈现。

## 重新构建作品页

只改作品数据或媒体文件无需构建。修改轮盘源代码后，在 `prototypes/3d-carousel/` 目录执行：

```sh
npm ci
npm run build:works
```

组件源码和许可保留在该目录的 `src/vendor/`，正式页的浏览器运行只依赖 `assets/` 内已打包资源，不需要加载原型页面或测试封面。布局与空间参数保持已确认原型的配置。

## 交互

- 拖动鼠标或横向触屏滑动，松手后减速并吸附。
- 在轮盘区域使用滚轮，或聚焦轮盘后使用左右方向键。
- 点击两侧作品先居中，再点击中央作品进入详情。
- 详情页通过 URL 参数读取作品；返回按钮携带作品 ID，并辅以会话存储恢复选择。
- 视频采用原生控件，不自动播放，支持播放、暂停、进度和全屏（以浏览器支持为准）。
- 减少动态效果模式关闭惯性和标题过渡；切换直接到位。
- 手机端详情改为上下排列。

不要将新页面 CSS 或 JS 引入首页。以后需要添加首页导航时，再独立评估该修改。
