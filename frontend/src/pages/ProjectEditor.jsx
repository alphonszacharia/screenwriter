import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../auth";

function ProjectEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [sceneContents, setSceneContents] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showSceneModal, setShowSceneModal] = useState(false);
    const [editingScene, setEditingScene] = useState(null);

    // Character dropdown
    const [openCharacterDropdownId, setOpenCharacterDropdownId] =
        useState(null);

    // Character modal
    const [showCharacterModal, setShowCharacterModal] = useState(false);
    const [characterModalBlockId, setCharacterModalBlockId] =
        useState(null);

    const [characterName, setCharacterName] = useState("");
    const [characterDescription, setCharacterDescription] = useState("");
    const [creatingCharacter, setCreatingCharacter] = useState(false);

    // Character report modal
    const [showCharacterReport, setShowCharacterReport] = useState(false);

    // Scene content blocks
    const [sceneBlocks, setSceneBlocks] = useState([
        {
            id: 1,
            type: "description",
            content: "",
        },
        {
            id: 2,
            type: "dialogue",
            content: "",
            characterId: "",
        },
    ]);

    const [showBlockMenu, setShowBlockMenu] = useState(false);

    // Scene fields
    const [sceneName, setSceneName] = useState("");
    const [sceneHeading, setSceneHeading] = useState("");

    const [savingScene, setSavingScene] = useState(false);

    // --------------------------------------------------
    // LOAD PROJECT, SCENES AND CHARACTERS
    // --------------------------------------------------

    useEffect(() => {
        const token = localStorage.getItem("token");

        Promise.all([
            authFetch(`http://localhost:8080/api/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),

            authFetch(`http://localhost:8080/api/projects/${id}/scenes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),

            authFetch(`http://localhost:8080/api/projects/${id}/characters`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        ])
            .then(
                async ([
                           projectResponse,
                           scenesResponse,
                           charactersResponse,
                       ]) => {
                    if (!projectResponse.ok) {
                        throw new Error("Failed to load project");
                    }

                    if (!scenesResponse.ok) {
                        throw new Error("Failed to load scenes");
                    }

                    if (!charactersResponse.ok) {
                        throw new Error("Failed to load characters");
                    }

                    const projectData =
                        await projectResponse.json();

                    const scenesData =
                        await scenesResponse.json();

                    const charactersData =
                        await charactersResponse.json();

                    setProject(projectData);
                    setScenes(scenesData);
                    setCharacters(charactersData);

                    const contentEntries = await Promise.all(
                        scenesData.map(async (scene) => {
                            const contentResponse = await authFetch(
                                `http://localhost:8080/api/scenes/${scene.id}/contents`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (!contentResponse.ok) {
                                throw new Error(
                                    `Failed to load contents for scene ${scene.sceneOrder}`
                                );
                            }

                            return [scene.id, await contentResponse.json()];
                        })
                    );

                    setSceneContents(Object.fromEntries(contentEntries));
                    setLoading(false);
                }
            )
            .catch((error) => {
                console.error(
                    "Project editor error:",
                    error
                );

                setError("Unable to load project.");
                setLoading(false);
            });
    }, [id]);

// --------------------------------------------------
// CREATE CHARACTER
// --------------------------------------------------

    const handleCreateCharacter = async () => {
        if (!characterName.trim()) {
            return;
        }

        const token = localStorage.getItem("token");

        setCreatingCharacter(true);

        try {
            const response = await authFetch(
                `http://localhost:8080/api/projects/${id}/characters`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        name: characterName,
                        description: characterDescription,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to create character"
                );
            }

            const newCharacter =
                await response.json();

            setCharacters((currentCharacters) => [
                ...currentCharacters,
                newCharacter,
            ]);

            if (characterModalBlockId !== null) {
                setSceneBlocks((currentBlocks) =>
                    currentBlocks.map(
                        (currentBlock) =>
                            currentBlock.id ===
                            characterModalBlockId
                                ? {
                                    ...currentBlock,
                                    characterId:
                                    newCharacter.id,
                                }
                                : currentBlock
                    )
                );
            }

            setCharacterName("");
            setCharacterDescription("");
            setCharacterModalBlockId(null);
            setShowCharacterModal(false);

        } catch (error) {
            console.error(
                "Create character error:",
                error
            );

        } finally {
            setCreatingCharacter(false);
        }
    };

// --------------------------------------------------
// OPEN EXISTING SCENE
// --------------------------------------------------

    const openScene = async (scene) => {
        const token = localStorage.getItem("token");

        try {
            const response = await authFetch(
                `http://localhost:8080/api/scenes/${scene.id}/contents`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load scene contents"
                );
            }

            const contents = await response.json();

            setEditingScene(scene);

            setSceneName(scene.sceneName || "");
            setSceneHeading(scene.heading || "");

            if (contents.length > 0) {
                setSceneBlocks(
                    contents.map((item) => ({
                        id: item.id,
                        type:
                            item.type === "DIALOGUE"
                                ? "dialogue"
                                : "description",
                        content: item.content || "",
                        characterId:
                            item.character?.id || "",
                    }))
                );
            } else {
                setSceneBlocks([
                    {
                        id: 1,
                        type: "description",
                        content: "",
                    },
                    {
                        id: 2,
                        type: "dialogue",
                        content: "",
                        characterId: "",
                    },
                ]);
            }

            setShowBlockMenu(false);
            setOpenCharacterDropdownId(null);
            setShowSceneModal(true);

        } catch (error) {
            console.error(
                "Open scene error:",
                error
            );

            alert("Unable to open scene.");
        }
    };

// --------------------------------------------------
// OPEN NEW SCENE
// --------------------------------------------------

    const openNewScene = () => {
        setEditingScene(null);

        setSceneName("");
        setSceneHeading("");

        setSceneBlocks([
            {
                id: 1,
                type: "description",
                content: "",
            },
            {
                id: 2,
                type: "dialogue",
                content: "",
                characterId: "",
            },
        ]);

        setShowBlockMenu(false);
        setOpenCharacterDropdownId(null);

        setShowSceneModal(true);
    };

    const handleExportScript = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You are not logged in.");
            return;
        }

        if (!project) {
            alert("Project is not loaded.");
            return;
        }

        try {
            // ==========================================
            // ALWAYS GET THE LATEST PROJECT
            // ==========================================

            const projectResponse = await authFetch(
                `http://localhost:8080/api/projects/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!projectResponse.ok) {
                throw new Error(
                    "Unable to load latest project details."
                );
            }

            const latestProject =
                await projectResponse.json();


            // ==========================================
            // ALWAYS GET THE LATEST SCENES
            // ==========================================

            const scenesResponse = await authFetch(
                `http://localhost:8080/api/projects/${id}/scenes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!scenesResponse.ok) {
                throw new Error(
                    "Unable to load latest scenes."
                );
            }

            const latestScenes =
                await scenesResponse.json();


            // ==========================================
            // GET LATEST CONTENT FOR EVERY SCENE
            // ==========================================

            const latestSceneContents = {};

            await Promise.all(
                latestScenes.map(async (scene) => {

                    const contentResponse =
                        await authFetch(
                            `http://localhost:8080/api/scenes/${scene.id}/contents`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                },
                            }
                        );

                    if (!contentResponse.ok) {
                        throw new Error(
                            `Unable to load content for Scene ${scene.sceneOrder}.`
                        );
                    }

                    latestSceneContents[scene.id] =
                        await contentResponse.json();
                })
            );


            // ==========================================
            // KEEP FRONTEND STATE IN SYNC
            // ==========================================

            setProject(latestProject);
            setScenes(latestScenes);
            setSceneContents(latestSceneContents);


            // ==========================================
            // HTML ESCAPE
            // ==========================================

            const escapeHtml = (value) =>
                String(value ?? "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");


            // ==========================================
            // BUILD SCENES
            // ==========================================

            const sceneSections = latestScenes
                .map((scene) => {

                    const contents =
                        latestSceneContents[scene.id] || [];


                    // ----------------------------------
                    // Scene description
                    // ----------------------------------

                    const sceneDescription =
                        String(
                            scene.description || ""
                        ).trim();


                    // ----------------------------------
                    // Avoid duplicate description
                    // ----------------------------------

                    const hasDescriptionContent =
                        contents.some(
                            (item) =>
                                !item.character?.name &&
                                String(
                                    item.content || ""
                                ).trim() ===
                                sceneDescription
                        );


                    // ----------------------------------
                    // Scene description HTML
                    // ----------------------------------

                    const sceneDescriptionHtml =
                        sceneDescription &&
                        !hasDescriptionContent
                            ? `
                            <div class="action scene-description">
                                ${escapeHtml(
                                sceneDescription
                            )}
                            </div>
                        `
                            : "";


                    // ----------------------------------
                    // Scene content
                    // ----------------------------------

                    const contentHtml = contents
                        .map((item) => {

                            // DIALOGUE
                            if (
                                item.character?.name
                            ) {

                                return `
                                <div class="dialogue">

                                    <div class="character">
                                        ${escapeHtml(
                                    item.character.name
                                )}
                                    </div>

                                    <div class="dialogue-text">
                                        ${escapeHtml(
                                    item.content
                                )}
                                    </div>

                                </div>
                            `;
                            }


                            // DESCRIPTION / ACTION
                            if (
                                item.content
                            ) {

                                return `
                                <div class="action">
                                    ${escapeHtml(
                                    item.content
                                )}
                                </div>
                            `;
                            }


                            return "";
                        })
                        .join("");


                    return `
                    <section class="scene">

                        <div class="scene-number">
                            SCENE ${escapeHtml(
                        scene.sceneOrder
                    )}
                        </div>

                        <h2>
                            ${escapeHtml(
                        scene.sceneName
                    )}
                        </h2>

                        ${
                        scene.heading
                            ? `
                                    <div class="heading">
                                        ${escapeHtml(
                                scene.heading
                            )}
                                    </div>
                                `
                            : ""
                    }

                        ${sceneDescriptionHtml}

                        ${contentHtml}

                    </section>
                `;
                })
                .join("");


            // ==========================================
            // OPEN PRINT WINDOW
            // ==========================================

            const printWindow = window.open(
                "",
                "_blank",
                "width=1000,height=850"
            );

            if (!printWindow) {

                alert(
                    "Please allow pop-ups to export the PDF."
                );

                return;
            }


            // ==========================================
            // PDF HTML
            // ==========================================

            printWindow.document.write(`
            <!DOCTYPE html>

            <html>

            <head>

                <meta charset="UTF-8">

                <title>
                    ${escapeHtml(
                latestProject.title ||
                "Screenplay"
            )}
                </title>


                <style>

                    @page {
                        size: A4;
                        margin:
                            15mm
                            16mm
                            17mm
                            16mm;
                    }


                    * {
                        box-sizing: border-box;
                    }


                    html,
                    body {
                        margin: 0;
                        padding: 0;

                        background: white;
                        color: #111;

                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        font-size: 10.5pt;

                        line-height: 1.42;
                    }


                    .report {
                        width: 100%;
                        max-width: 100%;
                        margin: 0 auto;
                    }


                    /* ==================================
                       TITLE PAGE
                    ================================== */

                    .title-page {
                        min-height: 260mm;

                        display: flex;

                        flex-direction: column;

                        justify-content: center;

                        text-align: center;

                        page-break-after: always;
                    }


                    .title-page .label {
                        font-size: 9pt;

                        font-weight: bold;

                        letter-spacing: 3px;

                        margin-bottom: 16px;

                        color: #555;
                    }


                    .title-page h1 {
                        font-size: 28pt;

                        line-height: 1.15;

                        margin:
                            0
                            0
                            10px;
                    }


                    .title-page .scene-count {
                        font-size: 10pt;

                        color: #777;

                        margin-bottom: 28px;
                    }


                    /* ==================================
                       PROJECT DETAILS
                    ================================== */

                    .project-details {
                        width: 72%;

                        margin: 0 auto;

                        text-align: left;
                    }


                    .project-detail {
                        margin-bottom: 11px;
                    }


                    .project-detail-label {
                        font-size: 7.5pt;

                        font-weight: bold;

                        text-transform: uppercase;

                        letter-spacing: 1.4px;

                        color: #777;

                        margin-bottom: 2px;
                    }


                    .project-detail-value {
                        font-size: 10pt;

                        color: #222;
                    }


                    .project-description {
                        margin-top: 16px;

                        padding-top: 12px;

                        border-top:
                            1px solid
                            #ddd;

                        font-size: 9pt;

                        line-height: 1.45;

                        color: #555;
                    }


                    /* ==================================
                       SCENE
                    ================================== */

                    .scene {
                        position: relative;

                        margin-bottom: 25px;

                        page-break-inside: auto;
                    }


                    .scene-number {
                        font-size: 8.5pt;

                        font-weight: bold;

                        letter-spacing: 1.8px;

                        color: #666;

                        margin-bottom: 3px;
                    }


                    .scene h2 {
                        font-size: 15pt;

                        line-height: 1.15;

                        margin:
                            0
                            0
                            5px;
                    }


                    .heading {
                        font-size: 9.5pt;

                        font-weight: bold;

                        text-transform: uppercase;

                        margin-bottom: 12px;

                        color: #222;
                    }


                    /* ==================================
                       ACTION / DESCRIPTION
                       LEFT
                    ================================== */

                    .action,
                    .scene-description {
                        width: 58%;

                        margin:
                            0
                            auto
                            0
                            0;

                        padding: 0;

                        white-space: pre-wrap;

                        text-align: left;

                        font-size: 10pt;

                        line-height: 1.42;

                        margin-bottom: 9px;
                    }


                    /* ==================================
                       DIALOGUE
                       RIGHT
                    ================================== */

                    .dialogue {
                        width: 55%;

                        margin:
                            10px
                            0
                            10px
                            auto;

                        padding-left: 12px;

                        page-break-inside: avoid;
                    }


                    .character {
                        text-align: center;

                        font-weight: bold;

                        text-transform: uppercase;

                        font-size: 9pt;

                        letter-spacing: 0.8px;

                        margin-bottom: 2px;
                    }


                    .dialogue-text {
                        white-space: pre-wrap;

                        text-align: left;

                        font-size: 9.8pt;

                        line-height: 1.4;
                    }


                    /* ==================================
                       SCENE SEPARATOR
                    ================================== */

                    .scene::after {
                        content: "";

                        display: block;

                        width: 100%;

                        height: 1px;

                        background: #ddd;

                        margin-top: 14px;
                    }


                    /* ==================================
                       PRINT
                    ================================== */

                    @media print {

                        .scene {
                            page-break-inside: auto;
                        }

                        .dialogue {
                            page-break-inside: avoid;
                        }

                        .scene-number,
                        .scene h2,
                        .heading {
                            page-break-after: avoid;
                        }

                    }

                </style>

            </head>


            <body>

                <main class="report">


                    <!-- ==============================
                         TITLE PAGE
                    =============================== -->

                    <section class="title-page">

                        <div class="label">
                            SCREENPLAY
                        </div>


                        <h1>
                            ${escapeHtml(
                latestProject.title ||
                "Untitled Screenplay"
            )}
                        </h1>


                        <div class="scene-count">
                            ${latestScenes.length}
                            ${
                latestScenes.length === 1
                    ? " Scene"
                    : " Scenes"
            }
                        </div>


                        <div class="project-details">


                            ${
                latestProject.productionName
                    ? `
                                        <div class="project-detail">

                                            <div class="project-detail-label">
                                                Production
                                            </div>

                                            <div class="project-detail-value">
                                                ${escapeHtml(
                        latestProject.productionName
                    )}
                                            </div>

                                        </div>
                                    `
                    : ""
            }


                            ${
                latestProject.directorName
                    ? `
                                        <div class="project-detail">

                                            <div class="project-detail-label">
                                                Director
                                            </div>

                                            <div class="project-detail-value">
                                                ${escapeHtml(
                        latestProject.directorName
                    )}
                                            </div>

                                        </div>
                                    `
                    : ""
            }


                            ${
                latestProject.screenwriterName
                    ? `
                                        <div class="project-detail">

                                            <div class="project-detail-label">
                                                Screenwriter
                                            </div>

                                            <div class="project-detail-value">
                                                ${escapeHtml(
                        latestProject.screenwriterName
                    )}
                                            </div>

                                        </div>
                                    `
                    : ""
            }


                            ${
                latestProject.description
                    ? `
                                        <div class="project-description">
                                            ${escapeHtml(
                        latestProject.description
                    )}
                                        </div>
                                    `
                    : ""
            }


                        </div>

                    </section>


                    <!-- ==============================
                         SCENES
                    =============================== -->

                    ${sceneSections}


                </main>


                <script>

                    window.onload = function () {

                        window.focus();

                        setTimeout(
                            function () {
                                window.print();
                            },
                            300
                        );

                    };

                </script>


            </body>

            </html>
        `);


            printWindow.document.close();

        } catch (error) {

            console.error(
                "Export script error:",
                error
            );

            alert(
                error.message ||
                "Unable to export the latest script."
            );
        }
    };


    const handleDeleteScene = async (scene) => {
        if (!scene?.id) {
            return;
        }

        const confirmed = window.confirm(
            `Delete Scene ${scene.sceneOrder}: "${scene.sceneName}"?\n\n` +
            "This will also delete the scene content. " +
            "The remaining scenes will be renumbered automatically."
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await authFetch(
                `http://localhost:8080/api/projects/${id}/scenes/${scene.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Unable to delete scene.");
            }

            // Reload the project so the backend's new scene numbers
            // are reflected immediately in the UI.
            window.location.reload();

        } catch (error) {
            console.error("Delete scene error:", error);
            alert(error.message || "Unable to delete scene.");
        }
    };

// --------------------------------------------------
// SAVE SCENE
// CREATE = POST
// UPDATE = PUT
// --------------------------------------------------

    const handleCreateScene = async () => {
        if (!sceneName.trim() || !sceneHeading.trim()) {
            alert(
                "Please enter Scene Name and Scene Heading."
            );

            return;
        }

        const token = localStorage.getItem("token");

        setSavingScene(true);

        try {
            const descriptionBlock =
                sceneBlocks.find(
                    (block) =>
                        block.type === "description" &&
                        block.content.trim()
                );

            const sceneDescription =
                descriptionBlock?.content || "";

            const characterIds = [
                ...new Set(
                    sceneBlocks
                        .filter(
                            (block) =>
                                block.type === "dialogue" &&
                                block.characterId
                        )
                        .map((block) =>
                            Number(block.characterId)
                        )
                ),
            ];

            // --------------------------------------------------
            // UPDATE EXISTING SCENE
            // --------------------------------------------------

            if (editingScene) {

                // 1. Update scene information
                const response = await authFetch(
                    `http://localhost:8080/api/projects/${id}/scenes/${editingScene.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            sceneName: sceneName.trim(),
                            heading: sceneHeading.trim(),
                            description: sceneDescription,
                            characterIds: characterIds,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to update scene"
                    );
                }

                const updatedScene =
                    await response.json();


                // 2. Update all scene content blocks
                const blocksToSave =
                    sceneBlocks.map(
                        (block, index) => ({
                            contentOrder: index + 1,

                            type:
                                block.type === "dialogue"
                                    ? "DIALOGUE"
                                    : "DESCRIPTION",

                            content:
                                block.content || "",

                            characterId:
                                block.type === "dialogue" &&
                                block.characterId
                                    ? Number(block.characterId)
                                    : null,
                        })
                    );


                const contentResponse =
                    await authFetch(
                        `http://localhost:8080/api/scenes/${editingScene.id}/contents`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },

                            body: JSON.stringify(
                                blocksToSave
                            ),
                        }
                    );


                if (!contentResponse.ok) {
                    throw new Error(
                        "Scene updated, but content could not be saved."
                    );
                }


                // 3. Update the scene in the dashboard list
                setScenes((currentScenes) =>
                    currentScenes.map(
                        (scene) =>
                            scene.id === updatedScene.id
                                ? updatedScene
                                : scene
                    )
                );


                setEditingScene(updatedScene);

                setShowSceneModal(false);

                return;
            }

            // --------------------------------------------------
            // CREATE NEW SCENE
            // --------------------------------------------------

            const response = await authFetch(
                `http://localhost:8080/api/projects/${id}/scenes`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        sceneName:
                            sceneName.trim(),

                        heading:
                            sceneHeading.trim(),

                        description:
                        sceneDescription,

                        characterIds:
                        characterIds,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to create scene"
                );
            }

            const newScene =
                await response.json();

            // --------------------------------------------------
            // SAVE CONTENT BLOCKS
            // --------------------------------------------------

            const blocksToSave =
                sceneBlocks.filter(
                    (block) =>
                        block.content.trim() ||
                        block.type === "dialogue"
                );

            for (
                let index = 0;
                index < blocksToSave.length;
                index++
            ) {
                const block =
                    blocksToSave[index];

                const contentResponse =
                    await authFetch(
                        `http://localhost:8080/api/scenes/${newScene.id}/contents`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",
                                Authorization: `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                                contentOrder:
                                    index + 1,

                                type:
                                    block.type ===
                                    "dialogue"
                                        ? "DIALOGUE"
                                        : "DESCRIPTION",

                                content:
                                    block.content ||
                                    "",

                                characterId:
                                    block.type ===
                                    "dialogue" &&
                                    block.characterId
                                        ? Number(
                                            block.characterId
                                        )
                                        : null,
                            }),
                        }
                    );

                if (!contentResponse.ok) {
                    throw new Error(
                        "Scene created, but content could not be saved."
                    );
                }
            }

            setScenes((currentScenes) => [
                ...currentScenes,
                newScene,
            ]);

            setSceneName("");
            setSceneHeading("");

            setSceneBlocks([
                {
                    id: 1,
                    type: "description",
                    content: "",
                },
                {
                    id: 2,
                    type: "dialogue",
                    content: "",
                    characterId: "",
                },
            ]);

            setEditingScene(null);
            setShowSceneModal(false);

        } catch (error) {
            console.error(
                "Save scene error:",
                error
            );

            alert(error.message);

        } finally {
            setSavingScene(false);
        }
    };

// --------------------------------------------------
// LOADING
// --------------------------------------------------

    if (loading) {
        return (
            <div className="project-editor-page">
                <p>Loading project...</p>
            </div>
        );
    }

// --------------------------------------------------
// ERROR
// --------------------------------------------------

    if (error) {
        return (
            <div className="project-editor-page">
                <p>{error}</p>
            </div>
        );
    }

// --------------------------------------------------
// UI
// --------------------------------------------------

    return (
        <div className="dashboard project-dashboard-style">

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
                        className="new-project-button project-report-button"
                        onClick={handleExportScript}
                    >
                        Export Script
                    </button>

                    <button
                        type="button"
                        className="new-project-button project-report-button"
                        onClick={() => navigate(`/project/${id}/characters`)}
                    >
                        Character Report
                    </button>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                </div>

            </header>


            <main className="main-content project-main-content">

                <section className="hero project-hero">

                    <div>

                        <div className="eyebrow">
                            SCREENPLAY
                        </div>

                        <h1>
                            {project.title}
                        </h1>

                        <p>
                            {project.description ||
                                "Build your story scene by scene."}
                        </p>


                    </div>

                    <div className="project-count">

                    <span>
                        {scenes.length}
                    </span>

                        <small>
                            {scenes.length === 1
                                ? "Scene"
                                : "Scenes"}
                        </small>

                    </div>

                </section>


                <section className="stats project-stats">

                    <div className="stat-card">
                    <span className="stat-label">
                        Total Scenes
                    </span>

                        <strong>
                            {scenes.length}
                        </strong>
                    </div>

                    <div className="stat-card">
                    <span className="stat-label">
                        Characters
                    </span>

                        <strong>
                            {characters.length}
                        </strong>
                    </div>

                </section>


                <div className="section-header">

                    <div>
                        <h2>
                            Scenes
                        </h2>

                        <p>
                            Your screenplay, scene by scene
                        </p>
                    </div>

                    <button
                        className="new-project-button"
                        onClick={openNewScene}
                    >
                        + New Scene
                    </button>

                </div>


                {scenes.length === 0 ? (

                    <div className="empty-card">

                        <div className="empty-icon">
                            🎞️
                        </div>

                        <h2>
                            Your first scene starts here
                        </h2>

                        <p>
                            Create a scene and begin writing your screenplay.
                        </p>

                        <button
                            className="primary-button"
                            onClick={openNewScene}
                        >
                            + Create First Scene
                        </button>

                    </div>

                ) : (

                    <section className="projects-grid project-scenes-grid">

                        {scenes.map((scene, index) => (

                            <article
                                className="project-card scene-project-card"
                                key={scene.id}
                            >

                                <div className="scene-card-simple">
                                    <div className="scene-card-title">
                                        <span className="scene-number">Scene {scene.sceneOrder}</span>

                                    </div>

                                    <div>
                                        <h3>{scene.sceneName}</h3>
                                    </div>

                                    <button
                                        type="button"
                                        className="open-button"
                                        onClick={() => openScene(scene)}
                                    >
                                        Edit Scene
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-scene-button"
                                        onClick={() => handleDeleteScene(scene)}
                                    >
                                        Delete Scene
                                    </button>
                                </div>
                            </article>

                        ))}

                    </section>

                )}


            </main>


            {/* SCENE MODAL */}

            {showSceneModal && (

                <div className="scene-fullscreen-modal">

                    <div className="scene-fullscreen-header">

                        <div className="scene-editor-title">

                            <div className="scene-editor-film-icon">
                                🎬
                            </div>

                            <div>

                                <h2>
                                    Scene Editor
                                </h2>

                                <span>
                                    {editingScene
                                        ? `Editing Scene ${editingScene.sceneOrder}`
                                        : "Building your screenplay"}
                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="scene-fullscreen-close"
                            onClick={() =>
                                setShowSceneModal(
                                    false
                                )
                            }
                        >
                            ×
                        </button>

                    </div>


                    <div className="scene-fullscreen-body">

                        <div className="scene-fullscreen-content">

                            <div className="scene-editor-kicker">
                                {editingScene
                                    ? "Edit Scene"
                                    : "New Scene"}
                            </div>


                            {/* SCENE NAME */}

                            <div className="form-group">

                                <label>
                                    Scene Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="The Morning After"
                                    value={
                                        sceneName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSceneName(
                                            event.target
                                                .value
                                        )
                                    }
                                />

                            </div>


                            {/* SCENE HEADING */}

                            <div className="form-group">

                                <label>
                                    Scene Heading
                                </label>

                                <input
                                    type="text"
                                    placeholder="INT. LIVING ROOM - NIGHT"
                                    value={
                                        sceneHeading
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSceneHeading(
                                            event.target
                                                .value
                                        )
                                    }
                                />

                            </div>


                            {/* SCENE CONTENT */}

                            <div className="scene-writing-section">

                                <div className="scene-writing-header">

                                    <div>

                                        <div className="scene-editor-kicker">
                                            Scene Content
                                        </div>

                                        <h3>
                                            Build your scene
                                        </h3>

                                        <p>
                                            Add action and dialogue
                                            in the order they happen
                                            in the scene.
                                        </p>

                                    </div>

                                </div>


                                {/* CONTENT BLOCKS */}

                                {sceneBlocks.map(
                                    (block) => (

                                        <div
                                            className="scene-block"
                                            key={block.id}
                                        >

                                            <div className="scene-block-top">

                                                <div className="scene-block-label">

                                                    {block.type ===
                                                    "description"
                                                        ? "DESCRIPTION"
                                                        : "DIALOGUE"}

                                                </div>


                                                {block.id !==
                                                    1 &&
                                                    block.id !==
                                                    2 && (

                                                        <div className="scene-block-controls">

                                                            <button
                                                                type="button"
                                                                className="move-scene-block-button"
                                                                onClick={() => {

                                                                    const index =
                                                                        sceneBlocks.findIndex(
                                                                            (
                                                                                currentBlock
                                                                            ) =>
                                                                                currentBlock.id ===
                                                                                block.id
                                                                        );

                                                                    if (
                                                                        index <=
                                                                        0
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    const updatedBlocks =
                                                                        [
                                                                            ...sceneBlocks,
                                                                        ];

                                                                    [
                                                                        updatedBlocks[
                                                                        index -
                                                                        1
                                                                            ],
                                                                        updatedBlocks[
                                                                            index
                                                                            ],
                                                                    ] = [
                                                                        updatedBlocks[
                                                                            index
                                                                            ],
                                                                        updatedBlocks[
                                                                        index -
                                                                        1
                                                                            ],
                                                                    ];

                                                                    setSceneBlocks(
                                                                        updatedBlocks
                                                                    );
                                                                }}
                                                            >
                                                                ↑
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="move-scene-block-button"
                                                                onClick={() => {

                                                                    const index =
                                                                        sceneBlocks.findIndex(
                                                                            (
                                                                                currentBlock
                                                                            ) =>
                                                                                currentBlock.id ===
                                                                                block.id
                                                                        );

                                                                    if (
                                                                        index ===
                                                                        -1 ||
                                                                        index ===
                                                                        sceneBlocks.length -
                                                                        1
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    const updatedBlocks =
                                                                        [
                                                                            ...sceneBlocks,
                                                                        ];

                                                                    [
                                                                        updatedBlocks[
                                                                            index
                                                                            ],
                                                                        updatedBlocks[
                                                                        index +
                                                                        1
                                                                            ],
                                                                    ] = [
                                                                        updatedBlocks[
                                                                        index +
                                                                        1
                                                                            ],
                                                                        updatedBlocks[
                                                                            index
                                                                            ],
                                                                    ];

                                                                    setSceneBlocks(
                                                                        updatedBlocks
                                                                    );
                                                                }}
                                                            >
                                                                ↓
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="delete-scene-block-button"
                                                                onClick={() => {

                                                                    setSceneBlocks(
                                                                        sceneBlocks.filter(
                                                                            (
                                                                                currentBlock
                                                                            ) =>
                                                                                currentBlock.id !==
                                                                                block.id
                                                                        )
                                                                    );
                                                                }}
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    )}

                                            </div>


                                            {/* CHARACTER DROPDOWN */}

                                            {block.type ===
                                                "dialogue" && (

                                                    <div className="character-dropdown">

                                                        <button
                                                            type="button"
                                                            className="character-dropdown-button"
                                                            onClick={() =>
                                                                setOpenCharacterDropdownId(
                                                                    openCharacterDropdownId ===
                                                                    block.id
                                                                        ? null
                                                                        : block.id
                                                                )
                                                            }
                                                        >

                                                        <span>

                                                            {block.characterId
                                                                ? characters.find(
                                                                    (
                                                                        character
                                                                    ) =>
                                                                        character.id ===
                                                                        Number(
                                                                            block.characterId
                                                                        )
                                                                )?.name ||
                                                                "Select Character"
                                                                : "Select Character"}

                                                        </span>


                                                            <span className="character-dropdown-arrow">

                                                            {openCharacterDropdownId ===
                                                            block.id
                                                                ? "▲"
                                                                : "▼"}

                                                        </span>

                                                        </button>


                                                        {openCharacterDropdownId ===
                                                            block.id && (

                                                                <div className="character-dropdown-menu">

                                                                    {characters.map(
                                                                        (
                                                                            character
                                                                        ) => (

                                                                            <button
                                                                                type="button"
                                                                                key={
                                                                                    character.id
                                                                                }
                                                                                className="character-dropdown-option"
                                                                                onClick={() => {

                                                                                    setSceneBlocks(
                                                                                        (
                                                                                            currentBlocks
                                                                                        ) =>
                                                                                            currentBlocks.map(
                                                                                                (
                                                                                                    currentBlock
                                                                                                ) =>
                                                                                                    currentBlock.id ===
                                                                                                    block.id
                                                                                                        ? {
                                                                                                            ...currentBlock,
                                                                                                            characterId:
                                                                                                            character.id,
                                                                                                        }
                                                                                                        : currentBlock
                                                                                            )
                                                                                    );

                                                                                    setOpenCharacterDropdownId(
                                                                                        null
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {
                                                                                    character.name
                                                                                }
                                                                            </button>

                                                                        )
                                                                    )}


                                                                    <div className="character-dropdown-divider" />


                                                                    <button
                                                                        type="button"
                                                                        className="character-dropdown-new"
                                                                        onClick={() => {

                                                                            setOpenCharacterDropdownId(
                                                                                null
                                                                            );

                                                                            setCharacterModalBlockId(
                                                                                block.id
                                                                            );

                                                                            setCharacterName(
                                                                                ""
                                                                            );

                                                                            setCharacterDescription(
                                                                                ""
                                                                            );

                                                                            setShowCharacterModal(
                                                                                true
                                                                            );
                                                                        }}
                                                                    >
                                                                        ＋ New Character
                                                                    </button>

                                                                </div>

                                                            )}

                                                    </div>

                                                )}


                                            {/* CONTENT TEXTAREA */}

                                            <textarea
                                                rows={
                                                    block.type ===
                                                    "dialogue"
                                                        ? 3
                                                        : 6
                                                }
                                                placeholder={
                                                    block.type ===
                                                    "description"
                                                        ? "Describe what happens..."
                                                        : "Write the dialogue..."
                                                }
                                                value={
                                                    block.content
                                                }
                                                onChange={(
                                                    event
                                                ) => {

                                                    setSceneBlocks(
                                                        (
                                                            currentBlocks
                                                        ) =>
                                                            currentBlocks.map(
                                                                (
                                                                    currentBlock
                                                                ) =>
                                                                    currentBlock.id ===
                                                                    block.id
                                                                        ? {
                                                                            ...currentBlock,
                                                                            content:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        }
                                                                        : currentBlock
                                                            )
                                                    );
                                                }}
                                            />

                                        </div>

                                    )
                                )}


                                {/* ADD BLOCK */}

                                <div className="add-block-container">

                                    <button
                                        type="button"
                                        className="add-scene-content-button"
                                        onClick={() =>
                                            setShowBlockMenu(
                                                !showBlockMenu
                                            )
                                        }
                                    >
                                        + Add Description or Dialogue
                                    </button>


                                    {showBlockMenu && (

                                        <div className="scene-block-menu">

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setSceneBlocks(
                                                        [
                                                            ...sceneBlocks,
                                                            {
                                                                id: Date.now(),
                                                                type: "description",
                                                                content: "",
                                                            },
                                                        ]
                                                    );

                                                    setShowBlockMenu(
                                                        false
                                                    );
                                                }}
                                            >

                                                <span>
                                                    ✦
                                                </span>

                                                <div>

                                                    <strong>
                                                        Description
                                                    </strong>

                                                    <small>
                                                        Add action or
                                                        visual details
                                                    </small>

                                                </div>

                                            </button>


                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setSceneBlocks(
                                                        [
                                                            ...sceneBlocks,
                                                            {
                                                                id: Date.now(),
                                                                type: "dialogue",
                                                                content: "",
                                                                characterId:
                                                                    "",
                                                            },
                                                        ]
                                                    );

                                                    setShowBlockMenu(
                                                        false
                                                    );
                                                }}
                                            >

                                                <span>
                                                    ◉
                                                </span>

                                                <div>

                                                    <strong>
                                                        Dialogue
                                                    </strong>

                                                    <small>
                                                        Add spoken dialogue
                                                    </small>

                                                </div>

                                            </button>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setShowSceneModal(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="create-button"
                                    disabled={
                                        savingScene
                                    }
                                    onClick={
                                        handleCreateScene
                                    }
                                >
                                    {savingScene
                                        ? "Saving..."
                                        : editingScene
                                            ? "Save Changes"
                                            : "Create Scene"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* CHARACTER MODAL */}

            {showCharacterModal && (

                <div className="character-modal-overlay">

                    <div className="character-modal">

                        <div className="character-modal-header">

                            <div>

                                <div className="scene-editor-kicker">
                                    New Character
                                </div>

                                <h2>
                                    Create Character
                                </h2>

                                <p>
                                    Add a character to this project.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="character-modal-close"
                                onClick={() => {

                                    setShowCharacterModal(
                                        false
                                    );

                                    setCharacterModalBlockId(
                                        null
                                    );
                                }}
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
                                    placeholder="JOHN"
                                    value={
                                        characterName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCharacterName(
                                            event.target
                                                .value
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
                                    placeholder="Describe this character..."
                                    value={
                                        characterDescription
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCharacterDescription(
                                            event.target
                                                .value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        <div className="character-modal-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {

                                    setShowCharacterModal(
                                        false
                                    );

                                    setCharacterModalBlockId(
                                        null
                                    );
                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="create-button"
                                disabled={
                                    creatingCharacter ||
                                    !characterName.trim()
                                }
                                onClick={
                                    handleCreateCharacter
                                }
                            >
                                {creatingCharacter
                                    ? "Creating..."
                                    : "Create Character"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default ProjectEditor;
