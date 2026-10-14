"""Generate the static fallback from the bundled public-domain Natural Earth land."""
import json, math
from pathlib import Path
root = Path(__file__).resolve().parents[1]
polygons = json.loads((root / 'src/data/earth-land.json').read_text())
view = json.loads((root / 'src/data/earth-view.json').read_text())
lon0, lat0 = math.radians(view['longitude']), math.radians(view['latitude'])
def project(lon, lat):
    lon, lat = math.radians(lon) - lon0, math.radians(lat)
    return [math.cos(lat)*math.sin(lon), math.cos(lat0)*math.sin(lat)-math.sin(lat0)*math.cos(lat)*math.cos(lon), math.sin(lat0)*math.sin(lat)+math.cos(lat0)*math.cos(lat)*math.cos(lon)]
def xy(p): return f'{180+p[0]*170:.2f},{180-p[1]*170:.2f}'
paths = []
for polygon in polygons:
    for ring in polygon:
        path = []
        for i in range(1, len(ring)):
            a, b = project(*ring[i-1]), project(*ring[i])
            if a[2] <= 0 and b[2] <= 0: continue
            if a[2]*b[2] < 0:
                t = a[2]/(a[2]-b[2]); edge = [a[k]+t*(b[k]-a[k]) for k in range(3)]
                norm = math.hypot(*edge); edge = [v/norm for v in edge]
                if a[2] <= 0: a = edge
                else: b = edge
            path.append('M'+xy(a)+'L'+xy(b))
        if path: paths.append('<path d="'+''.join(path)+'"/>')
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><title>Earth with geographic coastlines</title><defs><radialGradient id="o"><stop stop-color="#151515"/><stop offset="1" stop-color="#080808"/></radialGradient></defs><circle cx="180" cy="180" r="170" fill="url(#o)" stroke="#666" stroke-width=".6"/><g fill="none" stroke="#cececa" stroke-width=".75" stroke-linecap="round">'+''.join(paths)+'</g></svg>\n'
(root/'public/earth-monochrome.svg').write_text(svg)
print('Generated static Earth:', len(svg), 'bytes')
