import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {containsMunicipalPoint,sampleMunicipalPoint} from '../lib/geography-core.mjs';

const geography=JSON.parse(readFileSync(new URL('../public/data/geography.json',import.meta.url)));
function seeded(seed){let state=seed;return()=>((state=(state*1664525+1013904223)>>>0)/2**32);}
test('random points are inside official Madrid polygons and are not curated presets',()=>{const random=seeded(42),presets=new Set(['40.43550,-3.70350','40.44890,-3.72940','40.45030,-3.69250']);const districts=new Set();for(let i=0;i<1000;i++){const point=sampleMunicipalPoint(geography,random);assert.ok(containsMunicipalPoint(point,geography));assert.ok(!presets.has(point.map(value=>value.toFixed(5)).join(',')));districts.add(geography.neighborhoods.find(area=>containsMunicipalPoint(point,{neighborhoods:[area]})).district);}assert.ok(districts.size>10);});
test('two sequential samples are independent and require no score selection',()=>{const random=seeded(7),a=sampleMunicipalPoint(geography,random),b=sampleMunicipalPoint(geography,random);assert.notDeepEqual(a,b);});
