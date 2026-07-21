import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#7C5CFF', '#FF7A45', '#9B80FF', '#FF9466', '#5B3FD9']

export default function GenrePieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#211D2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
