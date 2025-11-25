import { FinancialCategory } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface FinancialStructureCardProps {
  structure: FinancialCategory[];
  title?: string;
}

export function FinancialStructureCard({
  structure,
  title = "Financial Distribution",
}: FinancialStructureCardProps) {
  const chartData = structure.map((item) => ({
    name: item.category,
    value: item.percentage,
  }));

  const colors = structure.map((item) => {
    const colorMap: Record<string, string> = {
      "from-red-500 to-orange-600": "#ef4444",
      "from-green-500 to-emerald-600": "#22c55e",
      "from-blue-500 to-cyan-600": "#3b82f6",
      "from-purple-500 to-pink-600": "#a855f7",
      "from-indigo-500 to-blue-600": "#6366f1",
      "from-yellow-500 to-amber-600": "#eab308",
    };
    return colorMap[item.color] || "#8884d8";
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {colors.map((color, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
