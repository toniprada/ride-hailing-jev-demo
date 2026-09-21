import {validateCategories} from '../lib/categories.mjs';
import {prepare,normalize} from '../lib/jev.mjs';
const windows=new Map();
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const send=(status,obj)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(obj));};
 if(req.method!=='POST')return send(405,{error:'Use the form to evaluate one trip.'});
 const origin=req.headers.origin;if(origin){try{if(new URL(origin).host!==req.headers.host)return send(403,{error:'Origin is not allowed.'});}catch{return send(403,{error:'Origin is not allowed.'});}}
 if(!process.env.TYPESAFE_API_KEY)return send(503,{error:'The service is not configured. Try again later.'});
 const now=Date.now();if(windows.size>2000)for(const [k,v] of windows)if(now-v.start>60000)windows.delete(k);
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0];let slot=windows.get(ip);if(!slot||now-slot.start>60000){slot={start:now,count:0};windows.set(ip,slot);}if(++slot.count>60)return send(429,{error:'Maximum 60 evaluations per minute. Wait a moment.'});
 let request,categories;
 try{let body=req.body;if(body===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>70000)return send(413,{error:'The context is too large.'});}body=JSON.parse(raw);}if(typeof body==='string')body=JSON.parse(body);if(JSON.stringify(body).length>70000)return send(413,{error:'The context is too large.'});request=prepare(body);categories=validateCategories(body.categories);}catch(e){return send(400,{error:e.message?.slice(0,180)||'Check the trip details.'});}
 const start=performance.now();
 try{const response=await fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{Authorization:'Bearer '+process.env.TYPESAFE_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(20000)});const raw=await response.text();const latencyMs=performance.now()-start;if(!response.ok)return send(502,{error:'Jev could not complete the request. Try again later.',providerStatus:response.status});const providerResponse=JSON.parse(raw),result=normalize(providerResponse,request);return send(200,{...result,providerResponse,evaluatedContext:{trip:request.state.trip_scenario,categories},latencyMs,tripCount:1,questionCount:Object.keys(request.questions).length,attributes:request.evaluationMetadata.attributes});}catch{return send(502,{error:'The request did not complete or the response was invalid. Try again.'});}
}
