// ── STATE ──────────────────────────────────────────────────────────
const PRESETS=[
  {n:'Ruang Tamu',i:'🛋️'},{n:'Ruang Keluarga',i:'📺'},{n:'Dapur',i:'🍳'},
  {n:'Kamar Utama',i:'🛏️'},{n:'Kamar Anak',i:'🧒'},{n:'Garasi',i:'🚗'},
  {n:'Kamar Mandi',i:'🚿'},{n:'Kantor/Kerja',i:'💻'},{n:'Laundry',i:'🫧'},{n:'Teras',i:'🌿'},
]
const ICONS=['🏠','🛋️','📺','🍳','🛏️','🧒','🚿','🚗','💻','🫧','🌿','🔧','🎮','📚','🎵','🏋️']
const VA_OPTIONS=[900,1300,2200,3500,5500,7700]

let kwhMeterCondition=null
let rooms=[
  {id:'r1',n:'Ruang Tamu',i:'🛋️',devs:[]},
  {id:'r2',n:'Ruang Keluarga',i:'📺',devs:[]},
  {id:'r3',n:'Dapur',i:'🍳',devs:[]},
  {id:'r4',n:'Kamar Utama',i:'🛏️',devs:[]},
  {id:'r5',n:'Garasi',i:'🚗',devs:[]},
]
let plnVa=1300, jumlahOrang=3, activeRoom='r1', selIco='🏠', customId=0
const API_URL = window.location.origin // use same origin (Vercel backend)
// ── TARIFF & CALC ──────────────────────────────────────────────────
function tariff(){ return plnVa<=900?1352:plnVa<=2200?1444:1699 }
function calcDev(w,h){ const kwh=Math.round(w*h*30/1000*10)/10; return {kwh,cost:Math.round(kwh*tariff())} }
function rp(n){ return 'Rp '+Math.round(n).toLocaleString('id-ID') }

// ── STEP NAV ──────────────────────────────────────────────────────
function go(n){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'))
  document.getElementById('p'+n).classList.add('active')
  document.getElementById('pf').style.width=['25%','50%','75%','100%'][n-1]
  ;['s1','s2','s3','s4'].forEach((id,i)=>{
    const el=document.getElementById(id); el.className='slbl'
    if(i+1<n) el.classList.add('ok'); else if(i+1===n) el.classList.add('on')
  })
  document.getElementById('stickyBar').style.display=n===2?'flex':'none'
  if(n===2){ renderTabs(); renderContent() }
  if(n===4) window.scrollTo(0,0)
}

// ── STEP 1 ────────────────────────────────────────────────────────
function initVA(){
  document.getElementById('vaRow').innerHTML=VA_OPTIONS.map(v=>
    `<button class="va-btn${v===plnVa?' sel':''}" onclick="setVa(${v})">${v.toLocaleString()} VA</button>`
  ).join('')
}
function setVa(v){ plnVa=v; initVA(); if(document.getElementById('p2').classList.contains('active')) renderContent(); updateSticky() }

function setOrang(n){
  jumlahOrang=n
  document.getElementById('orangVal').textContent=n
  document.getElementById('orangLabel').textContent=n+' orang tinggal di rumah'
}

function renderRooms(){
  document.getElementById('roomGrid').innerHTML=rooms.map(r=>`
    <div class="room-card${r.devs.length>0?' done':''}">
      <button class="r-del" onclick="removeRoom('${r.id}')">✕</button>
      <div class="r-ico">${r.i}</div>
      <div class="r-nm">${r.n}</div>
      ${r.devs.length>0?`<div class="r-cnt">✓ ${r.devs.length} perangkat</div>`:''}
    </div>
  `).join('')+`<div style="border:2px dashed var(--light);border-radius:14px;padding:16px 10px;text-align:center;background:transparent;cursor:pointer;color:var(--mid);font-size:11px;font-weight:700;transition:all .2s" onclick="togglePreset()" onmouseover="this.style.borderColor='var(--acc)';this.style.color='var(--acc)'" onmouseout="this.style.borderColor='var(--light)';this.style.color='var(--mid)'"><div style="font-size:26px;margin-bottom:6px">＋</div>Tambah</div>`

  const ok=rooms.length>0
  document.getElementById('btnStep2').disabled=!ok
  document.getElementById('roomHint').textContent=ok?`${rooms.length} ruangan dipilih`:'Pilih minimal 1 ruangan'
}
function removeRoom(id){
  rooms=rooms.filter(r=>r.id!==id)
  if(activeRoom===id&&rooms.length>0) activeRoom=rooms[0].id
  renderRooms()
}
function togglePreset(){
  const b=document.getElementById('presetBox'), show=b.style.display==='none'
  b.style.display=show?'block':'none'
  document.getElementById('customBox').style.display='none'
  if(show) document.getElementById('presetGrid').innerHTML=PRESETS.map(p=>
    `<div class="preset-item" onclick="addPreset('${p.n}','${p.i}')">${p.i} ${p.n}</div>`
  ).join('')
}
function addPreset(n,i){
  if(!rooms.find(r=>r.n===n)) rooms.push({id:'rp'+(++customId),n,i,devs:[]})
  renderRooms(); document.getElementById('presetBox').style.display='none'
}
function toggleCustom(){
  const b=document.getElementById('customBox'), show=b.style.display==='none'
  b.style.display=show?'block':'none'
  document.getElementById('presetBox').style.display='none'
  if(show){ document.getElementById('iconPicker').innerHTML=ICONS.map(ic=>
    `<span class="ico-opt${ic===selIco?' sel':''}" onclick="pickIco('${ic}')">${ic}</span>`
  ).join('') }
}
function pickIco(ic){ selIco=ic; toggleCustom(); toggleCustom() }
function addCustomRoom(){
  const n=document.getElementById('customName').value.trim(); if(!n) return
  rooms.push({id:'rc'+(++customId),n,i:selIco,devs:[]})
  document.getElementById('customName').value=''; renderRooms()
  document.getElementById('customBox').style.display='none'
}
function goStep2(){ if(!rooms.length) return; activeRoom=rooms[0].id; go(2) }

// ── STEP 2 ────────────────────────────────────────────────────────
function renderTabs(){
  document.getElementById('roomTabs').innerHTML=rooms.map(r=>
    `<button class="rtab${r.id===activeRoom?' sel':''}${r.devs.length>0?' done':''}" onclick="switchRoom('${r.id}')">
      ${r.i} ${r.n}${r.devs.length>0?' ✓'+r.devs.length:''}
    </button>`
  ).join('')
}
function switchRoom(id){ activeRoom=id; renderTabs(); renderContent() }

function renderContent(){
  const room=rooms.find(r=>r.id===activeRoom); if(!room) return
  const rCost=room.devs.reduce((a,d)=>a+calcDev(d.w,d.h).cost,0)
  document.getElementById('roomContent').innerHTML=`
    <div style="font-size:12px;color:var(--mid);margin-bottom:12px;padding:9px 13px;background:var(--light2);border-radius:9px;display:flex;gap:7px">
      <span>📸</span><span>Foto <strong>satu elektronik per foto</strong>. Tiap foto → AI identifikasi 1 perangkat.</span>
    </div>
    ${room.devs.length>0?`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:14px;font-weight:800">⚡ Terdeteksi <span style="font-size:12px;color:var(--mid);font-weight:500">${room.devs.length} perangkat</span></div>
        <span style="font-size:11px;color:var(--mid)">geser slider = jam/hari</span>
      </div>
      <div class="dlist">
        ${room.devs.map((d,i)=>{
          const {kwh,cost}=calcDev(d.w,d.h)
          const cc=cost>150000?'#ef4444':cost>60000?'#d97706':'#10b981'
          return `<div class="drow" id="drow_${room.id}_${i}">
            <div class="drow-top">
              <div class="d-ico">${d.e||'🔌'}</div>
              <div class="d-info"><div class="d-nm">${d.n}</div><div class="d-wt">${d.w}W · ${kwh} kWh/bln</div></div>
              <div class="d-cost" id="dc_${room.id}_${i}" style="color:${cc}">${rp(cost)}</div>
              <button class="dbtn" onclick="delDev('${room.id}',${i})">×</button>
            </div>
            <div>
              <div class="slider-row">
                <span class="sl-lbl">Jam pakai per hari</span>
                <span class="sl-val" id="sv_${room.id}_${i}">${d.h} jam</span>
              </div>
              <input type="range" min="0.5" max="24" step="0.5" value="${d.h}" oninput="updH('${room.id}',${i},this.value)">
              <div class="sl-ticks"><span>½j</span><span>12j</span><span>24j</span></div>
            </div>
          </div>`
        }).join('')}
      </div>
      <div class="room-total"><span class="rt-lbl">Total ${room.n}</span><span class="rt-val">${rp(rCost)}/bln</span></div>
    `:''}

    <!-- TAMBAH PERANGKAT + NAME PLATE (always visible) -->
    <div style="margin-top:14px">
      <input type="file" id="fi_${room.id}" accept="image/*" style="display:none" onchange="oneFile(this.files,'${room.id}')">
      <input type="file" id="np_${room.id}" accept="image/*" style="display:none" onchange="oneNameplate(this.files,'${room.id}')">
      
      <div class="uz" ondrop="onDrop(event,'${room.id}')" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" onclick="triggerUpload('fi_${room.id}')">
        <div id="uzi_${room.id}">
          <div class="uz-ico">${room.devs.length===0?'📷':'➕'}</div>
          <div class="uz-t">${room.devs.length===0?'Foto Elektronik Pertama':'+ Tambah Perangkat'} di ${room.n}</div>
          <div class="uz-s">Klik atau drag foto · 1 foto = 1 elektronik</div>
        </div>
        <div class="lbar" id="lb_${room.id}"><div class="lbar-fill"></div></div>
      </div>

      <div class="np-zone" ondrop="onDropNameplate(event,'${room.id}')" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" onclick="triggerUpload('np_${room.id}')">
        <div id="npzi_${room.id}">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:28px">🏷️</div>
            <div>
              <div style="font-size:13px;font-weight:800;color:var(--dark)">Foto Name Plate / Label</div>
              <div style="font-size:11px;color:var(--mid)">AI baca watt, merk & model dari stiker perangkat</div>
            </div>
          </div>
        </div>
        <div class="lbar" id="nplb_${room.id}"><div class="lbar-fill"></div></div>
      </div>
    </div>
  `
  updateSticky()
}

function showAdd(id){ document.getElementById('addBtn_'+id).style.display='none'; document.getElementById('addPanel_'+id).style.display='block' }
function hideAdd(id){ document.getElementById('addBtn_'+id).style.display='flex'; document.getElementById('addPanel_'+id).style.display='none' }
var _uploadLock = false
function triggerUpload(inputId) {
  if (_uploadLock) return
  _uploadLock = true
  var el = document.getElementById(inputId)
  if (el) el.click()
  setTimeout(function(){ _uploadLock = false }, 600)
}
function onDrop(e,id){ e.preventDefault(); oneFile(e.dataTransfer.files,id) }
function onDrop2(e,id){ e.preventDefault(); oneFile(e.dataTransfer.files,id) }
function onDropNameplate(e,id){ e.preventDefault(); e.currentTarget.classList.remove('drag'); oneNameplate(e.dataTransfer.files,id) }

async function oneNameplate(files,roomId){
  const imgs=Array.from(files).filter(f=>f.type.startsWith('image/')); if(!imgs.length) return
  const room=rooms.find(r=>r.id===roomId)
  const lb=document.getElementById('nplb_'+roomId)
  const inn=document.getElementById('npzi_'+roomId)
  if(lb) lb.classList.add('on')
  if(inn) inn.innerHTML='<div style="display:flex;align-items:center;gap:10px"><div style="font-size:28px;animation:rot .75s linear infinite;display:inline-block">🏷️</div><div><div style="font-size:13px;font-weight:800;color:var(--acc)">AI membaca name plate...</div><div style="font-size:11px;color:var(--mid)">Mendeteksi watt, merk & model</div></div></div>'
  try{
    let devs=[]
    if(API_URL){
      const b64=await toB64(imgs[0])
      const res=await fetch(API_URL+'/api/analyze/nameplate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mediaType:imgs[0].type,roomLabel:room.n})})
      const data=await res.json()
      devs=data.devices||[]
    } else {
      devs=mockNameplate()
    }
    devs.forEach(d=>room.devs.push({n:d.name,w:d.watts,h:d.dailyHours||4,e:emoji(d.name)}))
  }catch(e){ console.error(e) }
  if(lb) lb.classList.remove('on')
  renderTabs(); renderContent(); renderRooms()
}

function mockNameplate(){
  return [{name:'AC Split Daikin 1 PK (FTC25NV14)',watts:780,dailyHours:8}]
}


async function oneFile(files,roomId){
  const imgs=Array.from(files).filter(f=>f.type.startsWith('image/')); if(!imgs.length) return
  const room=rooms.find(r=>r.id===roomId)
  const lb=document.getElementById('lb_'+roomId)
  const inn=document.getElementById('uzi_'+roomId)
  if(lb) lb.classList.add('on')
  if(inn) inn.innerHTML='<div class="uz-ico" style="animation:rot .75s linear infinite;display:inline-block">\u26A1</div><div class="uz-t" style="color:var(--acc)">AI mengidentifikasi...</div><div class="uz-s">Mengenali elektronik dari foto</div>'
  try{
    let devs=[]
    if(API_URL){
      const b64=await toB64(imgs[0])
      const res=await fetch(API_URL+'/api/analyze/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mediaType:imgs[0].type,roomLabel:room.n})})
      const data=await res.json()
      devs=data.devices||[]
      // Check if non-electronic
      if(devs.length>0 && devs[0].isElectronic===false){
        if(lb) lb.classList.remove('on')
        showUploadError(roomId,'\u26A0\uFE0F Foto bukan perangkat elektronik! Silakan upload ulang foto elektronik (AC, kulkas, TV, dll).')
        return
      }
    } else {
      devs=mockOne(room.n,room.devs.length)
    }
    if(lb) lb.classList.remove('on')
    // Show confirmation dialog
    if(devs.length>0){
      showDeviceConfirm(roomId, devs, imgs[0])
    }
  }catch(e){
    console.error(e)
    if(lb) lb.classList.remove('on')
    renderTabs(); renderContent(); renderRooms()
  }
}

function showUploadError(roomId, msg){
  const inn=document.getElementById('uzi_'+roomId)
  if(inn) inn.innerHTML='<div class="uz-ico">\u274C</div><div class="uz-t" style="color:#ef4444;font-size:13px">'+msg+'</div><div class="uz-s" style="color:#ef4444">Klik untuk upload ulang</div>'
  // Auto-reset after 4 seconds
  setTimeout(function(){ renderContent() }, 4000)
}

function showDeviceConfirm(roomId, devs, imgFile){
  const room=rooms.find(r=>r.id===roomId)
  const d=devs[0]
  const inn=document.getElementById('uzi_'+roomId)
  // Store pending device data
  window.__pendingDev={roomId:roomId, devs:devs}
  if(inn) inn.innerHTML='<div style="background:#f0fdf4;border:1.5px solid #a7f3d0;border-radius:12px;padding:14px;text-align:left">'
    +'<div style="font-size:14px;font-weight:800;color:#065f46;margin-bottom:8px">\u2705 AI Terdeteksi:</div>'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
    +'<div style="font-size:24px">'+(d.emoji||'\uD83D\uDD0C')+'</div>'
    +'<div style="flex:1"><div style="font-size:14px;font-weight:800">'+d.name+'</div>'
    +'<div style="font-size:12px;color:var(--mid);display:flex;align-items:center;gap:4px;flex-wrap:wrap">'
    +'<input id="editWatts" type="number" min="1" value="'+d.watts+'" onfocus="this.select()" style="width:56px;padding:3px 6px;border:1.5px solid #a7f3d0;border-radius:6px;font-family:inherit;font-size:12px;font-weight:700;text-align:center;background:#fff;color:#065f46"/>'
    +'<span>W \u00B7 '+d.dailyHours+' jam/hari</span>'
    +'<span style="font-size:11px;color:#10b981">(bisa diubah)</span>'
    +'</div></div></div>'
    +'<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:10px">Apa benar perangkat ini?</div>'
    +'<div style="display:flex;gap:8px">'
    +'<button onclick="confirmDevice(true)" style="flex:1;padding:10px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer">\u2705 Ya, Benar</button>'
    +'<button onclick="confirmDevice(false)" style="flex:1;padding:10px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer">\u274C Bukan, Foto Ulang</button>'
    +'</div></div>'
}

function confirmDevice(isCorrect){
  if(!window.__pendingDev) return
  const {roomId, devs}=window.__pendingDev
  const room=rooms.find(r=>r.id===roomId)
  if(isCorrect && room){
    const editInput=document.getElementById('editWatts')
    if(editInput && devs[0]){
      const newW=parseFloat(editInput.value)
      if(!isNaN(newW) && newW>0) devs[0].watts=newW
    }
    devs.forEach(function(d){ room.devs.push({n:d.name,w:d.watts,h:d.dailyHours||4,e:d.emoji||emoji(d.name)}) })
  }
  window.__pendingDev=null
  renderTabs(); renderContent(); renderRooms()
  if(!isCorrect){
    // Show message to re-upload
    setTimeout(function(){
      var inn=document.getElementById('uzi_'+roomId)
      if(inn) inn.innerHTML='<div class="uz-ico">\uD83D\uDCF7</div><div class="uz-t" style="color:#d97706">Silakan foto ulang perangkat elektronik</div><div class="uz-s">Pastikan foto jelas dan terlihat perangkatnya</div>'
    },100)
  }
}

function updH(rid,idx,val){
  const room=rooms.find(r=>r.id===rid); room.devs[idx].h=parseFloat(val)
  const {kwh,cost}=calcDev(room.devs[idx].w,parseFloat(val))
  const cc=cost>150000?'#ef4444':cost>60000?'#d97706':'#10b981'
  const sv=document.getElementById('sv_'+rid+'_'+idx); if(sv) sv.textContent=val+' jam'
  const dc=document.getElementById('dc_'+rid+'_'+idx); if(dc){ dc.textContent=rp(cost); dc.style.color=cc }
  const wt=document.getElementById('drow_'+rid+'_'+idx)?.querySelector('.d-wt'); if(wt) wt.textContent=room.devs[idx].w+'W · '+kwh+' kWh/bln'
  const rt=document.getElementById('roomContent').querySelector('.rt-val')
  if(rt) rt.textContent=rp(room.devs.reduce((a,d)=>a+calcDev(d.w,d.h).cost,0))+'/bln'
  updateSticky()
}
function delDev(rid,idx){
  rooms.find(r=>r.id===rid).devs.splice(idx,1)
  renderTabs(); renderContent(); renderRooms()
}
function updateSticky(){
  const total=rooms.reduce((a,r)=>a+r.devs.reduce((b,d)=>b+calcDev(d.w,d.h).cost,0),0)
  const kwh=rooms.reduce((a,r)=>a+r.devs.reduce((b,d)=>b+calcDev(d.w,d.h).kwh,0),0)
  document.getElementById('stickyVal').textContent=total>0?`${rp(total)}/bln · ${Math.round(kwh)} kWh`:'Upload foto dulu'
}

// ── STEP 3 ────────────────────────────────────────────────────────
function billUp(buzId,inputId,prevId,icoId,txtId){
  const file=document.getElementById(inputId).files[0]; if(!file) return
  const reader=new FileReader()
  reader.onload=e=>{
    document.getElementById(prevId).src=e.target.result
    document.getElementById(buzId).classList.add('done')
    document.getElementById(icoId).style.display='none'
    document.getElementById(txtId).textContent='\u2705 Foto terupload'
    // If this is the KWH meter photo, also analyze its condition
    if(inputId==='inp_meter' && API_URL){
      analyzeKwhMeter(file)
    }
  }
  reader.readAsDataURL(file)
}

async function analyzeKwhMeter(file){
  var statusEl=document.getElementById('meterStatus')
  if(statusEl){ statusEl.style.display='block'; statusEl.innerHTML='<div style="display:flex;align-items:center;gap:8px"><div class="spin" style="width:18px;height:18px;border-width:2px"></div><span style="font-size:12px;color:var(--acc);font-weight:700">AI menganalisis kondisi KWH meter...</span></div>' }
  try{
    var b64=await toB64(file)
    var res=await fetch(API_URL+'/api/analyze/meter-condition',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mediaType:file.type})})
    var data=await res.json()
    if(data.success && data.condition){
      kwhMeterCondition=data.condition
      var cond=data.condition
      var condColors={baik:'#10b981',cukup:'#d97706',tua:'#ea580c',sangat_tua:'#dc2626'}
      var condLabels={baik:'Baik',cukup:'Cukup',tua:'Tua',sangat_tua:'Sangat Tua'}
      var riskColors={rendah:'#10b981',sedang:'#d97706',tinggi:'#ea580c',sangat_tinggi:'#dc2626'}
      var riskLabels={rendah:'Rendah',sedang:'Sedang',tinggi:'Tinggi',sangat_tinggi:'Sangat Tinggi'}
      if(statusEl) statusEl.innerHTML='<div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:10px;padding:12px;font-size:12px;line-height:1.6"><div style="font-weight:800;color:#0c4a6e;margin-bottom:6px">\u26A1 Hasil Analisis KWH Meter:</div><div><strong>Tipe:</strong> '+(cond.type==='analog'?'Analog (Ferraris)':'Digital/Prepaid')+'</div><div><strong>Estimasi Usia:</strong> ~'+cond.estimatedAge+' tahun</div><div><strong>Kondisi:</strong> <span style="color:'+(condColors[cond.condition]||'#d97706')+';font-weight:800">'+(condLabels[cond.condition]||cond.condition)+'</span></div>'+(cond.brand?'<div><strong>Merk:</strong> '+cond.brand+'</div>':'')+'<div><strong>Risiko Akurasi:</strong> <span style="color:'+(riskColors[cond.accuracyRisk]||'#d97706')+';font-weight:800">'+(riskLabels[cond.accuracyRisk]||cond.accuracyRisk)+'</span></div>'+(cond.issues&&cond.issues.length>0?'<div><strong>Temuan:</strong> '+cond.issues.join(', ')+'</div>':'')+'</div>'
    }
  }catch(e){
    console.error('Meter analysis error:',e)
    if(statusEl) statusEl.innerHTML='<div style="font-size:12px;color:var(--mid)">Analisis meter tidak tersedia</div>'
  }
}

function step3Summary(){
  const total=rooms.reduce((a,r)=>a+r.devs.reduce((b,d)=>b+calcDev(d.w,d.h).cost,0),0)
  const kwh=rooms.reduce((a,r)=>a+r.devs.reduce((b,d)=>b+calcDev(d.w,d.h).kwh,0),0)
  document.getElementById('s3Total').textContent=rp(total)
  document.getElementById('s3Kwh').textContent=Math.round(kwh)+' kWh/bulan'
}

// ── STEP 4: BUILD RESULTS ─────────────────────────────────────────
function goResults(){
  document.getElementById('p3').classList.remove('active')
  document.getElementById('ls').classList.add('on')
  setTimeout(()=>{ document.getElementById('ls').classList.remove('on'); go(4); buildResults() },2000)
}

// Rata-rata kWh pelanggan PLN per VA per bulan (referensi data PLN)
const AVG_KWH_BY_VA = {900:70,1300:130,2200:220,3500:360,5500:560,7700:780}

function buildPieChart(slices){
  // slices = [{label,value,color,pct}]
  const R=80, cx=100, cy=100
  let startAngle=-Math.PI/2
  let paths='', legends=''
  const PIE_COLORS=['#f59e0b','#ef4444','#10b981','#0891b2','#8b5cf6','#f97316','#06b6d4','#84cc16']
  slices.forEach((s,i)=>{
    const angle=(s.pct/100)*2*Math.PI
    const endAngle=startAngle+angle
    const x1=cx+R*Math.cos(startAngle), y1=cy+R*Math.sin(startAngle)
    const x2=cx+R*Math.cos(endAngle),   y2=cy+R*Math.sin(endAngle)
    const lg=angle>Math.PI?1:0
    const col=PIE_COLORS[i%PIE_COLORS.length]
    paths+=`<path d="M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${lg},1 ${x2},${y2} Z"
      fill="${col}" stroke="white" stroke-width="2" opacity="0.92"/>`
    // label jika slice cukup besar
    if(s.pct>7){
      const midA=startAngle+angle/2
      const lx=cx+(R*0.65)*Math.cos(midA), ly=cy+(R*0.65)*Math.sin(midA)
      paths+=`<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle"
        font-size="9" font-weight="800" fill="white">${s.pct}%</text>`
    }
    legends+=`<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
      <div style="width:11px;height:11px;border-radius:3px;background:${col};flex-shrink:0"></div>
      <div style="flex:1;font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.label}</div>
      <div style="font-size:12px;font-weight:800;color:${col};flex-shrink:0">${s.pct}%</div>
    </div>`
    startAngle=endAngle
  })
  return {svg:`<svg viewBox="0 0 200 200" width="160" height="160">${paths}</svg>`,legends}
}

function buildResults(){
  const allDevs=rooms.flatMap(r=>r.devs.map(d=>({...d,room:r})))
  const totalKwh=allDevs.reduce((a,d)=>a+calcDev(d.w,d.h).kwh,0)
  const totalCost=allDevs.reduce((a,d)=>a+calcDev(d.w,d.h).cost,0)
  const activeRooms=rooms.filter(r=>r.devs.length>0)
  const sorted=[...allDevs].sort((a,b)=>calcDev(b.w,b.h).cost-calcDev(a.w,a.h).cost)
  const top5=sorted.slice(0,5)
  const maxDevCost=calcDev(top5[0]?.w||1,top5[0]?.h||1).cost
  const actualBill=parseFloat(document.getElementById('inp_actual').value)||0
  const diff=actualBill>0?actualBill-totalCost:0
  const diffPct=actualBill>0?Math.round(Math.abs(diff/totalCost)*100):0
  const isOver=actualBill>0&&diff>totalCost*0.05
  const isUnder=actualBill>0&&diff<-(totalCost*0.05)
  const vaKey=VA_OPTIONS.reduce((p,v)=>v<=plnVa?v:p,VA_OPTIONS[0])
  const avgKwh=AVG_KWH_BY_VA[vaKey]||130
  const avgCost=Math.round(avgKwh*tariff())
  const vsAvgPct=avgKwh>0?Math.round(((totalKwh-avgKwh)/avgKwh)*100):0
  const isAboveAvg=vsAvgPct>10
  const wajarKwh=jumlahOrang*100
  const wajarCost=Math.round(wajarKwh*tariff())
  const kwhVsWajar=wajarKwh>0?Math.round(((totalKwh-wajarKwh)/wajarKwh)*100):0
  const suspectDev=sorted[0]
  const suspectShare=totalCost>0?Math.round((calcDev(suspectDev?.w||0,suspectDev?.h||0).cost/totalCost)*100):0
  const showWarning=isOver||(totalKwh>wajarKwh*1.1)||isAboveAvg
  const reportId='ENV-'+new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')+'-'+String(Math.floor(Math.random()*9999)).padStart(4,'0')
  const reportDate=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})
  const potentialSaving=Math.round(totalCost*0.30)
  const pieSlices=activeRooms.map(r=>{
    const rCost=r.devs.reduce((a,d)=>a+calcDev(d.w,d.h).cost,0)
    return {label:r.i+' '+r.n,value:rCost,pct:totalCost>0?Math.round((rCost/totalCost)*100):0,kwh:Math.round(r.devs.reduce((a,d)=>a+calcDev(d.w,d.h).kwh,0)*10)/10,cnt:r.devs.length}
  }).filter(s=>s.pct>0)
  const {svg:pieSvg,legends:pieLeg}=buildPieChart(pieSlices)
  const waMsg=encodeURIComponent('Halo! Saya baru cek lewat EnVisor AI.\nEstimasi tagihan: '+rp(totalCost)+'/bln\nDaya: '+plnVa+' VA · '+jumlahOrang+' penghuni\nID Laporan: '+reportId+'\nMohon bantu audit listrik rumah saya')

  document.getElementById('rsub').textContent=Math.round(totalKwh)+' kWh/bulan · '+allDevs.length+' perangkat · '+jumlahOrang+' penghuni'

  // ═══════════════════════════════════════════════════════════════
  // BUILD PREMIUM REPORT HTML
  // ═══════════════════════════════════════════════════════════════
  var h=''

  // ══ SECTION 1: HEADER & HERO RESULT ══
  h+='<div class="rpt-header" style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:20px;padding:24px;color:#fff;margin-bottom:16px">'
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;opacity:.7;font-size:11px;font-weight:700;letter-spacing:1px"><span>■ EnVisor.AI — Laporan Audit Energi Premium</span><span>ID: '+reportId+' | '+reportDate+'</span></div>'
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;opacity:.5;margin-bottom:6px">ESTIMASI TAGIHAN DARI PERANGKAT</div>'
  h+='<div style="font-size:38px;font-weight:900;color:#f59e0b;margin-bottom:4px">'+rp(totalCost)+'</div>'
  h+='<div style="font-size:13px;opacity:.7;margin-bottom:18px">per bulan · '+Math.round(totalKwh)+' kWh · '+allDevs.length+' perangkat</div>'
  // 3-column comparison
  h+='<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">'
  h+='<div style="flex:1;min-width:120px;background:rgba(255,255,255,.07);border-radius:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.1)"><div style="font-size:10px;font-weight:700;letter-spacing:1px;opacity:.6;margin-bottom:5px">ESTIMASI</div><div style="font-size:20px;font-weight:800;color:#f59e0b">'+rp(totalCost)+'</div></div>'
  if(actualBill>0){
    h+='<div style="flex:1;min-width:120px;background:rgba(255,255,255,.07);border-radius:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.1)"><div style="font-size:10px;font-weight:700;letter-spacing:1px;opacity:.6;margin-bottom:5px">TAGIHAN AKTUAL</div><div style="font-size:20px;font-weight:800;color:'+(isOver?'#f87171':'#34d399')+'">'+rp(actualBill)+'</div></div>'
  }
  h+='<div style="flex:1;min-width:120px;background:rgba(255,255,255,.07);border-radius:12px;padding:12px 14px;border:1px solid rgba(255,255,255,.1)"><div style="font-size:10px;font-weight:700;letter-spacing:1px;opacity:.6;margin-bottom:5px">POTENSI HEMAT</div><div style="font-size:20px;font-weight:800;color:#34d399">'+rp(potentialSaving)+'</div></div>'
  h+='</div>'
  // Stats row
  h+='<div style="display:flex;gap:20px;flex-wrap:wrap;font-size:12px;opacity:.7">'
  h+='<span>Daya: '+plnVa.toLocaleString()+' VA</span>'
  h+='<span>Penghuni: '+jumlahOrang+' orang</span>'
  h+='<span>Konsumsi: '+Math.round(totalKwh*10)/10+' kWh/bln</span>'
  h+='<span>Perangkat: '+allDevs.length+' unit</span>'
  h+='<span>Ruangan: '+activeRooms.length+'</span>'
  h+='</div></div>'

  // ══ WARNING BADGE ══
  if(showWarning){
    h+='<div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:14px;padding:14px 18px;margin-bottom:16px;font-size:13px;line-height:1.6;color:#991b1b">'
    h+='<strong style="color:#dc2626">■ PERINGATAN:</strong> Konsumsi listrik terdeteksi <strong style="color:#dc2626">'+(vsAvgPct>0?vsAvgPct+'% di atas rata-rata':'setara')+'</strong> pelanggan PLN '+plnVa.toLocaleString()+' VA'
    if(kwhVsWajar>10) h+=' dan <strong style="color:#dc2626">'+kwhVsWajar+'% di atas batas wajar</strong> untuk '+jumlahOrang+' penghuni'
    h+='. Laporan ini memuat analisa mendalam, diagnosa ilmiah, dan rencana aksi prioritas.</div>'
  }

  // ══ SECTION 2: RINGKASAN EKSEKUTIF ══
  h+='<div class="rc" style="margin-bottom:16px"><div class="rpt-sec">■ RINGKASAN EKSEKUTIF</div>'
  h+='<div style="font-size:13px;line-height:1.8;color:var(--dark)">'
  h+='EnVisor AI melakukan audit terhadap seluruh perangkat elektronik di rumah ini. Total ditemukan <strong>'+allDevs.length+' perangkat</strong> di '+activeRooms.length+' ruangan dengan konsumsi gabungan <strong>'+Math.round(totalKwh*10)/10+' kWh/bulan</strong>. Estimasi biaya dari perangkat adalah <strong>'+rp(totalCost)+'/bulan</strong>'
  if(actualBill>0){
    h+=', namun tagihan PLN aktual sebesar <strong>'+rp(actualBill)+'/bulan</strong> — artinya ada selisih <strong>'+rp(Math.abs(diff))+'/bulan ('+diffPct+'%)</strong> yang '+(isOver?'tidak dapat dijelaskan oleh pemakaian perangkat saja — indikasi kuat adanya permasalahan teknis':'menunjukkan estimasi cukup akurat')+'.'
  } else {
    h+='.'
  }
  h+='</div>'

  // Indicator table
  h+='<table class="rpt-tbl" style="width:100%;margin-top:14px;border-collapse:collapse;font-size:12px">'
  h+='<tr style="background:#0f172a;color:#fff"><th style="padding:10px;text-align:left">INDIKATOR</th><th style="padding:10px;text-align:center">NILAI ANDA</th><th style="padding:10px;text-align:center">NILAI NORMAL</th><th style="padding:10px;text-align:center">SELISIH</th><th style="padding:10px;text-align:center">STATUS</th></tr>'
  var trs=[
    ['Konsumsi kWh/bulan',Math.round(totalKwh)+' kWh',(jumlahOrang*100)+' kWh',kwhVsWajar>10?'+'+kwhVsWajar+'%':'Normal',kwhVsWajar>10?'🔴 Di atas wajar':'🟢 Normal'],
    ['Estimasi tagihan',rp(totalCost),rp(wajarCost),kwhVsWajar>10?'+'+kwhVsWajar+'%':'Normal',kwhVsWajar>10?'🟠 Perlu perhatian':'🟢 Normal'],
    ['vs Rata-rata '+plnVa.toLocaleString()+'VA',Math.round(totalKwh)+' kWh',avgKwh+' kWh',vsAvgPct>0?'+'+vsAvgPct+'%':vsAvgPct+'%',isAboveAvg?'🔴 Di atas rata-rata':'🟢 Normal']
  ]
  if(actualBill>0) trs.push(['Tagihan aktual vs estimasi',rp(actualBill),rp(totalCost),(isOver?'+':'')+diffPct+'% / '+rp(diff),isOver?'⚠️ Mencurigakan':'🟢 Sesuai'])
  trs.forEach(function(row,ri){
    h+='<tr style="background:'+(ri%2===0?'#f8fafc':'#fff')+'">'
    row.forEach(function(cell,ci){
      var align=ci===0?'left':'center'
      var color=ci===4?(cell.includes('🔴')||cell.includes('⚠️')?'#dc2626':cell.includes('🟠')?'#d97706':'#059669'):'var(--dark)'
      var fw=ci===4||ci===3?'700':'400'
      h+='<td style="padding:9px 10px;text-align:'+align+';border-bottom:1px solid var(--light);color:'+color+';font-weight:'+fw+'">'+cell+'</td>'
    })
    h+='</tr>'
  })
  h+='</table></div>'

  // ══ SECTION 3: DISTRIBUSI KONSUMSI (BELL CURVE) ══
  h+='<div class="rc" style="margin-bottom:16px"><div class="rpt-sec">■ POSISI KONSUMSI: DISTRIBUSI PELANGGAN PLN '+plnVa.toLocaleString()+' VA</div>'
  h+='<div style="font-size:13px;line-height:1.6;margin-bottom:14px;color:var(--dark)">Grafik di bawah menampilkan distribusi konsumsi listrik bulanan pelanggan daya <strong>'+plnVa.toLocaleString()+' VA</strong> (rata-rata '+avgKwh+' kWh/bulan). Posisi Anda berada di <strong>'+(vsAvgPct>0?'+'+vsAvgPct+'% dari rata-rata':Math.abs(vsAvgPct)+'% di bawah rata-rata')+'</strong>.</div>'
  // Build bell curve SVG
  h+=buildBellCurveSVG(avgKwh, totalKwh, plnVa)
  h+='<div style="margin-top:12px;padding:10px 14px;background:#f0f9ff;border-radius:10px;border:1px solid #bae6fd;font-size:12px;line-height:1.6;color:#0c4a6e">'
  h+='<strong>■ Penjelasan Statistik:</strong> Mean (μ) = '+avgKwh+' kWh, Standar Deviasi (σ) ≈ '+Math.round(avgKwh*0.28)+' kWh. 68% pelanggan berada di μ±σ = '+(avgKwh-Math.round(avgKwh*0.28))+'–'+(avgKwh+Math.round(avgKwh*0.28))+' kWh (zona hijau). Konsumsi Anda sebesar '+Math.round(totalKwh)+' kWh '+(totalKwh>avgKwh+avgKwh*0.56?'berada di zona merah (>2σ) — hanya ditempati oleh 2.5% pelanggan teratas':totalKwh>avgKwh+avgKwh*0.28?'berada di zona kuning (1-2σ)':'berada di zona normal')+'.'
  h+='</div></div>'

  // ══ SECTION 4: KONSUMSI PER RUANGAN ══
  h+='<div class="rc" style="margin-bottom:16px"><div class="rpt-sec">■ KONSUMSI PER RUANGAN — BREAKDOWN VISUAL</div>'
  h+='<div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap">'
  h+='<div style="flex-shrink:0">'+pieSvg+'</div>'
  h+='<div style="flex:1;min-width:200px"><table style="width:100%;border-collapse:collapse;font-size:12px">'
  h+='<tr style="border-bottom:2px solid var(--light)"><th style="padding:8px;text-align:left">Ruangan</th><th style="text-align:center;padding:8px">Perangkat</th><th style="text-align:right;padding:8px">kWh</th><th style="text-align:right;padding:8px">Biaya/bln</th></tr>'
  pieSlices.forEach(function(s){
    h+='<tr style="border-bottom:1px solid var(--light2)"><td style="padding:8px;font-weight:600">'+s.label+'</td><td style="text-align:center;padding:8px">'+s.cnt+'</td><td style="text-align:right;padding:8px">'+s.kwh+'</td><td style="text-align:right;padding:8px;font-weight:700;color:#d97706">'+rp(s.value)+'</td></tr>'
  })
  h+='<tr style="background:#f0fdf4;font-weight:800"><td style="padding:8px">TOTAL</td><td style="text-align:center;padding:8px">'+allDevs.length+'</td><td style="text-align:right;padding:8px">'+Math.round(totalKwh)+'</td><td style="text-align:right;padding:8px;color:#059669">'+rp(totalCost)+'</td></tr>'
  h+='</table></div></div></div>'

  // ══ SECTION 5: TOP 5 PERANGKAT BOROS — ANALISA MENDALAM ══
  h+='<div class="rc warn" style="margin-bottom:16px"><div class="rpt-sec">■ 5 PERANGKAT PALING BOROS — ANALISA MENDALAM</div>'
  // Bar chart
  h+='<div style="font-size:13px;font-weight:700;margin-bottom:10px;text-align:center">5 Perangkat Paling Boros — Biaya per Bulan</div>'
  h+='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">'
  top5.forEach(function(d,di){
    var dc=calcDev(d.w,d.h)
    var pct=Math.round((dc.cost/maxDevCost)*100)
    var cols=['linear-gradient(90deg,#ef4444,#f97316)','linear-gradient(90deg,#f59e0b,#ef4444)','linear-gradient(90deg,#fbbf24,#f59e0b)','linear-gradient(90deg,#a3e635,#10b981)','linear-gradient(90deg,#38bdf8,#0891b2)']
    h+='<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><div style="font-size:12px;font-weight:700">'+(d.e||'🔌')+' '+d.n+' <span style="font-size:10px;color:var(--mid);font-weight:500">· '+d.room.n+' · '+d.h+'j/hr</span></div><div style="font-size:12px;font-weight:800;color:#ef4444">'+rp(dc.cost)+'</div></div>'
    h+='<div style="height:22px;background:var(--light2);border-radius:20px;overflow:hidden;position:relative"><div id="dbar'+di+'" style="height:100%;width:0;border-radius:20px;background:'+cols[di]+';transition:width 1s cubic-bezier(.4,0,.2,1)"></div><span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:800;color:var(--mid)">'+dc.kwh+' kWh</span></div></div>'
  })
  h+='</div>'
  // Detailed table
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">'
  h+='<tr style="background:#92400e;color:#fff"><th style="padding:9px;text-align:center;width:30px">#</th><th style="padding:9px;text-align:left">Perangkat</th><th style="padding:9px;text-align:left">Ruangan</th><th style="padding:9px;text-align:center">Watt</th><th style="padding:9px;text-align:center">Jam/hr</th><th style="padding:9px;text-align:center">kWh/bln</th><th style="padding:9px;text-align:right">Biaya/bln</th><th style="padding:9px;text-align:center">Porsi</th></tr>'
  top5.forEach(function(d,di){
    var dc=calcDev(d.w,d.h)
    var share=totalCost>0?Math.round(dc.cost/totalCost*100):0
    h+='<tr style="background:'+(di%2===0?'#fffbeb':'#fff')+'"><td style="padding:8px;text-align:center;font-weight:800;color:#fff;background:'+(di<2?'#ef4444':di<4?'#f59e0b':'#0891b2')+';border-radius:6px">'+(di+1)+'</td><td style="padding:8px;font-weight:700">'+(d.e||'🔌')+' '+d.n+'</td><td style="padding:8px">'+d.room.n+'</td><td style="padding:8px;text-align:center">'+d.w+'W</td><td style="padding:8px;text-align:center">'+d.h+'</td><td style="padding:8px;text-align:center">'+dc.kwh+'</td><td style="padding:8px;text-align:right;font-weight:800;color:#ef4444">'+rp(dc.cost)+'</td><td style="padding:8px;text-align:center;font-weight:700">'+share+'%</td></tr>'
  })
  h+='</table>'
  h+='<div style="padding:10px 14px;background:var(--white);border-radius:10px;border:1.5px solid var(--light);font-size:12px;color:var(--mid)">💡 <strong style="color:var(--dark)">'+(suspectDev?.e||'🔌')+' '+(suspectDev?.n||'—')+'</strong> menyumbang <strong style="color:#ef4444">'+suspectShare+'%</strong> total tagihan bulanan</div></div>'

  // ══ SECTION 6: ANALISA PENYEBAB TAGIHAN TINGGI (ILMIAH) ══
  if(showWarning){
    h+='<div class="rc danger" style="margin-bottom:16px"><div class="rpt-sec">■ ANALISA PENYEBAB TAGIHAN TINGGI — DIAGNOSA ILMIAH</div>'
    h+='<div style="font-size:13px;line-height:1.6;margin-bottom:14px;color:var(--dark)">Berdasarkan data perangkat dan perbandingan dengan standar konsumsi PLN, berikut analisa ilmiah lengkap:</div>'

    // Cause 1: Degradasi perangkat tua
    h+='<div style="border:1.5px solid #fecaca;border-radius:14px;padding:16px;margin-bottom:12px;background:#fff5f5">'
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">1</div><strong style="font-size:14px">Degradasi Efisiensi Perangkat — Komponen Menua</strong></div><span style="background:#fecaca;color:#dc2626;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">PRIORITAS TINGGI</span></div>'
    h+='<div style="font-size:13px;line-height:1.7">'
    h+='<div style="margin-bottom:8px"><strong>• Perangkat terdampak:</strong> '+top5.slice(0,3).map(function(d){return d.n}).join(', ')+'</div>'
    h+='<div style="margin-bottom:8px"><strong>• Prinsip ilmiah:</strong> Hukum Arrhenius menyatakan laju degradasi komponen elektronik meningkat secara eksponensial dengan suhu operasi. Kapasitor elektrolitik kehilangan 1–3% kapasitansi per tahun, menyebabkan ripple current lebih besar dan efisiensi konversi daya menurun. Pada motor AC (kompresor kulkas, motor AC), oksidasi pada lilitan tembaga meningkatkan resistansi (R) — karena daya rugi P_loss = I²R, konsumsi meningkat kuadratik.</div>'
    h+='<div><strong>• Dampak kuantitatif:</strong> Perangkat berusia >7 tahun kemungkinan mengonsumsi 15–40% di atas rating asli '+suspectDev?.w+'W. Estimasi biaya nyata bisa mencapai '+rp(calcDev(suspectDev?.w||100,suspectDev?.h||4).cost*1.3)+'/bulan.</div>'
    h+='</div></div>'

    // Cause 2: KWH Meter
    h+='<div style="border:1.5px solid #fde68a;border-radius:14px;padding:16px;margin-bottom:12px;background:#fffbeb">'
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">2</div><strong style="font-size:14px">KWH Meter Analog Tidak Akurat — Drift Kalibrasi</strong></div><span style="background:#fef3c7;color:#d97706;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">PRIORITAS SEDANG</span></div>'
    h+='<div style="font-size:13px;line-height:1.7">'
    h+='<div style="margin-bottom:8px"><strong>• Mekanisme kesalahan:</strong> KWH meter analog (Ferraris meter) bekerja berdasarkan induksi elektromagnetik pada disk aluminium. Seiring usia: (1) <strong>Bearing friction drift</strong>: bantalan yang aus meningkatkan gesekan. (2) <strong>Magnetic saturation</strong>: inti besi elektromagnet mengalami perubahan permeabilitas. (3) <strong>Thermal expansion</strong>: ekspansi termal berulang melemahkan presisi mekanis disk.</div>'
    h+='<div><strong>• Standar PLN:</strong> Toleransi error meter baru ±2% (kelas 2). Setelah 8–10 tahun, error aktual sering mencapai 5–15%. Hubungi PLN 123 untuk pemeriksaan gratis.</div>'
    h+='</div></div>'

    // Cause 3: Arus Bocor
    h+='<div style="border:1.5px solid #fde68a;border-radius:14px;padding:16px;margin-bottom:12px;background:#fffbeb">'
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:#ffedd5;color:#ea580c;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">3</div><strong style="font-size:14px">Arus Bocor (Earth Leakage Current) — 24 Jam Nonstop</strong></div><span style="background:#fef3c7;color:#d97706;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">PRIORITAS SEDANG</span></div>'
    h+='<div style="font-size:13px;line-height:1.7">'
    h+='<div style="margin-bottom:8px"><strong>• Fisika arus bocor:</strong> Berdasarkan Hukum Ohm, arus bocor terjadi ketika ada jalur konduksi tidak terduga antara konduktor bertegangan dan ground (tanah). Isolasi kabel PVC tua mengalami degradasi dielektrik — kapasitansi parasitik antara konduktor dan ground meningkat, memungkinkan arus kapasitif mengalir meski tidak ada beban.</div>'
    h+='<div><strong>• Tes mandiri:</strong> Matikan semua MCB beban → amati KWH meter. Jika disk/LED masih bergerak = ada arus bocor aktif. Catat kecepatan putaran dan hubungi teknisi.</div>'
    h+='</div></div>'

    // Cause 4: Instalasi Tua
    h+='<div style="border:1.5px solid #bfdbfe;border-radius:14px;padding:16px;margin-bottom:12px;background:#eff6ff">'
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:#dbeafe;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">4</div><strong style="font-size:14px">Instalasi Listrik Tua — Resistansi Meningkat</strong></div><span style="background:#dbeafe;color:#2563eb;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">PRIORITAS RENDAH</span></div>'
    h+='<div style="font-size:13px;line-height:1.7">'
    h+='<div style="margin-bottom:8px"><strong>• Degradasi kabel:</strong> Kabel NYM/NYA berumur >15 tahun mengalami peningkatan resistansi 5–20% akibat oksidasi tembaga, micro-crack pada isolasi, dan terminal longgar. Power loss = I² × R — semakin besar arus (perangkat banyak menyala bersamaan), semakin besar rugi daya.</div>'
    h+='<div><strong>• Dampak ganda:</strong> Kabel panas juga meningkatkan suhu lingkungan panel, yang mempercepat degradasi isolasi kabel lain di sekitarnya — efek domino. Berdasarkan PUIL 2011, instalasi listrik harus diinspeksi minimal setiap 5 tahun.</div>'
    h+='</div></div>'
    h+='</div>'
  }

  // ══ SECTION 7: RENCANA AKSI + REKOMENDASI PRODUK ══
  h+='<div class="rc blue" style="margin-bottom:16px"><div class="rpt-sec">■ RENCANA AKSI PRIORITAS + REKOMENDASI PRODUK HEMAT ENERGI</div>'
  h+='<div style="font-size:13px;line-height:1.6;margin-bottom:14px;color:var(--dark)">Lima langkah berikut, jika dilakukan secara bertahap, dapat menurunkan tagihan sekitar <strong>'+rp(potentialSaving)+'/bulan</strong>. Setiap aksi dilengkapi rekomendasi produk spesifik yang tersedia di pasaran Indonesia.</div>'

  // Action 1: Timer/reduce usage
  h+='<div style="border:1.5px solid #a7f3d0;border-radius:14px;padding:16px;margin-bottom:12px;background:#f0fdf4">'
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">1</div><strong style="font-size:14px">Kurangi Jam Pakai '+top5.slice(0,2).map(function(d){return d.n}).join(' & ')+'</strong></div><span style="border:1.5px solid #059669;color:#059669;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">Minggu Ini</span></div>'
  h+='<div style="font-size:13px;line-height:1.7;margin-bottom:10px">Kurangi 2 jam/hari → estimasi hemat <strong style="color:#059669">'+rp(top5.slice(0,2).reduce(function(a,d){return a+calcDev(d.w,2).cost},0))+'/bulan</strong>. Gunakan timer atau smart plug.</div>'
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#059669;color:#fff"><th style="padding:8px;text-align:left">Rekomendasi Produk</th><th style="padding:8px;text-align:left">Merk / Model</th><th style="padding:8px;text-align:right">Harga Est.</th><th style="padding:8px;text-align:center">ROI</th></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">Timer Digital</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Broco / Hager EH111</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#059669">Rp 50–150 rb</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">1–2 bln</td></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">Smart Plug WiFi</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Bardi Smart Plug</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#059669">Rp 100–200 rb</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">2–4 bln</td></tr>'
  h+='</table></div>'

  // Action 2: Ganti perangkat boros
  h+='<div style="border:1.5px solid #fde68a;border-radius:14px;padding:16px;margin-bottom:12px;background:#fffbeb">'
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">2</div><strong style="font-size:14px">Ganti atau Servis '+(suspectDev?.n||'Perangkat Boros')+'</strong></div><span style="border:1.5px solid #d97706;color:#d97706;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">SEGERA — Bulan Ini</span></div>'
  h+='<div style="font-size:13px;line-height:1.7;margin-bottom:10px">Kontribusi <strong>'+suspectShare+'% total tagihan = '+rp(calcDev(suspectDev?.w||0,suspectDev?.h||0).cost)+'</strong>. Ganti model inverter → hemat 25–40%. ROI 18–24 bulan.</div>'
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#92400e;color:#fff"><th style="padding:8px;text-align:left">Rekomendasi Produk</th><th style="padding:8px;text-align:left">Merk / Model</th><th style="padding:8px;text-align:right">Harga Est.</th><th style="padding:8px;text-align:center">ROI</th></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">AC Inverter 1 PK Hemat</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Daikin FTKC25UVM4</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#d97706">Rp 4.2–5.0 juta</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">18–24 bln</td></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">AC Inverter 1 PK Premium</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Panasonic CS-PU10WKJ</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#d97706">Rp 4.5–5.5 juta</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">18–24 bln</td></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">AC Inverter 1 PK Terjangkau</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Sharp AH-XP10UHY</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#d97706">Rp 3.8–4.5 juta</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">20–26 bln</td></tr>'
  h+='</table>'
  h+='<div style="display:flex;gap:20px;margin-top:8px;font-size:11px;font-weight:700"><span style="color:#059669">■ Est. Hemat: '+rp(Math.round(calcDev(suspectDev?.w||0,suspectDev?.h||0).cost*0.35))+'/bulan</span><span style="color:var(--mid)">■ ROI: 18–24 bln</span></div></div>'

  // Action 3: PLN Meter
  h+='<div style="border:1.5px solid #a7f3d0;border-radius:14px;padding:16px;margin-bottom:12px;background:#f0fdf4">'
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">3</div><strong style="font-size:14px">Minta PLN Periksa atau Ganti KWH Meter (Call 123)</strong></div><span style="border:1.5px solid #0891b2;color:#0891b2;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">Minggu Ini — Gratis</span></div>'
  h+='<div style="font-size:13px;line-height:1.7">Hubungi PLN 123 (gratis). Jika meter >10 tahun, ajukan penggantian resmi. Proses 1–2 minggu dan tidak dipungut biaya untuk pelanggan reguler.</div></div>'

  // Action 4: Ganti kulkas/dispenser
  h+='<div style="border:1.5px solid #c4b5fd;border-radius:14px;padding:16px;margin-bottom:12px;background:#faf5ff">'
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">4</div><strong style="font-size:14px">Ganti Perangkat Boros Lainnya (Kulkas/Dispenser)</strong></div><span style="border:1.5px solid #7c3aed;color:#7c3aed;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">1–3 Bulan</span></div>'
  h+='<div style="font-size:13px;line-height:1.7;margin-bottom:10px">Kulkas dan dispenser lama dengan kompresor non-inverter mengonsumsi 50–65% lebih banyak. Kulkas inverter terbaru hanya 50–65W vs 160W model lama.</div>'
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#6d28d9;color:#fff"><th style="padding:8px;text-align:left">Rekomendasi Produk</th><th style="padding:8px;text-align:left">Merk / Model</th><th style="padding:8px;text-align:right">Harga Est.</th><th style="padding:8px;text-align:center">ROI</th></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">Kulkas 2P Inverter</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">LG GN-B392PLGB</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#7c3aed">Rp 4.5–6 juta</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">30–40 bln</td></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">Dispenser Hemat Eco</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Miyako WD-SP186H</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#7c3aed">Rp 400–600 rb</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">6–10 bln</td></tr>'
  h+='</table></div>'

  // Action 5: Audit instalasi
  h+='<div style="border:1.5px solid #bae6fd;border-radius:14px;padding:16px;margin-bottom:12px;background:#f0f9ff">'
  h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900">5</div><strong style="font-size:14px">Audit Instalasi & Deteksi Arus Bocor oleh Teknisi</strong></div><span style="border:1.5px solid #0284c7;color:#0284c7;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">1–3 Bulan</span></div>'
  h+='<div style="font-size:13px;line-height:1.7;margin-bottom:10px"><strong>• Tes mandiri:</strong> Matikan semua MCB beban → amati KWH meter. Jika disk/LED masih bergerak = ada arus bocor aktif.<br><strong>• Yang harus diperiksa:</strong> (1) Panel distribusi dan MCB — cek terminal longgar. (2) Kotak sambung (doos). (3) Ground system — ukur resistansi <5Ω. (4) Insulasi kabel — gunakan insulation tester (megger).<br><strong>• Regulasi:</strong> Berdasarkan PUIL 2011, instalasi listrik harus diinspeksi minimal setiap 5 tahun.</div>'
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#0369a1;color:#fff"><th style="padding:8px;text-align:left">Rekomendasi</th><th style="padding:8px;text-align:left">Merk / Model</th><th style="padding:8px;text-align:right">Harga Est.</th><th style="padding:8px;text-align:center">ROI</th></tr>'
  h+='<tr><td style="padding:8px;border-bottom:1px solid var(--light)">Jasa Inspeksi Instalasi</td><td style="padding:8px;border-bottom:1px solid var(--light);font-weight:700">Teknisi berlisensi SKTTK</td><td style="padding:8px;text-align:right;border-bottom:1px solid var(--light);color:#0284c7">Rp 300–600 rb</td><td style="padding:8px;text-align:center;border-bottom:1px solid var(--light)">2–6 bln</td></tr>'
  h+='</table></div>'
  h+='</div>'

  // ══ SECTION 8: SKENARIO PENGHEMATAN ══
  h+='<div class="rc" style="margin-bottom:16px"><div class="rpt-sec">■ SKENARIO PENGHEMATAN — PERBANDINGAN</div>'
  h+='<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px">'
  h+='<tr style="background:#0f172a;color:#fff"><th style="padding:10px;text-align:left">Skenario</th><th style="padding:10px;text-align:left">Aksi yang Dilakukan</th><th style="padding:10px;text-align:right">Tagihan Baru</th><th style="padding:10px;text-align:right;color:#34d399">Hemat/Bulan</th><th style="padding:10px;text-align:right;color:#34d399">Hemat/Tahun</th></tr>'
  var minSave=Math.round(totalCost*0.14)
  var modSave=Math.round(totalCost*0.29)
  var optSave=Math.round(totalCost*0.38)
  h+='<tr style="background:#f8fafc"><td style="padding:9px;font-weight:700">Minimal (1–2 aksi)</td><td style="padding:9px">Timer + naikkan setpoint suhu AC</td><td style="padding:9px;text-align:right">'+rp(totalCost-minSave)+'</td><td style="padding:9px;text-align:right;color:#059669;font-weight:700">'+rp(minSave)+'</td><td style="padding:9px;text-align:right;color:#059669;font-weight:700">'+rp(minSave*12)+'</td></tr>'
  h+='<tr><td style="padding:9px;font-weight:700">Moderat (3 aksi)</td><td style="padding:9px">AC baru + meter PLN + dispenser/kulkas baru</td><td style="padding:9px;text-align:right">'+rp(totalCost-modSave)+'</td><td style="padding:9px;text-align:right;color:#059669;font-weight:700">'+rp(modSave)+'</td><td style="padding:9px;text-align:right;color:#059669;font-weight:700">'+rp(modSave*12)+'</td></tr>'
  h+='<tr style="background:#f0fdf4"><td style="padding:9px;font-weight:700">Optimal (semua aksi)</td><td style="padding:9px">Semua termasuk instalasi + meter</td><td style="padding:9px;text-align:right">'+rp(totalCost-optSave)+'</td><td style="padding:9px;text-align:right;color:#059669;font-weight:800">'+rp(optSave)+'</td><td style="padding:9px;text-align:right;color:#059669;font-weight:800">'+rp(optSave*12)+'</td></tr>'
  h+='</table></div>'

  // ══ SECTION 9: TIPS ILMIAH ══
  h+='<div class="rc" style="margin-bottom:16px"><div class="rpt-sec">■ TIPS ILMIAH & KEBIASAAN HEMAT ENERGI</div>'

  h+='<div style="border:1.5px solid #bfdbfe;border-radius:12px;padding:14px;margin-bottom:10px;background:#eff6ff"><div style="font-weight:800;color:#1e40af;margin-bottom:8px">■■ Manajemen AC — Ilmu Termodinamika</div>'
  h+='<div style="font-size:13px;line-height:1.7">'
  h+='<strong>• Mode Dry vs Cool:</strong> Mode "Dry" (dehumidifier) mengonsumsi 30–40% lebih sedikit dari mode "Cool" karena kompresor bekerja intermiten.<br>'
  h+='<strong>• Posisi tirai/gorden:</strong> Paparan sinar matahari langsung meningkatkan beban pendinginan 8–15 BTU/m²/jam. Tutup gorden siang hari → AC tidak perlu bekerja keras.<br>'
  h+='<strong>• Pembersihan rutin:</strong> Filter AC kotor meningkatkan resistansi aliran udara → kompresor bekerja lebih keras. Bersihkan filter setiap 2 minggu.<br>'
  h+='<strong>• Insulasi ruangan:</strong> Segel celah di bawah pintu kamar AC dengan door sweep (Rp 15–30 rb). Udara dingin yang bocor = energi terbuang.</div></div>'

  h+='<div style="border:1.5px solid #fecaca;border-radius:12px;padding:14px;margin-bottom:10px;background:#fef2f2"><div style="font-weight:800;color:#991b1b;margin-bottom:8px">■ Phantom Load — Vampir Listrik 24 Jam</div>'
  h+='<div style="font-size:13px;line-height:1.7">'
  h+='<strong>• Apa itu phantom load?</strong> Perangkat dalam mode standby tetap mengonsumsi 0.5–15W meskipun tidak digunakan. TV, set top box, charger, dan microwave paling umum.<br>'
  h+='<strong>• Solusi:</strong> Gunakan power strip dengan saklar → matikan 1 tombol untuk semua perangkat. Estimasi hemat 5–10% tagihan bulanan.</div></div>'

  h+='<div style="border:1.5px solid #a7f3d0;border-radius:12px;padding:14px;margin-bottom:10px;background:#f0fdf4"><div style="font-weight:800;color:#065f46;margin-bottom:8px">■ Kulkas & Dispenser — Optimasi Pola Pemakaian</div>'
  h+='<div style="font-size:13px;line-height:1.7">'
  h+='<strong>• Kulkas:</strong> Jangan buka tutup kulkas terlalu sering. Setiap pembukaan pintu memasukkan udara hangat yang harus didinginkan kembali (kerja ekstra 5–7% per pembukaan). Isi kulkas 70–80% untuk efisiensi optimal.<br>'
  h+='<strong>• Dispenser:</strong> Matikan pemanas malam hari. Atau gunakan termos untuk menyimpan air panas — hemat 40–60% konsumsi dispenser.</div></div>'
  h+='</div>'


  // KWH METER CONDITION SECTION
  if(kwhMeterCondition){
    var mc=kwhMeterCondition
    var condColors={baik:'#10b981',cukup:'#d97706',tua:'#ea580c',sangat_tua:'#dc2626'}
    var condLabels={baik:'Baik',cukup:'Cukup',tua:'Tua',sangat_tua:'Sangat Tua'}
    var riskColors={rendah:'#10b981',sedang:'#d97706',tinggi:'#ea580c',sangat_tinggi:'#dc2626'}
    var riskLabels={rendah:'Rendah',sedang:'Sedang',tinggi:'Tinggi',sangat_tinggi:'Sangat Tinggi'}
    var meterIsOld=mc.estimatedAge>=8||mc.condition==='tua'||mc.condition==='sangat_tua'||mc.accuracyRisk==='tinggi'||mc.accuracyRisk==='sangat_tinggi'
    var borderColor=meterIsOld?'#fecaca':'#a7f3d0'
    var bgColor=meterIsOld?'#fff5f5':'#f0fdf4'
    h+='<div class="rc" style="margin-bottom:16px;border-color:'+borderColor+';background:'+bgColor+'"><div class="rpt-sec" style="background:linear-gradient(135deg,'+(meterIsOld?'#991b1b,#dc2626':'#065f46,#059669')+')">\u26A1 LAPORAN KONDISI KWH METER</div>'
    
    // Meter info card
    h+='<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px">'
    h+='<div style="flex:1;min-width:200px;background:var(--white);border-radius:12px;padding:14px;border:1px solid var(--light)">'
    h+='<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--mid);margin-bottom:8px">IDENTIFIKASI METER</div>'
    h+='<table style="font-size:13px;line-height:2">'
    h+='<tr><td style="font-weight:700;padding-right:14px">Tipe</td><td>'+(mc.type==='analog'?'\u2699\uFE0F Analog (Ferraris Disk)':'\uD83D\uDCDF Digital/Prepaid')+'</td></tr>'
    h+='<tr><td style="font-weight:700;padding-right:14px">Estimasi Usia</td><td><span style="color:'+(mc.estimatedAge>=10?'#dc2626':mc.estimatedAge>=6?'#d97706':'#10b981')+';font-weight:800">~'+mc.estimatedAge+' tahun</span></td></tr>'
    h+='<tr><td style="font-weight:700;padding-right:14px">Kondisi</td><td><span style="color:'+(condColors[mc.condition]||'#d97706')+';font-weight:800">'+(condLabels[mc.condition]||mc.condition)+'</span></td></tr>'
    if(mc.brand) h+='<tr><td style="font-weight:700;padding-right:14px">Merk</td><td>'+mc.brand+'</td></tr>'
    h+='<tr><td style="font-weight:700;padding-right:14px">Segel Kalibrasi</td><td>'+(mc.hasCalibrationSeal?'\u2705 Ada'+(mc.sealYear?' ('+mc.sealYear+')':''):'\u274C Tidak terlihat')+'</td></tr>'
    h+='</table></div>'
    
    // Risk gauge
    h+='<div style="flex:1;min-width:200px;background:var(--white);border-radius:12px;padding:14px;border:1px solid var(--light);text-align:center">'
    h+='<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--mid);margin-bottom:8px">RISIKO KETIDAKAKURATAN</div>'
    var riskPct=mc.accuracyRisk==='rendah'?15:mc.accuracyRisk==='sedang'?40:mc.accuracyRisk==='tinggi'?70:90
    h+='<div style="width:120px;height:120px;border-radius:50%;background:conic-gradient('+(riskColors[mc.accuracyRisk]||'#d97706')+' 0% '+riskPct+'%, var(--light2) '+riskPct+'% 100%);display:flex;align-items:center;justify-content:center;margin:0 auto 8px">'
    h+='<div style="width:90px;height:90px;border-radius:50%;background:var(--white);display:flex;align-items:center;justify-content:center;flex-direction:column">'
    h+='<div style="font-size:22px;font-weight:900;color:'+(riskColors[mc.accuracyRisk]||'#d97706')+'">'+(riskLabels[mc.accuracyRisk]||mc.accuracyRisk)+'</div>'
    h+='</div></div>'
    h+='<div style="font-size:11px;color:var(--mid)">Kemungkinan error pengukuran: <strong>'+(mc.accuracyRisk==='rendah'?'1-2%':mc.accuracyRisk==='sedang'?'3-5%':mc.accuracyRisk==='tinggi'?'5-15%':'10-20%')+'</strong></div>'
    h+='</div></div>'
    
    // Issues if any
    if(mc.issues&&mc.issues.length>0){
      h+='<div style="margin-bottom:12px;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;font-size:13px;line-height:1.7">'
      h+='<strong style="color:#dc2626">\u26A0\uFE0F Temuan Masalah:</strong><br>'
      mc.issues.forEach(function(issue){ h+='\u2022 '+issue+'<br>' })
      h+='</div>'
    }
    
    // Impact analysis
    if(meterIsOld){
      h+='<div style="padding:14px;background:#fff5f5;border:1.5px solid #fecaca;border-radius:12px;margin-bottom:12px">'
      h+='<div style="font-weight:800;color:#991b1b;margin-bottom:8px;font-size:14px">\u26A0\uFE0F DAMPAK PADA TAGIHAN LISTRIK</div>'
      h+='<div style="font-size:13px;line-height:1.7;color:#7f1d1d">'
      if(mc.type==='analog'){
        h+='<strong>KWH meter analog berusia ~'+mc.estimatedAge+' tahun tergolong '+(mc.condition==='sangat_tua'?'sangat':'cukup')+' tua.</strong> '
        h+='Meter Ferraris bekerja berdasarkan induksi elektromagnetik pada disk aluminium. Seiring waktu, <strong>bearing friction</strong> (gesekan bantalan) berubah, <strong>magnetic flux</strong> pada kumparan mengalami degradasi, dan <strong>brake magnet</strong> melemah. '
        h+='Kombinasi ini menyebabkan meter bisa <strong>mencatat lebih tinggi dari pemakaian sebenarnya (over-register)</strong> sebesar <strong>'+(mc.accuracyRisk==='sangat_tinggi'?'10-20%':mc.accuracyRisk==='tinggi'?'5-15%':'3-8%')+'</strong>.'
        h+='<br><br><strong>Estimasi dampak finansial:</strong> Jika total konsumsi Anda '+Math.round(totalKwh)+' kWh/bulan, meter tua bisa menambah <strong>'+rp(Math.round(totalCost*(mc.accuracyRisk==='sangat_tinggi'?0.15:mc.accuracyRisk==='tinggi'?0.10:0.05)))+'/bulan</strong> ke tagihan.'
      } else {
        h+='<strong>KWH meter digital berusia ~'+mc.estimatedAge+' tahun.</strong> '
        h+='Meskipun meter digital umumnya lebih akurat dari analog, komponen elektronik (kapasitor, sensor arus CT) tetap mengalami degradasi. '
        h+='Risiko error pengukuran: <strong>'+(mc.accuracyRisk==='sangat_tinggi'?'10-15%':mc.accuracyRisk==='tinggi'?'3-8%':'1-3%')+'</strong>.'
      }
      h+='</div></div>'
      
      // Recommendation
      h+='<div style="padding:14px;background:#f0fdf4;border:1.5px solid #a7f3d0;border-radius:12px">'
      h+='<div style="font-weight:800;color:#065f46;margin-bottom:8px;font-size:14px">\u2705 REKOMENDASI</div>'
      h+='<div style="font-size:13px;line-height:1.7;color:#064e3b">'
      h+='<strong>1.</strong> Hubungi <strong>PLN 123</strong> untuk minta pemeriksaan dan kalibrasi ulang meter (GRATIS untuk pelanggan reguler).<br>'
      h+='<strong>2.</strong> Jika meter >15 tahun, ajukan <strong>penggantian meter baru</strong> ke PLN Area terdekat.<br>'
      h+='<strong>3.</strong> Pertimbangkan upgrade ke <strong>meter digital prepaid</strong> untuk monitoring pemakaian lebih akurat.<br>'
      h+='<strong>4.</strong> Minta teknisi PLN untuk <strong>tera ulang</strong> — standar PLN mensyaratkan tera setiap 10 tahun (SPLN D3.016-1:2014).'
      h+='</div></div>'
    } else {
      h+='<div style="padding:14px;background:#f0fdf4;border:1.5px solid #a7f3d0;border-radius:12px">'
      h+='<div style="font-weight:800;color:#065f46;margin-bottom:8px;font-size:14px">\u2705 METER DALAM KONDISI BAIK</div>'
      h+='<div style="font-size:13px;line-height:1.7;color:#064e3b">'
      h+='KWH meter Anda dalam kondisi baik dengan risiko ketidakakuratan rendah. Selisih antara estimasi dan tagihan aktual kemungkinan besar bukan disebabkan oleh masalah meter.'
      h+='</div></div>'
    }
    h+='</div>'
  }


  // ══ SECTION 10: SIMPAN & CTA WHATSAPP ══
  h+='<div class="rc" style="margin-bottom:16px;border-color:#bae6fd;background:#f0f9ff">'
  h+='<div class="rpt-sec">■ SIMPAN & KIRIM LAPORAN</div>'
  h+='<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">'
  h+='<button onclick="window.print()" style="display:flex;align-items:center;gap:8px;padding:11px 18px;background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;border:none;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">🖨️ Simpan PDF</button>'
  h+='<div style="flex:1;min-width:200px;display:flex;gap:8px"><input id="emailInput" type="email" placeholder="email@kamu.com" style="flex:1;padding:11px 13px;border-radius:11px;border:1.5px solid var(--light);background:var(--white);font-family:inherit;font-size:13px"><button onclick="sendEmail()" style="padding:11px 16px;background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;border:none;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">📧 Kirim</button></div></div>'
  h+='<div id="emailStatus" style="margin-top:8px;font-size:12px;display:none"></div></div>'

  // WhatsApp CTA
  h+='<div style="background:linear-gradient(135deg,#25D366,#128C7E);border-radius:16px;padding:22px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px">'
  h+='<div><h4 style="color:#fff;font-size:16px;font-weight:800;margin:0 0 4px">🔧 Butuh Bantuan Teknisi Listrik Berlisensi?</h4><p style="color:rgba(255,255,255,.85);font-size:12px;margin:0">Audit lapangan, perbaikan arus bocor, penggantian instalasi</p></div>'
  h+='<a style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:#128C7E;font-weight:800;font-size:13px;padding:12px 22px;border-radius:12px;text-decoration:none;white-space:nowrap" href="https://wa.me/6285260409720?text='+waMsg+'" target="_blank">💬 Chat WhatsApp</a></div>'

  // Disclaimer
  h+='<div style="font-size:11px;color:var(--mid);line-height:1.6;padding:12px 16px;background:var(--light2);border-radius:10px;margin-bottom:8px">'
  h+='Laporan ini dibuat berdasarkan data yang diinput pengguna dan estimasi konsumsi standar perangkat menggunakan database daya PLN dan referensi ASHRAE, PUIL 2011, serta Permen ESDM No. 27/2017. Harga produk bersifat estimasi dan dapat berubah. Konsultasikan dengan teknisi berlisensi sebelum melakukan modifikasi instalasi.'
  h+='<br>EnVisor AI — '+reportDate+' — ID: '+reportId+'</div>'

  document.getElementById('rbody').innerHTML=h

  // Animate bars
  setTimeout(function(){
    top5.forEach(function(d,di){
      var pct=Math.round((calcDev(d.w,d.h).cost/maxDevCost)*100)
      var el=document.getElementById('dbar'+di); if(el) el.style.width=pct+'%'
    })
  },150)
}

// ── BELL CURVE SVG BUILDER ──────────────────────────────────────
function buildBellCurveSVG(mean, userKwh, va){
  var sigma=Math.round(mean*0.28)
  var w=600, ht=200, pad=40
  var minX=Math.max(0,mean-3*sigma), maxX=mean+3*sigma
  var scaleX=function(x){return pad+(x-minX)/(maxX-minX)*(w-2*pad)}
  var scaleY=function(y){return ht-pad-y*(ht-2*pad)}
  var gauss=function(x){return Math.exp(-0.5*Math.pow((x-mean)/sigma,2))}

  var svg='<svg viewBox="0 0 '+w+' '+(ht+20)+'" style="width:100%;max-width:600px;height:auto;display:block;margin:0 auto">'

  // Fill zones
  var zones=[
    {from:mean-sigma,to:mean+sigma,color:'rgba(16,185,129,0.25)',label:'Normal'},
    {from:mean+sigma,to:mean+2*sigma,color:'rgba(251,191,36,0.25)',label:'Tinggi'},
    {from:mean-2*sigma,to:mean-sigma,color:'rgba(251,191,36,0.15)',label:''},
    {from:mean+2*sigma,to:maxX,color:'rgba(239,68,68,0.25)',label:'Sangat Tinggi'},
  ]
  zones.forEach(function(z){
    var path='M'+scaleX(z.from)+','+scaleY(0)
    for(var x=z.from;x<=z.to;x+=2){
      path+=' L'+scaleX(x)+','+scaleY(gauss(x))
    }
    path+=' L'+scaleX(z.to)+','+scaleY(0)+' Z'
    svg+='<path d="'+path+'" fill="'+z.color+'"/>'
  })

  // Bell curve line
  var curvePath='M'+scaleX(minX)+','+scaleY(gauss(minX))
  for(var x=minX;x<=maxX;x+=2){
    curvePath+=' L'+scaleX(x)+','+scaleY(gauss(x))
  }
  svg+='<path d="'+curvePath+'" fill="none" stroke="#0f172a" stroke-width="2.5"/>'

  // Mean line
  svg+='<line x1="'+scaleX(mean)+'" y1="'+scaleY(0)+'" x2="'+scaleX(mean)+'" y2="'+scaleY(1)+'" stroke="#10b981" stroke-width="1.5" stroke-dasharray="6,4"/>'
  svg+='<text x="'+scaleX(mean)+'" y="'+(scaleY(1)-8)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#10b981">Rata-rata '+mean+' kWh</text>'

  // User position line
  svg+='<line x1="'+scaleX(userKwh)+'" y1="'+scaleY(0)+'" x2="'+scaleX(userKwh)+'" y2="'+(scaleY(gauss(userKwh))-5)+'" stroke="#ef4444" stroke-width="2.5"/>'
  svg+='<circle cx="'+scaleX(userKwh)+'" cy="'+(scaleY(gauss(userKwh))-5)+'" r="6" fill="#ef4444"/>'
  svg+='<text x="'+scaleX(userKwh)+'" y="'+(scaleY(gauss(userKwh))-18)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#ef4444">Anda: '+Math.round(userKwh)+' kWh</text>'

  // X axis labels
  for(var i=-2;i<=2;i++){
    var xVal=mean+i*sigma
    if(xVal>0){
      svg+='<text x="'+scaleX(xVal)+'" y="'+(ht+5)+'" text-anchor="middle" font-size="10" fill="#64748b">'+xVal+'</text>'
    }
  }
  svg+='<text x="'+(w/2)+'" y="'+(ht+18)+'" text-anchor="middle" font-size="10" fill="#94a3b8">Konsumsi kWh / bulan</text>'

  // Zone labels at bottom of curve
  svg+='<text x="'+scaleX(mean)+'" y="'+(scaleY(0)-5)+'" text-anchor="middle" font-size="9" font-weight="700" fill="#10b981">ZONA NORMAL</text>'
  if(mean+1.5*sigma<maxX) svg+='<text x="'+scaleX(mean+1.5*sigma)+'" y="'+(scaleY(0)-5)+'" text-anchor="middle" font-size="9" font-weight="700" fill="#d97706">TINGGI</text>'
  if(mean+2.5*sigma<maxX) svg+='<text x="'+scaleX(mean+2.5*sigma)+'" y="'+(scaleY(0)-5)+'" text-anchor="middle" font-size="9" font-weight="700" fill="#ef4444">SANGAT TINGGI</text>'

  svg+='</svg>'
  return svg
}

function sendEmail(){
  const email=document.getElementById('emailInput').value.trim()
  const status=document.getElementById('emailStatus')
  if(!email||!email.includes('@')){
    status.style.display='block'; status.style.color='#ef4444'
    status.textContent='⚠️ Masukkan alamat email yang valid'; return
  }
  // Build report text
  const allDevs=rooms.flatMap(r=>r.devs.map(d=>({...d,room:r})))
  const totalKwh=Math.round(allDevs.reduce((a,d)=>a+calcDev(d.w,d.h).kwh,0))
  const totalCost=allDevs.reduce((a,d)=>a+calcDev(d.w,d.h).cost,0)
  const sorted=[...allDevs].sort((a,b)=>calcDev(b.w,b.h).cost-calcDev(a.w,a.h).cost)
  const lines=[
    `LAPORAN AUDIT LISTRIK — EnVisor AI`,``,
    `Daya PLN : ${plnVa.toLocaleString()} VA`,
    `Penghuni : ${jumlahOrang} orang`,
    `Total kWh : ${totalKwh} kWh/bulan`,
    `Estimasi : ${rp(totalCost)}/bulan`,``,
    `5 PERANGKAT PALING BOROS:`,
    ...sorted.slice(0,5).map((d,i)=>`${i+1}. ${d.n} — ${rp(calcDev(d.w,d.h).cost)}/bln`),``,
    `Laporan lengkap: https://envisor.ai`
  ]
  const body=encodeURIComponent(lines.join('\n'))
  const subject=encodeURIComponent(`Laporan Audit Listrik Rumah — EnVisor AI`)
  window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  status.style.display='block'; status.style.color='#10b981'
  status.textContent='✅ Membuka aplikasi email kamu...'
  setTimeout(()=>{ status.style.display='none' },4000)
}

// ── HELPERS ───────────────────────────────────────────────────────
function toB64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; r.readAsDataURL(file) }) }

function emoji(name){
  const n=name.toLowerCase()
  if(n.includes('ac')||n.includes('air con')||n.includes('pendingin')) return '❄️'
  if(n.includes('kulkas')||n.includes('refrig')||n.includes('freeze')) return '🧊'
  if(n.includes('tv')||n.includes('tele')||n.includes('monitor')) return '📺'
  if(n.includes('cuci')||n.includes('wash')) return '🫧'
  if(n.includes('lampu')||n.includes('light')||n.includes('led')) return '💡'
  if(n.includes('laptop')||n.includes('computer')||n.includes('pc')) return '💻'
  if(n.includes('heater')||n.includes('pemanas')||n.includes('water')) return '🚿'
  if(n.includes('rice')||n.includes('nasi')) return '🍚'
  if(n.includes('microwave')||n.includes('oven')) return '📡'
  if(n.includes('kipas')||n.includes('fan')) return '🌀'
  if(n.includes('dispenser')) return '🥤'
  if(n.includes('pompa')||n.includes('pump')) return '💧'
  return '🔌'
}

function mockOne(roomName,count){
  const r=roomName.toLowerCase()
  const banks={
    dapur:[
      {name:'Kulkas 2 Pintu',watts:150,dailyHours:24},
      {name:'Rice Cooker',watts:400,dailyHours:2},
      {name:'Microwave',watts:900,dailyHours:0.5},
      {name:'Dispenser Air Panas',watts:350,dailyHours:8},
      {name:'Lampu LED Dapur',watts:20,dailyHours:6},
      {name:'Blender',watts:300,dailyHours:0.25},
    ],
    kamar:[
      {name:'AC Split 1 PK',watts:900,dailyHours:8},
      {name:'Lampu LED Kamar',watts:15,dailyHours:8},
      {name:'Kipas Angin',watts:45,dailyHours:6},
      {name:'Charger HP',watts:20,dailyHours:4},
      {name:'Laptop',watts:65,dailyHours:5},
      {name:'Lampu Tidur',watts:8,dailyHours:7},
    ],
    garasi:[
      {name:'Lampu Garasi',watts:40,dailyHours:4},
      {name:'Pompa Air',watts:250,dailyHours:1},
      {name:'Exhaust Fan',watts:30,dailyHours:6},
    ],
    default:[
      {name:'AC Split 1 PK',watts:900,dailyHours:6},
      {name:'LED TV 43"',watts:80,dailyHours:5},
      {name:'Lampu LED Ruangan',watts:30,dailyHours:8},
      {name:'Set Top Box',watts:15,dailyHours:5},
      {name:'WiFi Router',watts:12,dailyHours:24},
      {name:'Speaker Aktif',watts:20,dailyHours:4},
    ]
  }
  let list=banks.default
  if(r.includes('dapur')||r.includes('kitchen')) list=banks.dapur
  else if(r.includes('kamar')||r.includes('bedroom')) list=banks.kamar
  else if(r.includes('garasi')) list=banks.garasi
  return [list[count%list.length]]
}

function restart(){
  kwhMeterCondition=null
  rooms=[
    {id:'r1',n:'Ruang Tamu',i:'🛋️',devs:[]},
    {id:'r2',n:'Ruang Keluarga',i:'📺',devs:[]},
    {id:'r3',n:'Dapur',i:'🍳',devs:[]},
    {id:'r4',n:'Kamar Utama',i:'🛏️',devs:[]},
    {id:'r5',n:'Garasi',i:'🚗',devs:[]},
  ]
  plnVa=1300; jumlahOrang=3; activeRoom='r1'
  ;['buz1','buz2'].forEach(id=>document.getElementById(id).classList.remove('done'))
  ;['inp_bill','inp_meter','inp_actual'].forEach(id=>{ try{document.getElementById(id).value=''}catch(e){} })
  ;['bico1','bico2'].forEach((id,i)=>{ document.getElementById(id).style.display=''; document.getElementById(['btxt1','btxt2'][i]).textContent=['Foto Tagihan / Struk PLN','Foto KWH Meter'][i] })
  setOrang(3); go(1); initVA(); renderRooms()
}

// ── INIT ──────────────────────────────────────────────────────────
initVA(); renderRooms()
