import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function SimpleLineChart({ data, dataKey, xKey, color = '#FF7A45' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: -20, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: '#A8A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#A8A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#211D2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
