
const CONCEPT=window.MULTIPASS_CONCEPT_DATA;
const CLS={status:"mp_concept_status_v6", uncertain:"mp_concept_uncertain_v6", quiz:"mp_concept_quiz_v6"};
let conceptState={section:"all",point:null,tab:"source",flashIndex:0};

function conceptGet(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function conceptSet(k,v){localStorage.setItem(k,JSON.stringify(v))}
function showConcept(){
  showView("concept");
  renderConceptHome();
}
function renderConceptHome(){
 const statuses=conceptGet(CLS.status,{});
 const completed=Object.values(statuses).filter(v=>v==="done").length;
 const studying=Object.values(statuses).filter(v=>v==="study").length;
 const uncertain=conceptGet(CLS.uncertain,[]).length;
 $("#concept-summary").innerHTML=`
 <article class="card concept-stat"><small>전체 범위</small><b>9 SECTION · 41 POINT</b><span>원문 사진 ${CONCEPT.meta.sourceImageCount}장 포함</span></article>
 <article class="card concept-stat"><small>학습 완료</small><b>${completed} POINT</b><span>브라우저에 자동 저장</span></article>
 <article class="card concept-stat"><small>공부 중</small><b>${studying} POINT</b><span>이어보기 가능</span></article>
 <article class="card concept-stat"><small>다시 보기</small><b>${uncertain} POINT</b><span>헷갈림 저장</span></article>`;
 $("#concept-sections").innerHTML=CONCEPT.sections.map(s=>{
   const ps=CONCEPT.points.filter(p=>p.section===s.id);
   const done=ps.filter(p=>statuses[p.id]==="done").length;
   return `<button class="concept-section-card ${conceptState.section===s.id?'active':''}" onclick="filterConcept(${s.id})">
      <span>SECTION ${String(s.id).padStart(2,'0')}</span><b>${s.title}</b><small>${done}/${ps.length} 완료</small>
   </button>`
 }).join("");
 renderConceptPoints();
}
function filterConcept(section){conceptState.section=section;renderConceptHome()}
function renderConceptPoints(){
 const statuses=conceptGet(CLS.status,{});
 const uncertain=conceptGet(CLS.uncertain,[]);
 const points=conceptState.section==="all"?CONCEPT.points:CONCEPT.points.filter(p=>p.section===conceptState.section);
 $("#concept-point-list").innerHTML=points.map(p=>{
   const st=statuses[p.id]||"new";
   return `<article class="card concept-point-card">
     <div class="concept-point-top"><div><span class="point-badge">POINT ${String(p.id).padStart(3,'0')}</span><span class="section-mini">SECTION ${String(p.section).padStart(2,'0')}</span></div><span class="study-status ${st}">${{new:"미학습",study:"공부 중",done:"완료",review:"다시 보기"}[st]}</span></div>
     <h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.facts[0])}</p>
     <div class="concept-card-actions"><button class="btn btn-purple" onclick="openConceptPoint(${p.id})">학습하기</button>${uncertain.includes(p.id)?'<span class="uncertain-mark">★ 헷갈림</span>':''}</div>
   </article>`
 }).join("");
}
function openConceptPoint(id){
 conceptState.point=CONCEPT.points.find(p=>p.id===id);conceptState.tab="source";conceptState.flashIndex=0;
 const statuses=conceptGet(CLS.status,{});if(!statuses[id]){statuses[id]="study";conceptSet(CLS.status,statuses)}
 $("#concept-home").classList.add("hidden");$("#concept-detail").classList.remove("hidden");
 renderConceptDetail();window.scrollTo({top:0,behavior:"smooth"});
}
function backConcept(){conceptState.point=null;$("#concept-detail").classList.add("hidden");$("#concept-home").classList.remove("hidden");renderConceptHome()}
function renderConceptDetail(){
 const p=conceptState.point, statuses=conceptGet(CLS.status,{}), uncertain=conceptGet(CLS.uncertain,[]);
 $("#concept-detail-title").innerHTML=`<span class="point-badge">POINT ${String(p.id).padStart(3,'0')}</span><h2>${escapeHtml(p.title)}</h2><p>SECTION ${String(p.section).padStart(2,'0')} · ${escapeHtml(p.sectionTitle)}</p>`;
 $("#concept-status-actions").innerHTML=["new","study","done","review"].map(st=>`<button class="status-btn ${statuses[p.id]===st?'active':''}" onclick="setConceptStatus('${st}')">${{new:"미학습",study:"공부 중",done:"완료",review:"다시 보기"}[st]}</button>`).join("")+
 `<button class="status-btn uncertain ${uncertain.includes(p.id)?'active':''}" onclick="toggleConceptUncertain()">★ 헷갈렸어요</button>`;
 $$(".concept-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===conceptState.tab));
 const area=$("#concept-tab-content");
 if(conceptState.tab==="source") area.innerHTML=renderSourceTab(p);
 if(conceptState.tab==="summary") area.innerHTML=renderSummaryTab(p);
 if(conceptState.tab==="cards") area.innerHTML=renderCardsTab(p);
 if(conceptState.tab==="quiz") area.innerHTML=renderConceptQuiz(p);
 if(conceptState.tab==="related") area.innerHTML=renderRelatedTab(p);
}
function setConceptTab(tab){conceptState.tab=tab;renderConceptDetail()}
function setConceptStatus(st){const o=conceptGet(CLS.status,{});o[conceptState.point.id]=st;conceptSet(CLS.status,o);renderConceptDetail()}
function toggleConceptUncertain(){const a=conceptGet(CLS.uncertain,[]),id=conceptState.point.id,i=a.indexOf(id);i>=0?a.splice(i,1):a.push(id);conceptSet(CLS.uncertain,a);renderConceptDetail()}
function renderSourceTab(p){
 const imgs=p.images.length?p.images:CONCEPT.allImages.slice(Math.max(0,p.id-1),p.id);
 return `<div class="source-intro"><b>원문 전체 학습</b><p>사진 속 본문·표·기적의 TIP·개념체크를 줄이지 않고 원문 그대로 확인합니다. 사진을 누르면 크게 볼 수 있습니다.</p></div>
 <div class="book-page-grid">${imgs.map(src=>`<button class="book-page" onclick="openBookImage('${src}')"><img src="${src}" loading="lazy" alt="${escapeHtml(p.title)} 원문"></button>`).join("")}</div>
 <details class="all-source"><summary>1과목 전체 원문 사진 ${CONCEPT.meta.sourceImageCount}장 보기</summary><div class="book-page-grid all">${CONCEPT.allImages.map(src=>`<button class="book-page" onclick="openBookImage('${src}')"><img src="${src}" loading="lazy" alt="1과목 원문"></button>`).join("")}</div></details>`;
}
function renderSummaryTab(p){
 const c=p.comparison;
 return `<section class="learning-block"><h3>쉬운 해설 + 필수 암기</h3>${p.facts.map((x,i)=>`<div class="fact-row"><span>${i+1}</span><p>${escapeHtml(x)}</p></div>`).join("")}</section>
 ${c?`<section class="learning-block"><h3>헷갈리는 개념 비교표</h3><div class="compare-grid"><div><b>${c[0]}</b><p>${c[2]}</p></div><div><b>${c[1]}</b><p>${c[3]}</p></div></div></section>`:""}
 <section class="learning-block trap"><h3>시험 함정</h3><p>문제의 ‘옳지 않은 것’, ‘거리가 먼 것’, ‘아닌 것’을 먼저 확인하고 비슷한 용어의 역할·단위·계층을 비교하세요.</p></section>`;
}
function renderCardsTab(p){
 const i=conceptState.flashIndex%p.facts.length, front=`${p.title} · 암기 카드 ${i+1}`, back=p.facts[i];
 return `<div class="flash-wrap"><button class="flash-card" onclick="this.classList.toggle('flipped')"><span class="flash-front"><small>앞면</small><b>${escapeHtml(front)}</b><em>눌러서 정답 보기</em></span><span class="flash-back"><small>뒷면</small><b>${escapeHtml(back)}</b><em>시험 함정과 함께 기억하세요.</em></span></button>
 <div class="flash-actions"><button class="btn btn-outline" onclick="conceptFlash(-1)">이전</button><button class="btn btn-purple" onclick="conceptFlash(1)">다음 카드</button></div></div>`;
}
function conceptFlash(d){const p=conceptState.point;conceptState.flashIndex=(conceptState.flashIndex+d+p.facts.length)%p.facts.length;renderConceptDetail()}
function renderConceptQuiz(p){
 const saved=conceptGet(CLS.quiz,{})[p.id];
 return `<div class="concept-quiz">${p.quiz.map((q,qi)=>`<article class="mini-question"><h3>${qi+1}. ${escapeHtml(q.q)}</h3>${q.options.map((o,oi)=>`<button onclick="answerConceptQuiz(${qi},${oi})" class="${saved&&saved[qi]!==undefined?(oi===q.a?'correct':saved[qi]===oi?'wrong':''):''}"><span>${oi+1}</span>${escapeHtml(o)}</button>`).join("")}${saved&&saved[qi]!==undefined?`<p class="mini-explain">${saved[qi]===q.a?'정답입니다.':'정답은 '+(q.a+1)+'번입니다.'} ${escapeHtml(p.facts[Math.min(qi,p.facts.length-1)])}</p>`:""}</article>`).join("")}</div>`;
}
function answerConceptQuiz(qi,oi){const all=conceptGet(CLS.quiz,{}),id=conceptState.point.id;all[id]=all[id]||{};all[id][qi]=oi;conceptSet(CLS.quiz,all);renderConceptDetail()}
function renderRelatedTab(p){
 const terms=[p.title,...p.facts].join(" ").toLowerCase().split(/[\s·,/()]+/).filter(x=>x.length>=2);
 const matches=DATA.questions.filter(q=>q.valid!==false&&q.subject===1&&terms.some(t=>(q.question+" "+q.options.join(" ")).toLowerCase().includes(t))).slice(0,20);
 return `<section class="learning-block"><h3>관련 기출문제</h3><p>기존 기출 데이터에서 POINT 핵심어와 연결된 문제를 찾았습니다.</p>${matches.length?`<button class="btn btn-purple" onclick="startSession(DATA.questions.filter(q=>${JSON.stringify(matches.map(x=>x.id))}.includes(q.id)),'POINT ${String(p.id).padStart(3,'0')} 관련 기출','study')">${matches.length}문제 풀기</button><div class="related-list">${matches.map(q=>`<p>${q.date.slice(0,4)}.${q.date.slice(4,6)}.${q.date.slice(6)} · ${q.number}번 · ${escapeHtml(q.question)}</p>`).join("")}</div>`:`<div class="empty">자동 연결된 기출이 없습니다. 원문과 확인 퀴즈를 먼저 학습하세요.</div>`}</section>`;
}
function openBookImage(src){$("#book-modal-img").src=src;$("#book-modal").classList.remove("hidden");document.body.classList.add("modal-open")}
function closeBookImage(){ $("#book-modal").classList.add("hidden");document.body.classList.remove("modal-open") }
