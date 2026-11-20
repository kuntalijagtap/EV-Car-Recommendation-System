import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const inr = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export default function EMICalculator({ price }) {
  const [open, setOpen] = useState(false);
  const [downPercent, setDownPercent] = useState(20);
  const [annualRate, setAnnualRate] = useState(9.5);
  const [years, setYears] = useState(5);
  const loan = Math.max(0, (Number(price) || 0) * (1 - downPercent / 100));
  const { emi, schedule } = useMemo(() => {
    const months = years * 12; const monthly = annualRate / 1200;
    const payment = loan === 0 ? 0 : monthly === 0 ? loan / months : loan * monthly * (1 + monthly) ** months / ((1 + monthly) ** months - 1);
    let balance = loan; const yearly = [];
    for (let year = 1; year <= years; year += 1) {
      let principalPaid = 0; let interestPaid = 0;
      for (let month = 0; month < 12; month += 1) {
        const interest = balance * monthly; const principal = Math.min(balance, payment - interest);
        interestPaid += interest; principalPaid += principal; balance = Math.max(0, balance - principal);
      }
      yearly.push({ year, principalPaid, interestPaid, balance });
    }
    return { emi: payment, schedule: yearly };
  }, [loan, years, annualRate]);

  return <section className="rounded-2xl border border-aurora-border bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Plan your purchase</p><h2 className="mt-1 font-display text-lg font-semibold text-aurora-text">EMI calculator</h2></div><button type="button" onClick={() => setOpen((value) => !value)} className="evora-green-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"><Calculator className="h-4 w-4" />{open ? 'Hide loan details' : 'Calculate EMI'}</button></div>
    {open && <div className="mt-5 space-y-5"><div className="grid gap-4 sm:grid-cols-3">
      <label className="text-xs font-semibold text-slate-700">Down payment: {downPercent}%<input type="range" min="0" max="80" step="5" value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value))} className="mt-3 block w-full accent-emerald-600" /><span className="mt-1 block text-slate-500">{inr((Number(price) || 0) * downPercent / 100)}</span></label>
      <label className="text-xs font-semibold text-[#334155]">Interest rate (% p.a.)<input type="number" min="0" max="30" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0f172a]" /></label>
      <label className="text-xs font-semibold text-[#334155]">Loan tenure<select value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[#0f172a]">{[1,2,3,4,5,6,7].map((y) => <option key={y} value={y}>{y} years</option>)}</select></label>
    </div><div className="grid gap-3 sm:grid-cols-3"><div style={{ backgroundColor: '#dcfce7', color: '#14532d' }} className="rounded-xl p-4"><span style={{ color: '#14532d' }} className="text-xs font-semibold">Monthly EMI</span><b style={{ color: '#14532d' }} className="mt-1 block text-xl">{inr(emi)}</b></div><div style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }} className="rounded-xl p-4"><span style={{ color: '#334155' }} className="text-xs font-semibold">Loan amount</span><b style={{ color: '#0f172a' }} className="mt-1 block text-lg font-bold">{inr(loan)}</b></div><div style={{ backgroundColor: '#fef3c7', color: '#78350f' }} className="rounded-xl p-4"><span style={{ color: '#78350f' }} className="text-xs font-semibold">Total interest</span><b style={{ color: '#78350f' }} className="mt-1 block text-lg font-bold">{inr(emi * years * 12 - loan)}</b></div></div>
      <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[540px] text-left text-sm"><thead className="bg-slate-50 text-xs text-[#475569]"><tr><th className="p-3">Year</th><th className="p-3">Principal paid</th><th className="p-3">Interest paid</th><th className="p-3">Balance</th></tr></thead><tbody>{schedule.map((row) => <tr key={row.year} className="border-t border-slate-100 text-[#334155]"><td className="p-3">Year {row.year}</td><td className="p-3">{inr(row.principalPaid)}</td><td className="p-3">{inr(row.interestPaid)}</td><td className="p-3 font-semibold text-[#0f172a]">{inr(row.balance)}</td></tr>)}</tbody></table></div><p className="text-[11px] text-[#475569]">Illustrative estimate only. Your lender’s rate, fees and loan terms determine the final EMI.</p></div>}
  </section>;
}
