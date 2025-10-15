import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 28000 },
  { month: "Jun", revenue: 25000 },
];

const vendorData = [
  { month: "Jan", vendors: 20 },
  { month: "Feb", vendors: 35 },
  { month: "Mar", vendors: 50 },
  { month: "Apr", vendors: 65 },
  { month: "May", vendors: 80 },
  { month: "Jun", vendors: 95 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold text-[var(--text-color)]">
        📊 Dashboard Overview
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg text-white flex items-center gap-4">
          <span className="text-4xl leading-none">🧑‍🤝‍🧑</span>
          <div>
            <p className="text-sm opacity-80">Total Users</p>
            <h3 className="text-2xl font-bold">1,245</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg text-white flex items-center gap-4">
          <span className="text-4xl leading-none">💸</span>
          <div>
            <p className="text-sm opacity-80">Total Revenue</p>
            <h3 className="text-2xl font-bold">₹54,300</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg text-white flex items-center gap-4">
          <span className="text-4xl leading-none">🧾</span>
          <div>
            <p className="text-sm opacity-80">Invoices</p>
            <h3 className="text-2xl font-bold">3,210</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 shadow-lg text-white flex items-center gap-4">
          <span className="text-4xl leading-none">🏢</span>
          <div>
            <p className="text-sm opacity-80">Vendors</p>
            <h3 className="text-2xl font-bold">98</h3>
          </div>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[var(--bg)] shadow rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            Revenue Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor Growth */}
        <div className="bg-[var(--bg)] shadow rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            Vendor Registrations
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vendorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendors" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--bg)] shadow rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
          Recent Transactions
        </h3>
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[var(--secondary-bg)] text-[var(--accent)]">
            <tr>
              <th className="px-4 py-2">Invoice ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2">#INV-1001</td>
              <td className="px-4 py-2">John Doe</td>
              <td className="px-4 py-2">₹320</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                  <span>✅</span>
                  <span>Paid</span>
                </span>
              </td>
              <td className="px-4 py-2">24 Aug 2025</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2">#INV-1002</td>
              <td className="px-4 py-2">Jane Smith</td>
              <td className="px-4 py-2">₹150</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                  <span>⏳</span>
                  <span>Pending</span>
                </span>
              </td>
              <td className="px-4 py-2">23 Aug 2025</td>
            </tr>
            <tr>
              <td className="px-4 py-2">#INV-1003</td>
              <td className="px-4 py-2">Apex Supplies</td>
              <td className="px-4 py-2">₹780</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                  <span>⚠️</span>
                  <span>Overdue</span>
                </span>
              </td>
              <td className="px-4 py-2">22 Aug 2025</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
