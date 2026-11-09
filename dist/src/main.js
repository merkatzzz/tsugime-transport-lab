import {Simulation} from './simulation.js';
import {View} from './view.js';
import {BODIES,BY_ID,PHASES,NEXT,connections,isolated,reachable,footprint} from './architecture.js';
import {planTransfer,validatePlan} from './transport.js';
import {floorSVG,deckSVG} from './maps.js';
const $=s=>document.querySelector(s),sim=new Simulation();let view=null;
if(['localhost','127.0.0.1'].includes(location.hostname))document.querySelectorAll('[data-hosted-source]').forEach(a=>a.hidden=true);
try{view=new View($('#viewport'),sim);}catch(e){$('#webgl-error').hidden=false;console.error('WebGL initialization failed',e);}
let selected='R1',planPreview=null,mapView='floors',lastUI=0,keys=new Set(),dragging=false,lastPointer=null;
const validations=Object.keys(PHASES).map(p=>({from:p,to:NEXT[p],...validatePlan(planTransfer(p,NEXT[p]))}));
$('#validation-results').innerHTML=validations.map(v=>`<p>${v.from} → ${v.to}：${v.ok?'干渉 0':'検証失敗'} / ${v.stages}区間 / ${v.checks}検査 / 同時${v.maxConcurrent}体</p>`).join('');
function setView(mode){view?.setMode(mode);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===mode));$('#crosshair').hidden=mode!=='explore';$('.touch-controls').classList.toggle('active',mode==='explore'&&matchMedia('(pointer:coarse)').matches);$('#camera-caption').textContent=mode==='overview'?'DEVELOPER CUTAWAY':'FIRST PERSON / COLLISION ENABLED';$('#scene-title').textContent=mode==='overview'?'生活階と、その間の搬送空間':'壁・扉・開口を、目の高さで確かめる';$('#view-hint').textContent=mode==='overview'?'ドラッグで回転 · ホイールで拡大縮小':'WASD 移動 · ← → 回転 · ドラッグで視線 · E 操作';}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#floor-select').onchange=e=>{if(view){view.floor=e.target.value;if(view.floor!=='all'){view.orbit.target.set(22,Number(view.floor)+.5,5);view.orbit.distance=50;view.orbit.pitch=.9;}else{view.orbit.target.set(22,14,22);view.orbit.distance=96;}}};
$('#envelope').onchange=e=>{if(view)view.envelopes=e.target.checked;};$('#route').onchange=e=>{if(view)view.routes=e.target.checked;};
$('#start').onclick=()=>{planPreview=null;sim.startTransfer();renderUI();};$('#pause').onclick=()=>{sim.paused=!sim.paused;renderUI();};$('#cancel').onclick=()=>{sim.cancelWarning();renderUI();};
$('#speed').onchange=e=>sim.speed=Number(e.target.value);$('#reset').onclick=()=>{sim.reset();sim.experimental=$('#experimental').checked;sim.speed=Number($('#speed').value);planPreview=null;if(view){view.pathKey='';view.pathGroup.clear();}renderUI();};
$('#experimental').onchange=e=>{sim.experimental=e.target.checked;sim.message=sim.experimental?'孤立実験を許可しました。通常の退避防止を解除します。':'通常の退避保護を有効にしました。';};
$('#rescue').onclick=()=>sim.rescue();$('#lift-button').onclick=()=>sim.useLift();$('#touch-e').onclick=()=>sim.interact();
$('#help-button').onclick=()=>$('#help').showModal();$('#help-close').onclick=()=>$('#help').close();$('#help').onclick=e=>{if(e.target===$('#help')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
document.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>{mapView=b.dataset.map;document.querySelectorAll('[data-map]').forEach(q=>q.classList.toggle('active',q===b));$('#map-floors').hidden=mapView!=='floors';$('#map-deck').hidden=mapView!=='deck';renderUI();});
document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{planPreview=b.dataset.plan==='live'?null:b.dataset.plan;renderUI();});
document.querySelectorAll('.map').forEach(m=>m.onclick=e=>{const b=e.target.closest('[data-id]');if(b){selected=b.dataset.id;renderUI();}});
const canvas=view?.renderer.domElement;
canvas?.addEventListener('pointerdown',e=>{dragging=true;lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.focus();});
canvas?.addEventListener('pointermove',e=>{if(!dragging||!lastPointer)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;if(view.mode==='overview'){view.orbit.yaw-=dx*.008;view.orbit.pitch=Math.max(.15,Math.min(1.5,view.orbit.pitch+dy*.006));}else{sim.player.yaw-=dx*.004;sim.player.pitch=Math.max(-1.2,Math.min(1.2,sim.player.pitch-dy*.004));}lastPointer={x:e.clientX,y:e.clientY};});
canvas?.addEventListener('pointerup',()=>{dragging=false;lastPointer=null;});canvas?.addEventListener('pointercancel',()=>{dragging=false;lastPointer=null;});
canvas?.addEventListener('wheel',e=>{if(view.mode==='overview'){e.preventDefault();view.orbit.distance=Math.max(18,Math.min(165,view.orbit.distance+e.deltaY*.045));}},{passive:false});
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName)||$('#help').open)return;if(['KeyW','KeyS','KeyA','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyE','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='KeyE'&&!e.repeat)sim.interact();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
const touchKeys={forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD'};document.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(touchKeys[b.dataset.move]);};b.onpointerup=b.onpointercancel=()=>keys.delete(touchKeys[b.dataset.move]);});
function renderUI(){
 const active=sim.mode!=='idle',own=sim.owner,level=Math.abs(sim.player.y-24)<.1?'第三層':Math.abs(sim.player.y)<.1?'第二層':'搬送空間';
 $('#phase-badge').textContent=`周期 ${sim.phase}`;$('#phase-description').textContent=PHASES[sim.phase].label;$('#reachable-count').innerHTML=`${BODIES.filter(b=>sim.liveReachable.has(b.id)).length}<span>/ 8</span>`;
 $('#collision-count').textContent=sim.lastCheck?.errors.length??0;$('#player-location').textContent=`${level} / ${BY_ID[own]?.name??(own==='ANNEX'?'固定観察室':own==='lift'?'固定エレベーター':'固定回廊')}`;$('#coordinates').textContent=`X ${sim.player.x.toFixed(1)}　Y ${sim.player.y.toFixed(1)}　Z ${sim.player.z.toFixed(1)}`;
 $('#message').textContent=sim.message;$('#sequence').innerHTML=`${active?sim.plan?.from??sim.phase:sim.phase} <i>→</i> ${active?sim.plan?.to??sim.next:sim.next}`;
 $('#start').disabled=active||sim.liftActive;$('#start').innerHTML=`${sim.next} へ搬送 <span>→</span>`;$('#pause').disabled=!active&&!sim.liftActive;$('#pause').textContent=sim.paused?'▶':'Ⅱ';$('#pause').title=sim.paused?'再開':'一時停止';$('#cancel').hidden=!['warning','evacuate'].includes(sim.mode);
 const statuses={idle:'ドック固定・探索可能',warning:`退避警告 ${Math.max(0,5-sim.elapsed).toFixed(1)}秒`,evacuate:'安全確認・退避待ち',closing:'シャッター閉鎖・固定解除',moving:'搬送中・探索操作停止',opening:'再固定・シャッター開放'};
 $('#transfer-status').textContent=(sim.paused?'一時停止 / ':'')+statuses[sim.mode];
 const st=sim.plan?.stages[sim.stageIndex];$('#stage-label').textContent=sim.mode==='moving'?`${sim.stageIndex+1}/${sim.plan.stages.length}　${st?.label??'到着確認'}`:'専用搬送デッキを経由する実移動';
 const pct=sim.mode==='moving'?sim.elapsed/sim.plan.duration:sim.mode==='opening'?1:0;$('#progress').style.width=`${Math.min(100,pct*100)}%`;
 document.querySelectorAll('[data-plan]').forEach(b=>b.classList.toggle('active',b.dataset.plan===(planPreview??'live')));
 $('#map-upper').innerHTML=floorSVG(sim,1,{phase:planPreview,selected});$('#map-lower').innerHTML=floorSVG(sim,0,{phase:planPreview,selected});if(mapView==='deck')$('#map-deck').innerHTML=deckSVG(sim);
 $('#map-note').textContent=planPreview?`計画図 ${planPreview}：${PHASES[planPreview].label}。3Dの実配置は周期 ${sim.phase}。`:sim.mode==='moving'?'生活階を離れた搬送体は平面図から消えます。「搬送デッキ」で現在位置と占有を確認。':'現在の3D空間と同じ配置。区画を選ぶと詳細を表示。';
 const b=BY_ID[selected],f=footprint(b),link=(planPreview?connections(planPreview):sim.liveConnections).find(c=>c.a===b.id&&c.face==='N');$('#selected-id').textContent=b.id;$('#selected-name').textContent=b.name;$('#selected-size').textContent=`${b.cells.length}チャンク / ${f.w} × ${f.d} × 5m 外形`;
 $('#selected-detail').innerHTML=`<b>入口の有効重なり ${link.width.toFixed(2)}m</b> · ${link.status==='pass'?'通行可能':link.status==='view'?'視認のみ・身体通過不可':'遮断'}<br>室内高 ${b.ceiling.toFixed(1)}m / ${b.use==='residential'?'居住':b.use==='commerce'?'商業':'共同'}空間<br>${b.cells.length>1?'全構成チャンク・壁・内装を一体搬送。':'部屋と廊下・構造壁を同一外形に収容。'}${b.id==='R2'?'<br>2号室：鍵 / 3号室：観察窓・進入不可':''}${isolated(planPreview??sim.phase).includes(b.id)?'<br><b>固定回廊から到達不能。次周期で再接続。</b>':''}`;
 $('#history').innerHTML=sim.history.length?sim.history.map(x=>`<p>${x}</p>`).join(''):'搬送記録はまだありません。';
}
let last=performance.now();function frame(t){const dt=Math.min(.1,(t-last)/1000);last=t;
 if(view?.mode==='explore'&&!$('#help').open){let forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);if(['idle','warning','evacuate'].includes(sim.mode)&&!sim.liftActive){sim.player.yaw+=(keys.has('ArrowLeft')?1:0)*dt*1.7-(keys.has('ArrowRight')?1:0)*dt*1.7;const len=Math.hypot(forward,side)||1,dist=dt*2.8;sim.move((Math.sin(sim.player.yaw)*forward-Math.cos(sim.player.yaw)*side)/len*dist,(Math.cos(sim.player.yaw)*forward+Math.sin(sim.player.yaw)*side)/len*dist);}}
 sim.tick(dt);view?.render();if(t-lastUI>100){renderUI();lastUI=t;}requestAnimationFrame(frame);
}
renderUI();requestAnimationFrame(frame);
// Inspectable public laboratory state for reproducible browser QA; no persistent game storage.
window.lab={sim,view,setView,validations,snapshot:()=>({phase:sim.phase,mode:sim.mode,positions:structuredClone(sim.positions),player:{...sim.player},liftY:sim.liftY,webgl:!!view,renderer:view?.renderer.getContext().getParameter(view.renderer.getContext().RENDERER)})};
