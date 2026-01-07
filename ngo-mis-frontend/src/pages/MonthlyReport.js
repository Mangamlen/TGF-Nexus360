import { useState } from "react";
import projectService from "../services/projectService";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function MonthlyReport() {
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [report, setReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const { data } = await projectService.generateReport(month, year);
            setReport(data);
            toast.success("Report generated successfully!");
        } catch (error) {
            toast.error("Failed to generate report.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPdf = () => {
        const doc = new jsPDF();
        doc.text("Monthly Report", 20, 10);
        doc.autoTable({
            head: [['Metric', 'Value']],
            body: [
                ['Total Trainings', report.totalTrainings],
                ['Total Participants', report.totalParticipants],
                ['Total SHGs', report.totalSHGs],
            ],
        });
        doc.text("Narrative Summary", 20, doc.autoTable.previous.finalY + 10);
        doc.text(report.narrative, 20, doc.autoTable.previous.finalY + 20, { maxWidth: 180 });
        doc.save("monthly-report.pdf");
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Report</CardTitle>
                    <CardDescription>Generate a monthly report for project activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Input type="number" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Month (e.g., 1 for January)" />
                        <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g., 2024)" />
                        <Button onClick={handleGenerateReport} disabled={isGenerating}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Report
                        </Button>
                    </div>

                    {report && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <Button onClick={handleExportPdf}>Export to PDF</Button>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report for {month}/{year}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><strong>Total Trainings:</strong> {report.totalTrainings}</p>
                                    <p><strong>Total Participants:</strong> {report.totalParticipants}</p>
                                    <p><strong>Total SHGs:</strong> {report.totalSHGs}</p>
                                    <h4 className="font-bold mt-4">Narrative Summary</h4>
                                    <p>{report.narrative}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
