import {Stage21Experiment} from './stage21-experiment.js';
import {stage21MapSVG} from './stage21-view.js';
import {RAIL_NODES} from './stage21-rail.js';

export function installStage21Controls({sim,$,getSide,onStart,onEnd,changed,host=window}){
  const frozen=new Map();
  const busy=()=>sim.mode!=='idle'||!!sim.fault||sim.anyLiftActive||sim.experience.blocking||!!sim.items.mode;
  function start(kind){
    if(getSide()||busy())return false;
    const side=new Stage21Experiment(kind);
    for(const node of document.querySelectorAll('header .header-actions button:not(#help-button), .viewbar, aside, .transport-controls, #fault-controls, .transition-config')){frozen.set(node,!!node.inert);node.inert=true;}
    document.body?.classList.add('stage21-active');onStart(side);changed();return true;
  }
  $('#side-start-rail').onclick=()=>start('rail');$('#side-start-canal').onclick=()=>start('canal');
  $('#side-end').onclick=()=>{
    if(!getSide())return;onEnd();for(const[node,inert]of frozen)node.inert=inert;frozen.clear();document.body?.classList.remove('stage21-active');changed();
  };
  $('#side-interact').onclick=()=>{getSide()?.interact();changed();};
  $('#side-go').onclick=()=>{getSide()?.depart();changed();};
  for(const[kind,id]of[['up','side-up'],['down','side-down']])$('#'+id).onclick=()=>{getSide()?.climb(kind);changed();};
  $('#side-recover').onclick=()=>{getSide()?.recover();changed();};
  $('#side-flash').onclick=()=>{const s=getSide();if(s)s.model.fault.flashlight=!s.model.fault.flashlight;changed();};
  $('#side-climb-height').onchange=e=>{const s=getSide();if(s&&!s.motion.climbMove)s.model.fault.climbHeight=Number(e.target.value)===8?8:6;changed();};
  $('#side-brightness').oninput=e=>{const s=getSide();if(s)s.model.fault.brightness=Math.max(0,Math.min(100,Number(e.target.value)));};
  $('#side-replay').onclick=()=>{const s=getSide();if(s?.mapId==='canal-upper'){s.eventFired=false;s.triggerWaste();}changed();};
  $('#side-routes').onclick=e=>{const id=e.target.closest?.('[data-side-route]')?.dataset.sideRoute;if(id)getSide()?.selectRoute(id);changed();};
  host.addEventListener('keydown',e=>{
    const s=getSide();if(!s||e.repeat||e.ctrlKey||e.altKey||e.metaKey||['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName)||e.target?.isContentEditable||$('#help').open)return;
    if(['KeyQ','KeyC','KeyL','Space'].includes(e.code)){
      e.preventDefault();if(e.code==='KeyL')s.model.fault.flashlight=!s.model.fault.flashlight;
      else if(e.code==='Space')s.depart();else s.climb(e.code==='KeyQ'?'up':'down');changed();
    }
  });
  function render(){
    const s=getSide();$('#side-start-rail').disabled=!!s||busy();$('#side-start-canal').disabled=!!s||busy();$('#side-end').disabled=!s;$('#side-active').hidden=!s;
    if(!s)return false;
    const f=s.model.fault,targets=s.motion.climbTargets(),near=s.nearby();
    $('#side-status').textContent=s.message;$('#side-interact').textContent=near[0]?.name??'E：近くの対象なし';$('#side-interact').disabled=!near.length;
    $('#side-flash').textContent='懐中電灯：'+(f.flashlight?'ON':'OFF')+'（L）';$('#side-brightness').value=f.brightness;$('#side-climb-height').value=f.climbHeight;$('#side-climb-height').disabled=!!s.motion.climbMove||s.aboard||!!s.transition;
    for(const[k,id]of[['up','side-up'],['down','side-down']]){$('#'+id).hidden=!targets[k]||s.aboard||!!s.transition;}
    $('#side-climb-diagnosis').textContent=s.kind==='canal'?s.diagnosis:'';
    $('#side-go').hidden=s.kind!=='rail';$('#side-go').disabled=!s.aboard||s.cart.moving||!!s.transition;
    $('#side-go').textContent=s.cart.moving?'走行中 → 自動停止':'発進 / 折返し（Space）';
    let html='';if(s.kind==='rail'&&s.aboard&&!s.cart.moving)for(const id of s.cart.choices){const children=RAIL_NODES[s.cart.node].children,forward=children?.includes(id),label=children?(forward?(id===children[0]?'本線を進む':'支線へ入る'):'共通側へ戻る'):'折返し方向';html+='<button data-side-route="'+id+'" aria-pressed="'+(id===s.cart.selected)+'">'+label+(id===s.cart.selected?' ✓':'')+'</button>';}
    if($('#side-routes').innerHTML!==html)$('#side-routes').innerHTML=html;
    $('#side-map').innerHTML=stage21MapSVG(s);$('#side-inventory').textContent='試験内の回収部品 '+(s.model.items.counts.scrap??0)+'点'+(s.collectedNames.length?'：'+s.collectedNames.join('、'):'');
    $('#side-replay').hidden=s.mapId!=='canal-upper';$('#side-replay').disabled=!!s.transition;
    $('#camera-caption').textContent=s.kind==='rail'?'STAGE 21 / FIXED UNDERGROUND RAIL':'STAGE 21 / FIXED CANAL';
    $('#scene-title').textContent=s.kind==='rail'?(s.mapId==='rail-ground'?'地下への仮入口':s.aboard?'一人乗り軌道車 / 視点自由':RAIL_NODES[s.cart.node].name):s.mapId==='canal-home'?'固定用水路 / 潜水地点':'上流用水路 / 6m昇降と10m高壁';
    $('#scene-subtitle').textContent='独立試験区域 / 通常施設の配置・時計・所持品は保持';$('#player-location').textContent=s.aboard?'乗車中 / 身体移動なし':'徒歩探索 / 通常歩行に慣性なし';
    $('#coordinates').textContent='X '+s.player.x.toFixed(1)+' Y '+s.player.y.toFixed(1)+' Z '+s.player.z.toFixed(1);
    $('#view-hint').textContent='ドラッグで視線 · WASD / Shift · E 操作 · Q/C 昇降 · L 懐中電灯';$('#message').textContent=s.message;
    return true;
  }
  return {start,render,frame(){const s=getSide();$('#side-transition').hidden=!s?.transition;$('#side-transition').style.opacity=s?.fade??0;}};
}
