import fs from 'node:fs';
import {Stage21View} from '../dist/src/stage21-view.js';
import {View} from '../dist/src/view.js';
const rows=[];
for(const[w,h]of[[1280,720],[960,540],[390,300]])for(const Type of[View,Stage21View]){
 let updated=0,dimensions;const v={container:{clientWidth:w,clientHeight:h},camera:{updateProjectionMatrix(){updated++;}},renderer:{setSize(...args){dimensions=args.slice(0,2);}}};
 Type.prototype.resize.call(v);if(v.camera.aspect!==w/h||updated!==1)throw Error('Projection mismatch');rows.push({camera:Type.name,width:w,height:h,aspect:v.camera.aspect,dimensions});
}
fs.writeFileSync('docs/evidence/stage22-projection.json',JSON.stringify({cpuProjectionPassed:true,rows,actualResponsiveLayoutVerified:false,gpuVerified:false},null,2));
console.log(JSON.stringify({projectionCases:rows.length,webgl:false}));
