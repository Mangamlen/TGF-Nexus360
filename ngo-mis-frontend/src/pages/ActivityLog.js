import { useEffect, useState } from "react";
import API from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get("/activity");
        setLogs(res.data);
      } catch (err) {
        setError("Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>System Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center py-4">Loading...</p>}
        {error && <p className="text-center py-4 text-red-500">{error}</p>}

        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No activity found
                  </TableCell>
                </TableRow>
              )}

              {logs.map((log, index) => (
                <TableRow key={log.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{log.user_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
