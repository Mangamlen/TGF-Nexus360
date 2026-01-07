const db = require('../db');

async function generateMonthlyReport(month, year) {
    // Step 1: Pull Activities for the Month
    const [activities] = await db.promise().query(
        'SELECT * FROM project_activities WHERE MONTH(start_date) = ? AND YEAR(start_date) = ?',
        [month, year]
    );

    // Step 2: Aggregate Data
    const totalTrainings = activities.length;
    const totalParticipants = activities.reduce((sum, activity) => sum + activity.participants_count, 0);
    const totalSHGs = activities.reduce((sum, activity) => sum + activity.shg_count, 0);

    // Step 3: Detect Component Status
    const componentStatus = await getComponentStatus(activities);

    // Step 4: Expense Status
    const expenseStatus = await getExpenseStatus(activities);

    // Step 5: Auto-Generate Narrative
    const narrative = `During the reporting month, ${totalTrainings} training programs were conducted. A total of ${totalParticipants} participants from ${totalSHGs} SHGs were trained.`;

    return {
        totalTrainings,
        totalParticipants,
        totalSHGs,
        componentStatus,
        expenseStatus,
        narrative,
        activities,
    };
}

async function getComponentStatus(activities) {
    // This is a placeholder logic.
    // In a real application, you would have a table for components and their status.
    const components = {};
    activities.forEach(activity => {
        if (!components[activity.activity_type]) {
            components[activity.activity_type] = 'Ongoing';
        }
    });
    return components;
}

async function getExpenseStatus(activities) {
    // This is a placeholder logic.
    const expenseStatus = {};
    for (const activity of activities) {
        const [expenses] = await db.promise().query('SELECT * FROM project_expenses WHERE activity_id = ?', [activity.activity_id]);
        if (expenses.length === 0) {
            expenseStatus[activity.activity_type] = 'Pending';
        } else {
            expenseStatus[activity.activity_type] = 'Recorded';
        }
    }
    return expenseStatus;
}

module.exports = {
    generateMonthlyReport,
};
