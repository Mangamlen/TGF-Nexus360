import { useEffect, useState, useCallback } from "react";
import * as dashboardService from "../services/dashboardService"; // Updated import
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Building,
  Hourglass,
  DollarSign,
  Briefcase,
  CheckCircle,
  TrendingUp,
  MapPin,
  PieChart,
  User,
  FlaskConical,
  Loader2,
  Plane,
  Award
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton

// Colors for the pie chart
const COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];

const StatCard = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
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
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAdminOrManager) {
        const [adminRes, projectRes, topProducersRes, topBeneficiariesRes, villageData, honeyTrendData] = await Promise.all([
          dashboardService.getAdminSummary(),
          dashboardService.getProjectStats(),
          dashboardService.getTopHoneyProducers(),
          dashboardService.getTopBeneficiaries(),
          dashboardService.getBeneficiariesByVillage(),
          dashboardService.getHoneyTrend(),
        ]);

        setDashboardData(prev => ({
          ...prev,
          adminSummary: adminRes,
          projectStats: projectRes,
          topHoneyProducers: topProducersRes,
          topBeneficiaries: topBeneficiariesRes,
          beneficiariesByVillage: villageData,
          honeyTrend: honeyTrendData,
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

  const { adminSummary, hrSummary, mySummary, projectStats, topHoneyProducers, topBeneficiaries, beneficiariesByVillage, honeyTrend } = dashboardData;

  const renderBeneficiaryVillageChart = () => (
    <Card className="col-span-12 lg:col-span-4">
      <CardHeader>
        <CardTitle>Beneficiaries by Village</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <Skeleton className="h-[300px] w-full" />
        ) : beneficiariesByVillage && beneficiariesByVillage.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={beneficiariesByVillage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
                nameKey="village"
              >
                {beneficiariesByVillage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No village distribution data available.
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderHoneyTrendChart = () => (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader>
        <CardTitle>Honey Production Trend</CardTitle>
        <CardDescription>Monthly honey production for the current year.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : honeyTrend && honeyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={honeyTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} kg`, "Honey"]} />
              <Legend />
              <Line type="monotone" dataKey="total_kg" name="Honey (kg)" strokeWidth={2} stroke={COLORS[0]} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
             No honey production data available for this year.
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* Admin/Manager Dashboard */}
      {isAdminOrManager && (
        <div className="grid gap-4 md:gap-8 grid-cols-12">
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
                  <StatCard title="Total Beneficiaries" value={projectStats?.total_beneficiaries || 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Total Employees" value={adminSummary?.total_employees || 0} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Pending Leaves" value={adminSummary?.pending_leaves || 0} icon={<Hourglass className="h-4 w-4 text-muted-foreground" />} />
                  <StatCard title="Pending Expenses" value={adminSummary?.pending_expenses || 0} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                </>
              )}
            </div>

            {renderHoneyTrendChart()}
            {renderBeneficiaryVillageChart()}
            
            <div className="col-span-12 lg:col-span-7">
               <Card>
                <CardHeader>
                  <CardTitle>Top 5 Honey Producers</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <TableSkeleton /> : topHoneyProducers && topHoneyProducers.length > 0 ? (
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
                     <div className="flex h-24 items-center justify-center text-muted-foreground">
                      No top producers data available.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Performing Beneficiaries</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <TableSkeleton /> : topBeneficiaries && topBeneficiaries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Beneficiary</TableHead>
                          <TableHead className="text-right">Honey (kg)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topBeneficiaries.map((b, index) => (
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