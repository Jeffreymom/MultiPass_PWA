
const DATA=window.MULTIPASS_DATA;
const S={view:'dashboard',session:[],index:0,answers:{},revealed:{},startedAt:null,timer:null,filterStatus:'current',filterSubject:'all'};
const LS={wrong:'mp_wrong_v2',book:'mp_book_v2',history:'mp_history_v2',progress:'mp_progress_v2'};
const getLS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const setLS=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const statusLabel={current:'현재 범위',supplement:'보조 학습',review:'검토 학습',excluded:'현재 제외'};
const subjectName=n=>DATA.subjects[n];
function setNav(view){$$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view))}
function showView(name){S.view=name;setNav(name);$$('.view').forEach(v=>v.classList.add('hidden'));$('#view-'+name).classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});if(name==='dashboard')renderDashboard();if(name==='exams')renderExams();if(name==='wrong')renderCollection('wrong');if(name==='bookmarks')renderCollection('bookmarks');if(name==='syllabus')renderSyllabus()}
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
 return DATA.questions.filter(q=>(subject==='all'||q.subject===Number(subject))&&(status==='all'||q.status===status)&&(!date||q.date===date));
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
 const qs=DATA.questions.filter(q=>q.date===date).sort((a,b)=>a.number-b.number);
 startSession(qs,`${date.slice(0,4)}.${date.slice(4,6)}.${date.slice(6)} 기출문제`,'exam');
}
function startSession(qs,title,mode='study'){
 if(!qs.length)return alert('조건에 맞는 문제가 없습니다.');
 S.session=qs;S.index=0;S.answers={};S.revealed={};S.title=title;S.mode=mode;S.startedAt=Date.now();
 showView('quiz');$('#quiz-title').textContent=title;renderQuestion();startTimer();
}
function startTimer(){clearInterval(S.timer);S.timer=setInterval(()=>{const sec=Math.floor((Date.now()-S.startedAt)/1000);$('#timer').textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`},1000)}
function renderQuestion(){
 const q=S.session[S.index], chosen=S.answers[q.id], revealed=S.revealed[q.id];
 $('#quiz-progress').textContent=`${S.index+1} / ${S.session.length}`;
 $('#question-meta').innerHTML=`<span class="pill ${q.status}">${statusLabel[q.status]}</span><span class="pill review">${subjectName(q.subject)}</span><span class="muted">${q.date.slice(0,4)}.${q.date.slice(4,6)}.${q.date.slice(6)} · ${q.number}번 · ${q.topic}</span>`;
 $('#question-text').textContent=q.question;
 $('#options').innerHTML=q.options.map((o,i)=>{let c='option';if(chosen===i+1)c+=' selected';if(revealed&&i+1===q.answer)c+=' correct';if(revealed&&chosen===i+1&&chosen!==q.answer)c+=' wrong';return `<button class="${c}" onclick="choose(${i+1})"><strong>${i+1}</strong>${escapeHtml(o)}</button>`}).join('');
 $('#explain').classList.toggle('hidden',!revealed);
 $('#explain').innerHTML=revealed?`<b>${chosen===q.answer?'정답입니다.':'정답은 '+q.answer+'번입니다.'}</b><br>${escapeHtml(q.statusReason)}<br><span class="muted">※ 원문 정답표를 기준으로 표시합니다.</span>`:'';
 renderDots();
 $('#bookmark-btn').textContent=getLS(LS.book,[]).includes(q.id)?'★ 저장됨':'☆ 즐겨찾기';
}
function choose(n){const q=S.session[S.index];if(S.revealed[q.id])return;S.answers[q.id]=n;S.revealed[q.id]=true;const wrong=getLS(LS.wrong,[]);if(n!==q.answer&&!wrong.includes(q.id))wrong.push(q.id);if(n===q.answer){const i=wrong.indexOf(q.id);if(i>=0)wrong.splice(i,1)}setLS(LS.wrong,wrong);const p=getLS(LS.progress,{});p[q.subject]=(p[q.subject]||0)+1;setLS(LS.progress,p);renderQuestion()}
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
 const rows=[...DATA.exams].reverse().map(e=>`<tr><td><b>${e.label}</b></td><td>${e.count}문항</td><td><button class="btn btn-outline" onclick="startExam('${e.date}')">풀기</button></td></tr>`).join('');
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
