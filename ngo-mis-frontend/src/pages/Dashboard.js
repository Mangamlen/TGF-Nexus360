import React, { useEffect, useState, useCallback } from "react";
import * as dashboardService from "../services/dashboardService"; // Updated import
import { getRoleId } from "../utils/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import {
  Users,
  Building,
  Hourglass,
  DollarSign,
  CheckCircle,
  Plane,
  Award,
  XCircle, // For Absent %
  Clock, // For Pending Leaves
  FileText, // For Approved Reports
  Activity, // For FO Activity
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton

// Use theme colors for charts
const CHART_COLORS = [
  "hsl(var(--secondary))", // Eco Green
  "hsl(var(--primary))",   // Navy Blue
  "hsl(var(--accent))",    // Mint Green
  "hsl(var(--soft-teal))", // Soft Teal
  "hsl(var(--status-pending))", // Pending
  "hsl(var(--status-rejected))", // Rejected
  "hsl(var(--muted-foreground))", // Muted
];

const StatCard = ({ title, value, icon, description }) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {/* Icon faded in background (10% opacity) */}
      {React.cloneElement(icon, { className: "absolute right-4 top-4 h-12 w-12 text-muted-foreground opacity-10" })}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-lg" /> {/* Emerald Green underline */}
  </Card>
);

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </CardContent>
  </Card>
);

const TableSkeleton = ({ rows = 5, cols = 3 }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {Array.from({ length: cols }).map((_, i) => (
          <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function Dashboard() {
  const roleId = getRoleId();
  const isAdminOrManager = roleId === 1 || roleId === 2;
  const isHR = roleId === 5;
  const isEmployee = !isAdminOrManager && !isHR;

  const [dashboardData, setDashboardData] = useState({
    adminSummary: null,
    hrSummary: null,
    mySummary: null,
    projectStats: null,
    topHoneyProducers: null,
    topBeneficiaries: null,
    beneficiariesByVillage: [],
    honeyTrend: [],
    modernData: null, // New state for modern dashboard data
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAdminOrManager) {
        // Fetch modern dashboard data
        const modernRes = await dashboardService.getModernDashboardData();
        setDashboardData(prev => ({
          ...prev,
          modernData: modernRes,
        }));
      } else if (isHR) {
        const [hrRes, projectRes] = await Promise.all([
          dashboardService.getHrSummary(),
          dashboardService.getProjectStats(),
        ]);
        setDashboardData(prev => ({ ...prev, hrSummary: hrRes, projectStats: projectRes }));

      } else if (isEmployee) {
        const myRes = await dashboardService.getMySummary();
        setDashboardData(prev => ({ ...prev, mySummary: myRes }));
      }
    } catch (err) {
      // Errors are handled in the service
    } finally {
      setIsLoading(false);
    }
  }, [isAdminOrManager, isHR, isEmployee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { hrSummary, mySummary, modernData } = dashboardData;

  const calculatePercentages = (statsArray, type) => {
    const totalCount = statsArray.reduce((sum, item) => sum + item.count, 0);
    if (totalCount === 0) {
      if (type === 'attendance') return { present: 0, absent: 0 }; // Simplified for now
      if (type === 'leave') return { pending: 0, approved: 0, rejected: 0 };
      return {};
    }

    if (type === 'attendance') {
      const present = (statsArray.find(item => item.status === 'Present')?.count || 0);
      const absent = (statsArray.find(item => item.status === 'Absent')?.count || 0);
      const halfDay = (statsArray.find(item => item.status === 'Half Day')?.count || 0);
      // For simplicity, we'll combine Half Day into Absent for percentage
      const actualAbsent = absent + halfDay;
      
      const presentPercentage = ((present / totalCount) * 100).toFixed(1);
      const absentPercentage = ((actualAbsent / totalCount) * 100).toFixed(1);
      
      // Note: "Late" is not directly available from the current data structure.
      // If "Late" needs to be calculated, more specific data (e.g., check-in times vs. office start time)
      // or backend modifications would be required.
      
      return { present: presentPercentage, absent: absentPercentage };
    }

    if (type === 'leave') {
      const pending = (statsArray.find(item => item.status === 'Pending')?.count || 0);
      const approved = (statsArray.find(item => item.status === 'Approved')?.count || 0);
      const rejected = (statsArray.find(item => item.status === 'Rejected')?.count || 0);
      
      const pendingPercentage = ((pending / totalCount) * 100).toFixed(1);
      const approvedPercentage = ((approved / totalCount) * 100).toFixed(1);
      const rejectedPercentage = ((rejected / totalCount) * 100).toFixed(1);
      
      return { pending: pendingPercentage, approved: approvedPercentage, rejected: rejectedPercentage };
    }

    return {};
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Admin/Manager Dashboard - Modern View */}
      {isAdminOrManager && modernData && (
        <div className="grid gap-4 md:gap-8 grid-cols-12">
          {/* KPI Stat Cards */}
          <div className="col-span-12 grid gap-4 md:gap-8 lg:grid-cols-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Approved Reports"
                  value={modernData.approvedReportsCount || 0}
                  icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                  title="Total Beneficiaries"
                  value={modernData.totalBeneficiaries || 0}
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                  title="FO Activity Count"
                  value={modernData.foActivityCount || 0}
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                />
                {/* Attendance Stats */}
                {(() => {
                  const attendancePercentages = calculatePercentages(modernData.attendanceStats, 'attendance');
                  return (
                    <>
                      <StatCard
                        title="Present % (Last 30 Days)"
                        value={`${attendancePercentages.present}%`}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                      />
                      <StatCard
                        title="Absent % (Last 30 Days)"
                        value={`${attendancePercentages.absent}%`}
                        icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
                      />
                    </>
                  );
                })()}
                {/* Leave Status */}
                {(() => {
                  const leaveStats = modernData.leaveStatus;
                  const leavePercentages = calculatePercentages(modernData.leaveStatus, 'leave');


                  const pendingLeaves = leaveStats.find(item => item.status === 'Pending')?.count || 0;
                  const approvedLeaves = leaveStats.find(item => item.status === 'Approved')?.count || 0;
                  const rejectedLeaves = leaveStats.find(item => item.status === 'Rejected')?.count || 0;

                  return (
                    <>
                      <StatCard
                        title="Pending Leaves"
                        value={`${leavePercentages.pending}% (${pendingLeaves})`}
                        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                      />
                      <StatCard
                        title="Approved Leaves"
                        value={`${leavePercentages.approved}% (${approvedLeaves})`}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
                      />
                      <StatCard
                        title="Rejected Leaves"
                        value={`${leavePercentages.rejected}% (${rejectedLeaves})`}
                        icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
                      />
                    </>
                  );
                })()}
              </>
            )}
          </div>

          {/* Charts Section */}
          <Card className="col-span-12 lg:col-span-6">
            <CardHeader>
              <CardTitle>Attendance Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : modernData.attendanceTrends && modernData.attendanceTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={modernData.attendanceTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" /> {/* Darker gridlines */}
                    <XAxis dataKey="date" stroke="hsl(var(--primary))" tick={{ fill: "hsl(var(--primary))" }} />
                    <YAxis stroke="hsl(var(--primary))" tick={{ fill: "hsl(var(--primary))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "none", borderRadius: "0.5rem", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} /> {/* Rounded glass effect */}
                    <Legend />
                    <Line type="monotone" dataKey="present_count" name="Present Employees" stroke={CHART_COLORS[0]} activeDot={{ r: 8 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No attendance trend data available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-6">
            <CardHeader>
              <CardTitle>Monthly Leaves (Current Year)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : modernData.monthlyLeaves && modernData.monthlyLeaves.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={modernData.monthlyLeaves} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" /> {/* Darker gridlines */}
                    <XAxis dataKey="month" stroke="hsl(var(--primary))" tick={{ fill: "hsl(var(--primary))" }} />
                    <YAxis stroke="hsl(var(--primary))" tick={{ fill: "hsl(var(--primary))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "none", borderRadius: "0.5rem", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} /> {/* Rounded glass effect */}
                    <Legend />
                    <Bar dataKey="leave_count" name="Leaves" fill={CHART_COLORS[0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No monthly leave data available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-12">
            <CardHeader>
              <CardTitle>Report Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : modernData.reportStatus && modernData.reportStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={modernData.reportStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="status"
                    >
                      {modernData.reportStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "none", borderRadius: "0.5rem", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} /> {/* Rounded glass effect */}
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No report status data available.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top 5 Honey Producers Table */}
          <div className="col-span-12 lg:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Honey Producers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableSkeleton />
                ) : modernData.topHoneyProducers && modernData.topHoneyProducers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Village</TableHead>
                        <TableHead className="text-right">Honey (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modernData.topHoneyProducers.map((p, index) => (
                        <TableRow key={index}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.village}</TableCell>
                          <TableCell className="text-right">{p.total_honey_kg} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-24 items-center justify-center text-muted-foreground">
                    No top producers data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Performing Beneficiaries Table */}
          <div className="col-span-12 lg:col-span-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Performing Beneficiaries</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableSkeleton />
                ) : modernData.topPerformingBeneficiaries && modernData.topPerformingBeneficiaries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead className="text-right">Honey (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modernData.topPerformingBeneficiaries.map((b, index) => (
                        <TableRow key={index}>
                          <TableCell>{b.name}</TableCell>
                          <TableCell className="text-right">{b.total_honey_kg} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex h-24 items-center justify-center text-muted-foreground">
                    No top beneficiaries data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* HR Dashboard */}
      {isHR && (
         <div className="grid gap-4 md:gap-8 lg:grid-cols-4">
              {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard title="Total Employees" value={hrSummary?.total_employees || 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Total Departments" value={hrSummary?.total_departments || 0} icon={<Building className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Pending Leaves" value={hrSummary?.pending_leaves || 0} icon={<Hourglass className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Present Today" value={hrSummary?.present_today || 0} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
                </>
              )}
        </div>
      )}

      {/* Employee Dashboard */}
      {isEmployee && (
        <div className="grid gap-4 md:gap-8 lg:grid-cols-4">
            {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
            ) : (
                <>
                    <StatCard title="Present This Month" value={`${mySummary?.present_days_this_month || 0} days`} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Approved Leaves" value={mySummary?.total_approved_leaves || 0} icon={<Plane className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Approved Expenses" value={`₹${mySummary?.approved_expenses?.toLocaleString('en-IN') || 0}`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="Monthly Salary" value={`₹${mySummary?.salary?.toLocaleString('en-IN') || 0}`} icon={<Award className="h-4 w-4 text-muted-foreground" />} />
                </>
            )}
        </div>
      )}
    </main>
  );
}