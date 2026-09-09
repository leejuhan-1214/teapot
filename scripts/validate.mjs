import {readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const html=await readFile(path.join(root,'dist/index.html'),'utf8');
for(const [,asset] of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g))await access(path.join(root,'dist',asset));
const manifest=JSON.parse(await readFile(path.join(root,'dist/manifest.webmanifest'),'utf8'));
for(const item of manifest.icons)await access(path.join(root,'dist',item.src));
for(const file of ['app.js','model.js','sw.js']){const result=spawnSync(process.execPath,['--check',path.join(root,'dist',file)],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr);}
if(!html.includes('lang="ko"')||!html.includes('name="viewport"'))throw new Error('Missing mobile metadata');
if(manifest.display!=='standalone')throw new Error('Missing PWA display mode');
console.log('OK: entrypoint, linked assets, manifest, JavaScript syntax, Korean and mobile metadata.');
