import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from './CostBreakdownChart.module.css';
import { formatCurrency } from '../../utils/formatters';

const COLORS = {
  transport: '#0088FE',
  accommodation: '#00C49F',
  food: '#FFBB28',
  activity: '#FF8042',
  misc: '#8884d8'
};

const CostBreakdownChart = ({ breakdown = {} }) => {
  const data = Object.keys(breakdown).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: breakdown[key],
    category: key
  })).filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        No cost breakdown data available.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{payload[0].name}</p>
          <p className={styles.tooltipValue}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Cost Breakdown</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.category] || COLORS.misc} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostBreakdownChart;
