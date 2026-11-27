// Ví dụ: node scripts/check-all.cjs msedge chromium firefox webkit
const {spawn}=require('node:child_process');
const engines=process.argv.slice(2);if(!engines.length)engines.push('msedge');
function run(script,engine){return new Promise(resolve=>{
  const child=spawn(process.execPath,[require('node:path').join(__dirname,script)],{env:{...process.env,DTMS_BROWSER:engine},stdio:['ignore','pipe','pipe'],windowsHide:true});
  for(const stream of [child.stdout,child.stderr])stream.on('data',data=>process.stdout.write('['+engine+'] '+data));
  child.on('error',error=>{console.error(error);resolve(1);});child.on('exit',code=>resolve(code||0));
});}
Promise.all(engines.map(async engine=>{
  const first=await run('check-frontend.cjs',engine);
  const second=await run('check-integration.cjs',engine);
  const third=await run('check-regressions.cjs',engine);
  return first||second||third;
})).then(codes=>{process.exitCode=codes.some(Boolean)?1:0;});
