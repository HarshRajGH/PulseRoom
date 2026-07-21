import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ListeningAreaChart({ data, dataKey = 'minutes', color = '#7C5CFF' }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: -20, top: 10 }}>
        <defs>
          <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={Object.keys(data[0])[0]} tick={{ fill: '#A8A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#A8A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#211D2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#fillArea)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
