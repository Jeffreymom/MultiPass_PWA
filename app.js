
const DATA=window.MULTIPASS_DATA;
const S={view:'dashboard',session:[],index:0,answers:{},revealed:{},startedAt:null,timer:null,filterStatus:'current',filterSubject:'all'};
const LS={wrong:'mp_wrong_v2',uncertain:'mp_uncertain_v5',book:'mp_book_v2',history:'mp_history_v2',progress:'mp_progress_v2'};
const getLS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const setLS=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const statusLabel={current:'현재 범위',supplement:'보조 학습',review:'검토 학습',excluded:'현재 제외'};
const subjectName=n=>DATA.subjects[n];
function setNav(view){$$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view))}
function showView(name){S.view=name;setNav(name);$$('.view').forEach(v=>v.classList.add('hidden'));$('#view-'+name).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});if(name==='dashboard')renderDashboard();if(name==='exams')renderExams();if(name==='wrong')renderCollection('wrong');if(name==='bookmarks')renderCollection('bookmarks');if(name==='syllabus')renderSyllabus();if(name==='concept'&&window.renderConceptHome)renderConceptHome()}
function renderDashboard(){
 const m=DATA.meta, wrong=getLS(LS.wrong,[]), book=getLS(LS.book,[]), hist=getLS(LS.history,[]);
 $('#dashboard-stats').innerHTML=`
 <div class="card stat"><small>전체 기출</small><b>${m.examCount}회</b><span class="muted">${m.period}</span></div>
 <div class="card stat"><small>전체 문항</small><b>${m.questionCount.toLocaleString()}개</b><span class="muted">4과목 × 회차별 80문항</span></div>
 <div class="card stat"><small>내 오답</small><b>${wrong.length}개</b><span class="muted">자동 저장</span></div>
 <div class="card stat"><small>응시 기록</small><b>${hist.length}회</b><span class="muted">이 브라우저에 저장</span></div>`;
 const cards=[1,2,3,4].map(n=>`<article class="card subject-card" onclick="startFocused(${n})"><span class="subject-num">${n}</span><h3>${subjectName(n)}</h3><p class="muted">${DATA.meta.subjectCounts[n].toLocaleString()}문항 · 현재범위 우선</p><div class="progress"><i style="width:${Math.min(100,(getLS(LS.progress,{})[n]||0)/DATA.meta.subjectCounts[n]*100)}%"></i></div></article>`).join('');
 $('#subject-cards').innerHTML=cards;
 $('#status-summary').innerHTML=`
 <span class="pill current">현재 범위 ${m.statusCounts.current.toLocaleString()}</span>
 <span class="pill supplement">보조 ${m.statusCounts.supplement.toLocaleString()}</span>
 <span class="pill review">검토 ${m.statusCounts.review.toLocaleString()}</span>
 <span class="pill excluded">제외 ${m.statusCounts.excluded.toLocaleString()}</span>`;
}
function selectPool({subject='all',status='current',date=null}={}){
 return DATA.questions.filter(q=>q.valid!==false&&(subject==='all'||q.subject===Number(subject))&&(status==='all'||q.status===status)&&(!date||q.date===date));
}
function startFocused(subject='all'){
 const statuses=['current'];
 let pool=selectPool({subject,status:'current'});
 if(pool.length<20)pool=selectPool({subject,status:'all'});
 startSession(shuffle(pool).slice(0,20),`${subject==='all'?'전 과목':subjectName(subject)} 집중학습`,'study');
}
function startMock(){
 let qs=[];
 [1,2,3,4].forEach(s=>{let p=selectPool({subject:s,status:'current'});qs.push(...shuffle(p).slice(0,20))});
 startSession(qs,'최신 기준 80문제 모의고사','exam');
}
function startExam(date){
 const qs=DATA.questions.filter(q=>q.date===date&&q.valid!==false).sort((a,b)=>a.number-b.number);
 startSession(qs,`${date.slice(0,4)}.${date.slice(4,6)}.${date.slice(6)} 기출문제`,'exam');
}
function startSession(qs,title,mode='study'){
 if(!qs.length)return alert('조건에 맞는 문제가 없습니다.');
 S.session=qs;S.index=0;S.answers={};S.revealed={};S.title=title;S.mode=mode;S.startedAt=Date.now();
 showView('quiz');$('#quiz-title').textContent=title;renderQuestion();startTimer();
}
function startTimer(){clearInterval(S.timer);S.timer=setInterval(()=>{const sec=Math.floor((Date.now()-S.startedAt)/1000);$('#timer').textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`},1000)}

const KNOWLEDGE_BASE=[
 {keys:["트위닝","tweening"], text:"트위닝은 두 키프레임 사이의 중간 프레임을 자동으로 생성해 움직임을 연결하는 기법입니다."},
 {keys:["모핑","morphing"], text:"모핑은 한 이미지나 형태가 다른 이미지나 형태로 서서히 변하는 기법이며 2D와 3D 모두에서 사용할 수 있습니다."},
 {keys:["로토스코핑","rotoscoping"], text:"로토스코핑은 실사 영상의 움직임을 참고해 애니메이션을 만들거나 실사와 애니메이션 이미지를 합성하는 기법입니다."},
 {keys:["입자 시스템","particle system"], text:"입자 시스템은 비, 불, 연기, 눈, 폭발처럼 많은 작은 입자의 움직임으로 특수효과를 만드는 기법입니다."},
 {keys:["osi"], text:"OSI 모델은 통신 기능을 7개 계층으로 나눈 표준 모델입니다. 물리·데이터링크·네트워크·전송·세션·표현·응용 계층의 역할을 구분해야 합니다."},
 {keys:["ipv6"], text:"IPv6는 IPv4 주소 부족을 해결하기 위한 128비트 주소 체계이며 유니캐스트·애니캐스트·멀티캐스트를 지원합니다."},
 {keys:["rgb"], text:"RGB는 빛의 삼원색을 사용하는 가산혼합 방식으로 모니터와 디지털 화면에서 사용됩니다."},
 {keys:["cmyk"], text:"CMYK는 인쇄에 사용하는 감산혼합 방식으로 Cyan, Magenta, Yellow, Black을 사용합니다."},
 {keys:["html"], text:"HTML은 웹 문서의 구조와 내용을 정의하고, CSS는 표현을, JavaScript는 동작과 상호작용을 담당합니다."},
 {keys:["css"], text:"CSS는 웹 문서의 색상, 크기, 배치, 간격 등 시각적 표현을 담당합니다."},
 {keys:["javascript","자바스크립트"], text:"JavaScript는 웹 페이지의 이벤트 처리와 동적인 동작을 구현하는 프로그래밍 언어입니다."},
 {keys:["dbms"], text:"DBMS는 데이터베이스를 정의·조작·제어하며 무결성, 보안, 복구, 동시 접근을 관리합니다."},
 {keys:["ddl"], text:"DDL은 데이터 구조를 정의하는 언어로 CREATE, ALTER, DROP 등이 있습니다."},
 {keys:["dml"], text:"DML은 데이터를 조회·삽입·수정·삭제하며 SELECT, INSERT, UPDATE, DELETE 등이 있습니다."},
 {keys:["dcl"], text:"DCL은 권한과 트랜잭션을 제어하며 GRANT, REVOKE, COMMIT, ROLLBACK 등이 대표적입니다."},
 {keys:["표본화","sampling"], text:"표본화는 연속적인 아날로그 신호를 일정한 시간 간격으로 추출하는 과정입니다. 최고 주파수의 2배 이상으로 표본화해야 앨리어싱을 줄일 수 있습니다."},
 {keys:["양자화","quantization"], text:"양자화는 표본화된 신호의 진폭을 정해진 단계의 수치로 바꾸는 과정이며, 단계가 거칠수록 양자화 잡음이 커집니다."},
 {keys:["jpeg"], text:"JPEG는 사진처럼 색 변화가 많은 정지영상에 적합한 손실 압축 형식입니다."},
 {keys:["png"], text:"PNG는 무손실 압축과 투명 배경을 지원하는 이미지 형식입니다."},
 {keys:["gif"], text:"GIF는 최대 256색을 사용하며 투명과 간단한 애니메이션을 지원합니다."},
 {keys:["mpeg"], text:"MPEG는 동영상과 음향 압축을 위한 국제 표준 계열입니다. 각 버전의 목적과 활용 분야를 구분해야 합니다."},
 {keys:["저작권"], text:"저작권은 창작물의 저작자에게 부여되는 권리입니다. 보호 대상과 이용 허락, 인용 조건을 구분해야 합니다."},
 {keys:["가독성"], text:"가독성은 긴 글을 얼마나 편안하고 쉽게 읽을 수 있는지를 뜻합니다."},
 {keys:["판독성"], text:"판독성은 개별 글자의 형태를 얼마나 정확히 알아볼 수 있는지를 뜻합니다."},
 {keys:["커닝","kerning"], text:"커닝은 특정 글자 쌍 사이의 간격을 개별적으로 조절하는 작업입니다."},
 {keys:["레딩","leading"], text:"레딩은 글줄과 글줄 사이의 간격, 즉 행간을 뜻합니다."}
];
function isNegativeQuestion(text){return /(틀린|옳지\s*않|아닌\s*것|거리가\s*먼|잘못된|해당되지\s*않)/.test(text)}
function getKnowledgeExplanation(q){
 const hay=(q.question+" "+q.options.join(" ")).toLowerCase();
 const hit=KNOWLEDGE_BASE.find(item=>item.keys.some(k=>hay.includes(k.toLowerCase())));
 return hit?hit.text:"";
}
function buildExplanation(q,chosen){
 const correctText=q.options[q.answer-1]||"";
 const chosenText=chosen?q.options[chosen-1]||"":"";
 const negative=isNegativeQuestion(q.question);
 const lines=[];
 lines.push(negative?`이 문항은 ‘틀린 것’을 찾는 문제입니다. ${q.answer}번의 설명이 개념과 맞지 않아 정답입니다.`:`${q.answer}번이 문제에서 묻는 개념에 가장 알맞은 설명입니다.`);
 const knowledge=getKnowledgeExplanation(q); if(knowledge)lines.push(knowledge);
 if(chosen&&chosen!==q.answer&&chosenText)lines.push(`선택한 ${chosen}번은 “${chosenText}”이므로 문제의 조건과 맞지 않습니다.`);
 if(correctText)lines.push(`암기 포인트: ${correctText}`);
 return lines;
}
function isUncertain(id){return getLS(LS.uncertain,[]).includes(id)}
function toggleUncertain(){
 const q=S.session[S.index], uncertain=getLS(LS.uncertain,[]), wrong=getLS(LS.wrong,[]);
 const i=uncertain.indexOf(q.id);
 if(i>=0){
   uncertain.splice(i,1);
   if(S.answers[q.id]===q.answer){const wi=wrong.indexOf(q.id);if(wi>=0)wrong.splice(wi,1)}
 }else{
   uncertain.push(q.id);
   if(!wrong.includes(q.id))wrong.push(q.id);
 }
 setLS(LS.uncertain,uncertain);setLS(LS.wrong,wrong);renderQuestion();
}

function renderQuestion(){
 const q=S.session[S.index], chosen=S.answers[q.id], revealed=S.revealed[q.id];
 $('#quiz-progress').textContent=`${S.index+1} / ${S.session.length}`;
 $('#question-meta').innerHTML=`<span class="pill ${q.status}">${statusLabel[q.status]}</span><span class="pill review">${subjectName(q.subject)}</span><span class="muted">${q.date.slice(0,4)}.${q.date.slice(4,6)}.${q.date.slice(6)} · ${q.number}번 · ${q.topic}</span>`;
 $('#question-text').textContent=q.question;
 $('#options').innerHTML=q.options.map((o,i)=>{let c='option';if(chosen===i+1)c+=' selected';if(revealed&&i+1===q.answer)c+=' correct';if(revealed&&chosen===i+1&&chosen!==q.answer)c+=' wrong';return `<button class="${c}" onclick="choose(${i+1})"><strong>${i+1}</strong>${escapeHtml(o)}</button>`}).join('');
 $('#explain').classList.toggle('hidden',!revealed);
 if(revealed){
   const lines=buildExplanation(q,chosen), uncertain=isUncertain(q.id);
   $('#explain').innerHTML=`<div class="answer-title">${chosen===q.answer?'정답입니다.':'정답은 '+q.answer+'번입니다.'}</div>
   <div class="explanation-block">${lines.map((line,i)=>`<p class="${i===1?'knowledge-line':''}">${escapeHtml(line)}</p>`).join('')}</div>
   <button class="uncertain-btn ${uncertain?'active':''}" onclick="toggleUncertain()"><span class="check-box">${uncertain?'✓':''}</span>${uncertain?'헷갈린 문제로 저장됨':'헷갈렸어요 — 맞혔어도 오답노트에 저장'}</button>
   <div class="explain-foot">출제기준 연결: ${escapeHtml(q.statusReason)}<br>※ 정답은 원문 정답표를 기준으로 표시합니다.</div>`;
 }else{$('#explain').innerHTML='';}
 renderDots();
 $('#bookmark-btn').textContent=getLS(LS.book,[]).includes(q.id)?'★ 저장됨':'☆ 즐겨찾기';
}
function choose(n){const q=S.session[S.index];if(S.revealed[q.id])return;S.answers[q.id]=n;S.revealed[q.id]=true;const wrong=getLS(LS.wrong,[]);if(n!==q.answer&&!wrong.includes(q.id))wrong.push(q.id);if(n===q.answer&&!isUncertain(q.id)){const i=wrong.indexOf(q.id);if(i>=0)wrong.splice(i,1)}setLS(LS.wrong,wrong);const p=getLS(LS.progress,{});p[q.subject]=(p[q.subject]||0)+1;setLS(LS.progress,p);renderQuestion()}
function renderDots(){$('#question-dots').innerHTML=S.session.map((q,i)=>{let c='qdot';if(i===S.index)c+=' active';if(S.revealed[q.id])c+=S.answers[q.id]===q.answer?' done':' wrong';return `<button class="${c}" onclick="goQ(${i})">${i+1}</button>`}).join('')}
function goQ(i){S.index=i;renderQuestion()}
function nextQ(){if(S.index<S.session.length-1){S.index++;renderQuestion()}else finishSession()}
function prevQ(){if(S.index>0){S.index--;renderQuestion()}}
function toggleBookmark(){const q=S.session[S.index],arr=getLS(LS.book,[]),i=arr.indexOf(q.id);if(i>=0)arr.splice(i,1);else arr.push(q.id);setLS(LS.book,arr);renderQuestion()}
function finishSession(){
 clearInterval(S.timer);
 const answered=Object.keys(S.answers).length,correct=S.session.filter(q=>S.answers[q.id]===q.answer).length;
 const scores=[1,2,3,4].map(s=>{const qs=S.session.filter(q=>q.subject===s);const c=qs.filter(q=>S.answers[q.id]===q.answer).length;return {s,total:qs.length,correct:c,score:qs.length?Math.round(c/qs.length*100):0}});
 const total=Math.round(correct/S.session.length*100),passed=S.session.length===80&&scores.every(x=>x.score>=40)&&total>=60;
 const hist=getLS(LS.history,[]);hist.unshift({date:new Date().toISOString(),title:S.title,total,correct,count:S.session.length,passed});setLS(LS.history,hist.slice(0,100));
 showView('result');$('#result-main').innerHTML=`<div class="card"><span class="muted">${S.title}</span><div class="score">${total}점</div><p>${correct}개 정답 / ${S.session.length}문항 ${answered<S.session.length?`· 미응답 ${S.session.length-answered}개`:''}</p>${S.session.length===80?`<span class="pill ${passed?'current':'excluded'}">${passed?'합격권':'불합격권'}</span>`:''}</div>`;
 $('#result-subjects').innerHTML=scores.map(x=>`<div class="card"><small>${x.s}과목</small><b class="score" style="font-size:26px">${x.score}점</b><div class="muted">${x.correct}/${x.total}</div></div>`).join('');
}
function renderExams(){
 const rows=[...DATA.exams].reverse().map(e=>`<tr><td><b>${e.label}</b></td><td>${e.validCount===e.count?e.count+'문항':e.validCount+'문항 사용 / 원문 '+e.count+'문항'}</td><td><button class="btn btn-outline" onclick="startExam('${e.date}')">풀기</button></td></tr>`).join('');
 $('#exam-list').innerHTML=rows;
}
function renderCollection(type){
 const ids=getLS(type==='wrong'?LS.wrong:LS.book,[]),qs=ids.map(id=>DATA.questions.find(q=>q.id===id)).filter(Boolean);
 const target=type==='wrong'?'wrong-list':'bookmark-list';
 if(!qs.length){$('#'+target).innerHTML='<div class="empty">저장된 문제가 없습니다.</div>';return}
 $('#'+target).innerHTML=qs.map(q=>`<article class="card"><div class="question-meta"><span class="pill ${q.status}">${statusLabel[q.status]}</span><span class="muted">${subjectName(q.subject)} · ${q.date}</span></div><h3 style="line-height:1.6">${escapeHtml(q.question)}</h3><button class="btn btn-purple" onclick="startSession([DATA.questions.find(x=>x.id==='${q.id}')],'저장 문제 다시 풀기','study')">다시 풀기</button></article>`).join('');
}
function renderSyllabus(){
 $('#syllabus-counts').innerHTML=`전체 ${DATA.meta.questionCount.toLocaleString()}문항을 최신 기준에 따라 자동 분류했습니다. <b>현재 범위 ${DATA.meta.statusCounts.current.toLocaleString()}문항</b>은 집중학습에 우선 사용됩니다.`;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function resetData(){if(confirm('오답, 즐겨찾기, 응시기록을 모두 초기화할까요?')){Object.values(LS).forEach(k=>localStorage.removeItem(k));renderDashboard()}}
document.addEventListener('DOMContentLoaded',()=>{
 $$('.nav button').forEach(b=>b.onclick=()=>showView(b.dataset.view));
 $('#start-focus').onclick=()=>startFocused('all');$('#start-mock').onclick=startMock;$('#reset-btn').onclick=resetData;
 renderDashboard();
});
