# 郑奕飞 · Yifei Zheng

个人主页：https://hitzyf.github.io/

基于 AcademicPages / Minimal Mistakes 的静态个人主页，复用参考主页的原始主题样式。内容涵盖 RGB-D SLAM、3D Gaussian Splatting、三维场景重建与理解，以及教育背景、实习和项目经历。

## 编辑

- `index.html`：个人简介、教育、实习与项目内容。
- `assets/main.css`：AcademicPages 原始主题样式。
- `assets/site.css` / `assets/site.js`：头像和图标适配、移动端 Follow 菜单及页脚。
- `assets/profile.jpg`：个人照片。
- `assets/gs-slam.mp4`、`assets/real2sim.mp4`、`assets/dovsg.mp4`：对应项目的 1080p 字幕替换版演示视频。
- `sitemap.html`、`sitemap.xml`、`feed.xml`：网站地图与订阅。

无构建依赖。GitHub Pages 从 `main` 分支根目录发布。不含电话号码或完整 PDF 简历。

主题许可和来源见 `THEME-LICENSE.txt`、`THEME-SOURCES.md`。

## 项目视频

三个项目使用浏览器原生视频播放器，按原始顺序和速度播放用户提供的字幕替换版 MP4。字幕已包含在视频画面中，GS-SLAM、Real2Sim、DOVSG 的时长分别为 180、143、90 秒。视频链接含内容版本参数，以刷新旧缓存。

旧的 `interview-player.js`、`interview-player.css` 和 `interview-script.json` 保留在仓库中，但主页不再加载，避免重复覆盖字幕、强制静音或按旧时间轴截取新视频。
