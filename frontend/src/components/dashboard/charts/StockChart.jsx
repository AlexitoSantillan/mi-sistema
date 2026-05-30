import { useEffect, useState } from "react";
import api from "../../../services/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function StockChart() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/dashboard/chart/stock")
      .then(setData);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="stock"
          stroke="#0f766e"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default StockChart;