import {BODIES,BY_ID,LEVELS,placements,connections,isolated,reachable,footprint,boundaryWalls,portSegment,SLOTS,SPINE_PORTS} from './architecture.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const line=(a,b,color='#647263',width=.12,dash='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const colors={pass:'#3c8a60',view:'#d29b35',blocked:'#a67565'};
export function floorSVG(sim,level,{phase=null,selected='R1'}={}){
 const planned=!!phase,p=planned?placements(phase):sim.positions,state=phase??sim.phase,links=connections(state),iso=isolated(state),y=LEVELS[level];
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -6 62 25" role="img" aria-label="${level===1?'第三層':'第二層'} ${state}配置平面図"><defs><pattern id="hatch${level}" patternUnits="userSpaceOnUse" width="1" height="1" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1" stroke="#ac754a" stroke-width=".16"/></pattern></defs><rect x="-2" y="-4" width="50" height="4" fill="#c5cfb8" stroke="#9cae91" stroke-width=".14"/><rect x="-6" y="-4" width="4" height="4" fill="#a6bba4" stroke="#678163" stroke-width=".17"/><text x="-4" y="-1.4" font-size="1.25" text-anchor="middle" fill="#466541">EV</text><text x="22" y="-1.6" font-size="1.05" text-anchor="middle" fill="#72856a">固定回廊</text>`;
 if(level===0){const status=sim.shutter>.01&&!planned?'blocked':links.find(c=>c.b==='ANNEX').status;s+=`<rect x="48" y="4" width="4" height="4" fill="#b3c0a4" stroke="#61785d" stroke-width=".15"/>`;if(!reachable(state).has('ANNEX'))s+=`<rect x="48" y="4" width="4" height="4" fill="url(#hatch${level})"/>`;s+=`<text x="50" y="5.8" text-anchor="middle" font-size=".65" fill="#496143">固定</text><text x="50" y="6.8" text-anchor="middle" font-size=".65" fill="#496143">観察室</text>${line([48,5],[48,7],colors[status],.3)}`;}
 for(const b of BODIES){const t=p[b.id];if(Math.abs(t.y-y)>.1)continue;s+=`<g data-id="${b.id}" transform="translate(${t.x} ${t.z})">`;
  for(const [cx,cz] of b.cells)s+=`<rect x="${cx*8}" y="${cz*8}" width="8" height="8" fill="${b.color}" stroke="${selected===b.id?'#354f43':'#dce3d3'}" stroke-width="${selected===b.id?.25:.13}"/><text x="${cx*8+.45}" y="${cz*8+7.4}" font-size=".75" fill="#385046">${b.id}.${b.cells.indexOf(b.cells.find(c=>c[0]===cx&&c[1]===cz))+1}</text>`;
  for(const o of b.solids)s+=`<rect x="${o.x}" y="${o.z}" width="${o.w}" height="${o.d}" fill="#667768" opacity=".7"/>`;
  for(const o of b.furniture)s+=`<rect x="${o.x}" y="${o.z}" width="${o.w}" height="${o.d}" fill="#666e55" opacity=".35"/>`;
  for(const l of [...boundaryWalls(b),...b.walls])s+=line(l.a,l.b,'#4f6558',.13);
  for(const d of b.doors){s+=line(d.a,d.b,d.locked?'#a76d56':'#e8ead9',.23,d.glass?'.25 .15':'');}
  for(const q of b.ports){const l=portSegment(b,q),c=links.find(c=>(c.a===b.id&&c.face===q.face||c.b===b.id&&c.face==='E'&&q.face==='W'));const status=sim.shutter>.01&&!planned?'blocked':c?.status??'blocked';s+=line(l.a,l.b,colors[status],.34);}
  if(iso.includes(b.id))for(const [cx,cz]of b.cells)s+=`<rect x="${cx*8}" y="${cz*8}" width="8" height="8" fill="url(#hatch${level})" pointer-events="none"/>`;
  for(const label of b.labels)s+=`<text x="${label.x}" y="${label.z}" text-anchor="middle" font-size="${label.name.length>7?.62:.76}" fill="#344e43">${esc(label.name)}</text>`;
  s+='</g>';
 }
 for(let i=0;i<4;i++){const [a,b]=SPINE_PORTS[i];s+=line([SLOTS[i]+a,0],[SLOTS[i]+b,0],sim.shutter>.01&&!planned?'#a67565':'#f1efdd',.17);}
 if(!planned&&Math.abs(sim.player.y-y)<.1){const p=sim.player;s+=`<circle cx="${p.x}" cy="${p.z}" r=".5" fill="#cd6045" stroke="#f7f7e9" stroke-width=".17"/>${line([p.x,p.z],[p.x+Math.sin(p.yaw)*1.7,p.z+Math.cos(p.yaw)*1.7],'#cd6045',.18)}`;}
 s+=`<text x="48" y="18" font-size=".85" text-anchor="end" fill="#89967b">N ↑　8m ━</text></svg>`;return s;
}
export function deckSVG(sim){
 let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-9 -10 66 100" role="img" aria-label="搬送空間の占有と経路"><rect x="-.2" y="-.2" width="48.4" height="82.4" fill="#d9e1d1" stroke="#a3b49a" stroke-width=".2"/><rect x="48" y="4" width="4" height="4" fill="#9faf94" opacity=".6"/><text x="50" y="6.5" text-anchor="middle" font-size="1" fill="#5d7654">固定</text>';
 for(let z=0;z<82;z+=8)s+=line([0,z],[48,z],'#bbc9b0',.1);for(let x=0;x<=48;x+=8)s+=line([x,0],[x,82],'#bbc9b0',.1);
 s+='<text x="24" y="-5" text-anchor="middle" font-size="1.8" fill="#5c7555">専用搬送デッキ +11m</text>';
 for(const [z,label]of [[0,'ドック'],[20,'横行路'],[40,'近方ベイ'],[64,'遠方ベイ']])s+=`<text x="-2" y="${z+2}" text-anchor="end" font-size="1.4" fill="#6d8363">${label}</text>`;
 if(sim.plan)for(const st of sim.plan.stages)for(const m of st.motions){const f=footprint(BY_ID[m.id]);s+=line([m.from.x+f.w/2,m.from.z+f.d/2],[m.to.x+f.w/2,m.to.z+f.d/2],BY_ID[m.id].color,.2,'.7 .5');}
 for(const b of BODIES){const p=sim.positions[b.id],f=footprint(b);s+=`<g data-id="${b.id}" transform="translate(${p.x} ${p.z})" opacity="${Math.abs(p.y-11)<.1?1:.45}">`;for(const [cx,cz]of b.cells)s+=`<rect x="${cx*8+.1}" y="${cz*8+.1}" width="7.8" height="7.8" fill="${b.color}" stroke="#4f6b55" stroke-width=".15"/>`;s+=`<text x="${f.w/2}" y="${f.d/2}" text-anchor="middle" font-size="1.7" fill="#334e41">${b.id}</text><text x="${f.w/2}" y="${f.d/2+2}" text-anchor="middle" font-size="1.1" fill="#425d49">y ${p.y.toFixed(1)}m</text></g>`;}
 const p=sim.player;s+=`<circle cx="${p.x}" cy="${p.z}" r=".65" fill="#cd6045" stroke="#fff" stroke-width=".2"/></svg>`;return s;
}
