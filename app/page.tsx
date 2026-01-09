'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Terminal, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // 确保这个路径正确

// 定义用户提交的数据结构
interface LeadData {
  grade: string;
  gpa: string;
  country: string;
}

export default function Home() {
  const [step, setStep] = useState(0);
  
  // 核心状态管理
  const [formData, setFormData] = useState<LeadData>({ grade: '', gpa: '', country: '' });
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // 交互状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [showGate, setShowGate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 模拟通告栏数据
  const [fakeUser, setFakeUser] = useState("138****8821 刚刚获取了英国名校报告");

  // 假进度条文案
  const loadingSequence = [
    "正在连接 2026 全球院校数据库...",
    "正在比对 2025 vs 2026 录取政策差异...",
    "警告：检测到热门专业录取率大幅波动...",
    "正在计算您的最终胜率...",
    "报告已生成。"
  ];

  // 1. 模拟顶部通告栏轮播
  useEffect(() => {
    const interval = setInterval(() => {
      const users = [
        "139****1234 刚刚获取了香港大学预测报告",
        "186****5678 刚刚获取了哥伦比亚大学预测报告",
        "135****9999 刚刚获取了NUS预测报告",
        "150****3321 刚刚解锁了考研胜率分析"
      ];
      setFakeUser(users[Math.floor(Math.random() * users.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. 选项记录逻辑
  const handleSelect = (key: keyof LeadData, value: string, nextStep: number | 'analyze') => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (nextStep === 'analyze') {
      startAnalysis();
    } else {
      setStep(nextStep);
    }
  };

  // 3. 开始假装分析 (障眼法)
  const startAnalysis = () => {
    setStep(4);
    setIsAnalyzing(true);
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(loadingSequence[i]);
      i++;
      if (i >= loadingSequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setShowGate(true); // 显示手机号输入框
        }, 800);
      }
    }, 1200);
  };

  // 4. 最终提交 (写入 Supabase)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单校验
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
        alert("请输入正确的 11 位手机号");
        return;
    }

    setIsSubmitting(true);

    try {
      // 写入 Supabase
      const { error } = await supabase
        .from('leads')
        .insert([
          { 
            phone: phoneNumber,
            target_country: formData.country,
            gpa: formData.gpa,
            // 如果你的数据库里有 grade 字段也可以存，没有就不存
            // created_at 会自动生成
            status: 'new' 
          },
        ]);

      if (error) throw error;

      // 成功逻辑
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Submission Error:', error);
      alert("网络繁忙，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#03040A] text-white font-sans selection:bg-red-900 overflow-hidden relative">
      {/* 背景氛围光效 + 网格 */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(248,113,113,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,_rgba(148,163,184,0.25)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(148,163,184,0.18)_1px,_transparent_1px)] bg-[size:120px_120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col px-6 lg:px-10 py-6">
        {/* 顶部通告条 */}
        {!isSuccess && (
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-gray-300 backdrop-blur-md shadow-[0_0_25px_rgba(59,130,246,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono tracking-tight">{fakeUser}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>AI ADMISSION PREDICTOR · v2026</span>
            </div>
          </div>
        )}

        <AnimatePresence mode='wait'>
          {/* Step 0: 首页 (Landing) */}
          {step === 0 && !isSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col lg:flex-row lg:items-center gap-10"
            >
              {/* 左侧文案 */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/25 text-xs font-mono mb-6">
                  <AlertTriangle size={14} />
                  <span>2026 录取政策 · 实时监控模块</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-500 mb-4">
                  你的 GPA 还能<br className="hidden sm:block" />上岸哪所名校？
                </h1>
                <p className="text-slate-300/90 mb-8 text-sm lg:text-base leading-relaxed">
                  基于专为申请季训练的 AI 大模型，实时比对
                  <span className="text-sky-400 font-semibold mx-1">50,000+</span>
                  真实录取样本，输出个性化胜率曲线与冲稳保组合。
                  <br />
                  <span className="inline-flex items-center gap-1 text-rose-400 mt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span>26Fall 竞争激烈度预测上涨 40%，窗口正在收紧。</span>
                  </span>
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="relative w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-sm tracking-wide bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-[0_0_35px_rgba(56,189,248,0.55)]"
                  >
                    <span className="absolute inset-[-1px] rounded-2xl bg-gradient-to-r from-sky-400/40 via-transparent to-fuchsia-500/40 opacity-60 blur-[10px] -z-10" />
                    <span>立即开始 AI 测算</span>
                    <ArrowRight size={18} />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <div className="flex -space-x-2">
                      <div className="h-6 w-6 rounded-full bg-slate-500/40 border border-slate-300/40" />
                      <div className="h-6 w-6 rounded-full bg-slate-500/50 border border-slate-100/40" />
                      <div className="h-6 w-6 rounded-full bg-slate-400/60 border border-slate-50/40" />
                    </div>
                    <span>近 24 小时内已有 327 位同专业同档学生使用</span>
                  </div>
                </div>
              </div>

              {/* 右侧 AI 模块预览 */}
              <div className="flex-1 mt-10 lg:mt-0 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-sky-500/60 via-transparent to-fuchsia-500/60 opacity-70 blur-xl" />
                  <div className="relative rounded-3xl border border-slate-700/60 bg-slate-950/70 backdrop-blur-xl p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
                    <div className="flex items-center justify-between mb-4 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Realtime · Offer Probability Engine
                      </span>
                      <span>GPU 队列负载 62%</span>
                    </div>
                    <div className="h-40 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-fuchsia-500/20 border border-slate-600/60 flex items-center justify-center text-xs text-slate-200 font-mono">
                      <span>正在模拟 2026Fall 全球名校录取曲线...</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-[10px] text-slate-300">
                      <div className="rounded-xl border border-sky-500/40 bg-sky-500/5 px-3 py-2">
                        <div className="text-[9px] text-slate-400 mb-0.5">冲刺档</div>
                        <div className="font-semibold">Top 20</div>
                      </div>
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 px-3 py-2">
                        <div className="text-[9px] text-slate-400 mb-0.5">稳妥档</div>
                        <div className="font-semibold">Top 50</div>
                      </div>
                      <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-3 py-2">
                        <div className="text-[9px] text-slate-400 mb-0.5">保底档</div>
                        <div className="font-semibold">录取率 &gt; 93%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1-3: 问题收集 Wizard */}
          {(step >= 1 && step <= 3) && (
            <motion.div
                key="wizard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1 pt-4"
            >
                {/* 进度条 */}
                <div className="flex gap-2 mb-8">
                    {[1,2,3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= i ? 'bg-blue-500' : 'bg-gray-800'}`} />
                    ))}
                </div>

                <h2 className="text-2xl font-bold mb-8">
                    {step === 1 && "目前所在年级？"}
                    {step === 2 && "当前平均分/GPA？"}
                    {step === 3 && "目标国家/地区？"}
                </h2>

                <div className="space-y-3">
                    {step === 1 && ["大三/大四", "已毕业工作", "大一/大二", "考研二战"].map(opt => (
                        <OptionBtn key={opt} text={opt} onClick={() => handleSelect('grade', opt, 2)} />
                    ))}
                    {step === 2 && ["GPA 3.5+ / 85分+", "GPA 3.0-3.5 / 80-85", "GPA 3.0以下", "暂不清楚"].map(opt => (
                        <OptionBtn key={opt} text={opt} onClick={() => handleSelect('gpa', opt, 3)} />
                    ))}
                    {step === 3 && ["美国 US", "英国 UK", "中国香港 HK", "新加坡 SG", "澳洲 AU"].map(opt => (
                        <OptionBtn key={opt} text={opt} onClick={() => handleSelect('country', opt, 'analyze')} />
                    ))}
                </div>
            </motion.div>
          )}

          {/* Step 4: AI 计算动画 (Loading) */}
          {step === 4 && isAnalyzing && (
             <motion.div 
                key="analyzing"
                className="flex flex-col items-center justify-center flex-1 font-mono text-sm text-green-500"
             >
                <Terminal size={48} className="mb-8 text-green-400 animate-pulse" />
                <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-6 relative">
                    <motion.div 
                        className="h-full bg-green-500 absolute left-0 top-0"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                    />
                </div>
                <p className="animate-pulse">{loadingText}</p>
             </motion.div>
          )}

          {/* Step 5: 拦截门 (Lead Magnet) */}
          {showGate && !isSuccess && (
             <motion.div 
                key="gate"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col flex-1 pt-10"
             >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-2">
                        <Lock className="text-gray-400 group-hover:text-white transition-colors" size={32} />
                        <span className="text-xs text-gray-500 font-mono">ENCRYPTED REPORT</span>
                    </div>
                    {/* 假报告背景内容 */}
                    <div className="opacity-30 blur-sm select-none pointer-events-none">
                        <div className="flex justify-between items-end mb-4 border-b border-gray-700 pb-2">
                           <h3 className="text-xl font-bold">录取概率分析</h3>
                           <span className="text-4xl font-bold text-green-500">88%</span>
                        </div>
                        <div className="w-3/4 h-4 bg-gray-600 rounded mb-2"/>
                        <div className="w-1/2 h-4 bg-gray-600 rounded mb-2"/>
                        <div className="w-full h-24 bg-gray-700 rounded mt-4"/>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold mb-2">报告已生成</h3>
                    <p className="text-gray-400 text-sm">为保护数据隐私，结果仅发送至本人手机</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="tel" 
                        placeholder="请输入接收报告的手机号" 
                        className="w-full bg-black border border-gray-700 rounded-xl px-4 py-4 text-white focus:border-blue-500 outline-none transition-colors text-lg text-center tracking-widest"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "免费解锁详细报告"}
                    </button>
                    <p className="text-center text-xs text-gray-600">
                        点击即代表同意《用户隐私协议》并接受专家解读
                    </p>
                </form>
             </motion.div>
          )}

          {/* Success State: 成功页 */}
          {isSuccess && (
            <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center flex-1 text-center"
            >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-4">提交成功！</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    您的 2026 录取概率报告已进入排队队列。<br/>
                    <span className="text-white font-bold">高级留学顾问将在 10 分钟内</span><br/>
                    通过电话为您进行 1对1 深度解读。
                </p>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-500">
                    请留意来自北京/上海的电话，以免错过报告
                </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

// 简单的按钮组件
function OptionBtn({ text, onClick }: { text: string; onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] text-gray-200 py-4 px-6 rounded-xl transition-all active:scale-[0.98] group flex justify-between items-center"
        >
            <span className="font-medium">{text}</span>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-400"/>
        </button>
    )
}