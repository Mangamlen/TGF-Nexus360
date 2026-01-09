import api from './api';

const projectService = {
    getActivities: () => {
        return api.get('/projects/activities');
    },

    createActivity: (data) => {
        return api.post('/projects/activities', data);
    },

    updateActivity: (id, data) => {
        return api.put(`/projects/activities/${id}`, data);
    },

    deleteActivity: (id) => {
        return api.delete(`/projects/activities/${id}`);
    },

    createExpense: (activityId, data) => {
        return api.post(`/projects/activities/${activityId}/expenses`, data);
    },

    getExpenses: (activityId) => {
        if (activityId) {
            return api.get(`/projects/activities/${activityId}/expenses`);
        } else {
            return api.get(`/projects/expenses`); // Assuming an endpoint to get all expenses
        }
    },

    getAllProjects: () => {
        return api.get('/projects'); // Assuming a /projects endpoint for all projects
    },
};

export default projectService;
