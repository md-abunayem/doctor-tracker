"use client";

import Link from "next/link";
import { Users, Stethoscope, UserRound, TrendingUp, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import DashboardLayout from "../../../components/layouts/dashboard-layout";
import { Card } from "../../../components/ui/Card";
import { Loading } from "../../../components/ui/Loading";
import { PageHeading } from "../../../components/ui/PageHeading";
import { useDashboardQuery } from "@/lib/api";

const COLORS = ["#3978f6", "#18a77a", "#f2a93b", "#9565e8", "#e66b8a"];

type DashboardStats = {
  totals?: {
    totalDoctors?: number;
    totalPatients?: number;
    averagePatientsPerDoctor?: number;
    newPatientsThisMonth?: number;
  };
  recentPatients?: {
    _id?: string;
    id?: string;
    name: string;
    condition?: string;
    createdAt?: string;
  }[];
  patientsOverTime?: { month: string; count: number }[];
  patientsPerDoctor?: { doctorId: string; name: string; count: number }[];
  patientsByCondition?: { condition: string; count: number }[];
};

function normalize(value: unknown): DashboardStats {
  if (!value || typeof value !== "object") return {};

  const response = value as { data?: unknown };
  const stats = response.data ?? value;
  return stats && typeof stats === "object" ? (stats as DashboardStats) : {};
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardQuery();
  const stats = normalize(data);

  const recent = stats.recentPatients ?? [];
  const trend = stats.patientsOverTime ?? [];
  const perDoctor = stats.patientsPerDoctor ?? [];
  const conditions = stats.patientsByCondition ?? [];

  const metrics = [
    {
      label: "Total doctors",
      value: stats.totals?.totalDoctors ?? 0,
      icon: Stethoscope,
      note: "Registered doctors",
    },
    {
      label: "Total patients",
      value: stats.totals?.totalPatients ?? 0,
      icon: Users,
      note: "Patient records",
    },
    {
      label: "Avg. patients / doctor",
      value: stats.totals?.averagePatientsPerDoctor ?? 0,
      icon: UserRound,
      note: "Across all doctors",
    },
    {
      label: "New patients",
      value: stats.totals?.newPatientsThisMonth ?? 0,
      icon: TrendingUp,
      note: "This month",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeading
        title="Dashboard"
        description="Here's an overview of your healthcare operations."
        action={
          <Link href="/doctors" className="btn-primary">
            <Plus size={17} /> Add doctor
          </Link>
        }
      />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Card className="p-6">
          <p style={{ color: "var(--danger)" }}>
            Could not load dashboard statistics. Check your API connection.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, note }) => (
              <Card key={label} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm muted">{label}</p>
                    <p className="mt-3 text-3xl font-bold">{value}</p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--primary-soft)",
                      color: "var(--primary)",
                    }}
                  >
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-xs muted">{note}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <h2 className="font-bold">Patient growth</h2>
              <p className="mt-1 text-xs muted">
                Patient registrations over time
              </p>
              <div className="mt-6 h-64">
                {trend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend}>
                      <CartesianGrid
                        stroke="var(--border)"
                        strokeDasharray="4 4"
                      />
                      <XAxis dataKey="month" stroke="var(--muted)" />
                      <YAxis stroke="var(--muted)" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3978f6"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm muted">
                    No patient growth data available.
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="font-bold">Patients by doctor</h2>
              <p className="mt-1 text-xs muted">
                Patient distribution across doctors
              </p>
              <div className="mt-6 h-64">
                {perDoctor.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perDoctor} layout="vertical">
                      <CartesianGrid
                        stroke="var(--border)"
                        strokeDasharray="4 4"
                      />
                      <XAxis type="number" stroke="var(--muted)" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={105}
                        stroke="var(--muted)"
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#3978f6"
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm muted">
                    No doctor distribution data available.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
            <Card className="p-5 sm:p-6">
              <h2 className="font-bold">Patient conditions</h2>
              <p className="mt-1 text-xs muted">
                Breakdown by recorded condition
              </p>
              <div className="mt-4 h-56">
                {conditions.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditions}
                        dataKey="count"
                        nameKey="condition"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {conditions.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm muted">
                    No condition data available.
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {conditions.map((item, index) => (
                  <div
                    key={item.condition}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: COLORS[index % COLORS.length],
                        }}
                      />
                      {item.condition}
                    </span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between p-5 sm:p-6">
                <div>
                  <h2 className="font-bold">Recent patients</h2>
                  <p className="mt-1 text-xs muted">Latest patient records</p>
                </div>
                <Link
                  href="/patients"
                  className="text-xs font-semibold"
                  style={{ color: "var(--primary)" }}
                >
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Condition</th>
                      <th>Date added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((patient) => (
                      <tr key={patient._id ?? patient.id}>
                        <td className="font-semibold">{patient.name}</td>
                        <td>{patient.condition}</td>
                        <td className="muted">
                          {patient.createdAt
                            ? new Date(patient.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {!recent.length && (
                      <tr>
                        <td colSpan={3} className="py-10 text-center muted">
                          No recent patient records.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
