// Independent one-cell rooms; no internal hallway or room-partition rule.
export const ROOM_IDS=['BR1','BR2','BR3'];
export const ROOM_PURPOSE={BR1:'一チャンク一室。J9から直接入り、Bで第一層へ独立搬送',BR2:'大部屋西室。A/CはBR3と広い境界で接続し、Bは西へ独立搬送して閉鎖',BR3:'大部屋東室。A/CはBR2と接続し、BはBR1と第一層へ独立搬送'};
const port=(id,face,a=3,b=5,height=2.5)=>({id,face,a,b,height,role:'boundary-connector'});
const wide=face=>({...port('wide',face,.6,7.4,5.2),adaptive:true,adaptiveRecess:.1,wideSafety:true,profiles:[[.6,7.4]]});
export function addLargeRooms(bodies){bodies.find(b=>b.id==='J9').ports.push(port('large-rooms','S'));
 for(const [i,id]of ROOM_IDS.entries())bodies.push({id,name:['一チャンク一室・BR1','独立連結大部屋・西BR2','独立連結大部屋・東BR3'][i],generation:13,largeRoom:true,use:'common',zone:'service',color:'#a8b8ac',cells:[[0,0]],ceiling:5.6,ports:i===0?[port('entry','N'),port('south','S')]:i===1?[wide('E')]:[port('entry','N'),wide('W')],walls:[],doors:[],solids:[],furniture:[],privateRooms:[],roofAreas:[{x:0,z:0,w:8,d:8,height:5.6}],labels:[{name:i===0?'一室 7.76×7.76m':i===1?'連結広間・西':'連結広間・東',x:4,z:4}]});
}
export function largeRoomPlacements(phase,p){const b=phase==='B';return Object.assign(p,{BR1:{x:50.4,y:b?-12.8:0,z:41.6},BR2:{x:b?33.6:42,y:0,z:50},BR3:{x:50.4,y:b?-12.8:0,z:50}});}
