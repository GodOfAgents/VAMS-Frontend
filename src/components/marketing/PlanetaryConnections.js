import * as THREE from 'three'
import { createPlanetaryTopology, raisedArcPoint } from '../../motion/planetaryNetwork.js'

const vertexShader = `
  uniform vec4 uGlobeQuaternion;
  uniform float uGlobeScale;
  uniform float uPixelRatio;
  uniform float uEvolution;
  attribute float aBirth;
  attribute float aDuration;
  attribute float aProgress;
  attribute float aPhase;
  varying float vFacing;
  varying float vBirth;
  varying float vDuration;
  varying float vProgress;
  varying float vPhase;
  void main() {
    vec3 q=uGlobeQuaternion.xyz;
    vec3 p=position*uGlobeScale;
    vec3 rotated=p+2.0*cross(q,cross(q,p)+uGlobeQuaternion.w*p);
    vec3 world=rotated+vec3(0.0,-0.8,0.0);
    vec4 view=viewMatrix*vec4(world,1.0);
    vFacing=dot(normalize(rotated),normalize(cameraPosition-world));
    vBirth=aBirth; vDuration=aDuration; vProgress=aProgress; vPhase=aPhase;
    gl_Position=projectionMatrix*view;
    float alive=smoothstep(aBirth,aBirth+0.035,uEvolution);
    gl_PointSize=clamp((8.0+alive*12.0)*uPixelRatio*(10.6/max(4.0,-view.z)),3.0,40.0);
  }
`
const arcFragmentShader = `
  uniform float uEvolution;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uLayerStrength;
  varying float vFacing; varying float vBirth; varying float vDuration;
  varying float vProgress; varying float vPhase;
  void main() {
    float grown=smoothstep(vBirth,vBirth+max(0.005,vDuration),uEvolution);
    if (grown<=0.001 || vProgress>grown) discard;
    float head=exp(-pow((vProgress-grown)*42.0,2.0));
    float packet=pow(max(0.0,cos(vProgress*23.0-uTime*2.0+vPhase)),24.0);
    float front=mix(0.012,1.0,smoothstep(-0.08,0.15,vFacing));
    float alpha=(0.52+head*0.48+packet*0.28)*front*uOpacity*uLayerStrength;
    gl_FragColor=vec4(vec3(0.92),alpha);
  }
`
const hubFragmentShader = `
  uniform float uEvolution; uniform float uOpacity; uniform float uTime;
  varying float vFacing; varying float vBirth; varying float vPhase;
  void main() {
    float alive=smoothstep(vBirth,vBirth+0.035,uEvolution);
    if (alive<0.001) discard;
    float d=length(gl_PointCoord-0.5)*2.0;
    if (d>1.0) discard;
    float core=1.0-smoothstep(0.08,0.23,d);
    float halo=exp(-d*d*6.0)*0.48;
    float ring=(1.0-smoothstep(0.025,0.07,abs(d-0.55)))*0.4;
    float pulse=0.87+0.13*sin(uTime*1.5+vPhase);
    float front=smoothstep(-0.03,0.12,vFacing);
    gl_FragColor=vec4(vec3(1.0),(core+halo+ring)*alive*front*pulse*uOpacity);
  }
`

export function createPlanetaryConnections(pointGeometry, segments, shared) {
  const topology=createPlanetaryTopology(segments[0]+1,segments[1]+1)
  // Reuse exact GPU node coordinates, so junctions stay attached at every tier.
  for (const node of topology.nodes) node.position=Array.from(pointGeometry.attributes.aTarget.array.subarray(node.id*3,node.id*3+3))
  const uniformSet={
    uGlobeQuaternion:shared.uGlobeQuaternion,uGlobeScale:shared.uGlobeScale,
    uPixelRatio:shared.uPixelRatio,uTime:shared.uTime,uEvolution:{value:0},uOpacity:{value:0},
  }
  const resources=[]
  const group=new THREE.Group()
  function geometry(data) {
    const g=new THREE.BufferGeometry()
    for (const [key,values] of Object.entries(data)) g.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='position'?3:1))
    resources.push(g)
    return g
  }
  function material(fragmentShader, strength=1) {
    const m=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{...uniformSet,uLayerStrength:{value:strength}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})
    resources.push(m)
    return m
  }
  const arcs={position:[],aBirth:[],aDuration:[],aProgress:[],aPhase:[]}
  function append(data,p,birth,duration,t,phase) {
    data.position.push(...p);data.aBirth.push(birth);data.aDuration.push(duration);data.aProgress.push(t);data.aPhase.push(phase)
  }
  topology.edges.forEach((edge,i)=>{
    for (let j=0;j<48;j++) for (const t of [j/48,(j+1)/48]) {
      append(arcs,raisedArcPoint(topology.nodes[edge.from].position,topology.nodes[edge.to].position,t,edge.height),edge.birth,edge.duration,t,i*1.7)
    }
  })
  const links=new THREE.LineSegments(geometry(arcs),material(arcFragmentShader))
  const hubs={position:[],aBirth:[],aDuration:[],aProgress:[],aPhase:[]}
  topology.nodes.forEach((node,i)=>append(hubs,node.position,node.birth,0.035,0,i*2.4))
  const junctions=new THREE.Points(geometry(hubs),material(hubFragmentShader))
  const orbits={position:[],aBirth:[],aDuration:[],aProgress:[],aPhase:[]}
  for (let ring=0;ring<2;ring++) {
    const tilt=ring===0?0.48:-0.8
    for (let i=0;i<192;i++) for (const t of [i/192,(i+1)/192]) {
      const angle=t*Math.PI*2
      append(orbits,[4.15*Math.cos(angle),4.15*Math.sin(angle)*Math.sin(tilt),4.15*Math.sin(angle)*Math.cos(tilt)],0.73+ring*0.07,0.18,t,ring*3)
    }
  }
  const orbitalPaths=new THREE.LineSegments(geometry(orbits),material(arcFragmentShader,0.55))
  for (const object of [links,junctions,orbitalPaths]) { object.frustumCulled=false;object.renderOrder=4;group.add(object) }
  group.userData={hubCount:topology.nodes.length,routeCount:topology.edges.length}
  return {
    group,
    update(progress,opacity){uniformSet.uEvolution.value=progress;uniformSet.uOpacity.value=opacity;group.visible=progress>0.001},
    dispose(){resources.forEach((resource)=>resource.dispose())},
  }
}
