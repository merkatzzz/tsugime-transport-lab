import {SLATS,SLAT_PITCH,RECESS,slatPoses} from './portal-geometry.js';
export {SLATS,SLAT_PITCH,RECESS} from './portal-geometry.js';
import {panelKey,panelIntervals} from './portal-state.js';
import * as THREE from '../vendor/three.module.js';
export const PANEL_STEP=.25;
const insideOf=p=>({N:1,S:-1,W:-1,E:1}[p.face]);
export function poseSlats(hinges,height,amount,inside,recess=RECESS){slatPoses(height,amount,inside,recess).forEach((p,i)=>{hinges[i].position.set(0,p.y,p.z);hinges[i].rotation.x=p.rotation;});}
export function addAdaptivePortal(view,portal,body,p){const group=new THREE.Group();portal.add(group);group.userData.wallRole='opening-infill';const bays=[];for(const {a,b}of panelIntervals(p)){const bank=new THREE.Group();group.add(bank);bank.position.x=(a+b)/2-(p.a+p.b)/2;const hinges=[];for(let i=0;i<SLATS;i++){const h=new THREE.Group();bank.add(h);const left=a>p.a?.06:0,right=b<p.b?.06:0;view.cube(h,-(b-a)/2+left,0,-.006,b-a-left-right,p.height/SLATS,.012,'wall');hinges.push(h);}bays.push({a,b,hinges,amount:null});}(view.adaptivePortals??=[]).push({id:body.id,port:p,group,bays});}
export function renderAdaptivePortals(view){for(const portal of view.adaptivePortals??[])for(const bay of portal.bays){const next=view.sim.portalAmounts[panelKey(portal.id,portal.port,bay.a)]??1;if(bay.amount===next)continue;bay.amount=next;poseSlats(bay.hinges,portal.port.height,bay.amount,insideOf(portal.port),portal.port.adaptiveRecess??RECESS);}}
