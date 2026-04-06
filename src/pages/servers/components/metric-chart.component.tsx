import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line
} from 'recharts'
import { Card, CardContent, Typography, Box } from '@mui/material'
import type { Metric } from '../../../apis/metrics/metrics.interface'
import dayjs from 'dayjs'
import { formatPercent, formatBytes } from '../../../common/utils/format.utils'

interface MetricChartProps {
    data: Metric[]
    title: string
    type: 'usage' | 'network'
}

export const MetricChartComponent = ({ data, title, type }: MetricChartProps) => {
    if (data.length === 0) {
        return (
            <Card sx={{ height: 350, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box textAlign="center" p={3}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>{title}</Typography>
                    <Typography variant="body2" color="text.disabled">No data points available yet</Typography>
                </Box>
            </Card>
        )
    }

    const chartData = [...data].reverse().map(m => ({
        ...m,
        time: dayjs(m.timestamp).format('HH:mm:ss'),
        cpu: m.cpuUsage,
        ram: m.ramUsage,
        disk: m.diskUsage,
        netIn: m.networkIn,
        netOut: m.networkOut
    }))

    if (type === 'usage') {
        return (
            <Card sx={{ height: 350, mb: 3 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>{title}</Typography>
                    <Box sx={{ flex: 1, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="time"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 100]}
                                    tickFormatter={(val: number) => `${val}%`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [formatPercent(Number(value || 0)), '']}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Area
                                    name="CPU"
                                    type="monotone"
                                    dataKey="cpu"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCpu)"
                                />
                                <Area
                                    name="RAM"
                                    type="monotone"
                                    dataKey="ram"
                                    stroke="#22d3ee"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRam)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card sx={{ height: 350, mb: 3 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" fontWeight={600} mb={2}>{title}</Typography>
                <Box sx={{ flex: 1, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="time"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val: number) => formatBytes(val)}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [formatBytes(Number(value || 0)) + '/s', '']}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Line
                                name="Network In"
                                type="monotone"
                                dataKey="netIn"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                name="Network Out"
                                type="monotone"
                                dataKey="netOut"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    )
}
