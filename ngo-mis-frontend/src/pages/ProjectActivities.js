import { useState, useEffect } from "react";
import projectService from "../services/projectService";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";

export default function ProjectActivities() {
    const [activities, setActivities] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        project_id: "",
        activity_type: "",
        location: "",
        start_date: "",
        end_date: "",
        participants_count: "",
        shg_count: "",
        status: "",
    });

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const { data } = await projectService.getActivities();
            setActivities(data);
        } catch (error) {
            toast.error("Failed to fetch project activities.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (formData.activity_id) {
                await projectService.updateActivity(formData.activity_id, formData);
                toast.success("Activity updated successfully!");
            } else {
                await projectService.createActivity(formData);
                toast.success("Activity created successfully!");
            }
            fetchActivities();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to submit activity.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (activity) => {
        setFormData(activity);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await projectService.deleteActivity(id);
            toast.success("Activity deleted successfully!");
            fetchActivities();
        } catch (error) {
            toast.error("Failed to delete activity.");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Project Activities</CardTitle>
                    <CardDescription>Manage project activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setFormData({})}>Create Activity</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{formData.activity_id ? "Edit" : "Create"} Activity</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input name="project_id" value={formData.project_id} onChange={handleChange} placeholder="Project ID" />
                                    <Input name="activity_type" value={formData.activity_type} onChange={handleChange} placeholder="Activity Type" />
                                    <Input name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
                                    <Input name="start_date" type="date" value={formData.start_date} onChange={handleChange} />
                                    <Input name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                                    <Input name="participants_count" type="number" value={formData.participants_count} onChange={handleChange} placeholder="Participants Count" />
                                    <Input name="shg_count" type="number" value={formData.shg_count} onChange={handleChange} placeholder="SHG Count" />
                                    <Input name="status" value={formData.status} onChange={handleChange} placeholder="Status" />
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activity Type</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity) => (
                                <TableRow key={activity.activity_id}>
                                    <TableCell>{activity.activity_type}</TableCell>
                                    <TableCell>{activity.location}</TableCell>
                                    <TableCell>{new Date(activity.start_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(activity.end_date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" onClick={() => handleEdit(activity)}>Edit</Button>
                                        <Button variant="destructive" onClick={() => handleDelete(activity.activity_id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
