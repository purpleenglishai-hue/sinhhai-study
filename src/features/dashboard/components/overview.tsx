import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const data = [
  {
    name: 'Th 2',
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: 'Th 3',
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: 'Th 4',
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: 'Th 5',
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: 'Th 6',
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: 'Th 7',
    total: Math.floor(Math.random() * 5) + 1,
  },
  {
    name: 'CN',
    total: Math.floor(Math.random() * 5) + 1,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
