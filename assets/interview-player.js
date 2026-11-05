/* Full interview script, synchronized to the relevant original video scenes. */
(() => {
  'use strict';
  const SCRIPT_URL = new URL('interview-script.json?v=20261105-1', document.currentScript.src);
  const units = text => Array.from(text).reduce((n, c) => n + (/\s/.test(c) ? 0 : /[\x00-\x7f]/.test(c) ? 0.55 : 1), 0);
  const formatTime = n => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
  function captionLines(text) {
    if (units(text) <= 28) return text;
    const middle = units(text) / 2;
    let best = 0, score = Infinity;
    for (let i = 1; i < text.length; i++) {
      const left = units(text.slice(0, i)), right = units(text.slice(i));
      if (left < 8 || left > 28 || right > 28) continue;
      if (/[A-Za-z0-9-]/.test(text[i - 1]) && /[A-Za-z0-9-]/.test(text[i])) continue;
      const candidate = Math.abs(left - middle) + (/[，。；！？\s]/.test(text[i - 1]) ? 0 : 8);
      if (candidate < score) { score = candidate; best = i; }
    }
    return best ? text.slice(0, best) + '\n' + text.slice(best) : text;
  }
  function splitCues(text) {
    const parts = text.match(/[^，。；！？\n]+[，。；！？]?/g) || [text];
    const cues = [];
    let current = '';
    for (let part of parts) {
      if (current && units(current + part) > 43) { cues.push(current); current = ''; }
      while (units(part) > 43) {
        let end = 1;
        while (end < part.length && units(part.slice(0, end + 1)) <= 40) end++;
        // Keep Latin model names together when possible.
        while (end > 15 && /[A-Za-z0-9-]/.test(part[end]) && /[A-Za-z0-9-]/.test(part[end - 1])) end--;
        cues.push(part.slice(0, end)); part = part.slice(end);
      }
      current += part;
    }
    if (current) cues.push(current);
    return cues;
  }
  function timeline(scenes) {
    let time = 0;
    return scenes.map(scene => {
      const start = time;
      const cues = splitCues(scene.text).map(text => {
        const cue = { text, start: time, end: time + Math.max(3.2, units(text) / 4.2 + 0.5) };
        time = cue.end;
        return cue;
      });
      return { ...scene, start, end: time, cues };
    });
  }
  const players = [];
  class InterviewPlayer {
    constructor(video, scenes) {
      this.video = video;
      this.scenes = timeline(scenes);
      this.duration = this.scenes.at(-1).end;
      this.cues = this.scenes.flatMap(s => s.cues);
      this.time = 0; this.speed = 1; this.playing = false; this.scene = null;
      this.waiting = false; this.frame = 0; this.last = 0;
      this.root = document.createElement('div');
      this.root.className = 'interview-player';
      this.root.innerHTML = `
        <div class="interview-stage">
          <div class="interview-card" hidden></div>
          <div class="interview-caption" aria-live="off"></div>
        </div>
        <div class="interview-chapter"></div>
        <div class="interview-controls">
          <button type="button" class="interview-play" aria-label="播放讲解">播放讲解</button>
          <button type="button" class="interview-prev" aria-label="上一句" title="上一句">上一句</button>
          <button type="button" class="interview-next" aria-label="下一句" title="下一句">下一句</button>
          <span class="interview-time"></span>
          <label class="interview-speed-label">语速 <select class="interview-speed" aria-label="讲解速度"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option><option value="1.5">1.5×</option></select></label>
          <button type="button" class="interview-fullscreen" aria-label="全屏讲解">全屏</button>
          <input class="interview-seek" type="range" min="0" step="0.1" value="0" aria-label="讲解进度">
        </div>`;
      video.before(this.root);
      this.stage = this.root.querySelector('.interview-stage');
      this.stage.prepend(video);
      video.controls = false; video.muted = true; video.playsInline = true;
      this.card = this.root.querySelector('.interview-card');
      this.caption = this.root.querySelector('.interview-caption');
      this.chapter = this.root.querySelector('.interview-chapter');
      this.playButton = this.root.querySelector('.interview-play');
      this.seek = this.root.querySelector('.interview-seek'); this.seek.max = String(this.duration);
      this.timeDisplay = this.root.querySelector('.interview-time');
      this.fullscreen = this.root.querySelector('.interview-fullscreen');
      this.playButton.addEventListener('click', () => this.playing ? this.pause() : this.play());
      this.root.querySelector('.interview-prev').addEventListener('click', () => this.moveCue(-1));
      this.root.querySelector('.interview-next').addEventListener('click', () => this.moveCue(1));
      this.seek.addEventListener('input', () => this.jump(Number(this.seek.value)));
      this.root.querySelector('.interview-speed').addEventListener('change', e => {
        this.speed = Number(e.target.value); this.syncVideo(true);
      });
      this.fullscreen.addEventListener('click', () => this.toggleFullscreen());
      this.root.addEventListener('keydown', e => {
        if (/^(INPUT|SELECT|BUTTON)$/.test(e.target.tagName)) return;
        if (e.key === ' ') { e.preventDefault(); this.playing ? this.pause() : this.play(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); this.moveCue(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.moveCue(-1); }
      });
      this.stage.tabIndex = 0;
      this.stage.setAttribute('aria-label', `${video.getAttribute('aria-label')}，空格播放或暂停，左右键切换字幕`);
      video.addEventListener('waiting', () => { if (!this.scene?.card) this.waiting = true; });
      video.addEventListener('playing', () => { this.waiting = false; });
      video.addEventListener('canplay', () => { this.waiting = false; });
      video.addEventListener('seeked', () => { this.waiting = false; if (this.playing && !this.scene?.card) this.startVideo(); });
      video.addEventListener('loadedmetadata', () => this.syncVideo(true));
      video.addEventListener('error', () => { this.pause(); this.chapter.textContent = '视频暂时加载失败，请刷新后重试。'; });
      document.addEventListener('fullscreenchange', () => {
        this.fullscreen.textContent = document.fullscreenElement === this.root ? '退出全屏' : '全屏';
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') this.exitExpanded(); });
      this.render(true);
    }
    startVideo() {
      this.video.play().catch(() => { if (this.playing && !this.scene?.card) this.pause(); });
    }
    play() {
      players.forEach(p => { if (p !== this) p.pause(); });
      if (this.time >= this.duration - 0.05) this.jump(0);
      this.playing = true; this.last = performance.now();
      this.playButton.textContent = '暂停'; this.playButton.setAttribute('aria-label', '暂停讲解');
      this.syncVideo(true);
      this.frame = requestAnimationFrame(t => this.tick(t));
    }
    pause() {
      this.playing = false; cancelAnimationFrame(this.frame); this.video.pause();
      this.playButton.textContent = '播放讲解'; this.playButton.setAttribute('aria-label', '播放讲解');
    }
    tick(now) {
      if (!this.playing) return;
      const delta = Math.min((now - this.last) / 1000, 0.25); this.last = now;
      if (this.scene.card || !this.waiting) this.time = Math.min(this.duration, this.time + delta * this.speed);
      this.render(false);
      if (this.time >= this.duration) { this.pause(); return; }
      this.frame = requestAnimationFrame(t => this.tick(t));
    }
    jump(time) {
      this.time = Math.max(0, Math.min(this.duration, time)); this.last = performance.now();
      this.waiting = false; this.render(true);
    }
    moveCue(direction) {
      let index = this.cues.findIndex(c => this.time < c.end - 0.01);
      if (index < 0) index = this.cues.length - 1;
      this.jump(this.cues[Math.max(0, Math.min(this.cues.length - 1, index + direction))].start);
    }
    render(force) {
      const scene = this.scenes.find(s => this.time < s.end) || this.scenes.at(-1);
      const changed = this.scene !== scene;
      this.scene = scene;
      if (changed) {
        this.chapter.textContent = scene.label;
        this.card.hidden = !scene.card;
        if (scene.card === 'intro') this.card.innerHTML = '<div class="interview-card-eyebrow">哈尔滨工业大学 · 控制工程硕士</div><h3>郑奕飞</h3><p>三维视觉与场景理解</p><div class="interview-card-topics">可靠性建图 · 几何重建 · 三维语义</div>';
        if (scene.card === 'outro') this.card.innerHTML = '<div class="interview-card-eyebrow">三维感知 · 项目实践</div><h3>感谢聆听</h3><p>RGB-D 点云处理 · 配准与地图更新<br>PyTorch · 模型实验与消融验证</p><div class="interview-card-topics">可立即到岗 ｜ 每周 5 天 ｜ 连续 6 个月</div>';
      }
      const cue = scene.cues.find(c => this.time < c.end) || scene.cues.at(-1);
      const caption = captionLines(cue.text);
      if (this.caption.textContent !== caption) this.caption.textContent = caption;
      this.timeDisplay.textContent = `${formatTime(this.time)} / ${formatTime(this.duration)}`;
      this.seek.value = String(this.time);
      this.seek.setAttribute('aria-valuetext', `${formatTime(this.time)}，${scene.label}`);
      this.syncVideo(force || changed);
    }
    syncVideo(force) {
      if (!this.scene) return;
      if (this.scene.card) { this.video.pause(); this.waiting = false; return; }
      if (!this.video.readyState) { this.waiting = true; return; }
      const s = this.scene;
      const factor = (s.to - s.from) / (s.end - s.start);
      const sourceTime = Math.min(s.to - 0.05, s.from + Math.max(0, this.time - s.start) * factor);
      this.video.playbackRate = Math.max(0.0625, Math.min(16, factor * this.speed));
      if (force || (!this.video.seeking && Math.abs(this.video.currentTime - sourceTime) > 0.65)) {
        this.video.currentTime = sourceTime;
      }
      if (this.playing && this.video.paused && !this.video.seeking) this.startVideo();
      if (!this.playing && !this.video.paused) this.video.pause();
    }
    exitExpanded() {
      this.root.classList.remove('is-expanded');
      document.body.classList.remove('interview-expanded'); this.fullscreen.textContent = '全屏';
    }
    async toggleFullscreen() {
      if (document.fullscreenElement === this.root) { await document.exitFullscreen(); return; }
      if (this.root.classList.contains('is-expanded')) { this.exitExpanded(); return; }
      if (this.root.requestFullscreen) {
        try { await this.root.requestFullscreen(); return; } catch (_) { /* iOS / embedded fallback */ }
      }
      this.root.classList.add('is-expanded'); document.body.classList.add('interview-expanded');
      this.fullscreen.textContent = '退出全屏';
    }
  }
  fetch(SCRIPT_URL).then(response => {
    if (!response.ok) throw new Error('Interview script unavailable');
    return response.json();
  }).then(data => {
    for (const video of document.querySelectorAll('video[data-interview]')) {
      const scenes = data[video.dataset.interview];
      if (scenes) players.push(new InterviewPlayer(video, scenes));
    }
  }).catch(() => { /* Native video controls remain usable if the script cannot load. */ });
})();
