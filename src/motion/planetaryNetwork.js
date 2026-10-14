import { sphereTarget } from './globeMorph.js'

// Geographic anchors for an illustrative network, never deployment locations.
const anchors = [
  ['Dhaka',90.4,23.8],['Kolkata',88.4,22.6],['Delhi',77.2,28.6],['Mumbai',72.9,19.1],
  ['Chennai',80.3,13.1],['Kathmandu',85.3,27.7],['Colombo',79.9,6.9],['Bangkok',100.5,13.8],
  ['Singapore',103.8,1.4],['Jakarta',106.8,-6.2],['Manila',121,14.6],['Hong Kong',114.2,22.3],
  ['Tokyo',139.7,35.7],['Seoul',127,37.6],['Beijing',116.4,39.9],['Tashkent',69.3,41.3],
  ['Dubai',55.3,25.2],['Riyadh',46.7,24.7],['Istanbul',29,41],['Nairobi',36.8,-1.3],
  ['Cairo',31.2,30],['Cape Town',18.4,-33.9],['Lagos',3.4,6.5],['Dakar',-17.5,14.7],
  ['Paris',2.4,48.9],['London',-.1,51.5],['Berlin',13.4,52.5],['Stockholm',18.1,59.3],
  ['Sydney',151.2,-33.9],['Perth',115.9,-31.9],['Auckland',174.8,-36.8],['Honolulu',-157.9,21.3],
  ['San Francisco',-122.4,37.8],['New York',-74,40.7],['Toronto',-79.4,43.7],['Vancouver',-123.1,49.3],
  ['Mexico City',-99.1,19.4],['Bogota',-74.1,4.7],['Lima',-77,-12],['Sao Paulo',-46.6,-23.6],
  ['Santiago',-70.7,-33.5],['Buenos Aires',-58.4,-34.6],['Reykjavik',-21.9,64.1],
]
const clamp = (n) => Math.max(0, Math.min(1,n))
const dot = (a,b) => a.reduce((sum,v,i) => sum+v*b[i],0)
const normalized = (a) => { const r=Math.hypot(...a); return a.map((v) => v/r) }

export function calculateNetworkProgress({ scrollY, viewportHeight, globeStart }) {
  const start = globeStart + viewportHeight * 0.1
  const end = globeStart + viewportHeight * 1.55
  return clamp((scrollY-start)/Math.max(1,end-start))
}

export function createPlanetaryTopology(columns, rows) {
  const used = new Set()
  const seed = sphereTarget(Math.round((1-Math.sin(23*Math.PI/180))*rows/2-.5)*columns+Math.round((85+180)/360*columns)%columns,columns,rows)
  const nodes = anchors.map(([name,lon,lat]) => {
    const row = Math.max(0,Math.min(rows-1,Math.round((1-Math.sin(lat*Math.PI/180))*rows/2-.5)))
    let col = Math.round((lon+180)/360*columns)%columns
    while (used.has(row*columns+col)) col=(col+1)%columns
    const id=row*columns+col
    used.add(id)
    const position=sphereTarget(id,columns,rows)
    return {id,name,position,distance:Math.acos(Math.max(-1,Math.min(1,dot(position,seed)/3.5**2)))}
  }).sort((a,b) => a.distance-b.distance)
  nodes.forEach((node,i) => { node.birth = 0.025 + i/(nodes.length-1)*0.77 })
  const edges = []
  for (let to=1;to<nodes.length;to++) {
    const neighbors=nodes.slice(0,to).map((node,from) => ({from,distance:Math.acos(Math.max(-1,Math.min(1,dot(node.position,nodes[to].position)/3.5**2)))})).sort((a,b) => a.distance-b.distance).slice(0,2)
    if (to>7 && to%6===0 && !neighbors.some((n) => n.from===0)) neighbors.push({from:0,distance:nodes[to].distance})
    for (const {from,distance} of neighbors) {
      const birth=Math.max(nodes[from].birth,nodes[to].birth-0.1)
      edges.push({from,to,birth,duration:nodes[to].birth-birth,height:0.12+0.85*(distance/Math.PI)**0.8})
    }
  }
  return {nodes,edges}
}

export function raisedArcPoint(a,b,t,height=0.3) {
  if (t===0) return [...a]
  if (t===1) return [...b]
  const na=normalized(a), nb=normalized(b)
  const cosine=Math.max(-1,Math.min(1,dot(na,nb)))
  let direction
  if (cosine < -0.9999) {
    const axis=Math.abs(na[1])<0.9?[0,1,0]:[1,0,0]
    const tangent=normalized([na[1]*axis[2]-na[2]*axis[1],na[2]*axis[0]-na[0]*axis[2],na[0]*axis[1]-na[1]*axis[0]])
    direction=na.map((v,i)=>v*Math.cos(Math.PI*t)+tangent[i]*Math.sin(Math.PI*t))
  } else if (cosine > 0.9999) direction=normalized(na.map((v,i)=>v*(1-t)+nb[i]*t))
  else {
    const angle=Math.acos(cosine)
    direction=na.map((v,i)=>(Math.sin((1-t)*angle)*v+Math.sin(t*angle)*nb[i])/Math.sin(angle))
  }
  const radius=Math.hypot(...a)*(1-t)+Math.hypot(...b)*t+Math.sin(Math.PI*t)*height
  return direction.map((v)=>v*radius)
}
