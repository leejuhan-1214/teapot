// Demo-only domain model. Actual sensor integration can replace createRooms().
export const THRESHOLD_MINUTES=5;
export function createRooms(){
  const rooms=[];
  for(let floor=1;floor<=3;floor++) for(let n=1;n<=4;n++){
    const id=`${floor}0${n}`;
    rooms.push({id,name:`${floor}학년 ${n}반`,floor,building:'본관',occupied:'yes',door:false,ac:true,powerW:1250+floor*135+n*72,baselineW:1250+floor*135+n*72,acPowerW:1100,temperature:24.5+n*.3,humidity:46+n,minutes:0,stale:false,acknowledged:false});
  }
  Object.assign(rooms.find(r=>r.id==='203'),{occupied:'no',door:true,powerW:1920,acPowerW:1680,minutes:18,temperature:27.3});
  Object.assign(rooms.find(r=>r.id==='302'),{occupied:'no',door:false,powerW:1540,acPowerW:1320,minutes:12,temperature:24.8});
  Object.assign(rooms.find(r=>r.id==='104'),{name:'컴퓨터실',powerW:3150,baselineW:1900,minutes:22,temperature:25.6});
  Object.assign(rooms.find(r=>r.id==='304'),{occupied:'no',ac:false,powerW:38,baselineW:40,temperature:26.1});
  return rooms;
}
export function evaluateRoom(room){
  if(room.stale)return {level:'unknown',label:'연결 확인',score:0,reason:'센서 갱신이 중단되어 현재 상태를 확인할 수 없습니다.',type:'stale',estimateKWh:null};
  const long=room.minutes>=THRESHOLD_MINUTES;
  const vacant=room.occupied==='no';
  if(vacant&&room.ac&&room.door&&long)return {level:'critical',label:'긴급 확인',score:95,reason:`비어 있음 추정 · 냉방 중 문 열림 ${room.minutes}분`,type:'vacant-open',estimateKWh:room.acPowerW*room.minutes/60000};
  if(vacant&&room.ac&&long)return {level:'critical',label:'확인 필요',score:85,reason:`비어 있음 추정 · 에어컨 가동 ${room.minutes}분`,type:'vacant-ac',estimateKWh:room.acPowerW*room.minutes/60000};
  if(room.ac&&room.door&&long)return {level:'warning',label:'문 확인',score:70,reason:`냉방 중 문 열림 ${room.minutes}분 · 환기 여부 확인`,type:'open-door',estimateKWh:null};
  if(room.powerW>room.baselineW*1.4&&room.powerW-room.baselineW>200&&long)return {level:'warning',label:'사용량 확인',score:60,reason:`평소 예시값보다 ${Math.round((room.powerW/room.baselineW-1)*100)}% 높은 전력`,type:'unusual',estimateKWh:null};
  if(room.ac&&(vacant||room.door))return {level:'normal',label:'관찰 중',score:25,reason:`상태 변화 ${room.minutes}분 · ${THRESHOLD_MINUTES}분 지속 후 알림`,type:'observing',estimateKWh:null};
  return {level:'normal',label:'정상',score:0,reason:room.ac?'재실 신호가 있는 교실의 냉방입니다.':'현재 지속되는 낭비 의심 조건이 없습니다.',type:'normal',estimateKWh:0};
}
export const isActionable=room=>evaluateRoom(room).level!=='normal';
export const priorityRooms=rooms=>rooms.filter(isActionable).sort((a,b)=>evaluateRoom(b).score-evaluateRoom(a).score||b.minutes-a.minutes);
export function summarize(rooms){
 const valid=rooms.filter(r=>!r.stale);const active=priorityRooms(rooms);
 return {powerKW:valid.reduce((sum,r)=>sum+r.powerW,0)/1000,active:active.length,critical:active.filter(r=>evaluateRoom(r).level==='critical').length,unknown:rooms.length-valid.length,suspectKWh:valid.reduce((sum,r)=>sum+(evaluateRoom(r).estimateKWh||0),0),acCount:valid.filter(r=>r.ac).length};
}
export function changeSensor(room,key,value){
 const next={...room};
 if(key==='ac') {if(typeof value!=='boolean')throw new Error('ac must be boolean');if(value!==room.ac) next.powerW=Math.max(0,room.powerW+(value?room.acPowerW:-room.acPowerW));next.ac=value;}
 else if(key==='door'||key==='stale'){if(typeof value!=='boolean')throw new Error('value must be boolean');next[key]=value;}
 else if(key==='occupied'){if(!['yes','no','unknown'].includes(value))throw new Error('invalid occupancy');next.occupied=value;}
 else if(key==='minutes'){if(!Number.isInteger(value)||value<0||value>180)throw new Error('minutes must be 0–180');next.minutes=value;}
 else throw new Error('unsupported sensor');
 if(!['minutes','stale'].includes(key))next.minutes=0;
 next.acknowledged=false;
 return next;
}
export function applyScenario(name){
 let rooms=createRooms();
 if(name==='normal')rooms=rooms.map(r=>({...r,occupied:r.ac?'yes':'no',door:false,powerW:r.baselineW,minutes:0}));
 else if(name==='after-school')rooms=rooms.map(r=>({...r,occupied:'no',minutes:r.ac?20:0}));
 else if(name==='sensor-loss')rooms.find(r=>r.id==='203').stale=true;
 else if(name!=='waste')throw new Error('Unknown scenario');
 return rooms;
}
export const occupancyLabel=room=>room.stale?'확인 불가':({yes:'재실 신호 있음',no:'비어 있음 추정',unknown:'판단 보류'}[room.occupied]);
