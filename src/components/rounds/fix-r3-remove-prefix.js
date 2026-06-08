const fs = require('fs');
let code = fs.readFileSync('src/components/rounds/Round3View.tsx', 'utf8');

const target = `<span className="mr-3 font-label-caps text-sm bg-background/50 px-2 py-1 rounded border border-outline-variant/30">{String.fromCharCode(65 + idx)}</span>`;
code = code.split(target).join('');

fs.writeFileSync('src/components/rounds/Round3View.tsx', code);
