// Local coordinates of the recessed fixed canal. No geometry is left below an unclosed exterior wall.
export const CANAL={floor:0,water:-.3,bottom:-.85,bedTop:-.65,bank:2.4,inlet:[3,7],inletTop:1.5};
export function canalSection(){return[
 {id:'walk-foundation',x:0,y:-.85,z:0,w:2.34,h:.85,d:8},
 {id:'basin-bed',x:2.34,y:-.85,z:0,w:5.66,h:.2,d:8},
 {id:'basin-bank',x:2.34,y:-.65,z:0,w:.12,h:.81,d:8},
 {id:'basin-east',x:7.85,y:-.65,z:0,w:.15,h:.81,d:8},
 ...[0,7.85].flatMap(z=>[
  {id:'basin-end-left',x:2.46,y:-.65,z,w:.54,h:.81,d:.15},
  {id:'basin-end-right',x:7,y:-.65,z,w:.85,h:.81,d:.15},
  {id:'culvert-dark-end',x:3,y:-.65,z:z===0?0:7.95,w:4,h:2.15,d:.05,dark:true}
 ])
];}
