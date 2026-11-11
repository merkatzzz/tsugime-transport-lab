const port=(face,a=3,b=5,id=face,height=2.3)=>({id,face,a,b,height});
const box=(x,z,w,d,h=1)=>({x,z,w,d,h,color:'concrete'}),line=(a,b)=>({a,b});
export function extendBodies(bodies){
 const create=(id,name,use='corridor')=>({id,name,use,color:use==='infrastructure'?'#899f8e':use==='common'?'#a39a8e':'#a6ac88',cells:[[0,0]],ceiling:2.7,ports:['N','E','S','W'].map(f=>port(f)),walls:[],doors:[],solids:[],furniture:[],labels:[{name,x:4,z:4}],roofAreas:[{x:0,z:0,w:8,d:8,height:2.7}]});
 for(let i=1;i<=5;i++){const b=create('U'+i,['東翼迂回通路','旧設備前の分岐','第二層の空室前','物置と奥通路','第一層の予備通路'][i-1]);if(i===2||i===4){b.walls=[line([0,2.6],[2.8,2.6]),line([2.8,0],[2.8,1]),line([2.8,2.2],[2.8,2.6])];b.doors=[{id:b.id+'-door',a:[2.8,1],b:[2.8,2.2],open:false,label:i===2?'空室':'物置'}];b.furniture=[box(.6,.5,1.2,1.2,.8)];}else b.solids=[box(0,0,2.7,2.7,2.7),box(5.3,5.3,2.7,2.7,2.7)];bodies.push(b);}
 for(let i=1;i<=4;i++){const b=create('N'+i,'中和供給室 BN'+i,'infrastructure');b.ports=b.ports.filter(p=>p.face!=='E');b.ports.push(port('E',3.5,4.5,'bio',1.1));b.solids=[{...box(6.8,3.1,1.05,1.8,1.9),bioHousing:true}];b.furniture=[box(.6,.7,1.3,1,.7),box(5.2,6.4,1.5,.7,.8)];bodies.push(b);}
 const shuttle=create('S1','遠隔区域への搬送室','common');shuttle.ports.find(p=>p.face==='N').a=4;shuttle.ports.find(p=>p.face==='N').b=6;shuttle.furniture=[box(1,1,1.6,1,.6)];bodies.push(shuttle);
 for(let i=1;i<=4;i++){const b=create('D'+i,['遠隔区域・到着通路','遠隔区域・空き工房','遠隔区域・物置','遠隔区域・休憩通路'][i-1],'common');b.remote=true;if(i===2||i===3){b.walls=[line([0,2.6],[3.2,2.6]),line([4.4,2.6],[8,2.6])];b.doors=[{id:b.id+'-door',a:[3.2,2.6],b:[4.4,2.6],open:false,label:'遠隔区域の小部屋'}];b.ports=b.ports.filter(p=>p.face!=='N');b.furniture=[box(.6,.6,1.8,1,.6)];}else{b.solids=[box(0,0,2.8,2.8,2.7),box(5.2,5.2,2.8,2.8,2.7)];b.walls=[line([5.4,.6],[7.3,2.5])];}bodies.push(b);}
 for(const id of ['E2','E4'])bodies.find(b=>b.id===id).ports.push(port('S',4,6,'S',2.5));
 bodies.find(b=>b.id==='M1').ports.push(port('S',3,5,'S',2.5));
}
export function extensionPlacements(phase){const pose=(x,y,z,angle)=>angle===undefined?{x,y,z}:{x,y,z,angle};return{
 U1:pose(50.4,12.8,0),U2:pose(50.4,12.8,8.4),U3:pose(50.4,0,0),U4:pose(50.4,0,8.4),U5:pose(8.4,-12.8,8.4),
 N1:pose(16.8,-12.8,8.4),N2:pose(50.4,0,16.8),N3:pose(50.4,12.8,16.8),N4:pose(58.8,phase==='B'?0:12.8,0,phase==='B'?90:0),
 S1:pose(phase==='B'?92.4:42,12.8,8.4),D1:pose(100.8,12.8,8.4),D2:pose(109.2,12.8,8.4),D3:pose(100.8,12.8,16.8),D4:pose(109.2,12.8,16.8)
 };}
