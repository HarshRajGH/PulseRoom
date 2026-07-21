import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function RevenueBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#A8A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#A8A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#211D2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="revenue" fill="#7C5CFF" radius={[6, 6, 0, 0]} name="Revenue" />
        <Bar dataKey="tips" fill="#FF7A45" radius={[6, 6, 0, 0]} name="Tips" />
      </BarChart>
    </ResponsiveContainer>
  )
}
