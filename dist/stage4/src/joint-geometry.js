export const FLOOR_THICKNESS=.16,JOINT_SEAL=.26,JOINT_WALL=.12;
// One definition for the rendered tunnel and its collision centre lines.
// Only the gap receives a floor; the side/roof collar reaches into the frame.
export function jointGeometry(j){const floor={...j},collar=j.orientation==='EW'?{...j,x:j.x-JOINT_SEAL,w:j.w+2*JOINT_SEAL}:{...j,z:j.z-JOINT_SEAL,d:j.d+2*JOINT_SEAL},c=collar,h=JOINT_WALL/2,sides=j.orientation==='EW'?[{a:[c.x,c.z-h],b:[c.x+c.w,c.z-h]},{a:[c.x,c.z+c.d+h],b:[c.x+c.w,c.z+c.d+h]}]:[{a:[c.x-h,c.z],b:[c.x-h,c.z+c.d]},{a:[c.x+c.w+h,c.z],b:[c.x+c.w+h,c.z+c.d]}];return{floor,collar,sides,roofBase:FLOOR_THICKNESS+j.height};}
