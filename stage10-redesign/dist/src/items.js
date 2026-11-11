export const ITEMS={parcel:{name:'仮の届け物',kind:'usable',description:'生活用品店の店主へ渡す、小さな実験用の包み。',stackable:true},scrap:{name:'回収部品',kind:'salvage',description:'回収品と使用品を区別するための試料。売却経済は今回追加しません。',stackable:true}};
export class Items{
 constructor(sim){this.sim=sim;this.counts={};this.flags={};this.results=[];this.mode=null;this.selected=null;}
 obtain(){if(this.flags.received)return false;this.flags.received=true;this.counts.parcel=(this.counts.parcel??0)+1;return true;}
 open(mode='browse'){this.mode=mode;this.selected=null;}
 cancel(){this.mode=null;this.selected=null;}
 use(item,target){const s=this.sim;let ok=false,message;if(!this.counts[item])message='この品物は所持していません。';else if(item!=='parcel'||target!=='npc:shopkeeper')message='この対象には使えません。品物は消費しません。';else if(!(s.experience.trade==='shopkeeper'||s.experience.visit?.npc==='shopkeeper'||s.experience.nearNPC('shopkeeper')&&s.life.canTrade('shopkeeper')))message='受取人に会える位置と時間に渡してください。';else{ok=true;this.counts[item]--;this.flags.delivered=true;message='店主「届けてくれたのか。ありがとう。」';}const r={ok,item,target,message,time:s.life.time};this.results.push(r);if(this.results.length>32)this.results.shift();s.message=message;return r;}
}
