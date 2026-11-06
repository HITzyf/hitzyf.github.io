(() => {
  const players = document.querySelectorAll('.chapter-player');
  const videos = Array.from(players, player => player.querySelector('video'));

  function pauseOtherVideos(active) {
    for (const video of videos) {
      if (video !== active && !video.paused) video.pause();
    }
  }

  for (const player of players) {
    const video = player.querySelector('video');
    const buttons = player.querySelectorAll('.chapter-list button');
    const feedback = player.querySelector('.chapter-feedback');

    const report = message => {
      feedback.textContent = message;
      feedback.hidden = !message;
    };

    video.addEventListener('play', () => {
      if (!video.paused) pauseOtherVideos(video);
    });
    video.addEventListener('playing', () => report(''));
    video.addEventListener('error', () => report('本章视频加载失败，请点击章节重试。'));

    for (const button of buttons) {
      button.addEventListener('click', () => {
        pauseOtherVideos(video);
        report('');
        if (video.getAttribute('src') !== button.dataset.src) {
          video.src = button.dataset.src;
          video.setAttribute('aria-describedby', button.id);
          for (const item of buttons) {
            item.setAttribute('aria-pressed', String(item === button));
          }
        } else if (video.error) {
          video.load();
        } else {
          video.currentTime = 0;
        }
        video.play().catch(error => {
          if (error.name === 'NotAllowedError') report('请点击视频上的播放按钮。');
        });
      });
    }
  }
})();
