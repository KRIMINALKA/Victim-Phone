// default passwords (можеш да ги промениш тук)
const PHONE_PIN = "1987";        // PIN за отключване
const EMAIL_PIN = "281125";      // точно 6 цифри

// --- UTILS ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function showScreen(id){
  document.querySelectorAll('.screen, .app-screen').forEach(s=>s.classList.remove('active'));
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if(el) el.classList.add('active');
}

// --- LOCK SCREEN ---
const pinInput = $('#pin-input');
const unlockBtn = $('#unlock-btn');
const lockMsg = $('#lock-msg');
$('#default-pin').textContent = PHONE_PIN;

unlockBtn.addEventListener('click', ()=>{
  const val = pinInput.value.trim();
  if(val === PHONE_PIN){
    showScreen('home-screen');
  } else {
    lockMsg.textContent = 'Грешен PIN';
    setTimeout(()=> lockMsg.textContent = '', 1600);
  }
});

// allow Enter key
pinInput.addEventListener('keydown', e=>{
  if(e.key === 'Enter') unlockBtn.click();
});


// --- HOME ICONS ---
$$('.app-icon').forEach(icon=>{
  const app = icon.dataset.app;
  if(!app) return;
  icon.addEventListener('click', ()=>{
    if(app === 'bank') openBank();
    if(app === 'messages') openMessages();
    if(app === 'email') openEmailPass();
  });
});

// back buttons
$$('.back').forEach(b=>{
  b.addEventListener('click', ()=> {
    // go back to home
    showScreen('home-screen');
  });
});

// --- BANK ---
const txListEl = $('#tx-list');
const transactions = [
  {date:'2025-09-17',desc:'Пощенска доставка', amount:-24.50},
  {date:'2025-09-15',desc:'Профил: Кафене "Време"', amount:-8.20},
  {date:'2025-09-12',desc:'Превод от Мария', amount:+200.00},
  {date:'2025-09-03',desc:'Онлайн магазин - покупка', amount:-79.99},
  {date:'2025-08-28',desc:'Такса превод', amount:-2.50},
  {date:'2025-08-10',desc:'Заплата', amount:+12700.00},
  {date:'2025-07-22',desc:'Паркинг', amount:-17.00},
];

function openBank(){
  // populate list (6-7)
  txListEl.innerHTML = '';
  transactions.slice(0,7).forEach(t=>{
    const li = document.createElement('li');
    const amt = (t.amount >=0 ? '+' : '') + t.amount.toFixed(2);
    li.textContent = `${t.date} — ${t.desc} — ${amt} лв.`;
    txListEl.appendChild(li);
  });
  showScreen('bank-screen');
}


// --- MESSAGES ---
const chats = [
  {id:'chat1', name:'Алекс', preview:'Ще се видим ли?', img:null},
  {id:'chat2', name:'Мария', preview:'Мога ли да поговоря?', img:null},
  {id:'chat3', name:'Работа', preview:'Документите са тук', img:null},
  {id:'chat4', name:'Непознат номер', preview:'Имаш ли минутка?', img:null},
  {id:'chat5', name:'Брат', preview:'Къде си?', img:null}
];

const chatListEl = $('#chat-list');
function renderChatList(){
  chatListEl.innerHTML = '';
  chats.forEach(c=>{
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = getChatImage(c.id) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%230d2233"/><text x="50%" y="50%" fill="%239fb5d9" font-size="20" font-family="Arial" text-anchor="middle" dy=".3em">'+encodeURI(c.name)+'</text></svg>';
    const meta = document.createElement('div');
    meta.innerHTML = `<div style="font-weight:700">${c.name}</div><div style="font-size:13px;color:#9fb5d9">${c.preview}</div>`;
    li.appendChild(img);
    li.appendChild(meta);
    li.style.cursor = 'pointer';
    li.addEventListener('click', ()=> openChat(c.id, c.name));
    chatListEl.appendChild(li);
  });
}

function openMessages(){
  renderChatList();
  showScreen('messages-screen');
}

// chat storage helpers (stores dataURL in localStorage)
function getChatImage(chatId){
  try{ return localStorage.getItem('chat-img-'+chatId); } catch(e){ return null; }
}
function setChatImage(chatId, dataUrl){
  try{ localStorage.setItem('chat-img-'+chatId, dataUrl); } catch(e){ console.warn('localStorage failed', e); }
}

const chatImageEl = $('#chat-image');
const chatTitleEl = $('#chat-title');
const chatUpload = $('#chat-upload');
let currentChatId = null;

function openChat(chatId, chatName){
  currentChatId = chatId;
  chatTitleEl.textContent = chatName;
  const img = getChatImage(chatId);
  chatImageEl.src = img || '';
  showScreen('chat-screen');
}

// upload handler
chatUpload.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const dataUrl = ev.target.result;
    chatImageEl.src = dataUrl;
    if(currentChatId) setChatImage(currentChatId, dataUrl);
    // clear input
    chatUpload.value = '';
  };
  reader.readAsDataURL(f);
});

$('#chat-back').addEventListener('click', ()=>{
  openMessages();
});


// --- EMAILS ---
function openEmailPass(){
  showScreen('email-pass-screen');
}
const emailMsg = $('#email-msg');
$('#email-unlock').addEventListener('click', ()=>{
  const val = $('#email-pin').value.trim();
  if(val === EMAIL_PIN){
    renderEmails();
    showScreen('email-screen');
    $('#email-pin').value = '';
    emailMsg.textContent = '';
  } else {
    emailMsg.textContent = 'Грешен код';
    setTimeout(()=> emailMsg.textContent='', 1500);
  }
});

const emailListEl = $('#email-list');

// four promo emails (на български)
const promoEmails = [
  {from:'promo@shop.bg', subject:'Големи намаления до 70%!', preview:'Само днес — вземи 3 за цената на 2. Виж офертите.'},
  {from:'offers@travelnow.com', subject:'Промо код за пътуване', preview:'Ексклузивен код за 20% отстъпка до края на месеца.'},
  {from:'news@bank.bg', subject:'Актуални кредитни предложения', preview:'Нови условия по кредитите — провери дали можеш да спестиш.'},
  {from:'ads@fooddelivery.bg', subject:'Безплатна доставка днес', preview:'Поръчай сега и вземи безплатна доставка за първа поръчка.'}
];

// render email list (до 12)
function renderEmails(){
  emailListEl.innerHTML = '';
  // insert promo first
  promoEmails.forEach(e=>{
    const li = document.createElement('li');
    li.innerHTML = `<div class="subject">${e.subject}</div><div class="meta">${e.from} · ${e.preview}</div>`;
    emailListEl.appendChild(li);
  });
  // placeholder slots for up to 8 други (ти ще ги попълниш по-късно локално в HTML или чрез JS)
  const remaining = 8;
  for(let i=1;i<=remaining;i++){
    const li = document.createElement('li');
    li.innerHTML = `<div class="subject">[Празен имейл #${i}]</div><div class="meta">add content later</div>`;
    emailListEl.appendChild(li);
  }
}

// initial show lock
showScreen('lock-screen');
