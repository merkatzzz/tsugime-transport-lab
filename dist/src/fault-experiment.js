import {ORGAN_START} from './fault-organs.js';
import {FAULT_PRESET,faultPlan,faultPositions} from './fault-scenario.js';
import {snapshot,restore} from './save-life.js';import {connections,placements} from './architecture.js';
import {tickPortals} from './portal-state.js';import {geometryView,worldFromView} from './fault-geometry.js';import {FaultMotion} from './fault-physics.js';
export function startFault(s,{route=false,organic=false}={}){
 if(s.fault)return false;
 const normal=snapshot(s),runtime={speed:s.speed,automation:{enabled:s.automation.enabled,interval:s.automation.interval,idle:s.automation.idle,returnRequested:s.automation.returnRequested,returnRegion:s.automation.returnRegion,returnSteps:s.automation.returnSteps,exceptions:[...s.automation.exceptions]},transition:s.experience.transitionDuration};
 const plan=faultPlan(route||organic),positions=faultPositions(route||organic),initial=placements('A');
 const same=id=>['x','y','z','angle'].every(k=>Math.abs((positions[id][k]??0)-(initial[id][k]??0))<1e-7);
 s.reset({size:'ring1',method:'cooperative'});s.positions=positions;s.mode='fault';s.shutter=1;s.plan=plan;s.elapsed=FAULT_PRESET.time;s.player={...(organic?ORGAN_START:FAULT_PRESET.start)};
 s.fault={id:FAULT_PRESET.id+(organic?'-organic17':route?'-route16':''),organic,lighting:organic?'B':'A',brightness:organic?35:100,flashlight:false,manualPorts:organic?['V3:N']:route?['SM1:W']:[],time:FAULT_PRESET.time,openPorts:organic?['R2:E','V3:S']:[...FAULT_PRESET.openPorts,...(route?['SM1:N']:[])],normal,runtime,connections:connections('A',s.experiment,s.doors).filter(c=>c.permanent&&same(c.bodyA)&&same(c.bodyB)),motion:null};
 s.invalidate();tickPortals(s,0,true);
 let v,world;try{v=geometryView(s);world=worldFromView(v);if(!world.clear(s.player))throw Error('試験開始位置が建築に重なります');s.fault.motion=new FaultMotion(s,world,s.player);}catch(error){world?.dispose();s.fault=null;restore(s,normal);throw error;}finally{v?.dispose();}
 s.message=organic?'第17実験：R2東→L1屋根→赤い繊維→V3屋根→V1屋根→繊維を上ってV3南口。北口はE手動。':'故障実験：A→B 4.3秒で固定。SM0東シャッターからSM1の屋根へ。上下操作は開発専用です。';return true;
}
export function endFault(s){if(!s.fault)return false;const {normal,runtime,motion}=s.fault;motion.world.dispose();s.fault=null;restore(s,normal);s.speed=runtime.speed;Object.assign(s.automation,runtime.automation,{exceptions:new Set(runtime.automation.exceptions)});s.experience.transitionDuration=runtime.transition;s.message='故障前の通常状態へ戻しました。';return true;}
