import {createServer} from 'node:http';import {createServer as createViteServer} from 'vite';import evaluate from './api/evaluate.js';
const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});
createServer((req,res)=>{if(req.url==='/api/evaluate')return evaluate(req,res);vite.middlewares(req,res);}).listen(4173,'127.0.0.1',()=>console.log('Trip Lab: http://127.0.0.1:4173'));
