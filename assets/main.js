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

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

(function(){
  // Toggle timeline / list
  const btns = document.querySelectorAll('.exp-toggle-btn');
  const tl = document.getElementById('exp-timeline');
  const list = document.getElementById('exp-list');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if(btn.dataset.view === 'timeline'){
        tl.style.display = ''; list.style.display = 'none';
      } else {
        tl.style.display = 'none'; list.style.display = '';
      }
    });
  });

  // Animate teal spine fill on scroll
  const fill = document.getElementById('tl-fill');
  const spine = document.querySelector('.tl-spine');
  function updateFill(){
    if(!fill || !spine) return;
    const rect = spine.getBoundingClientRect();
    const winH = window.innerHeight;
    const start = rect.top;
    const end = rect.bottom;
    const visible = Math.min(winH, end) - Math.max(0, start);
    const pct = Math.max(0, Math.min(1, (winH - start) / (rect.height + winH * 0.3)));
    fill.style.height = (pct * 100) + '%';
  }
  window.addEventListener('scroll', updateFill, { passive: true });
  updateFill();
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

// ── PRELOADER ────────────────────────────────────────
(function () {
  var pre = document.getElementById('preloader');
  if (!pre) return;

  // lock scroll while preloader is visible
  document.body.style.overflow = 'hidden';

  function dismiss() {
    pre.classList.add('pl-done');
    document.body.style.overflow = '';
    setTimeout(function () { pre.style.display = 'none'; }, 950);
  }

  // bar fills over 1.15s starting at 0.85s → done at ~2s; dismiss at 2.2s
  setTimeout(dismiss, 2200);
})();