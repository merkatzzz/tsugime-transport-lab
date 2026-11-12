// Player.y is the support datum, 0.16m below the visible sole / slab top.
export const SOLE_OFFSET=.16,PLAYER_HEIGHT=1.70;
export const bodyRange=y=>({bottom:y+SOLE_OFFSET,top:y+SOLE_OFFSET+PLAYER_HEIGHT});
export function bodyOverlaps(y,bottom,top){const p=bodyRange(y);return p.bottom<top-1e-6&&p.top>bottom+1e-6;}
export function lineOverlapsBody(l,y){return bodyOverlaps(y,l.bottom??l.y+SOLE_OFFSET,l.top??l.y+SOLE_OFFSET+(l.height??2.8));}
