import * as THREE from '../vendor/three.module.js';
export const FAULT_LIGHTS={A:{hemi:2.5,key:2.6,fill:1.1,near:150,far:290,color:'#dde3df'},B:{hemi:.42,key:.4,fill:.18,near:18,far:75,color:'#283337'},C:{hemi:.075,key:.04,fill:.02,near:7,far:38,color:'#10191e'}};
export function updateFaultLighting(v){
 const mode=v.sim.fault?.lighting??'A',c=FAULT_LIGHTS[mode];let i=0;
 for(const o of v.scene.children){if(o.isHemisphereLight)o.intensity=c.hemi;else if(o.isDirectionalLight)o.intensity=i++===0?c.key:c.fill;}
 v.scene.background??=new THREE.Color();v.scene.background.set(c.color);v.scene.fog??=new THREE.Fog(c.color,c.near,c.far);v.scene.fog.color.set(c.color);v.scene.fog.near=c.near;v.scene.fog.far=c.far;
 if(!v.flash){v.flash=new THREE.SpotLight(0xffedcf,45,30,Math.PI/7,.65,1);v.scene.add(v.flash,v.flash.target);}
 v.flash.visible=!!v.sim.fault&&mode==='C'&&v.sim.fault.flashlight;
 v.flash.position.copy(v.camera.position);const direction=new THREE.Vector3();v.camera.getWorldDirection(direction);v.flash.target.position.copy(v.camera.position).addScaledVector(direction,10);
}
export function installFaultKeys(sim,changed,host=window){
 const held=new Set(),editable=e=>['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable;
 const stop=()=>{held.clear();if(sim.fault)sim.fault.motion.axis=0;};
 host.addEventListener('keydown',e=>{if(!sim.fault||editable(e))return;if(['KeyR','KeyF'].includes(e.code)){e.preventDefault();held.add(e.code);sim.fault.motion.setAxis((held.has('KeyR')?1:0)-(held.has('KeyF')?1:0));}if(e.code==='KeyL'&&!e.repeat){e.preventDefault();sim.fault.flashlight=!sim.fault.flashlight;changed();}});
 host.addEventListener('keyup',e=>{if(!held.delete(e.code))return;if(sim.fault)sim.fault.motion.axis=(held.has('KeyR')?1:0)-(held.has('KeyF')?1:0);});
 host.addEventListener('blur',stop);globalThis.document?.addEventListener?.('visibilitychange',()=>{if(document.hidden)stop();});host.addEventListener('focusin',e=>{if(editable(e))stop();});return stop;
}
