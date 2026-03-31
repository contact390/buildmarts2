const fs=require('fs');
const path=require('path');
const files=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
for(const f of files){
  const t=fs.readFileSync(f,'utf8');
  if(t.includes('<form') && !t.includes("fetch('footer.html')") && !t.includes('fetch(\"footer.html\")')){
    console.log(f);
  }
}
