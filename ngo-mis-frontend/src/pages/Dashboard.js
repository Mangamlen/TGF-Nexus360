import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { getRoleId } from "../utils/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Users,
  Building,
  Hourglass,
  Beef,
  DollarSign,
  Briefcase,
  GitPullRequest,
  CheckCircle,
  TrendingUp,
  MapPin,
  PieChart,
  CircleDollarSign,
  CalendarDays,
  Gauge,
  User,
  Activity,
  Award,
  FlaskConical,
  Loader2,
  Plane,
} from "lucide-react";
import { toast } from "react-toastify";

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
    attendanceTrend: null,
    honeySummary: null,
    topHoneyProducers: null,
    topBeneficiaries: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const newData = {};

      if (isAdminOrManager) {
        const [adminRes, projectRes, topProducersRes, topBeneficiariesRes] =
          await Promise.all([
            API.get("/dashboard/admin-summary"),
            API.get("/dashboard/project-stats"),
            API.get("/dashboard/top-honey-producers?limit=5"),
            API.get("/dashboard/top-beneficiaries?limit=5"),
          ]);
        newData.adminSummary = adminRes.data;
        newData.projectStats = projectRes.data;
        newData.topHoneyProducers = topProducersRes.data;
        newData.topBeneficiaries = topBeneficiariesRes.data;
      } else if (isHR) {
        const [hrRes, projectRes] = await Promise.all([
          API.get("/dashboard/hr-summary"),
          API.get("/dashboard/project-stats"),
        ]);
        newData.hrSummary = hrRes.data;
        newData.projectStats = projectRes.data;
      } else if (isEmployee) {
        const myRes = await API.get("/dashboard/my-summary");
        newData.mySummary = myRes.data;
      }

      setDashboardData(newData);
    } catch (err) {
      console.error("Dashboard load failed", err);
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [isAdminOrManager, isHR, isEmployee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  const { adminSummary, hrSummary, mySummary, projectStats, topHoneyProducers, topBeneficiaries } = dashboardData;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Admin/Manager Dashboard */}
      {isAdminOrManager && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.total_users || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.total_employees || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.total_departments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.pending_leaves || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.pending_expenses || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees Present Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.present_today || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payroll Generated Today</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminSummary?.payroll_generated_today || 0}</div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-8">Project Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats?.total_beneficiaries || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Beehives Distributed</CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats?.total_beehives_distributed || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Honey This Year (kg)</CardTitle>
                <Beef className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats?.total_honey_this_year || 0} kg</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses This Month (₹)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{projectStats?.total_expenses_this_month?.toLocaleString('en-IN') || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Honey Producers</CardTitle>
                <CardDescription>Beneficiaries with highest honey production.</CardDescription>
              </CardHeader>
              <CardContent>
                {topHoneyProducers && topHoneyProducers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Village</TableHead>
                        <TableHead className="text-right">Honey (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topHoneyProducers.map((p, index) => (
                        <TableRow key={index}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.village}</TableCell>
                          <TableCell className="text-right">{p.total_honey_kg} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No top producers data available.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Performing Beneficiaries</CardTitle>
                <CardDescription>Based on honey production and beehives.</CardDescription>
              </CardHeader>
              <CardContent>
                {topBeneficiaries && topBeneficiaries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Village</TableHead>
                        <TableHead className="text-right">Honey (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topBeneficiaries.map((b, index) => (
                        <TableRow key={index}>
                          <TableCell>{b.name}</TableCell>
                          <TableCell>{b.village}</TableCell>
                          <TableCell className="text-right">{b.total_honey_kg} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No top beneficiaries data available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mt-8">Trends & Distributions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Attendance Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chart: Attendance trend over time (last 30 days).</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Honey Production Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chart: Monthly honey production trend.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Beneficiaries by Village</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chart: Distribution of beneficiaries across villages.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Gender Distribution</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chart: Gender breakdown of beneficiaries.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* HR Dashboard */}
      {isHR && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrSummary?.total_employees || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrSummary?.total_departments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrSummary?.pending_leaves || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees Present Today</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrSummary?.present_today || 0}</div>
              </CardContent>
            </Card>
          </div>
          <h2 className="text-2xl font-bold mt-8">Beneficiary Insights</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Beneficiaries by Village</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chart: Distribution of beneficiaries across villages.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Gender Distribution</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chart: Gender breakdown of beneficiaries.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Employee Dashboard */}
      {isEmployee && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mySummary?.present_days_this_month || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Approved Leaves</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mySummary?.total_approved_leaves || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{mySummary?.approved_expenses?.toLocaleString('en-IN') || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Monthly Salary</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{mySummary?.salary?.toLocaleString('en-IN') || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}