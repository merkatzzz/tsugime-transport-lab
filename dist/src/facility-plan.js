import {DISTRICT_PURPOSE,districtPlacements} from './stage11-layout.js';
// Facility-wide phase design. Every body needs an explicit purpose, including deliberate waits.
// A transportable body is not fixed hardware merely because its three docking poses coincide.
const groups=[
 [1,['R1','R2','R3','R4','T1','T2','H1','L1']], [3,['J1','J2','J3','C0']],
 [4,['E1','E2','E3','E4']], [5,['H2','K1','K2','M1']],
 [6,['U1','U2','U3','U4','U5','N1','N2','N3','N4','S1','D1','D2','D3','D4']],
 [7,['V1','V2','V3','A3','Q1','W1']], [8,['G1','G2','G3','G4','G5']], [9,['J9','P9']], [11,['RH1','CP1','MK1','SH1','SH2','LB1']]
];
const purpose={...DISTRICT_PURPOSE,
 R1:'同じ住戸からの近道比較の基準として待機',R4:'第二層主EVの着床先と生活通路を維持',
 T1:'生活用品店と参照経路の目的地として待機',T2:'第二層店舗・東翼への接続を維持',
 J2:'C0挿入・撤収に対する分岐の基準点として待機',K1:'第一層主EVの着床先として待機',K2:'第一層探索水路・生活通路の基準点として待機',
 U1:'第三層東翼の入口を維持し、U2との接続方向を切り替える',U3:'第二層東翼入口を維持',U4:'N2前室への恒常経路を維持',U5:'第一層住宅群への六メートル共用入口を維持',
 N1:'固定泉P1に対する供給室の向きを維持',N2:'固定泉P2と供給器官への到達を維持',N3:'固定泉P3と第三層用水路への入口を維持',
 D1:'S1の遠隔着床先。恒久連結した遠隔区域の入口',D2:'遠隔工房の恒久通路を維持',D3:'遠隔物置の恒久通路を維持',D4:'遠隔区域の環状通路を維持',
 A3:'N3・住宅・固定用水路に至る共用玄関を維持',W1:'Bの予備点検廊下で開く探索目的地として待機',
 R2:'C0の挿入・撤収で参照経路を変更',R3:'J1と位置を交換し南北通路を変更',H1:'広間北半を別階・西側へ運びH2との連結を変更',H2:'広間南半を別経路へ分離・再連結',L1:'L字集会室が階と平面位置を変更',J1:'南北枝の接続先を変更',J3:'交差部の階と位置を変更',C0:'保管位置から近道へ挿入・撤収',
 E1:'東翼居室の階を交換',E2:'東翼居室の階を交換',E3:'東翼居室の階を交換',E4:'東翼居室の階を交換',
 M1:'上下交流室。CではG1の東に着床して住宅と待合の接続順を変更',U2:'BではN4が空ける場所へ移り、U1の南口から東口へ接続を変更',
 N4:'回転と上下搬送で泉PA/PBへの供給方向を変更',S1:'遠隔区域へ渡り帰還する搬送室',
 V1:'幅広共用前室と点検廊下の接続を変更',V2:'二連結住戸の階と西側接続を変更',V3:'階間搬送で居住区域への入口を変更',Q1:'予備点検廊下をBで挿入し旧設備室を開く',
 G1:'CではM1と順序を交換し、K2から直接入る二連結住宅に変更',G2:'現地・近傍回転で住宅と生活通路を接続',G3:'三連結居間を二つの階へ運び居住区EVと生活棟を接続',G4:'折れ通路の平面位置を変更して北住宅を再接続',G5:'居住区EVの住戸を階交換。南の増設空欄を実際に退避利用',
 J9:'G5に接続する生活廊下をBで第一層へ移す',P9:'四連結生活棟をBで第一層へ運び、接続相手をG3からG5へ変更'
};
export const BODY_POLICY=Object.fromEntries(groups.flatMap(([generation,ids])=>ids.map(id=>[id,{generation,kind:'transportable',purpose:purpose[id]}])));
export function redesignFacility(bodies){
 for(const b of bodies){const p=BODY_POLICY[b.id];if(!p?.purpose)throw Error(b.id+': ABC設計と待機理由を登録してください');b.mobility=p;}
 for(const [id,port]of [['U1','S'],['U2','N']])bodies.find(b=>b.id===id).ports.find(p=>p.id===port).permanent=false;
}
export function facilityPlacements(phase,p){
 if(phase==='B'){p.P9={x:58.8,y:-12.8,z:25.2};p.J9={x:50.4,y:-12.8,z:33.2};p.U2={x:58.8,y:12.8,z:0};}
 if(phase==='C'){p.G1={x:16.8,y:-12.8,z:0};p.M1={x:33.6,y:-12.8,z:0};}
 return districtPlacements(phase,p);
}
export const transitDeck=(id,start)=>['M1','V1','Q1','G1','G2','G3','G4','G5','J9','P9','LB1'].includes(id)?-6.4:id==='V3'&&start.y<0?-6.4:6.4;
export function facilityJobs(from,to,e,initial,target){
 if(!({A:'B',B:'C',C:'A'}[from]===to))throw Error('Supported sequence is A→B→C→A');
 for(const id of Object.keys(target))if(!BODY_POLICY[id]?.purpose)throw Error(id+': 施設全体の設計方針なし');
 const jobs=[],pos=structuredClone(initial),same=(a,b)=>['x','y','z','angle'].every(k=>Math.abs((a[k]??0)-(b[k]??0))<1e-6);
 const add=(id,end=target[id],tag=BODY_POLICY[id]?.purpose)=>{if(!BODY_POLICY[id]||!end)throw Error('未設計の搬送体 '+id);if(same(pos[id],end))return;jobs.push([id,{...end},tag]);pos[id]={...end};};
 const at=(id,end,tag)=>add(id,end,tag),run=ids=>ids.forEach(id=>add(id));
 const swap=(a,b)=>{at(a,{x:50.4,y:6.4,z:8.4},'東翼交換の一時退避');run([b,a]);};
 const south=(e.bounds?.d??({same:50,ring1:58.4,ring2:66.8}[e.size]))>=58.4;
 const housing=()=>{at('G5',south?{x:41.6,y:-6.4,z:50.4}:{x:58.8,y:-6.4,z:33.6},south?'南の増設空欄へ退避・共用居間の昇降列を開く':'小範囲の既存退避ベイ');run(['G3','G5']);};
 if(from==='A'){
  run(['V3','R2','C0','H1','H2','L1']);swap('E1','E3');run(['M1','V1','V2','Q1','N4','S1','U2','G1','G4','G2','P9','J9']);housing();
 }else if(from==='B'){
  add('U2');
  if(e.size==='same'){at('L1',{x:16.8,y:0,z:8.4},'集会室の空欄へ仮着床');run(['H1','L1']);}
  else{at('H1',{x:25.6,y:6.4,z:17.2},'広間の一時退避ベイ');run(['L1','H1']);}
  run(['J3','C0','R2']);at('J1',{x:0,y:12.8,z:25.2},'南の空欄で通路交換');run(['R3','J1']);swap('E3','E1');swap('E2','E4');
  run(['M1','H2','V1','V2','Q1','N4','S1','V3','G1','G2','G4']);housing();run(['J9','P9']);
 }else{
  at('G1',{x:16.8,y:-6.4,z:8.4},'住宅と交流室の順序交換・近傍の空欄に退避');run(['M1','G1','L1','J3']);at('J1',{x:0,y:12.8,z:25.2},'南の空欄で通路交換');run(['R3','J1']);swap('E4','E2');
 }
 if(from==='A')run(['CP1','RH1','MK1','SH2','LB1']);else if(from==='B')run(['RH1','CP1','MK1','SH2','LB1']);
 // Target coverage is automatic, not a list appended for each historical stage.
 // Newly added bodies still need policy and explicit phase design above.
 for(const id of Object.keys(target)){if(!BODY_POLICY[id]?.purpose)throw Error(id+': 施設全体の設計方針なし');add(id);}
 return jobs;
}
