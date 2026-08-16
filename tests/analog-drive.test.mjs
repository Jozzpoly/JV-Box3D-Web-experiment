import test from 'node:test';
import assert from 'node:assert/strict';
import { LongitudinalInputTimeline } from '../.test-dist/input/longitudinal-input-timeline.js';
import { PointerAnalogDriveAdapter, resolvePointerAnalogPedalTravelPx, resolvePointerAnalogPedalValue } from '../.test-dist/input/pointer-analog-drive-adapter.js';

const near=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<=e, `${a} != ${b}`);

test('pedal mapping has slop, continuous travel and clamp',()=>{
  assert.equal(resolvePointerAnalogPedalTravelPx(100),82);
  assert.equal(resolvePointerAnalogPedalValue(96,100,82),0);
  near(resolvePointerAnalogPedalValue(56,100,82),38/76);
  assert.equal(resolvePointerAnalogPedalValue(-100,100,82),1);
});

test('timeline integrates analog throttle at sub-step timestamps',()=>{
  const t=new LongitudinalInputTimeline(0);
  t.enqueueAnalogThrottle(.5,5,'p');
  const s=t.consumeInterval(0,10);
  near(s.command.throttle,.25); near(s.integratedThrottleMs,2.5);
});

test('digital keyboard demand overrides analog while active and analog resumes afterwards',()=>{
  const t=new LongitudinalInputTimeline(0);
  t.enqueueAnalogThrottle(.4,0,'touch');
  t.enqueueButton('FORWARD',true,2,'kbd');
  t.enqueueButton('FORWARD',false,6,'kbd');
  const s=t.consumeInterval(0,10);
  near(s.integratedThrottleMs,.8+4+1.6); near(s.command.throttle,.64);
});

test('analog brake uses strongest active source',()=>{
  const t=new LongitudinalInputTimeline(0);
  t.enqueueAnalogBrake(.3,0,'a'); t.enqueueAnalogBrake(.7,0,'b');
  const s=t.consumeInterval(0,10); near(s.command.brake,.7);
});

class FakeTarget extends EventTarget {
  captures=new Set(); height=120;
  setPointerCapture(id){this.captures.add(id)}
  releasePointerCapture(id){this.captures.delete(id)}
  hasPointerCapture(id){return this.captures.has(id)}
  getBoundingClientRect(){return {height:this.height}}
}
function pe(type,{id=1,y=100,button=0}={}){const e=new Event(type,{cancelable:true});Object.defineProperties(e,{pointerId:{value:id},clientY:{value:y},button:{value:button}});return e}
function click(){return new Event('click',{cancelable:true})}

test('adapter drives throttle continuously and releases to zero',()=>{
  let now=0; const timeline=new LongitudinalInputTimeline(0); const throttle=new FakeTarget(), brake=new FakeTarget(), direction=new FakeTarget();
  const seen=[]; const a=new PointerAnalogDriveAdapter({windowTarget:new EventTarget(),documentTarget:new EventTarget(),isDocumentHidden:()=>false,timeline,controls:{throttle,brake,direction},now:()=>now,onPedalStateChange:(...x)=>seen.push(x)});
  throttle.dispatchEvent(pe('pointerdown',{id:7,y:100})); now=2; throttle.dispatchEvent(pe('pointermove',{id:7,y:50})); now=6; throttle.dispatchEvent(pe('pointerup',{id:7,y:50}));
  const s=timeline.consumeInterval(0,10);
  assert.ok(s.integratedThrottleMs>0); assert.ok(s.integratedThrottleMs<10); assert.equal(s.command.brake,0); assert.deepEqual(seen.at(-1),['THROTTLE',0,false]); a.dispose();
});

test('D to R while throttle held immediately re-signs the same pedal value',()=>{
  let now=0; const timeline=new LongitudinalInputTimeline(0); const throttle=new FakeTarget(), brake=new FakeTarget(), direction=new FakeTarget(); const dirs=[];
  const a=new PointerAnalogDriveAdapter({windowTarget:new EventTarget(),documentTarget:new EventTarget(),isDocumentHidden:()=>false,timeline,controls:{throttle,brake,direction},now:()=>now,onDirectionChange:d=>dirs.push(d)});
  throttle.dispatchEvent(pe('pointerdown',{id:1,y:100})); now=1; throttle.dispatchEvent(pe('pointermove',{id:1,y:40})); now=5; direction.dispatchEvent(click());
  const s=timeline.consumeInterval(0,10);
  assert.ok(s.integratedThrottleMs<0, `expected reverse-dominant integral, got ${s.integratedThrottleMs}`); assert.deepEqual(dirs,['D','R']); a.dispose();
});

test('throttle and brake are independent multitouch captures',()=>{
  let now=0; const timeline=new LongitudinalInputTimeline(0); const throttle=new FakeTarget(), brake=new FakeTarget(), direction=new FakeTarget();
  const a=new PointerAnalogDriveAdapter({windowTarget:new EventTarget(),documentTarget:new EventTarget(),isDocumentHidden:()=>false,timeline,controls:{throttle,brake,direction},now:()=>now});
  throttle.dispatchEvent(pe('pointerdown',{id:1,y:100})); brake.dispatchEvent(pe('pointerdown',{id:2,y:100})); now=1; throttle.dispatchEvent(pe('pointermove',{id:1,y:35})); brake.dispatchEvent(pe('pointermove',{id:2,y:55}));
  const s=timeline.consumeInterval(0,10); assert.ok(s.command.throttle>0); assert.ok(s.command.brake>0); a.dispose();
});

test('blur clears owned analog input but preserves D/R selector state',()=>{
  let now=0, hidden=false; const timeline=new LongitudinalInputTimeline(0); const throttle=new FakeTarget(), brake=new FakeTarget(), direction=new FakeTarget(), win=new EventTarget(), doc=new EventTarget();
  const dirs=[]; const a=new PointerAnalogDriveAdapter({windowTarget:win,documentTarget:doc,isDocumentHidden:()=>hidden,timeline,controls:{throttle,brake,direction},now:()=>now,onDirectionChange:d=>dirs.push(d)});
  direction.dispatchEvent(click()); throttle.dispatchEvent(pe('pointerdown',{id:3,y:100})); now=1; throttle.dispatchEvent(pe('pointermove',{id:3,y:30})); now=4; win.dispatchEvent(new Event('blur')); const s=timeline.consumeInterval(0,10); assert.ok(s.integratedThrottleMs<0); assert.equal(dirs.at(-1),'R'); a.dispose();
});
