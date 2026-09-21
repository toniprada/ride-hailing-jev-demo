// Classify infrastructure tags, never administrative names or predicted trip purpose.
export function facilityType(t={}){
 if(t.disused==='yes'||t.abandoned==='yes')return null;
 if(['zoo','theme_park','museum','attraction'].includes(t.tourism))return t.tourism;
 if(t.leisure==='water_park')return 'water_park';
 if(t.aeroway==='terminal')return 'airport_terminal';
 if(t.aeroway==='aerodrome')return 'aerodrome';
 if(t.amenity==='hospital'||t.healthcare==='hospital')return 'hospital';
 if(t.amenity==='clinic'||t.healthcare==='clinic')return 'clinic';
 if(t.amenity==='bus_station')return 'bus_station';
 if(t.amenity==='university'||t.building==='university'||t.landuse==='education')return 'education';
 if(t.amenity==='college')return 'college';
 if(t.amenity==='school')return 'school';
 if(t.station==='subway'||t.subway==='yes'||t.station==='light_rail'||t.light_rail==='yes'||t.tram==='yes'||t.station==='freight'||t.usage==='military')return null;
 if(t.railway==='station')return 'railway_station';
 if(t.building==='train_station')return 'station_building';
 return null;
}
const project=(p,origin)=>[(p[0]-origin[1])*111195*Math.cos(origin[0]*Math.PI/180),(p[1]-origin[0])*111195];
function segmentDistance(point,a,b){const [ax,ay]=project(a,point),[bx,by]=project(b,point);const dx=bx-ax,dy=by-ay;const length=dx*dx+dy*dy;const t=length?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/length)):0;return Math.hypot(ax+t*dx,ay+t*dy);}
export function nearbyFacilities(point,data,contains,distance){
 if(!data?.facilities)return {status:'unavailable',matches:[],important_pois:[],source:null};
 const matches=[];
 for(const f of data.facilities){const type=facilityType(f.tags);if(!type)continue;const inside=Boolean(f.geometry&&contains(point,f.geometry));let d;
  if(inside)d=0;else if(f.geometry){const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;d=Infinity;for(const poly of polygons)for(const ring of poly)for(let i=1;i<ring.length;i++)d=Math.min(d,segmentDistance(point,ring[i-1],ring[i]));}else d=distance(point,f.coordinates);
  if(d<=100)matches.push({osm_id:f.id,name:f.name||null,type,relation:inside?'inside':'nearby',distance_m:Math.round(d),distance_method:f.geometry?'shortest distance to OSM polygon; zero inside':f.geometry_method||'OSM point',coordinates:f.coordinates,tags:f.tags,opening_hours_status:'unknown; raw OSM text only, not evaluated for selected date/time'});
 }
 const priority={airport_terminal:0,hospital:0,education:0,college:0,school:0,zoo:0,theme_park:0,water_park:0,railway_station:0,station_building:0,bus_station:0,aerodrome:1,clinic:1,museum:2,attraction:3};
 matches.sort((a,b)=>(a.relation==='inside'?0:1)-(b.relation==='inside'?0:1)||(priority[a.type]??9)-(priority[b.type]??9)||a.distance_m-b.distance_m);
 const seen=new Set();const distinct=matches.filter(f=>{const name=f.name?.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');const group=['railway_station','station_building'].includes(f.type)?'rail':f.type;const keys=[f.tags.wikidata,name&&group+':'+name].filter(Boolean);if(keys.some(k=>seen.has(k)))return false;keys.forEach(k=>seen.add(k));return true;});
 const important=distinct.filter(f=>f.name&&(f.relation==='inside'||f.distance_m<=100)).slice(0,8);
 return {status:'available',matches:distinct.slice(0,12),important_pois:important,important_radius_m:100,selection:'At most 8 named POIs: inside a polygon or within 100 m of its edge/node. Containment first, then health/transport/parks, museums/attractions, and distance. Deduplicated by Wikidata or normalized name plus type; it does not determine trip purpose.',radius_m:100,source:data.facility_source||null,limitations:'Geographic containment or proximity does not prove use or individual purpose. A station can be local rail; a station building alone does not confirm current or long-distance service. Ordinary stops, metro, and pharmacies are not classified as hubs or hospitals. Distances are approximate.'};
}
