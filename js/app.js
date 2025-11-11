// Simple demo app (localStorage) for Dashboard Demo
const STORAGE_KEY = 'vaulto_demo_v3';
const defaultState = {
  vaults: [
    { id:'v1', name:'Savings Vault', balance: 28400 },
    { id:'v2', name:'Investment Vault', balance: 12800 },
    { id:'v3', name:'Wallet', balance: 4400 },
  ],
  items: [
    { id:'a1', vaultId:'v1', title:'Emergency Fund', content:'Goal: ₹50,000', createdAt:Date.now()-86400000*10 },
    { id:'a2', vaultId:'v2', title:'Stocks - Oct', content:'SIP summary', createdAt:Date.now()-86400000*3 },
    { id:'a3', vaultId:'v3', title:'Grocery Receipts', content:'12 receipts', createdAt:Date.now()-86400000*1 },
  ],
  activeVault: 'v1',
};

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e){
    console.warn('Corrupted state, resetting to defaults');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

let state = loadState();

// DOM refs
const vaultListEl = document.getElementById('vaultList');
const itemsListEl = document.getElementById('itemsList');
const totalBalanceEl = document.getElementById('totalBalance');
const newVaultBtn = document.getElementById('newVaultBtn');
const newItemBtn = document.getElementById('newItemBtn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('cancel');
const itemForm = document.getElementById('itemForm');

function renderVaults(){
  vaultListEl.innerHTML = '';
  state.vaults.forEach(v => {
    const li = document.createElement('div');
    li.className = `card flex items-center justify-between p-2`;
    li.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#062233,#0b3a50);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--muted)">
          ${v.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
        </div>
        <div>
          <div style="font-weight:600">${v.name}</div>
          <div class="small">₹ ${v.balance.toLocaleString()}</div>
        </div>
      </div>
      <div>
        <button class="btn-ghost openVault" data-id="${v.id}">Open</button>
      </div>
    `;
    vaultListEl.appendChild(li);
  });

  document.querySelectorAll('.openVault').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      state.activeVault = id;
      saveState(state);
      renderAll();
    });
  });
}

function renderItems(){
  const filtered = state.items.filter(it => it.vaultId === state.activeVault).sort((a,b)=> b.createdAt - a.createdAt);
  itemsListEl.innerHTML = '';
  if(filtered.length === 0){
    itemsListEl.innerHTML = '<div class="small">No items here yet. Create one.</div>';
    return;
  }
  filtered.forEach(it => {
    const d = new Date(it.createdAt);
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-weight:600">${it.title}</div>
        <div class="small">${it.content}</div>
      </div>
      <div class="small">${d.toLocaleDateString()}</div>
    </div>`;
    itemsListEl.appendChild(el);
  });
}

function renderTotals(){
  const total = state.vaults.reduce((s,v)=> s+v.balance,0);
  totalBalanceEl.innerText = total.toLocaleString();
}

function renderAll(){
  renderVaults();
  renderItems();
  renderTotals();
}

newVaultBtn.addEventListener('click', ()=> {
  const name = prompt('Vault name') || `New Vault ${state.vaults.length+1}`;
  const id = 'v' + Math.random().toString(36).slice(2,8);
  state.vaults.push({ id, name, balance: 0 });
  state.activeVault = id;
  saveState(state);
  renderAll();
});

newItemBtn.addEventListener('click', ()=> {
  modal.style.display = 'flex';
});

cancelBtn.addEventListener('click', ()=> {
  modal.style.display = 'none';
});

itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('itmTitle').value.trim();
  const content = document.getElementById('itmContent').value.trim();
  if(!title){ alert('Add a title'); return; }
  const id = 'it' + Math.random().toString(36).slice(2,8);
  state.items.push({ id, vaultId: state.activeVault, title, content, createdAt: Date.now() });
  saveState(state);
  document.getElementById('itmTitle').value = '';
  document.getElementById('itmContent').value = '';
  modal.style.display = 'none';
  renderAll();
});

document.addEventListener('keydown', (e)=> {
  if(e.key === 'n' && !e.metaKey && !e.ctrlKey){
    modal.style.display = 'flex';
  }
});

renderAll();