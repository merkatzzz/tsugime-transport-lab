// South district: three anchored buildings and three independently transported cells.
// All routing uses ordinary ports, room envelopes and the existing deck scheduler.
export const SOUTH_IDS=['SC0','SC1','SM0','SM1','SM2','SM3'];
export const SOUTH_FIXED=['SC0','SM0','SM3'];
export const SOUTH_PURPOSE={SC0:'居住区から南へ曲がる固定玄関。G5南口と新商店街を結ぶ',SC1:'Cだけ南の旧広間跡へ挿入し、居住区と回遊街路を結ぶ独立廊下',SM0:'南側商店街の固定西玄関。Cでは南西の大部屋への横入口になる',SM1:'南側商店街の東通路と小店舗。Bは第一層の大部屋南口へ搬送',SM2:'回遊路の可動南東角。Cで環を閉じ、Aでは空欄を挟む保管ベイへ移る',SM3:'曲がる共用通路と店舗を持つ南西の固定街路'};
const port=(id,face,a=3,b=5)=>({id,face,a,b,height:2.5,role:'boundary-connector'});
export function addSouthDistrict(bodies){
 const get=id=>bodies.find(b=>b.id===id);
 get('G5').ports.push(port('south-district','S',3.4,5.4));
 get('BR1').ports.push(port('market','E'));
 get('BR2').ports.push(port('north','N'),port('south','S'));
 get('BR3').ports.push(port('south','S'));
 for(const id of SOUTH_IDS){const corridor=id.startsWith('SC'),b={id,name:{SC0:'南玄関・固定の折れ廊下',SC1:'C周期・挿入接続廊下',SM0:'南商店街・西玄関と小店舗',SM1:'南商店街・東通路と小店舗',SM2:'南商店街・可動の南東角',SM3:'南商店街・固定の南西角'}[id],generation:14,southMarket:!corridor,use:corridor?'corridor':'commerce',zone:'commerce',color:corridor?'#9cae9b':'#bca982',cells:[[0,0]],ceiling:3.1,ports:[],walls:[],doors:[],solids:[],furniture:[],privateRooms:[],roofAreas:[{x:0,z:0,w:8,d:8,height:3.1}],labels:[]};
 b.ports=(id==='SC0'||id==='SC1'?['N','S']:id==='SM0'?['N','E','S','W']:id==='SM1'?['N','W','S']:id==='SM2'?['N','W']:['N','E']).map(f=>port(f,f));
 if(!corridor){const r={x:5.3,z:.5,w:2.1,d:2.2};b.privateRooms.push(r);b.doors.push({id:id+'-shop',label:'小店舗入口',a:[5.3,1.05],b:[5.3,2.15],kind:'hinge',hinge:'a',swing:-90,open:false});b.furniture.push({x:6.65,z:.8,w:.4,d:1.3,h:.85,color:'wood'},{x:5.65,z:.7,w:.7,d:.3,h:1.2,color:'wood'});b.labels.push({name:'小店舗',x:6.3,z:1.7});}
 b.labels.push({name:corridor?'南への共用廊下':'曲がる共用街路',x:3.9,z:4.1});bodies.push(b);
 }
}
export function southPlacements(phase,p){
 const b=phase==='B',c=phase==='C';
 Object.assign(p,{SC0:{x:42,y:0,z:41.6},SC1:c?{x:42,y:0,z:50}:{x:33.6,y:6.4,z:50},SM0:{x:42,y:0,z:58.4},SM1:{x:50.4,y:b?-12.8:0,z:58.4},SM2:c?{x:50.4,y:0,z:66.8}:b?{x:50.4,y:-12.8,z:66.8}:{x:67.2,y:0,z:66.8},SM3:{x:42,y:0,z:66.8}});
 for(const id of['D1','D2','D3','D4'])p[id]={...p[id],z:p[id].z-8.4};
 if(b)p.S1={...p.S1,z:p.S1.z-8.4};
 if(b)p.BR2={x:25.2,y:0,z:50};
 if(c)Object.assign(p,{BR1:{x:33.6,y:0,z:58.4},BR2:{x:25.2,y:0,z:66.8},BR3:{x:33.6,y:0,z:66.8}});
 return p;
}
