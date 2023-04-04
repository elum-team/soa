"use strict";var e=require("fastify"),r=require("@fastify/cors"),t=require("@fastify/multipart"),s=require("@fastify/formbody");const o=e=>r=>e.header("content-type","application/json; charset=utf-8").code(200).send(r);class i{static Success=e=>({response:e});static Error=e=>({error:e});static NotReady=this.Error({code:0,message:"The server is not ready yet. Try a little later"});static MethodIsNotDefined=this.Error({code:1,message:"Method is not defined"});static BadRequest=this.Error({code:2,message:"Bad Request"});static AccessDenied=this.Error({code:3,message:"Access Denied"});static ServerError=this.Error({code:4,message:"Attempt to connect to server failed"})}exports.Request=i,exports.Server=class{secret;services;server=e();callback;constructor(e){this.secret=e.secret,this.services=e.services,this.server.register(r,{origin:"*"}),this.server.register(s),this.server.register(t,{attachFieldsToBody:!0,addToBody:!0}),this.server.route({url:"/",method:"POST",preHandler:this.preHandler,handler:this.handler})}preHandler=(e,r,t)=>{const s=o(r);try{const{authorization:r}=e.headers;if(!this.secret)return void t();if(!r||r!==this.secret)return void s(i.AccessDenied);t()}catch(e){console.error(e),s(i.BadRequest)}};handler=(e,r)=>{const t=o(r);try{if(!this.callback)return void t(i.NotReady);const{type:r,value:s}=e.body;if(console.log(e.body),!r||!s)return void t(i.BadRequest);const o=this.callback[r];if(!o&&"function"!=typeof o)return void t(i.MethodIsNotDefined);o(s,t)}catch(e){console.error(e),t(i.BadRequest)}};events=e=>{this.callback=e};listen=async(e=18400,r="0.0.0.0")=>{try{await this.server.listen({port:e,host:r});const t=this.server.server.address();t||(console.info("Server is not starting"),process.exit(1));const{address:s,port:o}="string"==typeof t?{address:r,port:e}:t;console.info(`[INFO] Listener port ${s}:${o}`)}catch(e){this.server.log.error(e),process.exit(1)}};send(e,r,t,s){const o=this.services[e];if(!o)return void console.warn(`[WARN] ${e.toString()} in not defined`);const c=`http://${o}/`,n={method:"POST",headers:{Authorization:this.secret,"Content-Type":"application/json"},body:JSON.stringify({type:r,value:t})};if(!s)return new Promise((async e=>{const r=await fetch(c,n),{error:t,response:s}=await r.json();t&&console.error(t),e([t,s])}));new Promise((async()=>{try{const e=await fetch(c,n),{error:r,response:t}=await e.json();r&&(console.error(r),s([r,void 0])),s([void 0,t])}catch{s([i.ServerError.error,void 0])}}))}};