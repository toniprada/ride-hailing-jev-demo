import {nearbyFacilities} from './facilities.mjs';
const categoryNames={'amenity:restaurant':'restaurantes','amenity:cafe':'cafeterías','amenity:bar':'bares','amenity:theatre':'teatros','amenity:cinema':'cines','amenity:clinic':'clínicas','amenity:hospital':'hospitales','amenity:university':'universidades','amenity:college':'centros de formación','amenity:school':'colegios','amenity:nightclub':'discotecas','tourism:hotel':'hoteles','tourism:museum':'museos','tourism:attraction':'atracciones','office:company':'oficinas de empresas','railway:station':'estaciones','aeroway:aerodrome':'aeródromos'};
const rad=Math.PI/180;
function inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
function inPolygon(x,y,rings){return inRing(x,y,rings[0])&&!rings.slice(1).some(r=>inRing(x,y,r));}
function contains(coordinates,g){const [y,x]=coordinates;return g.type==='Polygon'?inPolygon(x,y,g.coordinates):g.type==='MultiPolygon'&&g.coordinates.some(p=>inPolygon(x,y,p));}
export function containsMunicipalPoint(coordinates,data){return Boolean(data?.neighborhoods?.some(n=>contains(coordinates,n.geometry)));}
// Uniform rejection sampling over the supplied bounding box. Conditional on acceptance,
// each point in the union of official neighborhood polygons has equal planar density.
export function sampleMunicipalPoint(data,rng=Math.random){
 if(!data?.bbox||!data?.neighborhoods?.length)throw Error('Official municipal geometry is unavailable.');
 const [minLat,minLon,maxLat,maxLon]=data.bbox;
 for(let attempt=0;attempt<10000;attempt++){
  const point=[minLat+rng()*(maxLat-minLat),minLon+rng()*(maxLon-minLon)];
  if(containsMunicipalPoint(point,data))return point.map(value=>+value.toFixed(5));
 }
 throw Error('Could not sample a point inside the Madrid municipal boundary.');
}
function distance(a,b){const dy=(a[0]-b[0])*111195,dx=(a[1]-b[1])*111195*Math.cos((a[0]+b[0])/2*rad);return Math.hypot(dx,dy);}
export function enrichPoint(coordinates,data){
 const point=coordinates.map(n=>+n.toFixed(5));
 const fallback={name:point.map(n=>n.toFixed(4)).join(', '),coordinates:point,functional_description:'Geographic context is unavailable; no area function is assumed.',airport:false,facility_context:{status:'unavailable',matches:[],important_pois:[],source:null},area_statistics:{status:'unavailable',geography:null,area_code:null,area_name:null,metrics:{mean_age:null,household_size:null,net_income_household:null}},geo_context:{status:'unavailable',neighborhood:null,district:null,nearby:[],radius_m:100,source:null,limitations:'Do not infer activity or purpose from missing context.'}};
 if(!data)return fallback;
 const facilities=nearbyFacilities(point,data,contains,distance);
 const neighborhood=data.neighborhoods.find(n=>contains(point,n.geometry));
 const covered=point[0]>=data.bbox[0]&&point[0]<=data.bbox[2]&&point[1]>=data.bbox[1]&&point[1]<=data.bbox[3];
 const near=covered?data.pois.map(p=>({p,d:distance(point,p.coordinates)})).filter(x=>x.d<=100).sort((a,b)=>a.d-b.d):[];
 const nearby=near.slice(0,8).map(({p,d})=>({osm_id:p.id,name:p.name||null,tags:p.tags,distance_m:Math.round(d),location_method:'OSM node or feature bounding-box center'}));
 const status=neighborhood?(covered?'resolved':'partial'):(covered?'partial':'outside_coverage');
 const names=neighborhood?`${neighborhood.name}, district ${neighborhood.district}, Madrid`:'No neighborhood identified in the available polygons';
 const features=covered?(near.length?'Mapped POIs within 100 m: '+near.slice(0,8).map(({p,d})=>(p.name||Object.values(p.tags).join('/'))+' ('+Math.round(d)+' m)').join('; '):'No mapped POIs within 100 m; local evidence is limited'):'No point-POI coverage at this location';
 return {facility_context:facilities,area_statistics:neighborhood?.statistics?structuredClone(neighborhood.statistics):structuredClone(fallback.area_statistics),name:neighborhood?.name||fallback.name,coordinates:point,functional_description:('Administrative location: '+names+'. '+features+'. Prioritize containing facilities and point-local POIs, not neighborhood stereotypes.').slice(0,590),airport:facilities.matches.some(f=>['airport_terminal','aerodrome'].includes(f.type)&&(f.relation==='inside'||f.type==='airport_terminal'&&f.distance_m<=150)),geo_context:{status,neighborhood:neighborhood?.name||null,district:neighborhood?.district||null,nearby,radius_m:100,source:{neighborhoods:'Madrid City Council · official polygons',pois:'© OpenStreetMap contributors · local Overpass snapshot',retrieved_at:data.retrievedAt,osm_timestamp:data.osmTimestamp||null},limitations:'Selected categories, not a complete inventory. Fixed 100 m radius; it is not expanded when absent. Distances to OSM nodes/centers are approximate; records can represent parts of one place. POIs do not identify passenger activity.'}};
}
