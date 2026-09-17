import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../auth";

function Dashboard() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // New project modal
    const [showModal, setShowModal] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [productionName, setProductionName] = useState("");
    const [directorName, setDirectorName] = useState("");
    const [screenwriterName, setScreenwriterName] = useState("");
    const [creating, setCreating] = useState(false);

    // Delete
    const [deleteProject, setDeleteProject] = useState(null);

    // Edit project details
    const [showProjectDetails, setShowProjectDetails] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editProductionName, setEditProductionName] = useState("");
    const [editDirectorName, setEditDirectorName] = useState("");
    const [editScreenwriterName, setEditScreenwriterName] = useState("");

    const [savingProject, setSavingProject] = useState(false);
    const [projectEditError, setProjectEditError] = useState("");

    // --------------------------------------------------
    // CREATE PROJECT
    // --------------------------------------------------

    const handleCreateProject = async () => {
        if (!projectTitle.trim()) {
            return;
        }

        setCreating(true);

        try {
            const response = await authFetch(
                "http://localhost:8080/api/projects",
                {
                    method: "POST",

                    body: JSON.stringify({
                        title: projectTitle.trim(),
                        description: projectDescription.trim(),
                        productionName: productionName.trim(),
                        directorName: directorName.trim(),
                        screenwriterName: screenwriterName.trim(),
                    }),
                }
            );

            if (!response.ok) {
                const message = await response.text();

                throw new Error(
                    message || "Failed to create project"
                );
            }

            const newProject = await response.json();

            setProjects((currentProjects) => [
                newProject,
                ...currentProjects,
            ]);

            setProjectTitle("");
            setProjectDescription("");
            setProductionName("");
            setDirectorName("");
            setScreenwriterName("");

            setShowModal(false);

        } catch (error) {
            console.error(
                "Create project error:",
                error
            );

            alert(
                error.message ||
                "Unable to create project."
            );

        } finally {
            setCreating(false);
        }
    };

    // --------------------------------------------------
    // OPEN PROJECT DETAILS EDITOR
    // --------------------------------------------------

    const openProjectDetails = (project) => {
        setEditingProject(project);

        setEditTitle(project.title || "");
        setEditDescription(project.description || "");

        setEditProductionName(
            project.productionName || ""
        );

        setEditDirectorName(
            project.directorName || ""
        );

        setEditScreenwriterName(
            project.screenwriterName || ""
        );

        setProjectEditError("");
        setShowProjectDetails(true);
    };

    // --------------------------------------------------
    // CLOSE PROJECT DETAILS EDITOR
    // --------------------------------------------------

    const closeProjectDetails = () => {
        if (savingProject) {
            return;
        }

        setShowProjectDetails(false);
        setEditingProject(null);
        setProjectEditError("");
    };

    // --------------------------------------------------
    // UPDATE PROJECT
    // --------------------------------------------------

    const handleUpdateProject = async () => {
        if (!editingProject) {
            return;
        }

        if (!editTitle.trim()) {
            setProjectEditError(
                "Project title is required."
            );

            return;
        }

        setSavingProject(true);
        setProjectEditError("");

        try {
            const response = await authFetch(
                `http://localhost:8080/api/projects/${editingProject.id}`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        title: editTitle.trim(),
                        description: editDescription.trim(),
                        productionName:
                            editProductionName.trim(),
                        directorName:
                            editDirectorName.trim(),
                        screenwriterName:
                            editScreenwriterName.trim(),
                    }),
                }
            );

            if (!response.ok) {
                const message = await response.text();

                throw new Error(
                    message || "Failed to update project"
                );
            }

            const updatedProject =
                await response.json();

            setProjects((currentProjects) =>
                currentProjects.map((project) =>
                    project.id === updatedProject.id
                        ? updatedProject
                        : project
                )
            );

            setShowProjectDetails(false);
            setEditingProject(null);

        } catch (error) {
            console.error(
                "Update project error:",
                error
            );

            setProjectEditError(
                error.message ||
                "Unable to update project."
            );

        } finally {
            setSavingProject(false);
        }
    };

    // --------------------------------------------------
    // DELETE PROJECT
    // --------------------------------------------------

    const handleDeleteProject = async (projectId) => {
        try {
            const response = await authFetch(
                `http://localhost:8080/api/projects/${projectId}`,
                {
                    method: "DELETE",

                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to delete project"
                );
            }

            setProjects((currentProjects) =>
                currentProjects.filter(
                    (project) =>
                        project.id !== projectId
                )
            );

        } catch (error) {
            console.error(
                "Delete project error:",
                error
            );

            alert(
                "Unable to delete project."
            );
        }
    };

    // --------------------------------------------------
    // LOAD USER + PROJECTS
    // --------------------------------------------------

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("You are not logged in.");
            setLoading(false);
            return;
        }

        // Get logged-in user
        authFetch(
            "http://localhost:8080/api/users/profile"
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Failed to load profile"
                    );
                }

                return response.text();
            })
            .then((data) => {
                const name = data
                    .replace("Welcome ", "")
                    .replace(
                        "! You are authenticated.",
                        ""
                    );

                setUsername(name);
            })
            .catch((error) => {
                console.error(
                    "Profile error:",
                    error
                );
            });

        // Get projects
        authFetch(
            "http://localhost:8080/api/projects"
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Failed to load projects (${response.status})`
                    );
                }

                return response.json();
            })
            .then((data) => {
                setProjects(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(
                    "Error fetching projects:",
                    error
                );

                setError(
                    "Unable to load projects."
                );

                setLoading(false);
            });
    }, []);

    return (
        <div className="dashboard">

            {/* ==================================================
                TOP BAR
            ================================================== */}

            <header className="topbar">

                <div className="brand">

                    <div className="brand-icon">
                        🎬
                    </div>

                    <div>

                        <div className="brand-name">
                            Screenwriter
                        </div>

                        <div className="brand-subtitle">
                            Your stories, your world
                        </div>

                    </div>

                </div>

                <div className="topbar-actions">

                    <div className="logged-user">
                        👤 {username}
                    </div>

                    <button
                        className="new-project-button"
                        onClick={() =>
                            setShowModal(true)
                        }
                    >
                        + New Project
                    </button>

                    <button
                        className="logout-button"
                        onClick={() => {
                            localStorage.removeItem(
                                "token"
                            );

                            window.location.href = "/";
                        }}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="main-content">

                <section className="hero">

                    <div>

                        <div className="eyebrow">
                            WRITER'S WORKSPACE
                        </div>

                        <h1>
                            Welcome,{" "}
                            {username || "Writer"}
                        </h1>

                        <p>
                            Turn your ideas into
                            stories worth telling.
                        </p>

                    </div>

                    <div className="project-count">

                        <span>
                            {projects.length}
                        </span>

                        <small>
                            Projects
                        </small>

                    </div>

                </section>


                {/* ==================================================
                    STATS
                ================================================== */}

                <section className="stats">

                    <div className="stat-card">

                        <span className="stat-label">
                            Total Projects
                        </span>

                        <strong>
                            {projects.length}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span className="stat-label">
                            Workspace
                        </span>

                        <strong className="stat-text">
                            {username || "My Stories"}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span className="stat-label">
                            Status
                        </span>

                        <strong className="active-status">
                            ● Active
                        </strong>

                    </div>

                </section>


                {/* ==================================================
                    PROJECT SECTION
                ================================================== */}

                <div className="section-header">

                    <div>

                        <h2>
                            My Screenplays
                        </h2>

                        <p>
                            Your latest writing projects
                        </p>

                    </div>

                    <button className="sort-button">
                        Recently Updated ▾
                    </button>

                </div>


                {/* LOADING */}

                {loading && (
                    <div className="message-card">

                        <div className="message-icon">
                            ✍️
                        </div>

                        <h3>
                            Loading your stories...
                        </h3>

                    </div>
                )}


                {/* ERROR */}

                {error && (
                    <div className="message-card error">

                        <div className="message-icon">
                            ⚠️
                        </div>

                        <h3>
                            {error}
                        </h3>

                    </div>
                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    projects.length === 0 && (

                        <div className="empty-card">

                            <div className="empty-icon">
                                🎞️
                            </div>

                            <h2>
                                Your story starts here
                            </h2>

                            <p>
                                You don't have any
                                projects yet.
                                Create your first
                                screenplay and start
                                writing.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    setShowModal(true)
                                }
                            >
                                + Create Your First Project
                            </button>

                        </div>
                    )}


                {/* PROJECT CARDS */}

                {!loading &&
                    !error &&
                    projects.length > 0 && (

                        <section className="projects-grid">

                            {projects.map(
                                (project) => (

                                    <article
                                        className="project-card"
                                        key={project.id}
                                    >

                                        <div className="card-top">

                                            <span className="project-type">
                                                SCREENPLAY
                                            </span>

                                            <span className="project-id">
                                                #{project.id}
                                            </span>

                                        </div>


                                        <h3>
                                            {project.title}
                                        </h3>


                                        <p className="description">
                                            {project.description ||
                                                "No description provided."}
                                        </p>


                                        <div className="card-info">

                                            <div>

                                                <span>
                                                    Created
                                                </span>

                                                <strong>
                                                    {new Date(
                                                        project.createdAt
                                                    ).toLocaleDateString()}
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    Updated
                                                </span>

                                                <strong>
                                                    {new Date(
                                                        project.updatedAt
                                                    ).toLocaleDateString()}
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="card-actions">

                                            <button
                                                className="open-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/project/${project.id}`
                                                    )
                                                }
                                            >
                                                Open Project
                                            </button>


                                            {/* EDIT PROJECT */}

                                            <button
                                                type="button"
                                                className="icon-button"
                                                title="Edit Project Details"
                                                onClick={() =>
                                                    openProjectDetails(
                                                        project
                                                    )
                                                }
                                            >
                                                ✎
                                            </button>


                                            {/* DELETE */}

                                            <button
                                                type="button"
                                                className="delete-button"
                                                title="Delete Project"
                                                onClick={() =>
                                                    setDeleteProject(
                                                        project
                                                    )
                                                }
                                            >
                                                🗑
                                            </button>

                                        </div>

                                    </article>

                                )
                            )}

                        </section>
                    )}

            </main>


            {/* ==================================================
                NEW PROJECT MODAL
            ================================================== */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="project-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    New Project
                                </h2>

                                <p>
                                    Start a new screenplay.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="form-group">

                            <label>
                                Project Title
                            </label>

                            <input
                                type="text"
                                placeholder="Enter project title"
                                value={projectTitle}
                                onChange={(event) =>
                                    setProjectTitle(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Describe your story..."
                                rows="5"
                                value={projectDescription}
                                onChange={(event) =>
                                    setProjectDescription(
                                        event.target.value
                                    )
                                }
                            ></textarea>

                        </div>


                        <div className="form-group">

                            <label>
                                Production Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter production name"
                                value={productionName}
                                onChange={(event) =>
                                    setProductionName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Director Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter director name"
                                value={directorName}
                                onChange={(event) =>
                                    setDirectorName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Screenwriter Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter screenwriter name"
                                value={screenwriterName}
                                onChange={(event) =>
                                    setScreenwriterName(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="create-button"
                                onClick={
                                    handleCreateProject
                                }
                                disabled={creating}
                            >
                                {creating
                                    ? "Creating..."
                                    : "Create Project"}
                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* ==================================================
                EDIT PROJECT DETAILS MODAL
            ================================================== */}

            {showProjectDetails &&
                editingProject && (

                    <div className="modal-overlay">

                        <div className="project-modal project-details-modal">

                            <div className="modal-header">

                                <div>

                                    <div className="eyebrow">
                                        PROJECT DETAILS
                                    </div>

                                    <h2>
                                        Edit Project
                                    </h2>

                                    <p>
                                        Update your screenplay
                                        information.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeProjectDetails
                                    }
                                    disabled={savingProject}
                                >
                                    ×
                                </button>

                            </div>


                            {/* TITLE */}

                            <div className="form-group">

                                <label>
                                    Project Title
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter project title"
                                    value={editTitle}
                                    onChange={(event) =>
                                        setEditTitle(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* PRODUCTION */}

                            <div className="form-group">

                                <label>
                                    Production Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter production name"
                                    value={
                                        editProductionName
                                    }
                                    onChange={(event) =>
                                        setEditProductionName(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* DIRECTOR */}

                            <div className="form-group">

                                <label>
                                    Director Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter director name"
                                    value={
                                        editDirectorName
                                    }
                                    onChange={(event) =>
                                        setEditDirectorName(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* SCREENWRITER */}

                            <div className="form-group">

                                <label>
                                    Screenwriter Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter screenwriter name"
                                    value={
                                        editScreenwriterName
                                    }
                                    onChange={(event) =>
                                        setEditScreenwriterName(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    rows="5"
                                    placeholder="Describe your story..."
                                    value={
                                        editDescription
                                    }
                                    onChange={(event) =>
                                        setEditDescription(
                                            event.target.value
                                        )
                                    }
                                ></textarea>

                            </div>


                            {projectEditError && (

                                <div className="message-card error">
                                    <h3>
                                        {projectEditError}
                                    </h3>
                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeProjectDetails
                                    }
                                    disabled={
                                        savingProject
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="create-button"
                                    onClick={
                                        handleUpdateProject
                                    }
                                    disabled={
                                        savingProject
                                    }
                                >
                                    {savingProject
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}


            {/* ==================================================
                DELETE MODAL
            ================================================== */}

            {deleteProject && (

                <div className="modal-overlay">

                    <div className="project-modal delete-modal">

                        <div className="delete-icon">
                            🗑
                        </div>

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Delete Project?
                                </h2>

                                <p>
                                    Are you sure you want
                                    to delete{" "}
                                    <strong>
                                        {deleteProject.title}
                                    </strong>
                                    ?
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setDeleteProject(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="delete-warning">
                            This action cannot be undone.
                        </div>


                        <div className="modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setDeleteProject(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-button"
                                onClick={async () => {

                                    await handleDeleteProject(
                                        deleteProject.id
                                    );

                                    setDeleteProject(null);

                                }}
                            >
                                Delete Project
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Dashboard;