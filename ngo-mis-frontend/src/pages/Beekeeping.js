import React, { useState, useEffect } from 'react';
import beekeepingService from '../services/beekeepingService';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { PlusCircle, BarChart, AlertTriangle, Archive, Bug, Boxes } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

const Beekeeping = () => {
    const [report, setReport] = useState(null);
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // State for controlling dialog

    const [newName, setNewName] = useState('');
    const [newAcquiredDate, setNewAcquiredDate] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const reportData = await beekeepingService.getComprehensiveReport();
            const boxesData = await beekeepingService.getAllBoxes();
            setReport(reportData.data);
            setBoxes(boxesData.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch beekeeping data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewBox = async () => {
        if (!newName || !newAcquiredDate) {
            setError("Name and Acquired Date are required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await beekeepingService.addBox({
                name: newName,
                acquired_date: newAcquiredDate,
                notes: newNotes,
            });
            setIsDialogOpen(false);
            setNewName('');
            setNewAcquiredDate('');
            setNewNotes('');
            fetchData(); // Refresh data after adding a new box
        } catch (err) {
            setError(err.message || "Failed to add new bee box.");
            console.error("Error adding new bee box:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const renderStatCards = () => {
        if (!report) return Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />);
        
        const { Overall_Summary, Health_Ratios } = report;

        return (
            <>
                <StatCard 
                    title="Total Bee Boxes"
                    value={Overall_Summary.Total_Bee_Boxes_Managed}
                    icon={<Boxes className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard 
                    title="Active Colonies"
                    value={Overall_Summary.Total_Active_Colonies}
                    icon={<Bug className="h-4 w-4 text-muted-foreground" />}
                    description={`${Overall_Summary.Active_Colony_Ratio} of total boxes`}
                />
                <StatCard 
                    title="Empty Boxes"
                    value={report.Empty_Boxes.Count}
                    icon={<Archive className="h-4 w-4 text-muted-foreground" />}
                    description={`${Health_Ratios.Empty_Box_Ratio} of total boxes`}
                />
                <StatCard 
                    title="Absconded"
                    value={report.Boxes_That_Have_Flown_Away.Count}
                    icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                    description={`${Health_Ratios.Absconded_Box_Ratio} of total boxes`}
                />
            </>
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="success">Active</Badge>;
            case 'EMPTY':
                return <Badge variant="secondary">Empty</Badge>;
            case 'ABSCONDED':
                return <Badge variant="destructive">Absconded</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };
    
    const getLocationBadge = (location) => {
        switch (location) {
            case 'APIARY':
                return <Badge variant="info">Apiary</Badge>;
            case 'DISTRIBUTED':
                return <Badge variant="warning">Distributed</Badge>;
            case 'TRAVELING':
                return <Badge variant="primary">Traveling</Badge>;
            default:
                return <Badge>{location}</Badge>;
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Beekeeping Management</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Box
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Bee Box</DialogTitle>
                            <DialogDescription>
                                Fill in the details for the new bee box.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="col-span-3"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="acquiredDate" className="text-right">
                                    Acquired Date
                                </Label>
                                <Input
                                    id="acquiredDate"
                                    type="date"
                                    value={newAcquiredDate}
                                    onChange={(e) => setNewAcquiredDate(e.target.value)}
                                    className="col-span-3"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    className="col-span-3"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddNewBox} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Bee Box'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />) : renderStatCards()}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Bee Boxes</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-2">
                           {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Box ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Acquired Date</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {boxes.map(box => (
                                    <TableRow key={box.box_id}>
                                        <TableCell className="font-medium">{box.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{box.box_id}</TableCell>
                                        <TableCell>{getStatusBadge(box.status)}</TableCell>
                                        <TableCell>{getLocationBadge(box.location)}</TableCell>
                                        <TableCell>{new Date(box.acquired_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(box.last_updated).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Beekeeping;
