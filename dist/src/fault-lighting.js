import * as THREE from '../vendor/three.module.js';
export const FAULT_LIGHTS={A:{hemi:2.5,key:2.6,fill:1.1,near:150,far:290,color:'#dde3df'},B:{hemi:.42,key:.4,fill:.18,near:18,far:75,color:'#283337'},C:{hemi:.075,key:.04,fill:.02,near:7,far:38,color:'#10191e'}};
export const LIGHT_LEVELS={A:100,B:35,C:0};
export function selectFaultLight(s,mode){if(!s.fault)return;s.fault.lighting=mode;s.fault.brightness=LIGHT_LEVELS[mode];s.fault.flashlight=mode==='C';}
export function faultLightSettings(f){const level=Math.max(0,Math.min(100,f?.brightness??LIGHT_LEVELS[f?.lighting??'A'])),lo=level<=35?FAULT_LIGHTS.C:FAULT_LIGHTS.B,hi=level<=35?FAULT_LIGHTS.B:FAULT_LIGHTS.A,t=level<=35?level/35:(level-35)/65,c={level};for(const k of['hemi','key','fill','near','far'])c[k]=lo[k]+(hi[k]-lo[k])*t;c.color=new THREE.Color(lo.color).lerp(new THREE.Color(hi.color),t);return c;}
export function updateFaultLighting(v){
 const c=faultLightSettings(v.sim.fault);let i=0;
 for(const o of v.scene.children){if(o.isHemisphereLight)o.intensity=c.hemi;else if(o.isDirectionalLight)o.intensity=i++===0?c.key:c.fill;}
 v.scene.background??=new THREE.Color();v.scene.background.copy(c.color);v.scene.fog??=new THREE.Fog(c.color,c.near,c.far);v.scene.fog.color.copy(c.color);v.scene.fog.near=c.near;v.scene.fog.far=c.far;
 if(!v.flash){v.flash=new THREE.SpotLight(0xffedcf,45,30,Math.PI/7,.65,1);v.scene.add(v.flash,v.flash.target);}
 const soft=!!v.sim.fault?.stage20;v.flash.intensity=soft?(v.sim.fault.torchStrength??18):45;v.flash.angle=soft?.55:Math.PI/7;v.flash.penumbra=soft?1:.65;v.flash.distance=soft?26:30;v.flash.decay=soft?1.4:1;
 v.flash.visible=!!v.sim.fault&&v.sim.fault.flashlight;
 v.flash.position.copy(v.camera.position);const direction=new THREE.Vector3();v.camera.getWorldDirection(direction);v.flash.target.position.copy(v.camera.position).addScaledVector(direction,10);
 if(v.sim.fault?.organic&&!v.residualLights){v.residualLights=new THREE.Group();v.residualLights.userData.nonPhysical=true;for(const[x,y,z,intensity,color]of[[14.7,8.3,12.5,9,0xffd7a5],[12.4,1.8,20.7,6,0xbfd6cd]]){const l=new THREE.PointLight(color,intensity,6,1);l.position.set(x,y,z);v.residualLights.add(l);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.1,6,4),new THREE.MeshBasicMaterial({color}));bulb.position.copy(l.position);v.residualLights.add(bulb);}v.scene.add(v.residualLights);}if(v.residualLights)v.residualLights.visible=!!v.sim.fault?.organic;
 if(v.mats?.lamp){v.normalLampEmission??=v.mats.lamp.emissiveIntensity;v.mats.lamp.emissiveIntensity=v.sim.fault?.organic?0:v.normalLampEmission;}
}
export function installFaultKeys(sim,changed,host=window){
 const held=new Set(),editable=e=>['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable;
 const stop=()=>{held.clear();if(sim.fault)sim.fault.motion.axis=0;};
 host.addEventListener('keydown',e=>{if(!sim.fault||editable(e)||e.ctrlKey||e.metaKey||e.altKey)return;if(['KeyR','KeyF'].includes(e.code)){e.preventDefault();held.add(e.code);sim.fault.motion.setAxis((held.has('KeyR')?1:0)-(held.has('KeyF')?1:0));}if(['KeyQ','KeyC'].includes(e.code)&&sim.fault.climbEnabled&&!e.repeat){e.preventDefault();sim.fault.motion.commandClimb(e.code==='KeyQ'?'up':'down');changed();}if(e.code==='KeyL'&&!e.repeat){e.preventDefault();sim.fault.flashlight=!sim.fault.flashlight;changed();}});
 host.addEventListener('keyup',e=>{if(!held.delete(e.code))return;if(sim.fault)sim.fault.motion.axis=(held.has('KeyR')?1:0)-(held.has('KeyF')?1:0);});
 host.addEventListener('blur',stop);globalThis.document?.addEventListener?.('visibilitychange',()=>{if(document.hidden)stop();});host.addEventListener('focusin',e=>{if(editable(e))stop();});return stop;
}
