# 郑奕飞 · Yifei Zheng

个人主页：https://hitzyf.github.io/

基于 AcademicPages / Minimal Mistakes 的静态个人主页，复用参考主页的原始主题样式。内容涵盖 RGB-D SLAM、3D Gaussian Splatting、三维场景重建与理解，以及教育背景、实习和项目经历。

## 编辑

- `index.html`：个人简介、教育、实习与项目内容。
- `assets/main.css`：AcademicPages 原始主题样式。
- `assets/site.css` / `assets/site.js`：头像和图标适配、移动端 Follow 菜单及页脚。
- `assets/profile.jpg`：个人照片。
- `assets/gs-slam.mp4`、`assets/real2sim.mp4`、`assets/dovsg.mp4`：对应项目的原始 1080p 演示素材。
- `sitemap.html`、`sitemap.xml`、`feed.xml`：网站地图与订阅。

无构建依赖。GitHub Pages 从 `main` 分支根目录发布。不含电话号码或完整 PDF 简历。

主题许可和来源见 `THEME-LICENSE.txt`、`THEME-SOURCES.md`。

## 面试讲解字幕

前三个项目默认使用完整自我介绍字幕播放器，保留原始视频文件。`assets/interview-script.json` 保存逐段讲稿和原视频的场景时间范围；`interview-player.js` 按朗读长度生成字幕时间轴，自动对齐并调整画面速度。开场在第一个播放器，结束语在第三个播放器。可暂停、上一句/下一句、拖动进度、调节语速及全屏。字幕在网页播放器内显示，原始 MP4 下载文件不含新增字幕。JavaScript 或讲稿加载失败时保留原生视频播放。
