import {spawn} from "node:child_process";
import {resolve} from "node:path";

const env={...process.env,WRANGLER_LOG_PATH:process.env.WRANGLER_LOG_PATH||".wrangler/wrangler.log"};
const gateway=spawn(process.execPath,[resolve("scripts/quickrouter-proxy.mjs")],{env,stdio:"inherit"});
const site=spawn(process.execPath,[resolve("node_modules/next/dist/bin/next"),"dev"],{env,stdio:"inherit"});

let closing=false;
function close(code=0){if(closing)return;closing=true;gateway.kill();site.kill();setTimeout(()=>process.exit(code),250)}
gateway.on("exit",code=>{if(!closing&&code)close(code)});
site.on("exit",code=>close(code||0));
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>close(0));
