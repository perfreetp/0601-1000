import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import type { QuoteItem } from '@/types';
import {
  FileText,
  Plus,
  Trash2,
  Home as HomeIcon,
  Download,
  Save,
  Percent,
  CalendarDays,
  Banknote,
  PieChart as PieChartIcon,
  CheckCircle,
  X,
} from 'lucide-react';

const LOAN_YEARS_OPTIONS = [10, 20, 30];

export default function Quote() {
  const { quotes, properties, addQuote, removeQuote, updateQuote } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [showExportTip, setShowExportTip] = useState(false);
  const [showSaveTip, setShowSaveTip] = useState(false);
  const [globalDownPaymentRatio, setGlobalDownPaymentRatio] = useState(30);
  const [globalLoanYears, setGlobalLoanYears] = useState(30);
  const [globalInterestRate, setGlobalInterestRate] = useState(4.2);

  const availableProperties = useMemo(() => {
    const quotePropertyIds = new Set(quotes.map((q) => q.propertyId));
    return properties.filter((p) => !quotePropertyIds.has(p.id));
  }, [properties, quotes]);

  const handleAddProperty = () => {
    const property = properties.find((p) => p.id === selectedPropertyId);
    if (!property) return;

    const quote: QuoteItem = {
      id: `q${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      price: property.price,
      discount: 100,
      downPaymentRatio: globalDownPaymentRatio,
      loanYears: globalLoanYears,
      interestRate: globalInterestRate,
    };

    addQuote(quote);
    setSelectedPropertyId('');
    setShowAddModal(false);
  };

  const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
    if (principal <= 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  };

  const summary = useMemo(() => {
    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;
    let totalDownPayment = 0;
    let totalLoan = 0;
    let totalMonthlyPayment = 0;
    let totalInterest = 0;

    quotes.forEach((q) => {
      const originalPrice = q.price * 10000;
      const discountedPrice = originalPrice * (q.discount / 100);
      const downPayment = discountedPrice * (q.downPaymentRatio / 100);
      const loanAmount = discountedPrice - downPayment;
      const monthlyPayment = calculateMonthlyPayment(loanAmount, q.interestRate, q.loanYears);
      const totalRepayment = monthlyPayment * q.loanYears * 12;
      const interest = totalRepayment - loanAmount;

      totalOriginalPrice += originalPrice;
      totalDiscountedPrice += discountedPrice;
      totalDownPayment += downPayment;
      totalLoan += loanAmount;
      totalMonthlyPayment += monthlyPayment;
      totalInterest += interest;
    });

    const tax = totalDiscountedPrice * 0.01;
    const maintenanceFund = totalDiscountedPrice * 0.02;
    const totalCost = totalDownPayment + tax + maintenanceFund;

    return {
      totalOriginalPrice,
      totalDiscountedPrice,
      totalDiscount: totalOriginalPrice - totalDiscountedPrice,
      totalDownPayment,
      totalLoan,
      totalMonthlyPayment,
      totalInterest,
      tax,
      maintenanceFund,
      totalCost,
    };
  }, [quotes]);

  const pieData = useMemo(() => {
    if (quotes.length === 0) return [];
    const data = [
      { name: '首付', value: summary.totalDownPayment, color: '#00E5A8' },
      { name: '贷款本金', value: summary.totalLoan, color: '#36F5BC' },
      { name: '贷款利息', value: summary.totalInterest, color: '#00C48C' },
      { name: '税费', value: summary.tax, color: '#73FCD4' },
      { name: '维修基金', value: summary.maintenanceFund, color: '#FFD93D' },
    ];
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return data.map((d) => ({ ...d, percent: (d.value / total) * 100 }));
  }, [summary, quotes.length]);

  const handleExport = () => {
    setShowExportTip(true);
    setTimeout(() => setShowExportTip(false), 2500);
  };

  const handleSaveDraft = () => {
    setShowSaveTip(true);
    setTimeout(() => setShowSaveTip(false), 2500);
  };

  const formatWan = (value: number) => (value / 10000).toFixed(2);

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />

      <div className="max-w-7xl mx-auto pt-24 pb-12 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-400 to-aurora-600 flex items-center justify-center shadow-lg shadow-aurora-500/30">
              <FileText className="w-6 h-6 text-space-900" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient font-display tracking-wider">报价意向</h1>
              <p className="text-metal-400 text-sm mt-0.5">计算购房预算，生成报价清单</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveDraft} className="btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" />
              保存草稿
            </button>
            <button onClick={handleExport} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" strokeWidth={2.5} />
              导出报价单
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5 text-aurora-400" />
                  <span className="text-metal-100 font-semibold">意向清单</span>
                  <span className="tag-chip">{quotes.length}</span>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-ghost flex items-center gap-1.5 text-aurora-400"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  添加房源
                </button>
              </div>

              {quotes.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-12 h-12 text-metal-500 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-metal-300 mb-1">暂无房源</p>
                  <p className="text-metal-500 text-sm">点击上方"添加房源"开始创建报价</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((q) => {
                    const property = properties.find((p) => p.id === q.propertyId);
                    const discountedPrice = q.price * (q.discount / 100);
                    const downPayment = discountedPrice * (q.downPaymentRatio / 100);
                    const loanAmount = discountedPrice - downPayment;
                    const monthlyPayment = calculateMonthlyPayment(
                      loanAmount * 10000,
                      q.interestRate,
                      q.loanYears
                    );

                    return (
                      <div
                        key={q.id}
                        className="rounded-xl bg-space-800/40 border border-metal-500/20 p-4"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-space-700 to-space-600 flex items-center justify-center overflow-hidden">
                              {property?.coverImage ? (
                                <img
                                  src={property.coverImage}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <HomeIcon className="w-6 h-6 text-metal-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-metal-100 font-medium">{q.propertyTitle}</p>
                              <p className="text-aurora-400 text-lg font-bold mt-0.5">
                                ¥{q.price}万
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeQuote(q.id)}
                            className="p-1.5 rounded-lg text-metal-400 hover:text-coral-500 hover:bg-coral-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-metal-500 text-xs mb-1.5 flex items-center gap-1">
                              <Percent className="w-3 h-3" />
                              折扣
                            </label>
                            <input
                              type="number"
                              value={q.discount}
                              min={50}
                              max={100}
                              onChange={(e) =>
                                updateQuote(q.id, { discount: Number(e.target.value) })
                              }
                              className="input-field text-sm py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-metal-500 text-xs mb-1.5 flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              首付%
                            </label>
                            <input
                              type="number"
                              value={q.downPaymentRatio}
                              min={10}
                              max={90}
                              onChange={(e) =>
                                updateQuote(q.id, {
                                  downPaymentRatio: Number(e.target.value),
                                })
                              }
                              className="input-field text-sm py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-metal-500 text-xs mb-1.5 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              贷款年限
                            </label>
                            <select
                              value={q.loanYears}
                              onChange={(e) =>
                                updateQuote(q.id, { loanYears: Number(e.target.value) })
                              }
                              className="input-field text-sm py-2"
                            >
                              {LOAN_YEARS_OPTIONS.map((y) => (
                                <option key={y} value={y}>
                                  {y}年
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-metal-500 text-xs mb-1.5">利率(%)</label>
                            <input
                              type="number"
                              value={q.interestRate}
                              step={0.1}
                              onChange={(e) =>
                                updateQuote(q.id, { interestRate: Number(e.target.value) })
                              }
                              className="input-field text-sm py-2"
                            />
                          </div>
                        </div>

                        <div className="divider-glow my-4" />

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-metal-500 text-xs mb-1">优惠后</p>
                            <p className="text-metal-100 font-semibold">
                              ¥{discountedPrice.toFixed(2)}万
                            </p>
                          </div>
                          <div>
                            <p className="text-metal-500 text-xs mb-1">首付</p>
                            <p className="text-aurora-400 font-semibold">
                              ¥{downPayment.toFixed(2)}万
                            </p>
                          </div>
                          <div>
                            <p className="text-metal-500 text-xs mb-1">月供</p>
                            <p className="text-amber-400 font-semibold">
                              ¥{monthlyPayment.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-aurora-400" />
                <span className="text-metal-100 font-semibold">费用构成</span>
              </div>

              {pieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-metal-500 text-sm">添加房源后查看费用构成</p>
                </div>
              ) : (
                <>
                  <div className="relative w-48 h-48 mx-auto mb-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {(() => {
                        let cumulativePercent = 0;
                        return pieData.map((d, i) => {
                          const startPercent = cumulativePercent;
                          cumulativePercent += d.percent;
                          const startAngle = (startPercent / 100) * 2 * Math.PI;
                          const endAngle = (cumulativePercent / 100) * 2 * Math.PI;
                          const x1 = 50 + 40 * Math.cos(startAngle);
                          const y1 = 50 + 40 * Math.sin(startAngle);
                          const x2 = 50 + 40 * Math.cos(endAngle);
                          const y2 = 50 + 40 * Math.sin(endAngle);
                          const largeArcFlag = d.percent > 50 ? 1 : 0;
                          const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                          return <path key={i} d={pathData} fill={d.color} opacity={0.9} />;
                        });
                      })()}
                      <circle cx="50" cy="50" r="22" fill="#0F1F38" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-metal-500 text-xs">总价</p>
                      <p className="text-aurora-400 font-bold text-lg">
                        ¥{formatWan(summary.totalDownPayment + summary.totalLoan + summary.totalInterest + summary.tax + summary.maintenanceFund)}万
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-metal-300">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-metal-400 text-xs">
                            {d.percent.toFixed(1)}%
                          </span>
                          <span className="text-metal-100 font-medium w-20 text-right">
                            ¥{formatWan(d.value)}万
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <span className="text-metal-100 font-semibold block mb-4">费用明细</span>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-metal-400">房源总价</span>
                  <span className="text-metal-100">¥{formatWan(summary.totalOriginalPrice)}万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-400">优惠折扣</span>
                  <span className="text-coral-400">-¥{formatWan(summary.totalDiscount)}万</span>
                </div>
                <div className="divider-glow" />
                <div className="flex justify-between">
                  <span className="text-metal-400">优惠后总价</span>
                  <span className="text-metal-100 font-semibold">
                    ¥{formatWan(summary.totalDiscountedPrice)}万
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-400">首付金额</span>
                  <span className="text-aurora-400 font-semibold">
                    ¥{formatWan(summary.totalDownPayment)}万
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-400">贷款金额</span>
                  <span className="text-metal-100">¥{formatWan(summary.totalLoan)}万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-400">贷款利息</span>
                  <span className="text-metal-100">¥{formatWan(summary.totalInterest)}万</span>
                </div>
                <div className="divider-glow" />
                <div className="flex justify-between">
                  <span className="text-metal-400">税费(约1%)</span>
                  <span className="text-metal-100">¥{formatWan(summary.tax)}万</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-metal-400">维修基金(约2%)</span>
                  <span className="text-metal-100">¥{formatWan(summary.maintenanceFund)}万</span>
                </div>
                <div className="divider-glow" />
                <div className="flex justify-between items-center">
                  <span className="text-metal-200 font-medium">月供合计</span>
                  <span className="text-amber-400 text-xl font-bold">
                    ¥{summary.totalMonthlyPayment.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-metal-100 font-semibold">首付出资合计</span>
                  <span className="text-aurora-400 text-xl font-bold">
                    ¥{formatWan(summary.totalCost)}万
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient font-display">添加房源</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-metal-400 hover:text-metal-200 hover:bg-metal-500/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-metal-300 text-sm font-medium mb-2">选择房源</label>
              {availableProperties.length === 0 ? (
                <div className="py-8 text-center text-metal-500 text-sm">
                  所有房源已添加到报价单
                </div>
              ) : (
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="input-field"
                >
                  <option value="">请选择房源</option>
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} - ¥{p.price}万
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-metal-500 text-xs mb-1.5">首付比例%</label>
                <input
                  type="number"
                  value={globalDownPaymentRatio}
                  min={10}
                  max={90}
                  onChange={(e) => setGlobalDownPaymentRatio(Number(e.target.value))}
                  className="input-field text-sm py-2"
                />
              </div>
              <div>
                <label className="block text-metal-500 text-xs mb-1.5">贷款年限</label>
                <select
                  value={globalLoanYears}
                  onChange={(e) => setGlobalLoanYears(Number(e.target.value))}
                  className="input-field text-sm py-2"
                >
                  {LOAN_YEARS_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-metal-500 text-xs mb-1.5">利率%</label>
                <input
                  type="number"
                  value={globalInterestRate}
                  step={0.1}
                  onChange={(e) => setGlobalInterestRate(Number(e.target.value))}
                  className="input-field text-sm py-2"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                取消
              </button>
              <button
                onClick={handleAddProperty}
                disabled={!selectedPropertyId}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {(showExportTip || showSaveTip) && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="glass-card rounded-xl px-6 py-3 flex items-center gap-2 shadow-lg shadow-aurora-500/20">
            <CheckCircle className="w-5 h-5 text-aurora-400" />
            <span className="text-metal-100 text-sm">
              {showExportTip ? '报价单导出成功！' : '草稿已保存！'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
