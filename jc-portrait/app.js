const timelineData = {
  2024: {
    title: '從「理解自己」開始。',
    items: [
      '大量談心理學、腦科學、學習方法，也會碰觸松果體、脈輪與靈性，但始終會追問科學證據與解釋邊界。',
      '開始很明顯看得出你對語言細節、人格、創傷、焦慮與認知模式的高度敏感。',
      '寫日記、手寫清單、實體互動與減少社群依賴，逐漸變成你整理情緒與思考的方法。'
    ]
  },
  2025: {
    title: '語言與工作，開始長出專業骨架。',
    items: [
      '日文不再只是「會不會」，而是商務場合的語感、責任範圍、自然度與禮貌控制。',
      '工作中的 PM / QA / FAE 協調、RMA、BOM、EOL、供應鏈與客戶溝通，逐漸形成你偏好的 Project / Coordinator 型工作方式。',
      '婚禮與旅行規劃也展現同一種特質：既要有結構，又不想被結構綁死。'
    ]
  },
  2026: {
    title: '開始從「會用工具」走向「會定義系統」。',
    items: [
      '轉入 LCD / TAM 情境後，技術題從產品規格一路深入到 T-CON、PMIC、LED Driver、表面處理、認證與系統架構。',
      'Notion、Obsidian、Loop、GitHub、VS Code、Python、Vibe Coding 逐漸串成一條新的學習主線。',
      'AI 使用方式也變了：從翻譯、查詢、確認，走到比較模型、做網站、部署 GitHub Pages、設計互動體驗。'
    ]
  }
};

const panel = document.getElementById('timelinePanel');
function renderTimeline(year){
  const data = timelineData[year];
  panel.innerHTML = `<p class="eyebrow">${year}</p><h3>${data.title}</h3><ul>${data.items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
}
renderTimeline('2024');

document.querySelectorAll('.year-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.year-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderTimeline(btn.dataset.year);
  });
});

document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.layer-card').forEach(card=>{
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

document.querySelectorAll('.card-expand').forEach(btn=>{
  btn.addEventListener('click',(e)=>{
    e.stopPropagation();
    const detail = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    detail.hidden = isOpen;
    btn.textContent = isOpen ? '展開細節' : '收起細節';
  });
});

const threads = [
  '「非晶矽是什麼？」→ TFT 結構 → 光罩 → 好了我是不是又研究太深。',
  '「菊花鍊是什麼？」→ AD Board → 為什麼兩片 LCM 不能這樣控制。',
  '「Coding 跟 Programming 差在哪？」→ 抽象層級 → 工程工作到底在做什麼。',
  '「這句日文自然嗎？」→ 語氣 → 責任 → 商務文化 → 一封信改八版。',
  '「GitHub Pages 怎麼弄？」→ clone → commit → push → 然後開始自己部署網站。',
  '「這馬鈴薯還能吃？」——技術宇宙瞬間切換到食品安全副本。'
];
const randomBtn = document.getElementById('randomThreadBtn');
const randomOut = document.getElementById('randomThread');
randomBtn.addEventListener('click',()=>{
  const next = threads[Math.floor(Math.random()*threads.length)];
  randomOut.textContent = next;
});

const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn.addEventListener('click',()=>{
  const open = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!open));
  mobileNav.hidden = open;
});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  menuBtn.setAttribute('aria-expanded','false'); mobileNav.hidden = true;
}));

const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('in'); observer.unobserve(entry.target); } });
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
