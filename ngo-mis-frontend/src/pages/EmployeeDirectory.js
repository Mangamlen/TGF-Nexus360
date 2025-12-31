import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import * as employeeService from "../services/employeeService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Loader2, Search } from "lucide-react";
import API from "../services/api";
import { Skeleton } from "../components/ui/skeleton"; // Import Skeleton

function EmployeeCard({ employee }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Construct the full URL for the avatar image
  const avatarUrl = employee.photo_path ? `${API.defaults.baseURL}/${employee.photo_path.replace(/\\/g, '/')}` : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link to={`/employee/${employee.id}`}> {/* This route needs to be created */}
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatarUrl} alt={employee.name} />
            <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg">{employee.name}</h3>
          <p className="text-sm text-muted-foreground">{employee.designation}</p>
          <p className="text-xs text-muted-foreground">{employee.department}</p>
        </CardContent>
      </Link>
    </Card>
  );
}

const EmployeeCardSkeleton = () => (
  <Card>
    <CardContent className="p-4 flex flex-col items-center text-center">
      <Skeleton className="h-24 w-24 rounded-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-1" />
      <Skeleton className="h-3 w-1/3" />
    </CardContent>
  </Card>
);

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [empData, deptData] = await Promise.all([
          employeeService.getAllEmployees(),
          employeeService.getDepartments(),
        ]);
        setEmployees(empData);
        setDepartments(deptData);
      } catch (error) {
        // Errors are handled in the service
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepartment === "all" || emp.department === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDepartment]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or designation..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => ( // Render 10 skeleton cards
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(employee => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
              No employees found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
