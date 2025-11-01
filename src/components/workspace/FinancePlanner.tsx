"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { financeService, type Transaction } from "@/services/finance.service"
import toast from "react-hot-toast"

type Split = {
  investPct: number
  sinkingPct: number
  essentialsPct: number
  discretionaryPct: number
}

type SinkingFund = { id: string; name: string; amount: number }
type Caps = Record<string, number>

type PlannerState = {
  monthlyIncome: number
  split: Split
  sinkingFunds: SinkingFund[]
  categoryCaps: Caps
  emergencyFund: number
  plannedInvestUsd: number
  plannedSinkingUsd: number
}

const DEFAULT_CAP_CATEGORIES: string[] = [
  "food",
  "transportation",
  "entertainment",
  "shopping",
  "bills",
  "healthcare",
  "education",
  "travel",
  "subscriptions",
  "other_expense",
]

const STORAGE_KEY = "financePlannerSettings"

export default function FinancePlanner() {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  })
  const [monthTxns, setMonthTxns] = useState<Transaction[]>([])
  const [nudge, setNudge] = useState<string>("")
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [state, setState] = useState<PlannerState>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as PlannerState
      } catch {}
    }
    return {
      monthlyIncome: 4000,
      split: { investPct: 25, sinkingPct: 10, essentialsPct: 55, discretionaryPct: 10 },
      sinkingFunds: [
        { id: crypto.randomUUID(), name: "Insurance", amount: 100 },
        { id: crypto.randomUUID(), name: "Travel", amount: 150 },
      ],
      categoryCaps: DEFAULT_CAP_CATEGORIES.reduce<Caps>((acc, c) => { acc[c] = 0; return acc }, {}),
      emergencyFund: 0,
      plannedInvestUsd: 180,
      plannedSinkingUsd: 105,
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const pctTotal = useMemo(() => state.split.investPct + state.split.sinkingPct + state.split.essentialsPct + state.split.discretionaryPct, [state.split])
  const allocations = useMemo(() => {
    const inc = state.monthlyIncome || 0
    const toAmt = (p: number) => Math.round((inc * p) / 100)
    return {
      invest: toAmt(state.split.investPct),
      sinking: toAmt(state.split.sinkingPct),
      essentials: toAmt(state.split.essentialsPct),
      discretionary: toAmt(state.split.discretionaryPct),
    }
  }, [state.monthlyIncome, state.split])

  // Sinking table helpers
  const sinkingTotal = useMemo(() => state.sinkingFunds.reduce((s, f) => s + (Number(f.amount) || 0), 0), [state.sinkingFunds])
  const addSinkingFund = () => setState((p) => ({ ...p, sinkingFunds: [...p.sinkingFunds, { id: crypto.randomUUID(), name: "New Fund", amount: 0 }] }))
  const removeSinkingFund = (id: string) => setState((p) => ({ ...p, sinkingFunds: p.sinkingFunds.filter(f => f.id !== id) }))

  // Load month transactions (list view drives actuals)
  const monthEnd = useMemo(() => { const [y,m] = selectedMonth.split('-').map(Number); return new Date(y, m, 0) }, [selectedMonth])
  useEffect(() => {
    const load = async () => {
      try {
        const startISO = `${selectedMonth}-01`
        const endISO = `${selectedMonth}-${String(monthEnd.getDate()).padStart(2,'0')}`
        const { transactions } = await financeService.getTransactions({ startDate: startISO, endDate: endISO, limit: 1000 })
        setMonthTxns(transactions)
      } catch (e) {
        console.error(e)
        toast.error('Failed to load monthly transactions')
        setMonthTxns([])
      }
    }
    load()
  }, [selectedMonth, monthEnd])

  // Bucket mapping (simple)
  const DISCRETIONARY = new Set(["entertainment","shopping","travel","subscriptions","other_expense"]) as Set<string>
  const totals = useMemo(() => {
    const sum = { INVEST: 0, SINKING: 0, ESSENTIALS: 0, DISCRETIONARY: 0 }
    for (const t of monthTxns) {
      if (t.type !== 'expense') continue
      const cat = (t.category || '').toLowerCase()
      if (DISCRETIONARY.has(cat)) sum.DISCRETIONARY += t.amount
      else sum.ESSENTIALS += t.amount
    }
    return sum
  }, [monthTxns])

  // Caps (USD)
  const caps = useMemo(() => ({
    INVEST: Math.round((state.split.investPct / 100) * state.monthlyIncome),
    SINKING: Math.round((state.split.sinkingPct / 100) * state.monthlyIncome),
    ESSENTIALS: Math.round((state.split.essentialsPct / 100) * state.monthlyIncome),
    DISCRETIONARY: Math.round((state.split.discretionaryPct / 100) * state.monthlyIncome),
  }), [state.split, state.monthlyIncome])

  // Actuals (Invest/Sinking include planned transfers for KPI purposes)
  const actuals = useMemo(() => ({
    INVEST: totals.INVEST + (state.plannedInvestUsd || 0),
    SINKING: totals.SINKING + (state.plannedSinkingUsd || 0),
    ESSENTIALS: totals.ESSENTIALS,
    DISCRETIONARY: totals.DISCRETIONARY,
  }), [totals, state.plannedInvestUsd, state.plannedSinkingUsd])

  // KPIs
  const savingsRate = useMemo(() => (state.monthlyIncome ? (actuals.INVEST + actuals.SINKING) / state.monthlyIncome : 0), [actuals, state.monthlyIncome])
  const essentialsShare = useMemo(() => (state.monthlyIncome ? (actuals.ESSENTIALS / state.monthlyIncome) : 0), [actuals, state.monthlyIncome])
  const avgMonthlyExpenses = useMemo(() => actuals.ESSENTIALS + actuals.DISCRETIONARY, [actuals])
  const runway = useMemo(() => (avgMonthlyExpenses > 0 ? state.emergencyFund / avgMonthlyExpenses : null), [state.emergencyFund, avgMonthlyExpenses])

  const colorForMin = (v: number, min: number) => (v >= min ? 'bg-green-600' : v >= (min - 0.05) ? 'bg-yellow-500' : 'bg-red-600')
  const colorForMax = (v: number, max: number) => (v <= max ? 'bg-green-600' : v <= (max + 0.05) ? 'bg-yellow-500' : 'bg-red-600')

  // Weekly Check button
  const runWeeklyCheck = () => {
    const breaches = [
      { key: 'INVEST' as const },
      { key: 'SINKING' as const },
      { key: 'ESSENTIALS' as const },
      { key: 'DISCRETIONARY' as const },
    ].filter(({ key }) => actuals[key] > caps[key])

    if (breaches.length === 0) {
      setNudge("On track. Roll surplus into Investments (‘No Zero Days’).")
      toast.success('On track this week')
      return
    }
    const largest = breaches.sort((a,b)=> (actuals[b.key]-caps[b.key]) - (actuals[a.key]-caps[a.key]))[0]
    const entries = monthTxns.filter(t=> t.type==='expense').map(t=> ({ cat: t.category, amt: t.amount, bucket: DISCRETIONARY.has((t.category||'').toLowerCase()) ? 'DISCRETIONARY' : 'ESSENTIALS' as const }))
    const filtered = entries.filter(e=> e.bucket === largest.key)
    const top = filtered.sort((a,b)=> b.amt-a.amt)[0]
    const catName = top?.cat || (largest.key === 'DISCRETIONARY' ? 'Discretionary' : 'Essentials')
    const delta = Math.max(0, Math.round(actuals[largest.key] - caps[largest.key]))
    setNudge(`Cut ${catName} by $${Math.min(Math.max(delta, 40), 100)} next week to move ${largest.key} toward cap; redirect to Invest.`)
    toast.error('Over cap — suggestion added')
  }

  // Monthly Reset button
  const runMonthlyReset = () => {
    const [y,m] = selectedMonth.split('-').map(Number)
    const next = new Date(y, m-1, 1)
    next.setMonth(next.getMonth()+1)
    const nextKey = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}`
    try {
      localStorage.setItem(`${STORAGE_KEY}:${nextKey}`, JSON.stringify({ ...state }))
      toast.success(`Next month (${nextKey}) preloaded`)
    } catch {
      toast.error('Failed to preload next month')
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div>
          <label className="text-xs text-gray-600">Month</label>
          <Input type="month" value={selectedMonth} onChange={(e)=> setSelectedMonth(e.target.value)} className="mt-1 w-[180px] border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded border-3 border-black">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorForMin(savingsRate, 0.35)}`}></span>
            <span className="text-xs">Savings {Math.round(savingsRate*100)}%</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded border-3 border-black">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorForMax(essentialsShare, 0.55)}`}></span>
            <span className="text-xs">Essentials {Math.round(essentialsShare*100)}%</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded border-3 border-black">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-600"></span>
            <span className="text-xs">Runway {runway === null ? '—' : `${runway.toFixed(1)} mo`}</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-600">Income ($)</label>
          <Input type="number" min={0} value={state.monthlyIncome} onChange={(e)=> setState(p=>({ ...p, monthlyIncome: Number(e.target.value||0) }))} className="mt-1 w-[140px] border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
        </div>
      </div>

      {/* Split + Income Table */}
      <div className="bg-white rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">Budget Planner</h3>
          <Badge className={`text-xs ${pctTotal === 100 ? "bg-green-600" : "bg-red-600"}`}>{pctTotal}%</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
          <div className="col-span-2 md:col-span-2">
            <label className="text-xs text-gray-600">Monthly Income ($)</label>
            <Input type="number" min={0} value={state.monthlyIncome} onChange={(e)=> setState(p=>({ ...p, monthlyIncome: Number(e.target.value||0) }))} className="mt-1 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
          </div>
          {([
            ["Invest (25%)", "investPct"],
            ["Sinking (10%)", "sinkingPct"],
            ["Essentials (55%)", "essentialsPct"],
            ["Discretionary (10%)", "discretionaryPct"],
          ] as const).map(([label, key]) => (
            <div key={key}>
              <label className="text-xs text-gray-600">{label}</label>
              <div className="flex items-center gap-2 mt-1">
                <Input type="number" min={0} max={100} value={state.split[key]} onChange={(e)=> setState(p=>({ ...p, split: { ...p.split, [key]: Number(e.target.value||0) } }))} className="border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)] w-20" />
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ${ key === "investPct" ? allocations.invest : key === "sinkingPct" ? allocations.sinking : key === "essentialsPct" ? allocations.essentials : allocations.discretionary }
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Planned transfers inline */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <label className="text-xs text-gray-600">Planned Invest ($)</label>
            <Input type="number" min={0} value={state.plannedInvestUsd} onChange={(e)=> setState(p=>({ ...p, plannedInvestUsd: Number(e.target.value||0) }))} className="mt-1 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
          </div>
          <div>
            <label className="text-xs text-gray-600">Planned Sinking ($)</label>
            <Input type="number" min={0} value={state.plannedSinkingUsd} onChange={(e)=> setState(p=>({ ...p, plannedSinkingUsd: Number(e.target.value||0) }))} className="mt-1 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
          </div>
        </div>
        {pctTotal !== 100 && <p className="text-xs text-red-600 mt-2">The split must add up to 100%.</p>}
      </div>

      {/* Sinking Funds */}
      <div className="bg-white rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-3" id="sinking-section">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">Sinking Funds</h3>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${sinkingTotal <= allocations.sinking ? "bg-green-600" : "bg-red-600"}`}>Planned ${sinkingTotal} / Target ${allocations.sinking}</Badge>
            <Button type="button" onClick={addSinkingFund} className="h-8 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Add Row</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Name</th>
                <th className="py-2 w-40">Monthly Amount ($)</th>
                <th className="py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {state.sinkingFunds.map((fund) => (
                <tr key={fund.id} className="border-t">
                  <td className="py-2 pr-2">
                    <Input value={fund.name} onChange={(e)=> setState(p=>({ ...p, sinkingFunds: p.sinkingFunds.map(f=> f.id===fund.id ? { ...f, name: e.target.value } : f) }))} className="border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
                  </td>
                  <td className="py-2 pr-2">
                    <Input type="number" min={0} value={fund.amount} onChange={(e)=> setState(p=>({ ...p, sinkingFunds: p.sinkingFunds.map(f=> f.id===fund.id ? { ...f, amount: Number(e.target.value||0) } : f) }))} className="border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
                  </td>
                  <td className="py-2">
                    <Button type="button" variant="outline" onClick={()=> removeSinkingFund(fund.id)} className="h-8 w-full border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPIs + Advanced toggle */}
      <div className="bg-white rounded border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">KPIs</h4>
          <Button type="button" variant="outline" onClick={()=> setShowAdvanced(v=>!v)} className="h-8 px-2 text-xs border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2 rounded border-3 border-black bg-gray-50">
            <div className="text-xs text-gray-600">Savings rate</div>
            <div className="text-base font-semibold flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorForMin(savingsRate, 0.35)}`}></span>
              {Math.round(savingsRate*100)}%
            </div>
          </div>
          <div className="p-2 rounded border-3 border-black bg-gray-50">
            <div className="text-xs text-gray-600">Essentials share</div>
            <div className="text-base font-semibold flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorForMax(essentialsShare, 0.55)}`}></span>
              {Math.round(essentialsShare*100)}%
            </div>
          </div>
          <div className="p-2 rounded border-3 border-black bg-gray-50">
            <div className="text-xs text-gray-600">Emergency Fund ($)</div>
            <Input type="number" min={0} value={state.emergencyFund} onChange={(e)=> setState(p=>({ ...p, emergencyFund: Number(e.target.value||0) }))} className="mt-1 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
          </div>
          <div className="p-2 rounded border-3 border-black bg-gray-50">
            <div className="text-xs text-gray-600">Runway</div>
            <div className="text-base font-semibold">{runway === null ? '—' : `${runway.toFixed(1)} mo`}</div>
          </div>
        </div>
        <div className="text-[10px] text-gray-600 mt-2">Targets: Savings ≥35%, Essentials ≤55%</div>
        {showAdvanced && (
          <div className="mt-4 space-y-4">
            {/* Category Caps */}
            <div>
              <h5 className="text-sm font-semibold mb-2">Expense Category Caps</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DEFAULT_CAP_CATEGORIES.map((cat) => (
                  <div key={cat}>
                    <label className="text-xs text-gray-600 capitalize">{cat.replace("_"," ")}</label>
                    <Input type="number" min={0} value={state.categoryCaps[cat] || 0} onChange={(e)=> setState(p=>({ ...p, categoryCaps: { ...p.categoryCaps, [cat]: Number(e.target.value||0) } }))} className="mt-1 border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)]" />
                  </div>
                ))}
              </div>
            </div>
            {/* Caps vs Actuals */}
            <div>
              <h5 className="text-sm font-semibold mb-2">Caps vs Actuals</h5>
              {([['INVEST','Invest'],['SINKING','Sinking'],['ESSENTIALS','Essentials'],['DISCRETIONARY','Discretionary']] as const).map(([key,label])=>{
                const cap = caps[key]
                const act = actuals[key]
                const ratio = cap ? Math.min(act/cap, 1.25) : 0
                return (
                  <div key={key} className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>{label}</span>
                      <span>${act} / ${cap}</span>
                    </div>
                    <div className="h-4 bg-gray-100 border border-gray-300 rounded relative" title={`Actual $${act} / Cap $${cap} (Δ $${act-cap})`}>
                      <div className={`h-4 ${act > cap ? 'bg-red-500' : (act >= cap * 0.95 ? 'bg-yellow-400' : 'bg-green-500')} rounded`} style={{ width: `${Math.min(100, Math.round(ratio*100))}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Coach */}
            <div className="flex flex-col">
              <h5 className="text-sm font-semibold mb-2">Coach</h5>
              <p className="text-sm text-gray-800 min-h-[32px]">{nudge || 'Tap Weekly Check for a suggestion.'}</p>
              <div className="mt-2 flex gap-2">
                <Button type="button" onClick={runWeeklyCheck} className="border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)] h-8 px-3 text-xs">Weekly Check</Button>
                <Button type="button" variant="outline" onClick={runMonthlyReset} className="border-3 border-black rounded shadow-[3px_3px_0_0_rgba(0,0,0,1)] h-8 px-3 text-xs">Monthly Reset</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* (Advanced content moved above) */}
    </div>
  )
}


