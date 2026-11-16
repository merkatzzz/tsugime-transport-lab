import {startFault,endFault} from './fault-experiment.js';import {faultMapSVG} from './fault-map.js';
export function installFaultControls({sim,$,setView,clearKeys,changed,viewMode=()=>'overview'}){
 let normalView='overview',normalHide=false;
 const action=fn=>()=>{try{fn();}catch(e){sim.message=e.message;}clearKeys();changed();};
 $('#fault-start').onclick=action(()=>{normalView=viewMode();normalHide=!!$('#hide-npcs').checked;startFault(sim);$('#hide-npcs').checked=false;$('#hide-npcs').onchange?.({target:{checked:false}});setView('explore');});
 $('#fault-end').onclick=action(()=>{endFault(sim);$('#hide-npcs').checked=normalHide;$('#hide-npcs').onchange?.({target:{checked:normalHide}});setView(normalView);});
 $('#fault-walk').onclick=action(()=>sim.fault?.motion.walkMode());
 $('#fault-recover').onclick=action(()=>sim.fault?.motion.recover());
 for(const[id,axis]of[['fault-up',1],['fault-down',-1]]){const button=$('#'+id),stop=()=>{if(sim.fault)sim.fault.motion.axis=0;};button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);sim.fault?.motion.setAxis(axis);};button.onpointerup=button.onpointercancel=button.onlostpointercapture=stop;}
 window.addEventListener('blur',()=>{if(sim.fault)sim.fault.motion.axis=0;});
 return{render(){const active=!!sim.fault;$('#fault-start').disabled=active||sim.mode!=='idle'||sim.anyLiftActive;for(const id of['fault-end','fault-up','fault-down','fault-walk','fault-recover'])$('#'+id).disabled=!active;
 for(const id of['start','pause','apply-experiment','experiment-size','experiment-method','save-life','load-life','reset','auto-enabled','exception-add','exception-remove','exception-exit','lift-button','lab-debug-reconnect','inventory-open','item-use-open','trade-open','parcel-get','hide-npcs'])$('#'+id).disabled=active;
 document.querySelectorAll('[data-location]').forEach(b=>b.disabled=active);
 document.querySelectorAll('[data-plan]').forEach(b=>b.disabled=active);
 $('#fault-status').textContent=active?'故障実験 / '+(sim.fault.motion.control==='free'?'開発専用の上下移動（押している間）':sim.fault.motion.grounded?'通常歩行・足場あり':'通常歩行・自由落下'):'通常ABC運用 / 故障試験は指定状態を再現';
 if(!active)return false;
 $('#life-panel').hidden=true;$('#dialogue').hidden=true;$('#booth-view').hidden=true;$('#lift-menu').hidden=true;$('#life-clock').textContent='故障試験中：生活時計停止';$('#life-status').textContent='通常の生活状態は復帰時に戻します。';
 const p=sim.player,m=sim.fault.motion;$('#sequence').textContent='A → B（故障停止）';$('#progress').style.width=(sim.fault.time/sim.plan.duration*100)+'%';$('#reachable-count').textContent='—';$('#camera-caption').textContent='FAULT EXPERIMENT / AB 4.3s';$('#scene-title').textContent='室内から、停止したチャンクの屋根へ';$('#scene-subtitle').textContent='故障配置を保持 / 床のない場所では自由落下';$('#experiment-summary').textContent='故障試験の検証済み設定：一回り・協調搬送';$('#phase-badge').textContent='故障 A→B';$('#phase-description').textContent='4.3秒の中間配置で固定';$('#transfer-status').textContent='故障停止・実形状で探索';$('#stage-label').textContent='SM0東口→SM1の屋根。開口の先に継手床は追加しません。';$('#player-location').textContent=(p.owner??'搬送空間')+' / '+(m.control==='free'?'開発上下移動':m.grounded?'足場上':'落下中');$('#coordinates').textContent=`X ${p.x.toFixed(2)} Y ${p.y.toFixed(2)} Z ${p.z.toFixed(2)}`;$('#message').textContent=sim.message;
 $('#map-upper').innerHTML=faultMapSVG(sim);$('#map-lower').innerHTML='<p>故障時は上図に全高さの実位置を投影しています。</p>';$('#map-first').innerHTML='';$('#map-deck').innerHTML=faultMapSVG(sim);$('#map-note').textContent='通常のA/B完成配置の経路グラフは表示しません。ラベルのYは停止床高です。';$('#selected-detail').textContent='故障中：完成配置の接続診断は無効。外形は俯瞰、足場は実際のメッシュで確認してください。';return true;}};
}
