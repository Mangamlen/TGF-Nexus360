const db = require('../db');

// Project Activities
exports.createActivity = async (req, res) => {
    const { project_id, activity_type, location, start_date, end_date, participants_count, shg_count, status } = req.body;
    try {
        const [result] = await db.promise().query(
            'INSERT INTO project_activities (project_id, activity_type, location, start_date, end_date, participants_count, shg_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [project_id, activity_type, location, start_date, end_date, participants_count, shg_count, status]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error creating project activity', error });
    }
};

exports.getActivities = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM project_activities');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project activities', error });
    }
};

exports.getActivityById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.promise().query('SELECT * FROM project_activities WHERE activity_id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Project activity not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project activity', error });
    }
};

exports.updateActivity = async (req, res) => {
    const { id } = req.params;
    const { project_id, activity_type, location, start_date, end_date, participants_count, shg_count, status } = req.body;
    try {
        const [result] = await db.promise().query(
            'UPDATE project_activities SET project_id = ?, activity_type = ?, location = ?, start_date = ?, end_date = ?, participants_count = ?, shg_count = ?, status = ? WHERE activity_id = ?',
            [project_id, activity_type, location, start_date, end_date, participants_count, shg_count, status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project activity not found' });
        }
        res.status(200).json({ id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error updating project activity', error });
    }
};

exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.promise().query('DELETE FROM project_activities WHERE activity_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project activity not found' });
        }
        res.status(200).json({ message: 'Project activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project activity', error });
    }
};

// Activity Outputs
exports.createActivityOutput = async (req, res) => {
    const { activityId } = req.params;
    const { output_type, description } = req.body;
    try {
        const [result] = await db.promise().query(
            'INSERT INTO activity_outputs (activity_id, output_type, description) VALUES (?, ?, ?)',
            [activityId, output_type, description]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error creating activity output', error });
    }
};

exports.getActivityOutputs = async (req, res) => {
    const { activityId } = req.params;
    try {
        const [rows] = await db.promise().query('SELECT * FROM activity_outputs WHERE activity_id = ?', [activityId]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching activity outputs', error });
    }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT id, project_name FROM projects');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};

// Project Expenses
exports.createProjectExpense = async (req, res) => {
    const { activityId } = req.params;
    const { amount, bill_uploaded, expense_status } = req.body;
    try {
        const [result] = await db.promise().query(
            'INSERT INTO project_expenses (activity_id, amount, bill_uploaded, expense_status) VALUES (?, ?, ?, ?)',
            [activityId, amount, bill_uploaded, expense_status]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error creating project expense', error });
    }
};

exports.getProjectExpenses = async (req, res) => {
    const { activityId } = req.params;
    try {
        let query = 'SELECT * FROM project_expenses';
        let params = [];
        if (activityId) {
            query += ' WHERE activity_id = ?';
            params.push(activityId);
        }
        const [rows] = await db.promise().query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching project expenses', error });
    }
};
