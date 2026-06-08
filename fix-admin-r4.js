const fs = require('fs');
let code = fs.readFileSync('src/components/AdminControls.tsx', 'utf8');

const target = `                {/* Judging */}
                <span className="text-[10px] font-label-caps text-on-surface-variant mt-1 border-t border-outline-variant/30 pt-3">CHẤM ĐIỂM:</span>`;

const replacement = `                {/* Judging */}
                {gameState.currentQuestion && (
                  <div className="flex flex-col gap-1 mt-2 mb-1">
                    <span className="text-[10px] font-label-caps text-on-surface-variant">ĐÁP ÁN ĐÚNG:</span>
                    <div className="font-bold text-sm text-primary">
                      {gameState.currentQuestion.answer || "Chưa có đáp án"}
                    </div>
                  </div>
                )}
                <span className="text-[10px] font-label-caps text-on-surface-variant mt-1 border-t border-outline-variant/30 pt-3">CHẤM ĐIỂM:</span>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminControls.tsx', code);
