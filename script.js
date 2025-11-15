const ADMIN_NICK="karowkin";const ADMIN_PASS="kartowkinproskin";let state={weekOffset:0,isAdmin:false,schedule:{}};const defaultTemplate={"Понедельник":["Математика","Русский","Литература","История","География","Физкультура"],"Вторник":["Английский","Химия","Алгебра","Русский","Биология","Информатика"],"Среда":["ОБЖ","История","Физика","Алгебра","География","Литература"],"Четверг":["Русский","Математика","Технология","Английский","Физкультура","Химия"],"Пятница":["Информатика","Алгебра","Физика","История","Биология","Литература"],"Суббота":["—","—","—","—","—","—"]};

function getWeekStart(o=0){const d=new Date(),day=d.getDay(),diff=(day===0?-6:1-day);return new Date(d.getFullYear(),d.getMonth(),d.getDate()+diff+o*7)}
function weekKey(o){return getWeekStart(o).toISOString().slice(0,10)}
function ensureWeek(k){if(!state.schedule[k])state.schedule[k]=JSON.parse(JSON.stringify(defaultTemplate))}
function saveState(){localStorage.setItem("schedule_state",JSON.stringify(state))}
function loadState(){const raw=localStorage.getItem("schedule_state");if(raw){try{state=JSON.parse(raw)}catch{}}}

function notify(msg){const t=document.getElementById("toast"),d=document.createElement("div");d.className="item";d.textContent=msg;t.appendChild(d);setTimeout(()=>d.remove(),2500)}

function renderBoard(){
 const board=document.getElementById("board"); board.innerHTML="";
 const key=weekKey(state.weekOffset); ensureWeek(key);
 const week=state.schedule[key]; const monday=getWeekStart(state.weekOffset);
 const days=Object.keys(week);
 for(let i=0;i<days.length;i++){
  const dayName=days[i], lessons=week[dayName];
  const card=document.createElement("div"); card.className="day-card";
  const d=new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+i);
  card.innerHTML=`<h3>${dayName}</h3><div>(${d.toLocaleDateString("ru-RU",{day:"numeric",month:"long"})})</div><ul class="lessons"></ul>`;
  const ul=card.querySelector(".lessons");
  lessons.forEach((lesson,idx)=>{
    const li=document.createElement("li");
    const strike=lesson.startsWith("~~");
    li.innerHTML=`<span class="${strike?"strike":""}">${idx+1}. ${strike?lesson.slice(2):lesson}</span>
    ${state.isAdmin?`<button data-act="edit" data-d="${dayName}" data-i="${idx}">✏️</button>
                    <button data-act="strike" data-d="${dayName}" data-i="${idx}">✔️</button>
                    <button data-act="del" data-d="${dayName}" data-i="${idx}">🗑️</button>`:""}`;
    ul.appendChild(li);
  });
  if(state.isAdmin){
   const add=document.createElement("div");
   add.innerHTML=`<input id="add_${dayName}" placeholder="Новый урок..."><button data-add="${dayName}">+ Добавить</button>`;
   card.appendChild(add);
  }
  board.appendChild(card);
 }
}

document.addEventListener("click",e=>{
 if(e.target.dataset.act==="edit"){let day=e.target.dataset.d,i=e.target.dataset.i;const k=weekKey(state.weekOffset),v=state.schedule[k][day][i].replace(/^~~/,"");let nv=prompt("Изменить урок:",v);if(nv){state.schedule[k][day][i]=nv;saveState();renderBoard();notify("Урок изменён")}}
 if(e.target.dataset.act==="del"){let day=e.target.dataset.d,i=e.target.dataset.i;if(confirm("Удалить?")){const k=weekKey(state.weekOffset);state.schedule[k][day].splice(i,1);saveState();renderBoard();notify("Удалено")}}
 if(e.target.dataset.act==="strike"){let day=e.target.dataset.d,i=e.target.dataset.i;const k=weekKey(state.weekOffset);let v=state.schedule[k][day][i];state.schedule[k][day][i]=v.startsWith("~~")?v.slice(2):"~~"+v;saveState();renderBoard();notify("Статус изменён")}
 if(e.target.dataset.add){let day=e.target.dataset.add,input=document.getElementById("add_"+day);let v=input.value.trim();if(v){const k=weekKey(state.weekOffset);state.schedule[k][day].push(v);saveState();renderBoard();notify("Урок добавлен")}}
});

function doLogin(){const n=document.getElementById("adminNick").value.trim(),p=document.getElementById("adminPass").value;
 if(n===ADMIN_NICK&&p===ADMIN_PASS){state.isAdmin=true;saveState();renderBoard();notify("Админ включён");document.getElementById("modal").classList.add("hidden")}
 else alert("Неверный логин/пароль");
}
function logout(){state.isAdmin=false;saveState();renderBoard();notify("Выход")}
function updateTime(){const now=new Date();document.getElementById("time").textContent=
 now.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
 document.getElementById("date").textContent=
 now.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})+" года";
 document.getElementById("updatedAt").textContent=new Date().toLocaleString("ru-RU")}

document.getElementById("btnLogin").onclick=()=>document.getElementById("modal").classList.remove("hidden");
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("modalLogin").onclick=doLogin;
document.getElementById("btnLogout").onclick=logout;
document.getElementById("prevWeek").onclick=()=>{state.weekOffset--;saveState();renderBoard()};
document.getElementById("nextWeek").onclick=()=>{state.weekOffset++;saveState();renderBoard()};

loadState();renderBoard();updateTime();setInterval(updateTime,1000);
