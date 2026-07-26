
const CONCEPT=window.MULTIPASS_CONCEPT_DATA;
const CLS={status:"mp_concept_status_v7", uncertain:"mp_concept_uncertain_v7", quiz:"mp_concept_quiz_v7"};
let conceptState={section:"all",point:null,tab:"content",flashIndex:0};
function conceptGet(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}
function conceptSet(k,v){localStorage.setItem(k,JSON.stringify(v))}
function showConcept(){showView("concept");renderConceptHome()}
function renderConceptHome(){
 const statuses=conceptGet(CLS.status,{});
 const completed=Object.values(statuses).filter(v=>v==="done").length;
 const studying=Object.values(statuses).filter(v=>v==="study").length;
 const review=Object.values(statuses).filter(v=>v==="review").length;
 $("#concept-summary").innerHTML=`
 <article class="card concept-stat"><small>전체 범위</small><b>9 SECTION · 41 POINT</b><span>책 사진 없이 텍스트 학습</span></article>
 <article class="card concept-stat"><small>학습 완료</small><b>${completed} POINT</b><span>브라우저 자동 저장</span></article>
 <article class="card concept-stat"><small>공부 중</small><b>${studying} POINT</b><span>이어보기 가능</span></article>
 <article class="card concept-stat"><small>다시 보기</small><b>${review} POINT</b><span>헷갈림 복습</span></article>`;
 $("#concept-sections").innerHTML=CONCEPT.sections.map(s=>{
   const ps=CONCEPT.points.filter(p=>p.section===s.id);
   const done=ps.filter(p=>statuses[p.id]==="done").length;
   return `<button class="concept-section-card ${conceptState.section===s.id?'active':''}" onclick="filterConcept(${s.id})"><span>SECTION ${String(s.id).padStart(2,'0')}</span><b>${escapeHtml(s.title)}</b><small>${done}/${ps.length} 완료</small></button>`
 }).join("");
 renderConceptPoints();
}
function filterConcept(section){conceptState.section=section;renderConceptHome();requestAnimationFrame(()=>$("#concept-point-list")?.scrollIntoView({behavior:"smooth",block:"start"}))}
function renderConceptPoints(){
 const statuses=conceptGet(CLS.status,{}),uncertain=conceptGet(CLS.uncertain,[]);
 const points=conceptState.section==="all"?CONCEPT.points:CONCEPT.points.filter(p=>p.section===conceptState.section);
 $("#concept-point-list").innerHTML=points.map(p=>{const st=statuses[p.id]||"new";return `<article class="card concept-point-card"><div class="concept-point-top"><div><span class="point-badge">POINT ${String(p.id).padStart(3,'0')}</span><span class="section-mini">SECTION ${String(p.section).padStart(2,'0')}</span></div><span class="study-status ${st}">${{new:"미학습",study:"공부 중",done:"완료",review:"다시 보기"}[st]}</span></div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.facts[0]||"")}</p><div class="concept-card-actions"><button class="btn btn-purple" onclick="openConceptPoint(${p.id})">학습하기</button>${uncertain.includes(p.id)?'<span class="uncertain-mark">★ 헷갈림</span>':''}</div></article>`}).join("");
}
function openConceptPoint(id){conceptState.point=CONCEPT.points.find(p=>p.id===id);conceptState.tab="content";conceptState.flashIndex=0;const s=conceptGet(CLS.status,{});if(!s[id]){s[id]="study";conceptSet(CLS.status,s)}$("#concept-home").classList.add("hidden");$("#concept-detail").classList.remove("hidden");renderConceptDetail();window.scrollTo({top:0,behavior:"smooth"})}
function backConcept(){conceptState.point=null;$("#concept-detail").classList.add("hidden");$("#concept-home").classList.remove("hidden");renderConceptHome()}
function renderConceptDetail(){
 const p=conceptState.point,s=conceptGet(CLS.status,{}),u=conceptGet(CLS.uncertain,[]);
 $("#concept-detail-title").innerHTML=`<span class="point-badge">POINT ${String(p.id).padStart(3,'0')}</span><h2>${escapeHtml(p.title)}</h2><p>SECTION ${String(p.section).padStart(2,'0')} · ${escapeHtml(p.sectionTitle)}</p>`;
 $("#concept-status-actions").innerHTML=["new","study","done","review"].map(st=>`<button class="status-btn ${s[p.id]===st?'active':''}" onclick="setConceptStatus('${st}')">${{new:"미학습",study:"공부 중",done:"완료",review:"다시 보기"}[st]}</button>`).join("")+`<button class="status-btn uncertain ${u.includes(p.id)?'active':''}" onclick="toggleConceptUncertain()">★ 헷갈렸어요</button>`;
 $$(".concept-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===conceptState.tab));
 const a=$("#concept-tab-content");
 if(conceptState.tab==="content")a.innerHTML=renderContent(p);
 if(conceptState.tab==="summary")a.innerHTML=renderSummary(p);
 if(conceptState.tab==="cards")a.innerHTML=renderCards(p);
 if(conceptState.tab==="quiz")a.innerHTML=renderQuiz(p);
 if(conceptState.tab==="related")a.innerHTML=renderRelated(p);
}
function setConceptTab(t){conceptState.tab=t;renderConceptDetail()}
function setConceptStatus(st){const o=conceptGet(CLS.status,{});o[conceptState.point.id]=st;conceptSet(CLS.status,o);renderConceptDetail()}
function toggleConceptUncertain(){const a=conceptGet(CLS.uncertain,[]),id=conceptState.point.id,i=a.indexOf(id);i>=0?a.splice(i,1):a.push(id);conceptSet(CLS.uncertain,a);renderConceptDetail()}
function renderContent(p){return `<section class="textbook-content">${p.blocks.map(b=>`<article class="learning-block"><h3>${escapeHtml(b.title)}</h3><ul class="study-list">${b.items.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></article>`).join("")}<article class="learning-block tip"><h3>기적의 TIP · 시험 포인트</h3><p>${escapeHtml(p.tip)}</p></article></section>`}
function renderSummary(p){return `<section class="learning-block"><h3>핵심 요약</h3>${p.facts.map((x,i)=>`<div class="fact-row"><span>${i+1}</span><p>${escapeHtml(x)}</p></div>`).join("")}</section>`}
function renderCards(p){const i=conceptState.flashIndex%p.facts.length;return `<div class="flash-wrap"><button class="flash-card" onclick="this.classList.toggle('flipped')"><span class="flash-front"><small>앞면</small><b>${escapeHtml(p.title)} · 카드 ${i+1}</b><em>눌러서 뜻 보기</em></span><span class="flash-back"><small>뒷면</small><b>${escapeHtml(p.facts[i])}</b><em>${i+1}/${p.facts.length}</em></span></button><div class="flash-actions"><button class="btn btn-outline" onclick="conceptFlash(-1)">이전</button><button class="btn btn-purple" onclick="conceptFlash(1)">다음 카드</button></div></div>`}
function conceptFlash(d){const n=conceptState.point.facts.length;conceptState.flashIndex=(conceptState.flashIndex+d+n)%n;renderConceptDetail()}
function renderQuiz(p){const saved=conceptGet(CLS.quiz,{})[p.id];return `<div class="concept-quiz">${p.quiz.map((q,qi)=>`<article class="mini-question">${q.source?`<small class="quiz-source">${escapeHtml(q.source)}</small>`:''}<h3>${qi+1}. ${escapeHtml(q.q)}</h3>${q.options.map((o,oi)=>`<button onclick="answerConceptQuiz(${qi},${oi})" class="${saved&&saved[qi]!==undefined?(oi===q.a?'correct':saved[qi]===oi?'wrong':''):''}"><span>${oi+1}</span>${escapeHtml(o)}</button>`).join("")}${saved&&saved[qi]!==undefined?`<div class="mini-explain"><p><b>${saved[qi]===q.a?'정답입니다.':'정답은 '+(q.a+1)+'번입니다.'}</b><br>${escapeHtml(q.explanation||p.facts[Math.min(qi,p.facts.length-1)]||'')}</p>${q.optionAnalysis?`<ol class="option-analysis">${q.optionAnalysis.map((x,oi)=>`<li class="${oi===q.a?'correct-analysis':'wrong-analysis'}"><b>${oi+1}번</b> ${escapeHtml(x)}</li>`).join('')}</ol>`:''}</div>`:""}</article>`).join("")}</div>`}
function answerConceptQuiz(qi,oi){const all=conceptGet(CLS.quiz,{}),id=conceptState.point.id;all[id]=all[id]||{};all[id][qi]=oi;conceptSet(CLS.quiz,all);renderConceptDetail()}
function startRelatedQuestions(pointId){
 const p=CONCEPT.points.find(point=>point.id===pointId);
 if(!p)return alert('POINT 정보를 찾지 못했습니다.');
 const ids=new Set(p.relatedQuestionIds||[]);
 const questions=DATA.questions.filter(q=>ids.has(q.id)&&q.valid!==false);
 startSession(questions,`POINT ${String(p.id).padStart(3,'0')} 관련 기출`,'study');
}
function renderRelated(p){
 const ids=p.relatedQuestionIds||[];
 const m=DATA.questions.filter(q=>ids.includes(q.id)&&q.valid!==false);
 return `<section class="learning-block"><h3>관련 실제 기출문제</h3><p>POINT의 핵심 용어와 문제 본문·보기·출제 주제를 함께 대조하여 선별했습니다.</p>${m.length?`<button type="button" class="btn btn-purple" onclick="startRelatedQuestions(${p.id})">${m.length}문제 풀기</button><div class="related-list">${m.map(q=>`<p>${q.date.slice(0,4)}.${q.date.slice(4,6)}.${q.date.slice(6)} · ${q.number}번 · ${escapeHtml(q.question)}</p>`).join("")}</div>`:'<div class="empty">직접 연결되는 실제 기출을 찾지 못했습니다.</div>'}</section>`;
}
