import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { getTasks, createTask, updateTask, deleteTask } from "../api/taskApi";

function useTasks() {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); // Create/Update/Delete

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getTasks();
            setTasks(response.data.data);
        }
        catch (error) {
            console.error(error);
            toast.error("Failed to fetch tasks.");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const createNewTask = async (taskData) => {
        try {
            setActionLoading(true);

            await createTask(taskData);

            toast.success("Task created successfully!");

            await fetchTasks();

        } catch (error) {
            console.error(error);
            toast.error("Failed to create task.");
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const updateExistingTask = async (id, taskData) => {
        try {
            setActionLoading(true);

            await updateTask(id, taskData);

            toast.success("Task updated successfully!");

            await fetchTasks();

        } catch (error) {
            console.error(error);
            toast.error("Failed to update task.");
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const deleteExistingTask = async (id) => {
        try {
            setActionLoading(true);

            await deleteTask(id);

            toast.success("Task deleted successfully!");

            await fetchTasks();

        } catch (error) {
            console.error(error);
            toast.error("Failed to delete task.");
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    return {
        tasks,
        loading,
        actionLoading,
        fetchTasks,
        createNewTask,
        updateExistingTask,
        deleteExistingTask,
    };
}

export default useTasks;