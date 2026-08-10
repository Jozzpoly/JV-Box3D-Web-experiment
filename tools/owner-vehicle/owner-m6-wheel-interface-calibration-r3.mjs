import { calibrateOwnerWheelR1 } from './owner-m6-visual-calibration-r1.mjs';

const EPS = 1e-9;
const CORNERS = Object.freeze(['fl', 'fr', 'rl', 'rr']);

function fail(message) {
  throw new Error(`Owner M6 R3 wheel interface calibration rejected: ${message}`);
}
function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,k){return [a[0]*k,a[1]*k,a[2]*k];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function len(a){return Math.hypot(a[0],a[1],a[2]);}
function norm(a,label){const l=len(a);if(!(l>EPS))fail(`${label} is degenerate`);return mul(a,1/l);}
function midpoint(a,b){return mul(add(a,b),0.5);}
function distance(a,b){return len(sub(a,b));}
function isLeft(corner){return corner==='fl'||corner==='rl';}

function requireSourceMarker(source,name){
  if(source.duplicateNodeNames.includes(name))fail(`wheel marker ${name} is duplicated`);
  const value=source.uniqueNodeWorldPositions[name];
  if(!Array.isArray(value)||value.length!==3)fail(`wheel marker ${name} is missing`);
  return [...value];
}

export function deriveWheelMountInterfaceR3(source, requestedRadius, requestedWidth) {
  const calibration=calibrateOwnerWheelR1(source,requestedRadius,requestedWidth);
  const widthLeft=requireSourceMarker(source,'Marker_TireWidthLeft');
  const widthRight=requireSourceMarker(source,'Marker_TireWidthRight');
  const socket=requireSourceMarker(source,'Socket_WheelMount');
  const authoredCenter=midpoint(widthLeft,widthRight);
  const authoredAxle=norm(sub(widthRight,widthLeft),'authored wheel axle');
  const socketFromCenter=sub(socket,authoredCenter);
  const authoredAxialOffset=dot(socketFromCenter,authoredAxle);
  const authoredRadialResidual=sub(socketFromCenter,mul(authoredAxle,authoredAxialOffset));
  const authoredRadialResidualLength=len(authoredRadialResidual);
  if(authoredRadialResidualLength>1e-9){
    fail(`Socket_WheelMount is not on the authored axle: residual=${authoredRadialResidualLength}`);
  }
  const signedMountOffsetMeters=authoredAxialOffset*calibration.report.axialScale;
  if(Math.abs(Math.abs(signedMountOffsetMeters)-calibration.report.mountOffset)>1e-12){
    fail('signed wheel mount offset disagrees with verified R1 wheel calibration');
  }
  return Object.freeze({
    mountLocalPosition:Object.freeze([0,signedMountOffsetMeters,0]),
    mountOffsetMeters:Math.abs(signedMountOffsetMeters),
    signedMountOffsetMeters,
    visualOrientation:Object.freeze({
      left:Object.freeze([0,0,0,1]),
      right:Object.freeze([1,0,0,0]),
    }),
    provenance:Object.freeze({
      mount:'AUTHORED_NODE:Socket_WheelMount',
      center:'AUTHORED_MARKER_MIDPOINT:Marker_TireWidthLeft+Marker_TireWidthRight',
      dimensions:'VERIFIED_R1_WHEEL_RADIUS_WIDTH_MARKERS',
    }),
    report:Object.freeze({
      authoredCenter:Object.freeze(authoredCenter),
      authoredSocket:Object.freeze(socket),
      authoredAxialOffset,
      authoredRadialResidualLength,
      mountOffsetMeters:Math.abs(signedMountOffsetMeters),
      signedMountOffsetMeters,
      wheelCalibration:calibration.report,
    }),
  });
}

export function wheelVisualLocalFromSourceR3(corner, wheelInterface) {
  if(!CORNERS.includes(corner))fail(`unknown corner ${corner}`);
  return Object.freeze({
    position:Object.freeze([0,0,0]),
    rotation:isLeft(corner)?wheelInterface.visualOrientation.left:wheelInterface.visualOrientation.right,
    scale:Object.freeze([1,1,1]),
  });
}

export function evaluateWheelMountRestR3(corner, wheelInterface, geometry) {
  if(!CORNERS.includes(corner))fail(`unknown corner ${corner}`);
  const inward=isLeft(corner)?1:-1;
  const mountWorld=Object.freeze([
    geometry.wheelCenter[0],
    geometry.wheelCenter[1],
    geometry.wheelCenter[2]+inward*wheelInterface.mountOffsetMeters,
  ]);
  const kingpinMid=Object.freeze(midpoint(geometry.upperBall,geometry.lowerBall));
  return Object.freeze({
    corner,
    inward,
    mountWorld,
    kingpinMid,
    mountToKingpinMeters:distance(mountWorld,kingpinMid),
    mountFromWheelCenterMeters:distance(mountWorld,geometry.wheelCenter),
  });
}
