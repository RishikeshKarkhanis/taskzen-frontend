import Navbar from "../layout/Navbar";
import StatsCards from "./StatsCards";
import Toolbar from "./Toolbar";
import ViewSelector from "./ViewSelector";
import TaskCard from "../task/TaskCard";
import TaskGrid from "../task/TaskGrid";
import TaskModal from "../modals/TaskModal";
import EmptyState from "../task/EmptyState";
import toast from "react-hot-toast";

import { getTasks, createTask, updateTask, deleteTask } from "../../api/taskApi";
import { useState, useEffect } from "react";


const handleCreateTask = () => {
    setIsTaskModalOpen(true);
};

function Dashboard() {

    // const [selectedView, setSelectedView] = useState("all");
    const [tasks, setTasks] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchTasks = async () => {
        try {
            const response = await getTasks();
            setTasks(response.data.data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const taskStats = {
        total: tasks.length,

        todo: tasks.filter(
            (task) => task.status === "Todo"
        ).length,

        inProgress: tasks.filter(
            (task) => task.status === "In Progress"
        ).length,

        completed: tasks.filter(
            (task) => task.status === "Completed"
        ).length,
    };

    const filteredTasks = tasks.filter((task) => {

        // Search
        const keyword = search.toLowerCase();

        const matchesSearch =
            task.title.toLowerCase().includes(keyword) ||
            task.description.toLowerCase().includes(keyword) ||
            task.category.toLowerCase().includes(keyword);

        // Priority
        const matchesPriority =
            priorityFilter === "All" ||
            task.priority === priorityFilter;

        // Category
        const matchesCategory =
            categoryFilter === "All" ||
            task.category === categoryFilter;

        // Status
        let matchesStatus = true;

        if (statusFilter === "Completed") {
            matchesStatus = task.status === "Completed";
        }

        if (statusFilter === "Pending") {
            matchesStatus = task.status !== "Completed";
        }

        return (
            matchesSearch &&
            matchesPriority &&
            matchesCategory &&
            matchesStatus
        );

    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }

        if (sortBy === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }

        if (sortBy === "priority") {

            const priorityOrder = {
                High: 3,
                Medium: 2,
                Low: 1,
            };

            return (
                priorityOrder[b.priority] -
                priorityOrder[a.priority]
            );
        }

        return 0;
    });

    const handleCreateTask = () => {
        setSelectedTask(null);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (selectedTask) {
                await updateTask(selectedTask._id, taskData);
                toast.success("Task updated successfully!");
            } 
            else {
                await createTask(taskData);
                toast.success("Task created successfully!");
            }
            await fetchTasks();
            setSelectedTask(null);
            setIsTaskModalOpen(false);

        } catch (error) {
            console.error("Failed to save task:", error);
            toast.error("Something went wrong!");
        }
    };


    const handleEdit = (id) => {
        const task = tasks.find((t) => t._id === id);
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            toast.success("Task deleted successfully!");
            await fetchTasks();

        } catch (error) {
            console.error("Failed to delete task:", error);
            toast.error("Something went wrong!");
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
    };

    const handleSort = () => {
        const options = ["newest", "oldest", "priority"];
        const currentIndex = options.indexOf(sortBy);
        const nextIndex = (currentIndex + 1) % options.length;
        setSortBy(options[nextIndex]);
    };

    return (
        <main className="min-h-screen bg-slate-50">

            <Navbar onCreateTask={handleCreateTask} />

            <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

                <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                        Good to see you
                    </h1>

                    <p className="mt-2 text-slate-500 text-lg">
                        Here's an overview of everything on your plate.
                    </p>
                </div>

                <StatsCards stats={taskStats} />

                <Toolbar
                    search={search}
                    sortBy={sortBy}
                    onSearchChange={handleSearch}
                    onSortClick={handleSort}
                />

                <ViewSelector
                    priorityFilter={priorityFilter}
                    categoryFilter={categoryFilter}
                    statusFilter={statusFilter}
                    setPriorityFilter={setPriorityFilter}
                    setCategoryFilter={setCategoryFilter}
                    setStatusFilter={setStatusFilter}
                />

                {sortedTasks.length > 0 ? (

                    <TaskGrid
                        tasks={sortedTasks}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                ) : (

                    <EmptyState
                        onCreateTask={handleCreateTask}
                    />

                )}

                <TaskModal

                    isOpen={isTaskModalOpen}

                    mode={selectedTask ? "edit" : "create"}

                    task={selectedTask}

                    onClose={() => {

                        setIsTaskModalOpen(false);

                        setSelectedTask(null);

                    }}

                    onSubmit={handleSaveTask}

                />

            </section>

        </main>
    );
}

export default Dashboard;