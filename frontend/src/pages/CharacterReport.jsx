import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CharacterReport_associated_scenes.css";

function CharacterReport() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [characters, setCharacters] = useState([]);
    const [scenes, setScenes] = useState([]);
    const [sceneContents, setSceneContents] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingCharacter, setEditingCharacter] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [updatingCharacter, setUpdatingCharacter] = useState(false);

    // Stores the character id whose Associated Scenes popup is open.
    const [showAssociatedScenes, setShowAssociatedScenes] = useState(null);

    useEffect(() => {
        const loadCharacterReport = async () => {
            const token = localStorage.getItem("token");

            try {
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [
                    projectResponse,
                    charactersResponse,
                    scenesResponse,
                ] = await Promise.all([
                    fetch(
                        `http://localhost:8080/api/projects/${id}`,
                        { headers }
                    ),

                    fetch(
                        `http://localhost:8080/api/projects/${id}/characters`,
                        { headers }
                    ),

                    fetch(
                        `http://localhost:8080/api/projects/${id}/scenes`,
                        { headers }
                    ),
                ]);

                if (!projectResponse.ok) {
                    throw new Error("Failed to load project");
                }

                if (!charactersResponse.ok) {
                    throw new Error("Failed to load characters");
                }

                if (!scenesResponse.ok) {
                    throw new Error("Failed to load scenes");
                }

                const projectData =
                    await projectResponse.json();

                const charactersData =
                    await charactersResponse.json();

                const scenesData =
                    await scenesResponse.json();

                setProject(projectData);
                setCharacters(charactersData);
                setScenes(scenesData);

                // Load contents for every scene.
                const contentResults = await Promise.all(
                    scenesData.map(async (scene) => {
                        const response = await fetch(
                            `http://localhost:8080/api/scenes/${scene.id}/contents`,
                            { headers }
                        );

                        if (!response.ok) {
                            throw new Error(
                                `Failed to load contents for scene ${scene.sceneOrder}`
                            );
                        }

                        const contents =
                            await response.json();

                        return {
                            sceneId: scene.id,
                            contents,
                        };
                    })
                );

                const contentsByScene = {};

                contentResults.forEach(
                    ({ sceneId, contents }) => {
                        contentsByScene[sceneId] = contents;
                    }
                );

                setSceneContents(contentsByScene);
                setLoading(false);

            } catch (error) {
                console.error(
                    "Character report error:",
                    error
                );

                setError(
                    "Unable to load character report."
                );

                setLoading(false);
            }
        };

        loadCharacterReport();
    }, [id]);

    const getCharacterScenes = (characterId) => {
        return scenes.filter((scene) => {
            const contents =
                sceneContents[scene.id] || [];

            return contents.some(
                (content) =>
                    content.character?.id === characterId
            );
        });
    };

    const openEditCharacter = (character) => {
        setEditingCharacter(character);
        setEditName(character.name || "");
        setEditDescription(
            character.description || ""
        );
    };

    const handleUpdateCharacter = async () => {
        if (!editName.trim() || !editingCharacter) {
            return;
        }

        const token = localStorage.getItem("token");

        setUpdatingCharacter(true);

        try {
            const response = await fetch(
                `http://localhost:8080/api/projects/${id}/characters/${editingCharacter.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name: editName.trim(),
                        description: editDescription,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to update character"
                );
            }

            const updatedCharacter =
                await response.json();

            setCharacters((currentCharacters) =>
                currentCharacters.map((character) =>
                    character.id ===
                    updatedCharacter.id
                        ? updatedCharacter
                        : character
                )
            );

            setEditingCharacter(null);
            setEditName("");
            setEditDescription("");

        } catch (error) {
            console.error(
                "Update character error:",
                error
            );

            alert("Unable to update character.");

        } finally {
            setUpdatingCharacter(false);
        }
    };

    const handleExportAssociatedScenes = (character, associatedScenes) => {
        if (!character) {
            return;
        }

        const escapeHtml = (value) =>
            String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        const sceneRows =
            associatedScenes.length === 0
                ? `<div class="empty">No associated scenes.</div>`
                : associatedScenes
                    .map(
                        (scene) => `
                            <div class="scene-row">
                                <div class="scene-number">
                                    Scene ${escapeHtml(scene.sceneOrder)}
                                </div>
                                <div class="scene-name">
                                    ${escapeHtml(scene.sceneName)}
                                </div>
                            </div>
                        `
                    )
                    .join("");

        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=750"
        );

        if (!printWindow) {
            alert("Please allow pop-ups to export the PDF.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>
                    Associated Scenes - ${escapeHtml(character.name)}
                </title>

                <style>
                    @page {
                        size: A4;
                        margin: 20mm;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        color: #171717;
                        background: #ffffff;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 12pt;
                        line-height: 1.5;
                    }

                    .report {
                        width: 100%;
                        max-width: 760px;
                        margin: 0 auto;
                    }

                    .eyebrow {
                        margin-bottom: 10px;
                        color: #777777;
                        font-size: 10px;
                        font-weight: 700;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                    }

                    h1 {
                        margin: 0 0 8px;
                        font-size: 28px;
                        line-height: 1.2;
                    }

                    .character {
                        margin-bottom: 28px;
                        color: #333333;
                        font-size: 15px;
                    }

                    .divider {
                        margin: 0 0 26px;
                        border: 0;
                        border-top: 2px solid #222222;
                    }

                    .section-title {
                        margin-bottom: 12px;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }

                    .scene-row {
                        display: grid;
                        grid-template-columns: 110px 1fr;
                        gap: 24px;
                        padding: 15px 0;
                        border-bottom: 1px solid #dddddd;
                        page-break-inside: avoid;
                    }

                    .scene-number {
                        color: #555555;
                        font-size: 10pt;
                        font-weight: 700;
                        text-transform: uppercase;
                    }

                    .scene-name {
                        color: #111111;
                        font-size: 13pt;
                        font-weight: 600;
                        overflow-wrap: anywhere;
                    }

                    .empty {
                        color: #555555;
                        padding: 20px 0;
                    }
                </style>
            </head>

            <body>
                <main class="report">

                    <div class="eyebrow">
                        SCREENWRITER
                    </div>

                    <h1>
                        Associated Scenes
                    </h1>

                    <div class="character">
                        Character:
                        <strong>${escapeHtml(character.name)}</strong>
                    </div>

                    <hr class="divider">

                    <div class="section-title">
                        Scenes
                    </div>

                    ${sceneRows}

                </main>

                <script>
                    window.onload = function () {
                        window.focus();
                        setTimeout(function () {
                            window.print();
                        }, 200);
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    if (loading) {
        return (
            <div className="dashboard">
                <main className="main-content">
                    <p>Loading character report...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <main className="main-content">
                    <p>{error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard">

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

                    <button
                        type="button"
                        className="logout-button"
                        onClick={() =>
                            navigate(`/project/${id}`)
                        }
                    >
                        ← Project
                    </button>

                </div>

            </header>


            <main className="main-content">

                <section className="hero">

                    <div>

                        <div className="eyebrow">
                            CHARACTER REPORT
                        </div>

                        <h1>
                            {project.title}
                        </h1>

                        <p>
                            All characters in this screenplay.
                        </p>

                    </div>

                    <div className="project-count">

                        <span>
                            {characters.length}
                        </span>

                        <small>
                            {characters.length === 1
                                ? "Character"
                                : "Characters"}
                        </small>

                    </div>

                </section>


                <div className="section-header">

                    <div>
                        <h2>
                            Characters
                        </h2>

                        <p>
                            Your screenplay's cast
                        </p>
                    </div>

                </div>


                {characters.length === 0 ? (

                    <div className="empty-card">

                        <div className="empty-icon">
                            ♙
                        </div>

                        <h2>
                            No Characters Yet
                        </h2>

                        <p>
                            Create characters from dialogue
                            blocks in the Scene Editor.
                        </p>

                    </div>

                ) : (

                    <section className="projects-grid character-report-grid">

                        {characters.map((character) => {

                            const associatedScenes =
                                getCharacterScenes(
                                    character.id
                                );

                            return (
                                <article
                                    className="project-card character-report-card"
                                    key={character.id}
                                >

                                    <div className="character-report-card-top">

                                        <div className="character-report-avatar">
                                            {character.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                        </div>

                                        <div className="character-report-name">

                                            <h3>
                                                {character.name}
                                            </h3>

                                            <span>
                                                Character #{character.id}
                                            </span>

                                        </div>

                                    </div>


                                    <p className="character-report-description">
                                        {character.description?.trim()
                                            ? character.description
                                            : "No character description added yet."}
                                    </p>


                                    <div className="character-associated-scenes">

                                        <button
                                            type="button"
                                            className="open-button associated-scenes-button"
                                            onClick={() =>
                                                setShowAssociatedScenes(
                                                    character.id
                                                )
                                            }
                                        >
                                            <span>
                                                Associated Scenes
                                            </span>

                                            <span className="associated-scenes-count">
                                                {associatedScenes.length}
                                            </span>

                                            <span className="associated-scenes-arrow">
                                                →
                                            </span>
                                        </button>

                                    </div>


                                    <div className="card-actions">

                                        <button
                                            type="button"
                                            className="open-button"
                                            onClick={() =>
                                                openEditCharacter(
                                                    character
                                                )
                                            }
                                        >
                                            Edit Character
                                        </button>

                                    </div>

                                </article>
                            );
                        })}

                    </section>

                )}

            </main>


            {/* ASSOCIATED SCENES POPUP */}

            {showAssociatedScenes !== null && (() => {
                const selectedCharacter = characters.find(
                    (character) => character.id === showAssociatedScenes
                );

                if (!selectedCharacter) {
                    return null;
                }

                const selectedScenes =
                    getCharacterScenes(selectedCharacter.id);

                return (
                    <div
                        className="character-modal-overlay"
                        onClick={() => setShowAssociatedScenes(null)}
                    >
                        <div
                            className="associated-scenes-window"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="associated-scenes-window-header">
                                <div>
                                    <div className="scene-editor-kicker">
                                        ASSOCIATED SCENES
                                    </div>
                                    <h2>{selectedCharacter.name}</h2>
                                </div>

                                <button
                                    type="button"
                                    className="character-modal-close"
                                    onClick={() => setShowAssociatedScenes(null)}
                                    aria-label="Close associated scenes"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="associated-scenes-window-body">
                                {selectedScenes.length === 0 ? (
                                    <div className="character-report-empty">
                                        <div className="empty-icon">🎞️</div>
                                        <h3>No Associated Scenes</h3>
                                        <p>
                                            This character has not been
                                            assigned to any dialogue yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="associated-scenes-window-list">
                                        {selectedScenes.map((scene) => (
                                            <div
                                                className="associated-scenes-window-row"
                                                key={scene.id}
                                            >
                                                <span className="associated-scenes-window-number">
                                                    Scene {scene.sceneOrder}
                                                </span>

                                                <strong className="associated-scenes-window-name">
                                                    {scene.sceneName}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="associated-scenes-window-actions">
                                <button
                                    type="button"
                                    className="new-project-button"
                                    onClick={() =>
                                        handleExportAssociatedScenes(
                                            selectedCharacter,
                                            selectedScenes
                                        )
                                    }
                                >
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}


            {/* EDIT CHARACTER MODAL */}

            {editingCharacter && (

                <div
                    className="character-modal-overlay"
                    onClick={() =>
                        setEditingCharacter(null)
                    }
                >

                    <div
                        className="character-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="character-modal-header">

                            <div>

                                <div className="scene-editor-kicker">
                                    EDIT CHARACTER
                                </div>

                                <h2>
                                    Edit Character
                                </h2>

                                <p>
                                    Update this character's information.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="character-modal-close"
                                onClick={() =>
                                    setEditingCharacter(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="character-modal-body">

                            <div className="form-group">

                                <label>
                                    Character Name
                                </label>

                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(
                                            event.target.value
                                        )
                                    }
                                    autoFocus
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    rows="5"
                                    value={editDescription}
                                    onChange={(event) =>
                                        setEditDescription(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        <div className="character-modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setEditingCharacter(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="create-button"
                                disabled={
                                    updatingCharacter ||
                                    !editName.trim()
                                }
                                onClick={
                                    handleUpdateCharacter
                                }
                            >
                                {updatingCharacter
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default CharacterReport;
