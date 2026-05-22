(function(){
  const btn = document.getElementById('scrollTop');
  const arc = document.getElementById('gauge-arc');
  const CIRCUMFERENCE = 169.6; // 2*PI*27

  function update() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(scrolled / total, 1) : 0;

    // show button after 8% scroll
    btn.classList.toggle('visible', pct > 0.08);

    // arc: dashoffset goes from CIRCUMFERENCE (empty) to 0 (full)
    if (arc) arc.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
if (isFinePointer && cursor && ring) {
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
  function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);}
  animRing();
  document.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ring.style.width='48px';ring.style.height='48px';ring.style.opacity='0.8';});
    el.addEventListener('mouseleave',()=>{ring.style.width='32px';ring.style.height='32px';ring.style.opacity='0.5';});
  });
} else if (cursor && ring) {
  cursor.style.display='none';
  ring.style.display='none';
}
const reveals=document.querySelectorAll('.reveal');
const obs=new IntersectionObserver(entries=>{entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*80);obs.unobserve(e.target);}});},{threshold:0.1});
reveals.forEach(el=>obs.observe(el));

(function(){
  const track=document.getElementById('ps-track');
  if(!track)return;
  const total=track.children.length;
  const dots=document.querySelectorAll('.ps-dot');
  const curEl=document.getElementById('ps-cur');
  let idx=0;
  function goTo(n){
    idx=(n+total)%total;
    track.style.transform='translateX(-'+(idx*100)+'%)';
    dots.forEach((d,i)=>{d.style.background=i===idx?'var(--teal)':'var(--border)';d.style.width=i===idx?'40px':'24px';});
    curEl.textContent=String(idx+1).padStart(2,'0');
  }
  document.getElementById('ps-next').onclick=()=>goTo(idx+1);
  document.getElementById('ps-prev').onclick=()=>goTo(idx-1);
  dots.forEach((d,i)=>d.onclick=()=>goTo(i));
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')goTo(idx+1);if(e.key==='ArrowLeft')goTo(idx-1);});
  let tx=0;
  track.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
  track.addEventListener('touchend',e=>{const d=tx-e.changedTouches[0].clientX;if(Math.abs(d)>50)goTo(d>0?idx+1:idx-1);},{passive:true});
  Array.from(track.children).forEach(s=>{
    const pi=s.querySelectorAll('.pimg'),pd=s.querySelectorAll('.pidot');
    if(!pi.length)return;
    let p=0;
    function gP(n){pi[p].style.opacity=0;pi[p].classList.remove('pactive');if(pd[p])pd[p].style.opacity='0.3';p=(n+pi.length)%pi.length;pi[p].style.opacity=1;pi[p].classList.add('pactive');if(pd[p])pd[p].style.opacity='1';}
    s.querySelector('.pimg-next')?.addEventListener('click',e=>{e.stopPropagation();gP(p+1);});
    s.querySelector('.pimg-prev')?.addEventListener('click',e=>{e.stopPropagation();gP(p-1);});
    pd.forEach((d,i)=>d.onclick=()=>gP(i));
  });
})();

(function(){
  const btn = document.getElementById('theme-btn');
  const root = document.documentElement;
  const saved = localStorage.getItem('theme') || 'light';
  if(saved === 'dark') { root.setAttribute('data-theme','dark'); btn.textContent = '☾'; }

  btn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if(isDark) {
      root.setAttribute('data-theme','light');
      btn.textContent = '☀';
      localStorage.setItem('theme','light');
    } else {
      root.setAttribute('data-theme','dark');
      btn.textContent = '☾';
      localStorage.setItem('theme','dark');
    }
  });
})();

(function(){
  const counters = document.querySelectorAll('.counter');
  const speed = 1800;

  const animateCounter = (el) => {
    const target = +el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const step = target / (speed / 16);
    let current = 0;

    const update = () => {
      current += step;
      if (current < target) {
        el.textContent = Math.floor(current) + suffix;
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    };
    update();
  };

  function initObs() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  }

  setTimeout(initObs, 0);
})();

(function(){
  // Spine fill on scroll
  const fill = document.getElementById('tl-fill');
  const spine = document.querySelector('.tl-spine');
  function updateFill(){
    if(!fill || !spine) return;
    const rect = spine.getBoundingClientRect();
    const winH = window.innerHeight;
    const pct = Math.max(0, Math.min(1, (winH - rect.top) / (rect.height + winH * 0.3)));
    fill.style.height = (pct * 100) + '%';
  }
  window.addEventListener('scroll', updateFill, { passive: true });
  updateFill();

  // Dot pop animation on scroll-in
  const dotObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('dot-pop'); dotObs.unobserve(e.target); } });
  }, { threshold: 0.8 });
  document.querySelectorAll('.tl-dot').forEach(d => dotObs.observe(d));

  // Duration bar animation on scroll-in
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('animated'); barObs.unobserve(e.target); } });
  }, { threshold: 0.8 });
  document.querySelectorAll('.tl-duration-fill').forEach(el => barObs.observe(el));

  // Expandable bullets — show 3 by default
  document.querySelectorAll('.tl-bullets').forEach(ul => {
    const items = ul.querySelectorAll('li');
    if(items.length <= 3) return;
    items.forEach((li, i) => { if(i >= 3) li.style.display = 'none'; });
    const btn = document.createElement('button');
    btn.className = 'exp-expand-btn';
    const extra = items.length - 3;
    let open = false;
    btn.textContent = '+ ' + extra + ' more';
    btn.addEventListener('click', () => {
      open = !open;
      items.forEach((li, i) => { if(i >= 3) li.style.display = open ? '' : 'none'; });
      btn.textContent = open ? '— show less' : '+ ' + extra + ' more';
    });
    ul.after(btn);
  });
})();

(function(){
  const bars = document.querySelectorAll('.edu-bar');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('animated'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => obs.observe(b));
})();

// Hamburger menu
(function(){
  const btn = document.getElementById('hamburger');
  const nav = document.querySelector('nav');
  if(!btn) return;
  btn.addEventListener('click', () => nav.classList.toggle('nav-open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('nav-open'));
  });
})();

// Copy email button
(function(){
  const btn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('copyToast');
  if(!btn) return;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText('imenayadi86@gmail.com').then(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1800);
    });
  });
})();

function openCertModal(src, label){
  const modal = document.getElementById('cert-modal');
  document.getElementById('cert-modal-img').src = src;
  document.getElementById('cert-modal-label').textContent = label;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeCertModal(){
  document.getElementById('cert-modal').style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeCertModal(); });

// ── TYPEWRITER ROLE CYCLER ────────────────────────────
(function () {
  var el = document.getElementById('typewriter');
  if (!el) return;

  var roles = ['Data Engineer', 'BI Developer', 'ETL Specialist', 'Pipeline Builder'];
  var roleIdx = 0, charIdx = 0, deleting = false;
  var TYPE_MS = 85, DELETE_MS = 45, PAUSE_TYPED = 2000, PAUSE_DELETED = 350;

  function tick() {
    var role = roles[roleIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = role.slice(0, charIdx);
      if (charIdx === role.length) {
        deleting = true;
        setTimeout(tick, PAUSE_TYPED);
        return;
      }
    } else {
      charIdx--;
      el.textContent = role.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(tick, PAUSE_DELETED);
        return;
      }
    }
    setTimeout(tick, deleting ? DELETE_MS : TYPE_MS);
  }

  setTimeout(tick, 700); // wait for hero fade-in
})();

// ── HERO PARTICLE CANVAS ─────────────────────────────
(function () {
  var canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = 75;
  var MAX_DIST = 150;
  var raf;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
    this.r  = Math.random() * 1.4 + 0.5;
  }
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  };

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    var rgb  = dark ? '57,210,164' : '26,122,100';
    var dotA = dark ? 0.55 : 0.35;
    var lineA = dark ? 0.18 : 0.10;

    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      ctx.beginPath();
      ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + rgb + ',' + dotA + ')';
      ctx.fill();
    }

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(' + rgb + ',' + ((1 - d / MAX_DIST) * lineA) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function () { init(); });
  init();
  draw();
})();