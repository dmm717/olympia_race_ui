const fs = require('fs');
let code = fs.readFileSync('src/components/rounds/Round3View.tsx', 'utf8');

const target = `              <h2 className="text-2xl font-headline-lg text-on-surface leading-relaxed">
                {q.text}
              </h2>
            </div>`;

const replacement = `              <h2 className="text-2xl font-headline-lg text-on-surface leading-relaxed">
                {q.text}
              </h2>
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 w-full text-left">
                  {q.options.map((opt: string, idx: number) => (
                    <div key={idx} className="bg-surface-variant text-on-surface-variant p-4 rounded-xl border border-outline-variant font-bold text-lg cursor-pointer hover:bg-primary hover:text-on-primary transition-colors flex items-center shadow-sm"
                         onClick={() => { if (!isLocked && !hasSubmitted) setMyAnswer(opt); }}>
                      <span className="mr-3 font-label-caps text-sm bg-background/50 px-2 py-1 rounded border border-outline-variant/30">{String.fromCharCode(65 + idx)}</span>
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>`;

code = code.split(target).join(replacement);

fs.writeFileSync('src/components/rounds/Round3View.tsx', code);
