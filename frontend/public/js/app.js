// ── STATE ──────────────────────────────────────────────────────────
const PRESETS=[
  {n:'Ruang Tamu',i:'🛋️'},{n:'Ruang Keluarga',i:'📺'},{n:'Dapur',i:'🍳'},
  {n:'Kamar Utama',i:'🛏️'},{n:'Kamar Anak',i:'🧒'},{n:'Garasi',i:'🚗'},
  {n:'Kamar Mandi',i:'🚿'},{n:'Kantor/Kerja',i:'💻'},{n:'Laundry',i:'🫧'},{n:'Teras',i:'🌿'},
]
const ICONS=['🏠','🛋️','📺','🍳','🛏️','🧒','🚿','🚗','💻','🫧','🌿','🔧','🎮','📚','🎵','🏋️']
const VA_OPTIONS=[900,1300,2200,3500,5500,7700]

let rooms=[
  {id:'r1',n:'Ruang Tamu',i:'🛋️',devs:[]},
  {id:'r2',n:'Ruang Keluarga',i:'📺',devs:[]},
  {id:'r3',n:'Dapur',i:'🍳',devs:[]},
  {id:'r4',n:'Kamar Utama',i:'🛏️',devs:[]},
  {id:'r5',n:'Garasi',i:'🚗',devs:[]},
]
let plnVa=1300, jumlahOrang=3, activeRoom='r1', selIco='🏠', customId=0
const API_URL='' // Leave empty to use mock data, or set to your deployed URL

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
      <div style="margin-top:12px"></div>
    `:''}
    ${room.devs.length===0?`
      <div class="uz" ondrop="onDrop(event,'${room.id}')" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" onclick="document.getElementById('fi_${room.id}').click()">
        <input type="file" id="fi_${room.id}" accept="image/*" onchange="oneFile(this.files,'${room.id}')">
        <div id="uzi_${room.id}">
          <div class="uz-ico">📷</div>
          <div class="uz-t">Foto Elektronik Pertama di ${room.n}</div>
          <div class="uz-s">Klik atau drag foto · 1 foto = 1 elektronik</div>
        </div>
        <div class="lbar" id="lb_${room.id}"><div class="lbar-fill"></div></div>
      </div>
    `:`
      <div id="addZone_${room.id}">
        <button id="addBtn_${room.id}" onclick="showAdd('${room.id}')"
          style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:15px;border:2px dashed var(--light);border-radius:14px;background:transparent;font-family:inherit;font-size:14px;font-weight:700;color:var(--acc);cursor:pointer;transition:all .2s"
          onmouseover="this.style.background='#fffbeb';this.style.borderColor='var(--acc)'"
          onmouseout="this.style.background='transparent';this.style.borderColor='var(--light)'">
          📷 + Tambah Elektronik ke-${room.devs.length+1}
        </button>
        <div id="addPanel_${room.id}" style="display:none;margin-top:10px">
          <div style="font-size:12px;font-weight:700;color:var(--mid);margin-bottom:8px">📷 Foto Elektronik ke-${room.devs.length+1}</div>
          <div class="uz" ondrop="onDrop2(event,'${room.id}')" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" onclick="document.getElementById('fi2_${room.id}').click()">
            <input type="file" id="fi2_${room.id}" accept="image/*" onchange="oneFile(this.files,'${room.id}')">
            <div id="uzi2_${room.id}">
              <div class="uz-ico">📱</div>
              <div class="uz-t">Foto Elektronik Berikutnya</div>
              <div class="uz-s">AI identifikasi otomatis dari foto</div>
            </div>
            <div class="lbar" id="lb2_${room.id}"><div class="lbar-fill"></div></div>
          </div>
          <button onclick="hideAdd('${room.id}')" style="background:none;border:none;color:var(--mid);font-size:13px;cursor:pointer;font-family:inherit">Batal</button>
        </div>
      </div>
    `}
  `
  updateSticky()
}

function showAdd(id){ document.getElementById('addBtn_'+id).style.display='none'; document.getElementById('addPanel_'+id).style.display='block' }
function hideAdd(id){ document.getElementById('addBtn_'+id).style.display='flex'; document.getElementById('addPanel_'+id).style.display='none' }
function onDrop(e,id){ e.preventDefault(); oneFile(e.dataTransfer.files,id) }
function onDrop2(e,id){ e.preventDefault(); oneFile(e.dataTransfer.files,id) }

async function oneFile(files,roomId){
  const imgs=Array.from(files).filter(f=>f.type.startsWith('image/')); if(!imgs.length) return
  const room=rooms.find(r=>r.id===roomId)
  const isFirst=room.devs.length===0
  const lbId=isFirst?'lb_'+roomId:'lb2_'+roomId
  const innId=isFirst?'uzi_'+roomId:'uzi2_'+roomId
  const lb=document.getElementById(lbId), inn=document.getElementById(innId)
  if(lb) lb.classList.add('on')
  if(inn) inn.innerHTML=`<div class="uz-ico" style="animation:rot .75s linear infinite;display:inline-block">⚡</div><div class="uz-t" style="color:var(--acc)">AI mengidentifikasi...</div><div class="uz-s">Mengenali elektronik dari foto</div>`
  try{
    let devs=[]
    if(API_URL){ // Set API_URL above to enable real AI analysis
      const b64=await toB64(imgs[0])
      const res=await fetch(API_URL+'/api/analyze/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64,mediaType:imgs[0].type,roomLabel:room.n})})
      devs=(await res.json()).devices||[]
    } else { devs=mockOne(room.n,room.devs.length) }
    devs.forEach(d=>room.devs.push({n:d.name,w:d.watts,h:d.dailyHours||4,e:emoji(d.name)}))
  }catch(e){ console.error(e) }
  if(lb) lb.classList.remove('on')
  renderTabs(); renderContent(); renderRooms()
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
    document.getElementById(txtId).textContent='✅ Foto terupload'
  }
  reader.readAsDataURL(file)
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

  // Tagihan & perbandingan
  const actualBill=parseFloat(document.getElementById('inp_actual').value)||0
  const diff=actualBill>0?actualBill-totalCost:0
  const diffPct=actualBill>0?Math.round(Math.abs(diff/totalCost)*100):0
  const isOver=actualBill>0&&diff>totalCost*0.05
  const isUnder=actualBill>0&&diff<-(totalCost*0.05)

  // Perbandingan rata-rata pelanggan daya yang sama
  const vaKey=VA_OPTIONS.reduce((p,v)=>v<=plnVa?v:p,VA_OPTIONS[0])
  const avgKwh=AVG_KWH_BY_VA[vaKey]||130
  const avgCost=Math.round(avgKwh*tariff())
  const vsAvgPct=avgKwh>0?Math.round(((totalKwh-avgKwh)/avgKwh)*100):0
  const isAboveAvg=vsAvgPct>10

  // Konsumsi wajar per penghuni
  const wajarKwh=jumlahOrang*100
  const kwhVsWajar=Math.round((totalKwh/wajarKwh)*100)
  const suspectDev=sorted[0]
  const suspectShare=totalCost>0?Math.round((calcDev(suspectDev?.w||0,suspectDev?.h||0).cost/totalCost)*100):0
  const showWarning=isOver||(totalKwh>wajarKwh*1.1)||isAboveAvg

  // Build pie chart slices
  const pieSlices=activeRooms.map(r=>{
    const rCost=r.devs.reduce((a,d)=>a+calcDev(d.w,d.h).cost,0)
    return {label:r.i+' '+r.n, value:rCost, pct:totalCost>0?Math.round((rCost/totalCost)*100):0}
  }).filter(s=>s.pct>0)
  const {svg:pieSvg, legends:pieLeg}=buildPieChart(pieSlices)

  const waMsg=encodeURIComponent(`Halo! Saya baru cek lewat EnVisor AI.\nEstimasi tagihan: ${rp(totalCost)}/bln\nDaya: ${plnVa} VA · ${jumlahOrang} penghuni\nMohon bantu audit listrik rumah saya 🙏`)

  document.getElementById('rsub').textContent=`${Math.round(totalKwh)} kWh/bulan · ${allDevs.length} perangkat · ${jumlahOrang} penghuni`

  document.getElementById('rbody').innerHTML=`

  <!-- ══ 1. ESTIMASI & PERBANDINGAN TAGIHAN ══ -->
  <div class="hero-result" style="margin-bottom:12px">
    <div class="hr-label">ESTIMASI TAGIHAN DARI PERANGKAT KAMU</div>
    <div class="hr-main">${rp(totalCost)}</div>
    <div class="hr-sub">per bulan · ${Math.round(totalKwh)} kWh · ${allDevs.length} perangkat</div>

    <div class="hr-compare">
      <div class="hr-cbox">
        <div class="hr-clbl">WAJAR (${jumlahOrang} org)</div>
        <div class="hr-cval green">${rp(wajarKwh*tariff())}</div>
      </div>
      <div class="hr-cbox">
        <div class="hr-clbl">RATA-RATA ${plnVa.toLocaleString()} VA</div>
        <div class="hr-cval yellow">${rp(avgCost)}</div>
      </div>
      ${actualBill>0?`<div class="hr-cbox">
        <div class="hr-clbl">TAGIHAN AKTUAL</div>
        <div class="hr-cval ${isOver?'red':isUnder?'green':'yellow'}">${rp(actualBill)}</div>
      </div>`:''}
    </div>

    <!-- Badges -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">
      ${actualBill>0?`<div class="hr-badge ${isOver?'over':isUnder?'under':'ok'}">
        ${isOver?`⚠️ Tagihan aktual lebih besar ${diffPct}% dari estimasi perangkat`
          :isUnder?`✅ Tagihan aktual lebih kecil ${diffPct}% dari estimasi`
          :`✅ Tagihan aktual sesuai estimasi perangkat`}
      </div>`:''}
      <div class="hr-badge ${isAboveAvg?'over':'ok'}">
        ${isAboveAvg
          ?`⚠️ Pemakaian kamu lebih besar ${vsAvgPct}% dari rata-rata pelanggan ${plnVa.toLocaleString()} VA`
          :vsAvgPct<-10
            ?`✅ Pemakaian kamu lebih hemat ${Math.abs(vsAvgPct)}% dari rata-rata pelanggan ${plnVa.toLocaleString()} VA`
            :`✅ Pemakaian kamu setara rata-rata pelanggan ${plnVa.toLocaleString()} VA`}
      </div>
    </div>
  </div>

  <!-- ══ 2. PIE CHART KONSUMSI PER RUANGAN ══ -->
  <div class="rc" style="margin-bottom:12px">
    <div class="rh">
      <div class="ri">🏠</div>
      <div><div class="rtl">Konsumsi per Ruangan</div><div class="rsb">Proporsi biaya listrik tiap ruangan</div></div>
    </div>
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <div style="flex-shrink:0">${pieSvg}</div>
      <div style="flex:1;min-width:140px">${pieLeg}</div>
    </div>
  </div>

  <!-- ══ 3. 5 PERANGKAT PALING BOROS — BAR CHART ══ -->
  <div class="rc warn" style="margin-bottom:12px">
    <div class="rh">
      <div class="ri">🔥</div>
      <div><div class="rtl">5 Perangkat Paling Boros</div><div class="rsb">Biaya per bulan</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${top5.map((d,di)=>{
        const {kwh,cost}=calcDev(d.w,d.h)
        const pct=Math.round((cost/maxDevCost)*100)
        const cols=['linear-gradient(90deg,#ef4444,#f97316)','linear-gradient(90deg,#f59e0b,#ef4444)','linear-gradient(90deg,#fbbf24,#f59e0b)','linear-gradient(90deg,#a3e635,#10b981)','linear-gradient(90deg,#38bdf8,#0891b2)']
        return `<div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <div style="font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px">
              <span>${d.e||'🔌'}</span>
              <span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.n}</span>
              <span style="font-size:10px;color:var(--mid);font-weight:500">· ${d.room.n} · ${d.h}j/hr</span>
            </div>
            <div style="font-size:12px;font-weight:800;color:#ef4444;flex-shrink:0">${rp(cost)}</div>
          </div>
          <div style="height:20px;background:var(--light2);border-radius:20px;overflow:hidden;position:relative">
            <div id="dbar${di}" style="height:100%;width:0;border-radius:20px;background:${cols[di]};transition:width 1s cubic-bezier(.4,0,.2,1)"></div>
            <span style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:800;color:${di<2?'#92400e':'var(--mid)'}">${kwh} kWh</span>
          </div>
        </div>`
      }).join('')}
    </div>
    <div style="margin-top:12px;padding:10px 14px;background:var(--white);border-radius:10px;border:1.5px solid var(--light);font-size:12px;color:var(--mid)">
      💡 <strong style="color:var(--dark)">${suspectDev?.e||'🔌'} ${suspectDev?.n||'—'}</strong> menyumbang <strong style="color:#ef4444">${suspectShare}%</strong> total tagihan bulanan
    </div>
  </div>

  <!-- ══ 4. ANALISA PENYEBAB TAGIHAN TINGGI ══ -->
  ${showWarning?`
  <div class="rc danger" style="margin-bottom:12px">
    <div class="rh">
      <div class="ri">🔍</div>
      <div><div class="rtl">Analisa Penyebab Tagihan Tinggi</div>
      <div class="rsb">${actualBill>0&&isOver?`Tagihan aktual ${diffPct}% di atas estimasi`:`Konsumsi ${vsAvgPct>0?vsAvgPct+'% di atas':Math.abs(vsAvgPct)+'% di bawah'} rata-rata pelanggan ${plnVa.toLocaleString()} VA`}</div></div>
    </div>
    <div class="kemungkinan-list">
      <div class="km-item">
        <div class="km-num r">1</div>
        <div class="km-text">
          <strong>Perangkat ${suspectDev?.n||'boros'} tidak efisien</strong>
          Menyumbang ${suspectShare}% tagihan. Jika usianya >5 tahun, komponen internal (kapasitor, kompresor) mengalami degradasi dan menarik daya jauh di atas spesifikasi asli ${suspectDev?.w||0}W.
        </div>
      </div>
      <div class="km-item">
        <div class="km-num y">2</div>
        <div class="km-text">
          <strong>KWH Meter sudah tua atau tidak akurat</strong>
          Meter analog berumur >10 tahun rentan kalibrasi bergeser. Kenaikan suhu ruangan juga mempercepat putaran disk meter analog. Hubungi PLN 123 untuk pemeriksaan gratis.
        </div>
      </div>
      <div class="km-item">
        <div class="km-num o">3</div>
        <div class="km-text">
          <strong>Ada arus bocor (current leakage)</strong>
          Isolasi kabel tua, stop kontak longgar, atau grounding buruk bisa menyebabkan arus mengalir ke tanah 24 jam tanpa disadari. Tes: matikan semua beban → amati KWH meter. Jika masih berputar = ada kebocoran.
        </div>
      </div>
      <div class="km-item">
        <div class="km-num b">4</div>
        <div class="km-text">
          <strong>Instalasi listrik sudah tua</strong>
          Kabel berumur >15 tahun memiliki resistansi lebih tinggi → terjadi rugi daya (power loss) di sepanjang jaringan. Semakin panjang kabel, semakin besar kehilangan energinya.
        </div>
      </div>
    </div>
  </div>

  <!-- ══ 5. SOLUSI / YANG HARUS DILAKUKAN ══ -->
  <div class="rc blue" style="margin-bottom:12px">
    <div class="rh">
      <div class="ri">✅</div>
      <div><div class="rtl">Solusi & Yang Harus Dilakukan</div><div class="rsb">Langkah prioritas untuk turunkan tagihan</div></div>
    </div>
    <div class="action-list">
      <div class="act-item">
        <div class="act-num">1</div>
        <div class="act-text">
          <strong>Ganti atau servis ${suspectDev?.n||'perangkat boros'}</strong>
          Kontribusi ${suspectShare}% tagihan. Ganti dengan model inverter/berlabel SNI hemat energi → estimasi hemat ${rp(calcDev(suspectDev?.w||0,suspectDev?.h||0).cost*0.35)}/bulan. ROI alat baru biasanya 18–24 bulan.
        </div>
      </div>
      <div class="act-item">
        <div class="act-num">2</div>
        <div class="act-text">
          <strong>Minta PLN periksa atau ganti KWH Meter</strong>
          Hubungi PLN 123 (gratis). Jika meter >10 tahun, ajukan penggantian resmi. Proses 1–2 minggu dan tidak dipungut biaya untuk pelanggan reguler.
        </div>
      </div>
      <div class="act-item">
        <div class="act-num">3</div>
        <div class="act-text">
          <strong>Audit instalasi & cek arus bocor</strong>
          Matikan semua perangkat → amati KWH meter. Masih berputar? Hubungi teknisi listrik berlisensi untuk inspeksi panel, kabel, dan grounding rumah.
        </div>
      </div>
      <div class="act-item">
        <div class="act-num">4</div>
        <div class="act-text">
          <strong>Kurangi 2 jam/hari pada ${top5.slice(0,2).map(d=>d.n).join(' & ')}</strong>
          Estimasi hemat ${rp(top5.slice(0,2).reduce((a,d)=>a+calcDev(d.w,d.h).cost*0.3,0))}/bulan. Gunakan timer atau smart plug untuk otomatisasi.
        </div>
      </div>
    </div>
  </div>
  `:`
  <div class="rc ok" style="margin-bottom:12px">
    <div class="rh"><div class="ri">✅</div><div><div class="rtl">Konsumsi Listrik Normal</div><div class="rsb">Tidak ada indikasi masalah besar</div></div></div>
    <div style="font-size:13px;line-height:1.8;color:#065f46">
      Pemakaian listrik rumahmu <strong>sudah efisien</strong> — ${Math.abs(vsAvgPct)}% lebih hemat dari rata-rata pelanggan ${plnVa.toLocaleString()} VA. Tips tambahan:
      <ul style="margin-top:8px;padding-left:18px;display:flex;flex-direction:column;gap:5px">
        <li>Set AC 24–26°C → hemat 6% per derajat yang dinaikkan</li>
        <li>Cabut perangkat standby → bisa hemat 5–10% tagihan</li>
        <li>Gunakan smart power strip dengan auto-cut untuk TV & audio</li>
      </ul>
    </div>
  </div>
  `}

  <!-- ══ SIMPAN / KIRIM REPORT ══ -->
  <div class="rc" style="margin-bottom:12px;border-color:#bae6fd;background:#f0f9ff">
    <div class="rh">
      <div class="ri">📤</div>
      <div><div class="rtl">Simpan & Kirim Laporan</div><div class="rsb">Download PDF atau kirim ke email kamu</div></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button onclick="window.print()" style="display:flex;align-items:center;gap:8px;padding:11px 18px;background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;border:none;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 3px 10px rgba(8,145,178,.3)" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        🖨️ Simpan PDF
      </button>
      <div style="flex:1;min-width:200px;display:flex;gap:8px">
        <input id="emailInput" type="email" placeholder="email@kamu.com"
          style="flex:1;padding:11px 13px;border-radius:11px;border:1.5px solid var(--light);background:var(--white);font-family:inherit;font-size:13px;color:var(--dark);outline:none;transition:border-color .2s"
          onfocus="this.style.borderColor='#0891b2'" onblur="this.style.borderColor='var(--light)'">
        <button onclick="sendEmail()" style="padding:11px 16px;background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;border:none;border-radius:11px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          📧 Kirim
        </button>
      </div>
    </div>
    <div id="emailStatus" style="margin-top:8px;font-size:12px;display:none"></div>
  </div>

  <!-- ══ 6. HUBUNGI WHATSAPP ══ -->
  <div class="wa-cta">
    <div class="wa-t">
      <h4>🔧 Butuh Bantuan Teknisi Listrik?</h4>
      <p>Audit langsung, perbaikan arus bocor, cek instalasi rumah</p>
    </div>
    <a class="wa-btn" href="https://wa.me/6285260409720?text=${waMsg}" target="_blank">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      Chat WhatsApp
    </a>
  </div>
  `

  // Animate dev bars
  setTimeout(()=>{
    top5.forEach((d,di)=>{
      const {cost}=calcDev(d.w,d.h)
      const pct=Math.round((cost/maxDevCost)*100)
      const el=document.getElementById('dbar'+di); if(el) el.style.width=pct+'%'
    })
  },150)
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