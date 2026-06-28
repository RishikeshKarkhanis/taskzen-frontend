import Navbar from "../layout/Navbar";
import StatsCards from "./StatsCards";
import Toolbar from "./Toolbar";
import ViewSelector from "./ViewSelector";
import TaskCard from "../task/TaskCard";
import TaskGrid from "../task/TaskGrid";
import TaskModal from "../modals/TaskModal";
import { dummyTasks } from "../../data/dummyTasks";
import EmptyState from "../task/EmptyState";

import { useState } from "react";

const handleSearch = (value) => {
    console.log(value);
};

const handleFilter = () => {
    console.log("Filter");
};

const handleSort = () => {
    console.log("Sort");
};

const handleRefresh = () => {
    console.log("Refresh");
};

const handleCreateTask = () => {
    setIsTaskModalOpen(true);
};

function Dashboard() {

    // const [selectedView, setSelectedView] = useState("all");
    const [tasks, setTasks] = useState(dummyTasks);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

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
            return new Date(b.dueDate) - new Date(a.dueDate);
        }

        if (sortBy === "oldest") {
            return new Date(a.dueDate) - new Date(b.dueDate);
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

    const handleSaveTask = (taskData) => {

        if (selectedTask) {

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === selectedTask.id
                        ? {
                            ...task,
                            ...taskData,
                        }
                        : task
                )
            );

        } else {

            const newTask = {

                id: Date.now(),

                ...taskData,

            };

            setTasks((prev) => [newTask, ...prev]);

        }

        setSelectedTask(null);

        setIsTaskModalOpen(false);

    };


    const handleEdit = (id) => {

        const task = tasks.find((t) => t.id === id);
        setSelectedTask(task);
        setIsTaskModalOpen(true);

    };

    const handleDelete = (id) => {
        setTasks((prev) =>
            prev.filter((task) => task.id !== id)
        );
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
                    onFilterClick={handleFilter}
                    onRefresh={handleRefresh}
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