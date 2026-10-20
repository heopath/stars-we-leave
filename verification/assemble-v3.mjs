import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL('../dist/'+name,import.meta.url),'utf8');
const [html,css,engine,app,icon,extra,world,exploration]=await Promise.all(['index.html','experience.css','life.mjs','experience.mjs','star.svg','wander.mjs','world.mjs','exploration.css'].map(read));
const module=extra+'\n'+world+'\n'+engine.replace(/^import .*?;\r?\n/gm,'')+'\n'+app.replace(/^import .*?;\r?\n/gm,'').replace("$('legacy-link').hidden=!localStorage.getItem(LEGACY);","$('legacy-link').hidden=true;");
const standalone=html.replace('href="./star.svg"','href="data:image/svg+xml,'+encodeURIComponent(icon)+'"')
  .replace('<link rel="stylesheet" href="./experience.css">','<style>'+css+'</style>')
  .replace('<link rel="stylesheet" href="./exploration.css">','<style>'+exploration+'</style>')
  .replace('<script type="module" src="./experience.mjs"></script>','<script type="module">\n'+module+'\n</script>')
  .replace('class="brand" href="./"','class="brand" href=""');
if(/src="\.\//.test(standalone)||/href="\.\/experience/.test(standalone))throw new Error('Unbundled offline dependency');
await writeFile(new URL('./우리가-남긴-별-v3.html',import.meta.url),standalone);
await writeFile(new URL('./offline-v3-check.mjs',import.meta.url),module);
console.log('v0.3 standalone HTML assembled; all runtime assets embedded.');
