"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import axiosInstance from "@/lib/api/axios-instance";

const COLORS = ['#10b981', '#f43f5e']; 

export default function DashboardCharts() {
  const [data, setData] = useState({ revenue: [], occupancy: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/dashboard/analytics");
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>Loading charts...</div>;
  }

  return (
    <div className="dashboard-grid-2" style={{ marginTop: "24px" }}>
      
     
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Monthly Revenue</span>
        </div>
        <div style={{ height: "300px", width: "100%", paddingRight: "10px" }}>
          {data.revenue.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: "14px", padding: "40px 0", textAlign: "center" }}>
              No revenue data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `NPR ${val}`} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`NPR ${Number(value || 0).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#1a56db" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    
      <div className="chart-card">
        <div className="chart-header">
          <span className="chart-title">Property Occupancy</span>
        </div>
        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.occupancy}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                cx="50%"
                cy="50%"
              >
                {data.occupancy.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
