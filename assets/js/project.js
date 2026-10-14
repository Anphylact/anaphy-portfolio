'use strict';
(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const id = new URLSearchParams(location.search).get('id');
  const index = projects.findIndex(project => project.id === id);
  const project = projects[index];
  const back = document.getElementById('back');
  const placeholder = document.getElementById('placeholder');
  const video = document.getElementById('video');
  const note = document.getElementById('video-note');
  if (!project) {
    document.getElementById('title').textContent = '未找到作品';
    document.getElementById('description').textContent = '作品可能已移除，或链接不完整。请返回作品选集重新选择。';
    placeholder.querySelector('p').textContent = '暂无可显示的影像';
    placeholder.querySelector('small').textContent = '返回作品选集，浏览其他作品';
    note.hidden = true;
    return;
  }
  document.title = `${project.title} · Anaphy`;
  back.href = `works.html?selected=${encodeURIComponent(project.id)}`;
  try { sessionStorage.setItem('anaphy-selected', project.id); } catch {}
  document.getElementById('number').textContent = `作品 ${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  for (const key of ['title', 'year', 'type', 'role', 'description']) {
    document.getElementById(key).textContent = project[key] || (key === 'year' ? '年份待填写' : '待填写');
  }
  if (project.video) {
    video.addEventListener('error', () => {
      video.pause(); video.hidden = true; placeholder.hidden = false;
      placeholder.querySelector('p').textContent = '视频暂时无法播放';
      placeholder.querySelector('small').textContent = '请稍后重试，或检查视频文件路径';
      note.textContent = '视频文件未能加载';
    });
    if (project.cover) video.poster = project.cover;
    video.src = project.video;
    video.hidden = false; placeholder.hidden = true;
  } else { note.textContent = '此作品尚未添加视频'; }
})();
