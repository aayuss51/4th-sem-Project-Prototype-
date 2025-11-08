
/* Global app script for HealCare demo frontend (uses localStorage) */

function qs(sel){ return document.querySelector(sel) }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)) }

function openModal(html){
  const modal = qs('#modal'); const content = qs('#modalContent');
  content.innerHTML = html; modal.classList.remove('hidden');
  setTimeout(()=> content.querySelectorAll('input,select,button,textarea')[0]?.focus(),80);
}
function closeModal(){ qs('#modal').classList.add('hidden'); qs('#modalContent').innerHTML = ''; }

document.addEventListener('click', function(e){
  if(e.target.id==='modalClose' || e.target.id==='modal') closeModal();
});

// data helpers
function load(key){ return JSON.parse(localStorage.getItem(key) || '[]') }
function save(key,arr){ localStorage.setItem(key, JSON.stringify(arr)) }

// Dashboard specific
function updateStats(){
  const patients = load('patients'), doctors=load('doctors'), apps=load('appointments');
  qs('#statPatients').textContent = patients.length;
  qs('#statDoctors').textContent = doctors.length;
  qs('#statAppointments').textContent = apps.length;
}

function renderDashboard(){
  const apps = load('appointments').slice().sort((a,b)=> new Date(a.date) - new Date(b.date)).slice(0,5);
  const dashApps = qs('#dashAppointments tbody'); if(dashApps){ dashApps.innerHTML=''; apps.forEach(a=>{
    const tr=document.createElement('tr'); tr.innerHTML = `<td>${a.patient}</td><td>${a.doctor}</td><td>${a.date}</td><td>${a.time}</td>`; dashApps.appendChild(tr);
  })}

  const patients = load('patients').slice(-5).reverse();
  const pList = qs('#dashPatients'); if(pList){ pList.innerHTML=''; patients.forEach(p=>{ const li=document.createElement('li'); li.textContent = `${p.name} — ${p.disease}`; pList.appendChild(li) })}

  const doctors = load('doctors').slice(0,7);
  const dList = qs('#dashDoctors'); if(dList){ dList.innerHTML=''; doctors.forEach(d=>{ const li=document.createElement('li'); li.textContent = `${d.name} — ${d.special}`; dList.appendChild(li) })}
}

// Patients page
function bindPatientsPage(){
  const tableBody = qs('#patientTable tbody');
  function refresh(){
    const patients = load('patients'); tableBody.innerHTML=''; patients.forEach((p,idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.name}</td><td>${p.age}</td><td>${p.gender}</td><td>${p.disease}</td>
        <td>
          <button class="btn tiny" data-act="edit" data-id="${idx}">Edit</button>
          <button class="btn tiny danger" data-act="del" data-id="${idx}">Delete</button>
        </td>`;
      tableBody.appendChild(tr);
    })
  }
  refresh();

  qs('#newPatient')?.addEventListener('click', ()=> {
    openModal(`<h3>Add Patient</h3>
      <form id="pForm">
        <input name="name" placeholder="Full name" required><br>
        <input name="age" placeholder="Age" required><br>
        <input name="gender" placeholder="Gender" required><br>
        <input name="disease" placeholder="Disease" required><br>
        <div style="text-align:right"><button class="btn">Save</button></div>
      </form>`);
    qs('#pForm').addEventListener('submit', function(e){
      e.preventDefault();
      const fm = new FormData(e.target);
      const p = Object.fromEntries(fm.entries());
      const arr = load('patients'); arr.push(p); save('patients',arr); closeModal(); refresh(); updateAll();
    })
  });

  tableBody?.addEventListener('click', function(e){
    const btn = e.target.closest('button'); if(!btn) return;
    const act = btn.dataset.act; const id = +btn.dataset.id;
    if(act==='del'){ const arr=load('patients'); arr.splice(id,1); save('patients',arr); refresh(); updateAll() }
    if(act==='edit'){ const arr=load('patients'); const p=arr[id];
      openModal(`<h3>Edit Patient</h3>
      <form id="pForm">
        <input name="name" value="${p.name}" required><br>
        <input name="age" value="${p.age}" required><br>
        <input name="gender" value="${p.gender}" required><br>
        <input name="disease" value="${p.disease}" required><br>
        <div style="text-align:right"><button class="btn">Save</button></div>
      </form>`);
      qs('#pForm').addEventListener('submit', function(ev){ ev.preventDefault(); const fm=new FormData(ev.target); arr[id]=Object.fromEntries(fm.entries()); save('patients',arr); closeModal(); refresh(); updateAll() })
    }
  })
}

// Doctors page
function bindDoctorsPage(){
  const tableBody = qs('#doctorTable tbody');
  function refresh(){
    const doctors = load('doctors'); tableBody.innerHTML=''; doctors.forEach((d,idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d.name}</td><td>${d.special}</td><td>${d.phone}</td>
        <td>
          <button class="btn tiny" data-act="edit" data-id="${idx}">Edit</button>
          <button class="btn tiny danger" data-act="del" data-id="${idx}">Delete</button>
        </td>`;
      tableBody.appendChild(tr);
    })
  }
  refresh();

  qs('#newDoctor')?.addEventListener('click', ()=> {
    openModal(`<h3>Add Doctor</h3>
      <form id="dForm">
        <input name="name" placeholder="Full name" required><br>
        <input name="special" placeholder="Specialization" required><br>
        <input name="phone" placeholder="Phone" required><br>
        <div style="text-align:right"><button class="btn">Save</button></div>
      </form>`);
    qs('#dForm').addEventListener('submit', function(e){
      e.preventDefault();
      const fm=new FormData(e.target); const d=Object.fromEntries(fm.entries());
      const arr = load('doctors'); arr.push(d); save('doctors',arr); closeModal(); refresh(); updateAll();
    })
  });

  tableBody?.addEventListener('click', function(e){
    const btn = e.target.closest('button'); if(!btn) return;
    const act = btn.dataset.act; const id = +btn.dataset.id;
    if(act==='del'){ const arr=load('doctors'); arr.splice(id,1); save('doctors',arr); refresh(); updateAll() }
    if(act==='edit'){ const arr=load('doctors'); const d=arr[id];
      openModal(`<h3>Edit Doctor</h3>
      <form id="dForm">
        <input name="name" value="${d.name}" required><br>
        <input name="special" value="${d.special}" required><br>
        <input name="phone" value="${d.phone}" required><br>
        <div style="text-align:right"><button class="btn">Save</button></div>
      </form>`);
      qs('#dForm').addEventListener('submit', function(ev){ ev.preventDefault(); const fm=new FormData(ev.target); arr[id]=Object.fromEntries(fm.entries()); save('doctors',arr); closeModal(); refresh(); updateAll() })
    }
  })
}

// Appointments page
function bindAppointmentsPage(){
  const tableBody = qs('#appointmentTable tbody');
  function refresh(){
    const arr = load('appointments'); tableBody.innerHTML=''; arr.forEach((a,idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.patient}</td><td>${a.doctor}</td><td>${a.date}</td><td>${a.time}</td>
        <td><button class="btn tiny" data-act="del" data-id="${idx}">Cancel</button></td>`;
      tableBody.appendChild(tr);
    })
  }
  refresh();

  // populate datalists
  const pList = qs('#patientsList'); const dList=qs('#doctorsList');
  function populateLists(){
    const patients=load('patients'); const doctors=load('doctors');
    if(pList){ pList.innerHTML = patients.map(p=>`<option value="${p.name}">`).join('') }
    if(dList){ dList.innerHTML = doctors.map(d=>`<option value="${d.name}">`).join('') }
  }
  populateLists();

  qs('#appointmentForm')?.addEventListener('submit', function(e){
    e.preventDefault();
    const fm=new FormData(e.target); const a=Object.fromEntries(fm.entries());
    const arr = load('appointments'); arr.push(a); save('appointments',arr); e.target.reset(); refresh(); updateAll();
  });

  tableBody?.addEventListener('click', function(e){
    const btn = e.target.closest('button'); if(!btn) return;
    const act = btn.dataset.act; const id = +btn.dataset.id;
    if(act==='del'){ const arr=load('appointments'); arr.splice(id,1); save('appointments',arr); refresh(); updateAll() }
  });

  // when patients/doctors change, update datalists
  window.addEventListener('storage', populateLists);
}

// fallback: generic initializer for pages
function init(){
  updateStats(); renderDashboard();

  if(qs('#patientTable')) bindPatientsPage();
  if(qs('#doctorTable')) bindDoctorsPage();
  if(qs('#appointmentTable')) bindAppointmentsPage();

  // global search (basic)
  qs('#globalSearch')?.addEventListener('input', function(e){
    const q=this.value.toLowerCase();
    // simple highlight: redirect to patients if matches a patient
    const patients = load('patients'), doctors=load('doctors'), apps=load('appointments');
    if(patients.some(p=> p.name.toLowerCase().includes(q))){ window.location='patients.html' }
    else if(doctors.some(d=> d.name.toLowerCase().includes(q))){ window.location='doctors.html' }
    else if(apps.some(a=> a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q))){ window.location='appointments.html' }
  });

  // buttons in header to open quick-add
  qs('#addPatientBtn')?.addEventListener('click', ()=> qs('#newPatient')?.click() );
}

function updateAll(){ updateStats(); renderDashboard(); }

// start
document.addEventListener('DOMContentLoaded', init);
