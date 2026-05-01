const STORAGE_KEY = "personal-site-studio:draft:v2";
const GITHUB_STORAGE_KEY = "personal-site-studio:github:v1";

const defaultSiteData = {
    metadata: {
        siteTitle: "My Personal Website",
    },
    profile: {
        name: "Your Name",
        title: "Your Role or Research Area",
        sidebarNote: "Add your short tagline here",
        about: [
            "Write a short self-introduction here. Mention your role, background, or what your website is about.",
            "Use this section to explain your current work, research focus, or professional direction.",
            "Add one more paragraph for education, affiliation, collaboration interests, or anything else you want visitors to know.",
        ],
        motto: "Write your own signature line or motto here.",
        photo: {
            type: "image",
            src: "",
            positionX: 50,
            positionY: 50,
        },
        signature: {
            type: "image",
            src: "",
            positionX: 50,
            positionY: 50,
        },
    },
    links: [
        { label: "CV", url: "assets/cv.pdf" },
        { label: "Email", url: "mailto:your-email@example.com" },
        { label: "GitHub", url: "https://github.com/your-username" },
        { label: "Google Scholar", url: "https://scholar.google.com/" },
    ],
    research: [
        "Research Topic A",
        "Research Topic B",
    ],
    updates: [
        "Add a recent update here.",
        "Add another milestone, award, or news item here.",
        "Use this area for offers, publications, talks, travel, or project progress.",
    ],
    publications: [
        {
            group: "Research Area A",
            title: "Paper Title One",
            authors: "Author A, Author B, Author C",
            venue: "Conference or Journal, 2026",
            summary: "Summarize the motivation, method, and result in one or two sentences.",
            media: {
                type: "image",
                src: "",
                poster: "",
                positionX: 50,
                positionY: 50,
            },
            links: {
                paper: "",
                project: "",
                arxiv: "",
            },
        },
        {
            group: "Research Area A",
            title: "Paper Title Two",
            authors: "Author A*, Author B*, Author C, Author D",
            venue: "Workshop / Under Review / Preprint",
            summary: "Use this slot for another paper, demo, or project with video preview.",
            media: {
                type: "video",
                src: "",
                poster: "",
                positionX: 50,
                positionY: 50,
            },
            links: {
                paper: "",
                project: "",
                arxiv: "",
            },
        },
        {
            group: "Research Area B",
            title: "Paper Title Three",
            authors: "Author A, Author B",
            venue: "Conference or Journal, 2025",
            summary: "This slot can be used for a poster, publication figure, or another project summary.",
            media: {
                type: "image",
                src: "",
                positionX: 50,
                positionY: 50,
            },
            links: {
                paper: "",
                project: "",
                arxiv: "",
            },
        },
    ],
    projects: [
        {
            title: "Project One",
            description: "Describe a project, demo, open-source repository, or field deployment here.",
            url: "",
            cta: "Open project",
        },
        {
            title: "Project Two",
            description: "Add a second project card for software, hardware, datasets, or collaborations.",
            url: "",
            cta: "View repository",
        },
    ],
    competitions: [
        {
            title: "Competition or Award One",
            award: "Award Title or Track",
            note: "Explain what the competition was and why it matters.",
        },
        {
            title: "Competition or Award Two",
            award: "Award Title or Track",
            note: "Use this card for competition results, scholarships, honors, or certificates.",
        },
    ],
    tutorials: [
        {
            date: "05.2026",
            title: "Tutorial or Talk One",
            url: "",
        },
        {
            date: "04.2026",
            title: "Tutorial or Talk Two",
            url: "",
        },
    ],
    hobbies: [
        "Add a short personal note about hobbies, travel, sports, music, or anything else you want to share.",
        "Keep this section optional if you want a more formal website.",
    ],
    footer: "© 2026 Your Name. All rights reserved.",
};

const previewStage = document.getElementById("preview-stage");
const editorPanel = document.getElementById("editor-panel");
const saveStatus = document.getElementById("save-status");
const publishStatus = document.getElementById("publish-status");
const saveDraftButton = document.getElementById("save-draft");
const undoButton = document.getElementById("undo-change");
const redoButton = document.getElementById("redo-change");
const exportButton = document.getElementById("export-site");
const resetButton = document.getElementById("reset-template");
const publishButton = document.getElementById("publish-github");
const importButton = document.getElementById("import-data");
const importInput = document.getElementById("json-import");
const githubOwnerInput = document.getElementById("github-owner");
const githubRepoInput = document.getElementById("github-repo");
const githubBranchInput = document.getElementById("github-branch");
const githubPathInput = document.getElementById("github-path");
const githubMessageInput = document.getElementById("github-message");
const githubTokenInput = document.getElementById("github-token");

let siteData = loadDraft();
let historyStack = [clone(siteData)];
let historyIndex = 0;
let dragState = null;

hydrateGitHubDraft();
renderAll();
wireEvents();

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadDraft() {
    try {
        const draft = localStorage.getItem(STORAGE_KEY);
        return draft ? JSON.parse(draft) : clone(defaultSiteData);
    } catch {
        return clone(defaultSiteData);
    }
}

function hydrateGitHubDraft() {
    try {
        const saved = JSON.parse(localStorage.getItem(GITHUB_STORAGE_KEY) || "{}");
        githubOwnerInput.value = saved.owner || "";
        githubRepoInput.value = saved.repo || "";
        githubBranchInput.value = saved.branch || "main";
        githubPathInput.value = saved.path || "";
        githubMessageInput.value = saved.message || "Update personal website";
    } catch {
        githubBranchInput.value = "main";
        githubMessageInput.value = "Update personal website";
    }
}

function saveGitHubDraft() {
    const draft = {
        owner: githubOwnerInput.value.trim(),
        repo: githubRepoInput.value.trim(),
        branch: githubBranchInput.value.trim(),
        path: githubPathInput.value.trim(),
        message: githubMessageInput.value.trim(),
    };
    localStorage.setItem(GITHUB_STORAGE_KEY, JSON.stringify(draft));
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function pathTokens(path) {
    return String(path)
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter(Boolean);
}

function getByPath(object, path) {
    return pathTokens(path).reduce((current, token) => current?.[token], object);
}

function setByPath(object, path, value) {
    const tokens = pathTokens(path);
    const lastToken = tokens.pop();
    const parent = tokens.reduce((current, token) => current[token], object);
    parent[lastToken] = value;
}

function listButton(action, list, index, label) {
    return `<button type="button" class="small-button" data-action="${action}" data-list="${list}" data-index="${index}">${escapeHtml(label)}</button>`;
}

function renderEditor() {
    editorPanel.innerHTML = `
        <details open>
            <summary>Profile</summary>
            <div class="field-grid">
                <label>Browser Title<input type="text" data-path="metadata.siteTitle" value="${escapeHtml(siteData.metadata.siteTitle)}"></label>
                <label>Name<input type="text" data-path="profile.name" value="${escapeHtml(siteData.profile.name)}"></label>
                <label>Title<input type="text" data-path="profile.title" value="${escapeHtml(siteData.profile.title)}"></label>
                <label>Sidebar Note<input type="text" data-path="profile.sidebarNote" value="${escapeHtml(siteData.profile.sidebarNote)}"></label>
                <label>Motto<textarea data-path="profile.motto">${escapeHtml(siteData.profile.motto)}</textarea></label>
                ${siteData.profile.about.map((paragraph, index) => `
                    <div class="repeater-item">
                        <h4>About Paragraph ${index + 1}</h4>
                        <label>Text<textarea data-path="profile.about.${index}">${escapeHtml(paragraph)}</textarea></label>
                        <div class="item-actions">${listButton("remove-string-item", "profile.about", index, "Remove paragraph")}</div>
                    </div>
                `).join("")}
                <div class="inline-actions">
                    <button type="button" class="small-button" data-action="add-string-item" data-list="profile.about">Add paragraph</button>
                </div>
                <label>Profile Image Source<input type="text" data-path="profile.photo.src" value="${escapeHtml(siteData.profile.photo.src)}"></label>
                <label>Signature Image Source<input type="text" data-path="profile.signature.src" value="${escapeHtml(siteData.profile.signature.src)}"></label>
            </div>
        </details>

        <details>
            <summary>Links</summary>
            <div class="repeater">
                ${siteData.links.map((link, index) => `
                    <div class="repeater-item">
                        <h4>Link ${index + 1}</h4>
                        <label>Label<input type="text" data-path="links.${index}.label" value="${escapeHtml(link.label)}"></label>
                        <label>URL<input type="text" data-path="links.${index}.url" value="${escapeHtml(link.url)}"></label>
                        <div class="item-actions">${listButton("remove-link", "links", index, "Remove link")}</div>
                    </div>
                `).join("")}
                <div class="inline-actions">
                    <button type="button" class="small-button" data-action="add-link">Add link</button>
                </div>
            </div>
        </details>

        <details>
            <summary>Research & Updates</summary>
            <div class="repeater">
                <div class="repeater-item">
                    <h4>Research Interests</h4>
                    ${siteData.research.map((item, index) => `
                        <label>Item ${index + 1}<input type="text" data-path="research.${index}" value="${escapeHtml(item)}"></label>
                        <div class="item-actions">${listButton("remove-string-item", "research", index, "Remove item")}</div>
                    `).join("")}
                    <div class="inline-actions"><button type="button" class="small-button" data-action="add-string-item" data-list="research">Add research item</button></div>
                </div>
                <div class="repeater-item">
                    <h4>Recent Updates</h4>
                    ${siteData.updates.map((item, index) => `
                        <label>Update ${index + 1}<textarea data-path="updates.${index}">${escapeHtml(item)}</textarea></label>
                        <div class="item-actions">${listButton("remove-string-item", "updates", index, "Remove update")}</div>
                    `).join("")}
                    <div class="inline-actions"><button type="button" class="small-button" data-action="add-string-item" data-list="updates">Add update</button></div>
                </div>
            </div>
        </details>

        <details>
            <summary>Publications</summary>
            <div class="repeater">
                ${siteData.publications.map((publication, index) => `
                    <div class="repeater-item">
                        <h4>Publication ${index + 1}</h4>
                        <label>Group<input type="text" data-path="publications.${index}.group" value="${escapeHtml(publication.group)}"></label>
                        <label>Title<textarea data-path="publications.${index}.title">${escapeHtml(publication.title)}</textarea></label>
                        <label>Authors<textarea data-path="publications.${index}.authors">${escapeHtml(publication.authors)}</textarea></label>
                        <label>Venue<input type="text" data-path="publications.${index}.venue" value="${escapeHtml(publication.venue)}"></label>
                        <label>Summary<textarea data-path="publications.${index}.summary">${escapeHtml(publication.summary)}</textarea></label>
                        <label>Media Type<input type="text" data-path="publications.${index}.media.type" value="${escapeHtml(publication.media.type)}"></label>
                        <label>Media Source<input type="text" data-path="publications.${index}.media.src" value="${escapeHtml(publication.media.src)}"></label>
                        <label>Poster Source<input type="text" data-path="publications.${index}.media.poster" value="${escapeHtml(publication.media.poster || "")}"></label>
                        <label>Paper Link<input type="text" data-path="publications.${index}.links.paper" value="${escapeHtml(publication.links.paper)}"></label>
                        <label>Project Link<input type="text" data-path="publications.${index}.links.project" value="${escapeHtml(publication.links.project)}"></label>
                        <label>ArXiv Link<input type="text" data-path="publications.${index}.links.arxiv" value="${escapeHtml(publication.links.arxiv)}"></label>
                        <div class="item-actions">${listButton("remove-publication", "publications", index, "Remove publication")}</div>
                    </div>
                `).join("")}
                <div class="inline-actions"><button type="button" class="small-button" data-action="add-publication">Add publication</button></div>
            </div>
        </details>

        <details>
            <summary>Projects</summary>
            <div class="repeater">
                ${siteData.projects.map((project, index) => `
                    <div class="repeater-item">
                        <h4>Project ${index + 1}</h4>
                        <label>Title<input type="text" data-path="projects.${index}.title" value="${escapeHtml(project.title)}"></label>
                        <label>Description<textarea data-path="projects.${index}.description">${escapeHtml(project.description)}</textarea></label>
                        <label>URL<input type="text" data-path="projects.${index}.url" value="${escapeHtml(project.url)}"></label>
                        <label>CTA Label<input type="text" data-path="projects.${index}.cta" value="${escapeHtml(project.cta)}"></label>
                        <div class="item-actions">${listButton("remove-project", "projects", index, "Remove project")}</div>
                    </div>
                `).join("")}
                <div class="inline-actions"><button type="button" class="small-button" data-action="add-project">Add project</button></div>
            </div>
        </details>

        <details>
            <summary>Competitions & Tutorials</summary>
            <div class="repeater">
                <div class="repeater-item">
                    <h4>Competitions</h4>
                    ${siteData.competitions.map((item, index) => `
                        <label>Title<input type="text" data-path="competitions.${index}.title" value="${escapeHtml(item.title)}"></label>
                        <label>Award<input type="text" data-path="competitions.${index}.award" value="${escapeHtml(item.award)}"></label>
                        <label>Note<textarea data-path="competitions.${index}.note">${escapeHtml(item.note)}</textarea></label>
                        <div class="item-actions">${listButton("remove-competition", "competitions", index, "Remove competition")}</div>
                    `).join("")}
                    <div class="inline-actions"><button type="button" class="small-button" data-action="add-competition">Add competition</button></div>
                </div>
                <div class="repeater-item">
                    <h4>Tutorials</h4>
                    ${siteData.tutorials.map((item, index) => `
                        <label>Date<input type="text" data-path="tutorials.${index}.date" value="${escapeHtml(item.date)}"></label>
                        <label>Title<input type="text" data-path="tutorials.${index}.title" value="${escapeHtml(item.title)}"></label>
                        <label>URL<input type="text" data-path="tutorials.${index}.url" value="${escapeHtml(item.url)}"></label>
                        <div class="item-actions">${listButton("remove-tutorial", "tutorials", index, "Remove tutorial")}</div>
                    `).join("")}
                    <div class="inline-actions"><button type="button" class="small-button" data-action="add-tutorial">Add tutorial</button></div>
                </div>
            </div>
        </details>

        <details>
            <summary>Hobbies & Footer</summary>
            <div class="repeater">
                <div class="repeater-item">
                    <h4>Hobbies</h4>
                    ${siteData.hobbies.map((item, index) => `
                        <label>Item ${index + 1}<textarea data-path="hobbies.${index}">${escapeHtml(item)}</textarea></label>
                        <div class="item-actions">${listButton("remove-string-item", "hobbies", index, "Remove hobby note")}</div>
                    `).join("")}
                    <div class="inline-actions"><button type="button" class="small-button" data-action="add-string-item" data-list="hobbies">Add hobby note</button></div>
                </div>
                <div class="repeater-item">
                    <h4>Footer</h4>
                    <label>Footer text<input type="text" data-path="footer" value="${escapeHtml(siteData.footer)}"></label>
                </div>
            </div>
        </details>
    `;
}

function renderEditableText(tagName, path, text, className = "") {
    return `<${tagName} class="editable-field ${className}" contenteditable="true" spellcheck="false" data-path="${escapeHtml(path)}">${escapeHtml(text)}</${tagName}>`;
}

function renderMediaSlot(media, mediaPath, extraClass = "") {
    const classes = ["media-slot", extraClass];
    if (media.type === "image") {
        classes.push("image-slot");
    }
    const attrs = `class="${classes.join(" ")}" data-media-path="${escapeHtml(mediaPath)}"`;
    if (!media.src) {
        return `<div ${attrs}><div class="empty-note">Drop image or video here.</div></div>`;
    }
    if (media.type === "video") {
        return `
            <div ${attrs}>
                <video src="${escapeHtml(media.src)}" ${media.poster ? `poster="${escapeHtml(media.poster)}"` : ""} controls muted loop playsinline></video>
            </div>
        `;
    }
    return `
        <div ${attrs}>
            <img src="${escapeHtml(media.src)}" alt="" style="object-position:${Number(media.positionX) || 50}% ${Number(media.positionY) || 50}%;">
        </div>
    `;
}

function groupBy(items, key) {
    return items.reduce((accumulator, item) => {
        const group = item[key] || "Misc";
        accumulator[group] ??= [];
        accumulator[group].push(item);
        return accumulator;
    }, {});
}

function renderSite(mode = "editor") {
    const publicationGroups = groupBy(siteData.publications, "group");
    const profileLinks = siteData.links
        .map((link) => `<a href="${escapeHtml(link.url)}"${mode === "editor" ? ' data-editor-link="true"' : ""}>${escapeHtml(link.label)}</a>`)
        .join(" ");

    return `
        <div class="site-preview">
            <div class="site-layout">
                <aside class="site-sidebar">
                    ${mode === "editor"
                        ? renderEditableText("h1", "profile.name", siteData.profile.name)
                        : `<h1>${escapeHtml(siteData.profile.name)}</h1>`}
                    ${mode === "editor"
                        ? renderEditableText("p", "profile.sidebarNote", siteData.profile.sidebarNote, "sidebar-title")
                        : `<p class="sidebar-title">${escapeHtml(siteData.profile.sidebarNote)}</p>`}
                    <ul class="site-nav">
                        <li><a href="#about">About</a></li>
                        <li><a href="#updates">Updates</a></li>
                        <li><a href="#publications">Publications</a></li>
                        <li><a href="#projects">Projects</a></li>
                        <li><a href="#competitions">Competitions</a></li>
                        <li><a href="#tutorials">Tutorials</a></li>
                        <li><a href="#hobbies">Hobbies</a></li>
                    </ul>
                </aside>
                <main class="site-content">
                    <section id="about">
                        <div class="about-grid">
                            <div>
                                <h2>About</h2>
                                ${siteData.profile.about.map((paragraph, index) =>
                                    mode === "editor"
                                        ? renderEditableText("p", `profile.about.${index}`, paragraph)
                                        : `<p>${escapeHtml(paragraph)}</p>`
                                ).join("")}
                                ${mode === "editor"
                                    ? renderEditableText("p", "profile.motto", siteData.profile.motto, "personal-motto")
                                    : `<p class="personal-motto">${escapeHtml(siteData.profile.motto)}</p>`}
                            </div>
                            <div class="about-side">
                                ${renderMediaSlot(siteData.profile.photo, "profile.photo", "profile-photo-slot")}
                                ${renderMediaSlot(siteData.profile.signature, "profile.signature", "signature-slot")}
                                <div class="profile-links">${profileLinks}</div>
                            </div>
                        </div>
                    </section>

                    <section id="research">
                        <h2>Research Interests</h2>
                        <ul class="compact-list">
                            ${siteData.research.map((item, index) =>
                                mode === "editor"
                                    ? `<li class="editable-field" contenteditable="true" spellcheck="false" data-path="research.${index}">${escapeHtml(item)}</li>`
                                    : `<li>${escapeHtml(item)}</li>`
                            ).join("")}
                        </ul>
                    </section>

                    <section id="updates">
                        <h2>Recent Updates</h2>
                        <ul class="compact-list">
                            ${siteData.updates.map((item, index) =>
                                mode === "editor"
                                    ? `<li class="editable-field" contenteditable="true" spellcheck="false" data-path="updates.${index}">${escapeHtml(item)}</li>`
                                    : `<li>${escapeHtml(item)}</li>`
                            ).join("")}
                        </ul>
                    </section>

                    <section id="publications">
                        <h2>Selected Publications</h2>
                        ${Object.entries(publicationGroups).map(([group, publications]) => `
                            <div class="pub-group">
                                <h3>${escapeHtml(group)}</h3>
                                ${publications.map((publication) => {
                                    const publicationIndex = siteData.publications.indexOf(publication);
                                    return `
                                        <article class="publication">
                                            <div class="publication-media">
                                                ${renderMediaSlot(publication.media, `publications.${publicationIndex}.media`, "publication-media")}
                                            </div>
                                            <div class="publication-copy">
                                                ${mode === "editor"
                                                    ? renderEditableText("h4", `publications.${publicationIndex}.title`, publication.title)
                                                    : `<h4>${escapeHtml(publication.title)}</h4>`}
                                                ${mode === "editor"
                                                    ? renderEditableText("p", `publications.${publicationIndex}.authors`, publication.authors, "publication-meta")
                                                    : `<p class="publication-meta">${escapeHtml(publication.authors)}</p>`}
                                                ${mode === "editor"
                                                    ? renderEditableText("p", `publications.${publicationIndex}.venue`, publication.venue, "publication-meta")
                                                    : `<p class="publication-meta">${escapeHtml(publication.venue)}</p>`}
                                                <p class="publication-links">
                                                    ${publication.links.paper ? `<a href="${escapeHtml(publication.links.paper)}"${mode === "editor" ? ' data-editor-link="true"' : ""}>paper</a>` : ""}
                                                    ${publication.links.project ? `<a href="${escapeHtml(publication.links.project)}"${mode === "editor" ? ' data-editor-link="true"' : ""}>project</a>` : ""}
                                                    ${publication.links.arxiv ? `<a href="${escapeHtml(publication.links.arxiv)}"${mode === "editor" ? ' data-editor-link="true"' : ""}>arxiv</a>` : ""}
                                                </p>
                                                ${mode === "editor"
                                                    ? renderEditableText("p", `publications.${publicationIndex}.summary`, publication.summary, "publication-summary")
                                                    : `<p class="publication-summary">${escapeHtml(publication.summary)}</p>`}
                                            </div>
                                        </article>
                                    `;
                                }).join("")}
                            </div>
                        `).join("")}
                    </section>

                    <section id="projects">
                        <h2>Projects</h2>
                        <div class="project-grid">
                            ${siteData.projects.map((project, index) => `
                                <article class="card-item">
                                    ${mode === "editor"
                                        ? renderEditableText("h4", `projects.${index}.title`, project.title)
                                        : `<h4>${escapeHtml(project.title)}</h4>`}
                                    ${mode === "editor"
                                        ? renderEditableText("p", `projects.${index}.description`, project.description)
                                        : `<p>${escapeHtml(project.description)}</p>`}
                                    <p><a href="${escapeHtml(project.url)}"${mode === "editor" ? ' data-editor-link="true"' : ""}>${escapeHtml(project.cta)}</a></p>
                                </article>
                            `).join("")}
                        </div>
                    </section>

                    <section id="competitions">
                        <h2>Competitions & Awards</h2>
                        <div class="competition-grid">
                            ${siteData.competitions.map((item, index) => `
                                <article class="card-item">
                                    ${mode === "editor"
                                        ? renderEditableText("h4", `competitions.${index}.title`, item.title)
                                        : `<h4>${escapeHtml(item.title)}</h4>`}
                                    ${mode === "editor"
                                        ? renderEditableText("p", `competitions.${index}.award`, item.award, "publication-meta")
                                        : `<p class="publication-meta">${escapeHtml(item.award)}</p>`}
                                    ${mode === "editor"
                                        ? renderEditableText("p", `competitions.${index}.note`, item.note)
                                        : `<p>${escapeHtml(item.note)}</p>`}
                                </article>
                            `).join("")}
                        </div>
                    </section>

                    <section id="tutorials">
                        <h2>Tutorials</h2>
                        <div class="tutorial-grid">
                            ${siteData.tutorials.map((item, index) => `
                                <article class="card-item">
                                    ${mode === "editor"
                                        ? renderEditableText("p", `tutorials.${index}.date`, item.date, "publication-meta")
                                        : `<p class="publication-meta">${escapeHtml(item.date)}</p>`}
                                    ${mode === "editor"
                                        ? renderEditableText("h4", `tutorials.${index}.title`, item.title)
                                        : `<h4>${escapeHtml(item.title)}</h4>`}
                                    <p><a href="${escapeHtml(item.url)}"${mode === "editor" ? ' data-editor-link="true"' : ""}>Open material</a></p>
                                </article>
                            `).join("")}
                        </div>
                    </section>

                    <section id="hobbies">
                        <h2>Hobbies</h2>
                        ${siteData.hobbies.map((item, index) =>
                            mode === "editor"
                                ? renderEditableText("p", `hobbies.${index}`, item)
                                : `<p>${escapeHtml(item)}</p>`
                        ).join("")}
                    </section>

                    <div class="footer-note">
                        ${mode === "editor"
                            ? `<p class="editable-field" contenteditable="true" spellcheck="false" data-path="footer">${escapeHtml(siteData.footer)}</p>`
                            : `<p>${escapeHtml(siteData.footer)}</p>`}
                    </div>
                </main>
            </div>
        </div>
    `;
}

function renderPreview() {
    previewStage.innerHTML = renderSite("editor");
}

function renderAll() {
    renderEditor();
    renderPreview();
    syncHistoryButtons();
}

function syncHistoryButtons() {
    undoButton.disabled = historyIndex === 0;
    redoButton.disabled = historyIndex >= historyStack.length - 1;
}

function persistDraft(message) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    saveStatus.textContent = `${message} Last saved at ${time}.`;
}

function recordHistory() {
    const currentSerialized = JSON.stringify(siteData);
    const activeSerialized = JSON.stringify(historyStack[historyIndex]);
    if (currentSerialized === activeSerialized) {
        return;
    }
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(clone(siteData));
    historyIndex = historyStack.length - 1;
    syncHistoryButtons();
}

function updateFromInput(target) {
    const path = target.dataset.path;
    if (!path) {
        return;
    }
    let nextValue = target.value;
    if (target.type === "number") {
        nextValue = Number(target.value);
    }
    setByPath(siteData, path, nextValue);
    renderPreview();
    persistDraft("Draft updated.");
    recordHistory();
}

function createDefaultPublication() {
    return {
        group: "New Group",
        title: "New publication title",
        authors: "Author A, Author B",
        venue: "Venue or status",
        summary: "Short description of the work.",
        media: {
            type: "image",
            src: "",
            poster: "",
            positionX: 50,
            positionY: 50,
        },
        links: {
            paper: "",
            project: "",
            arxiv: "",
        },
    };
}

function createDefaultProject() {
    return {
        title: "New project",
        description: "Short description of the project.",
        url: "",
        cta: "Open project",
    };
}

function createDefaultCompetition() {
    return {
        title: "New competition",
        award: "Award or track",
        note: "What this competition was about.",
    };
}

function createDefaultTutorial() {
    return {
        date: "05.2026",
        title: "New tutorial item",
        url: "",
    };
}

function addStringItem(listPath) {
    const list = getByPath(siteData, listPath);
    list.push("New item");
}

function removeAt(listPath, index) {
    const list = getByPath(siteData, listPath);
    list.splice(index, 1);
}

function handlePanelAction(action, button) {
    if (action === "add-string-item") {
        addStringItem(button.dataset.list);
    } else if (action === "remove-string-item") {
        removeAt(button.dataset.list, Number(button.dataset.index));
    } else if (action === "add-link") {
        siteData.links.push({ label: "New Link", url: "" });
    } else if (action === "remove-link") {
        siteData.links.splice(Number(button.dataset.index), 1);
    } else if (action === "add-publication") {
        siteData.publications.push(createDefaultPublication());
    } else if (action === "remove-publication") {
        siteData.publications.splice(Number(button.dataset.index), 1);
    } else if (action === "add-project") {
        siteData.projects.push(createDefaultProject());
    } else if (action === "remove-project") {
        siteData.projects.splice(Number(button.dataset.index), 1);
    } else if (action === "add-competition") {
        siteData.competitions.push(createDefaultCompetition());
    } else if (action === "remove-competition") {
        siteData.competitions.splice(Number(button.dataset.index), 1);
    } else if (action === "add-tutorial") {
        siteData.tutorials.push(createDefaultTutorial());
    } else if (action === "remove-tutorial") {
        siteData.tutorials.splice(Number(button.dataset.index), 1);
    } else {
        return;
    }
    persistDraft("Draft updated.");
    recordHistory();
    renderAll();
}

function beginMediaDrag(event) {
    const slot = event.target.closest(".image-slot");
    if (!slot) {
        return;
    }
    const mediaPath = slot.dataset.mediaPath;
    const media = getByPath(siteData, mediaPath);
    if (!media || media.type !== "image") {
        return;
    }
    const image = slot.querySelector("img");
    if (!image) {
        return;
    }
    dragState = {
        mediaPath,
        image,
        slot,
        rect: slot.getBoundingClientRect(),
        originX: event.clientX,
        originY: event.clientY,
        startX: Number(media.positionX) || 50,
        startY: Number(media.positionY) || 50,
    };
    slot.classList.add("is-dragging");
}

function continueMediaDrag(event) {
    if (!dragState) {
        return;
    }
    const deltaX = ((event.clientX - dragState.originX) / dragState.rect.width) * 100;
    const deltaY = ((event.clientY - dragState.originY) / dragState.rect.height) * 100;
    const nextX = clamp(dragState.startX + deltaX, 0, 100);
    const nextY = clamp(dragState.startY + deltaY, 0, 100);
    const media = getByPath(siteData, dragState.mediaPath);
    media.positionX = nextX;
    media.positionY = nextY;
    dragState.image.style.objectPosition = `${nextX}% ${nextY}%`;
}

function endMediaDrag() {
    if (!dragState) {
        return;
    }
    dragState.slot.classList.remove("is-dragging");
    dragState = null;
    persistDraft("Media position updated.");
    recordHistory();
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

async function handleMediaDrop(event) {
    const slot = event.target.closest(".media-slot");
    if (!slot) {
        return;
    }
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
        return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    const media = getByPath(siteData, slot.dataset.mediaPath);
    if (!media) {
        return;
    }
    if (file.type.startsWith("video/")) {
        media.type = "video";
        media.src = dataUrl;
        media.poster = "";
    } else {
        media.type = "image";
        media.src = dataUrl;
    }
    persistDraft("Media replaced.");
    recordHistory();
    renderPreview();
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function wireEvents() {
    editorPanel.addEventListener("change", (event) => {
        const target = event.target;
        if (target.matches("[data-path]")) {
            updateFromInput(target);
        }
    });

    editorPanel.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) {
            return;
        }
        handlePanelAction(button.dataset.action, button);
    });

    previewStage.addEventListener("focusout", (event) => {
        const target = event.target;
        if (target.matches("[contenteditable][data-path]")) {
            recordHistory();
            persistDraft("Text updated.");
            renderEditor();
        }
    }, true);

    previewStage.addEventListener("input", (event) => {
        const target = event.target;
        if (!target.matches("[contenteditable][data-path]")) {
            return;
        }
        setByPath(siteData, target.dataset.path, target.textContent.trim());
    });

    previewStage.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-editor-link]");
        if (link) {
            event.preventDefault();
        }
    });

    previewStage.addEventListener("pointerdown", beginMediaDrag);
    previewStage.addEventListener("dragover", (event) => {
        if (event.target.closest(".media-slot")) {
            event.preventDefault();
        }
    });
    previewStage.addEventListener("drop", handleMediaDrop);

    document.addEventListener("pointermove", continueMediaDrag);
    document.addEventListener("pointerup", endMediaDrag);

    saveDraftButton.addEventListener("click", () => {
        persistDraft("Draft saved manually.");
        recordHistory();
    });

    undoButton.addEventListener("click", () => {
        if (historyIndex === 0) {
            return;
        }
        historyIndex -= 1;
        siteData = clone(historyStack[historyIndex]);
        persistDraft("Undo applied.");
        renderAll();
    });

    redoButton.addEventListener("click", () => {
        if (historyIndex >= historyStack.length - 1) {
            return;
        }
        historyIndex += 1;
        siteData = clone(historyStack[historyIndex]);
        persistDraft("Redo applied.");
        renderAll();
    });

    exportButton.addEventListener("click", handleExportSite);

    resetButton.addEventListener("click", () => {
        siteData = clone(defaultSiteData);
        historyStack = [clone(siteData)];
        historyIndex = 0;
        persistDraft("Template reset.");
        renderAll();
    });

    importButton.addEventListener("click", () => {
        importInput.click();
    });

    importInput.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        try {
            const text = await file.text();
            siteData = JSON.parse(text);
            historyStack = [clone(siteData)];
            historyIndex = 0;
            persistDraft("Imported JSON draft.");
            renderAll();
        } catch (error) {
            saveStatus.textContent = `Import failed: ${error.message}`;
        } finally {
            importInput.value = "";
        }
    });

    publishButton.addEventListener("click", handlePublishToGitHub);

    [
        githubOwnerInput,
        githubRepoInput,
        githubBranchInput,
        githubPathInput,
        githubMessageInput,
    ].forEach((input) => {
        input.addEventListener("change", saveGitHubDraft);
    });
}

async function handleExportSite() {
    const templateCss = getTemplateCssText();
    downloadFile("index.html", buildExportHtml());
    downloadFile("site.css", templateCss);
    downloadFile("site-data.json", JSON.stringify(siteData, null, 2));
    saveStatus.textContent = "Exported index.html, site.css, and site-data.json.";
}

function buildExportHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(siteData.metadata.siteTitle)}</title>
<link rel="stylesheet" href="site.css">
</head>
<body>
${renderSite("export")}
</body>
</html>`;
}

function getTemplateCssText() {
    const sheet = Array.from(document.styleSheets).find((styleSheet) =>
        styleSheet.href?.endsWith("site-template.css")
    );
    if (!sheet) {
        throw new Error("site-template.css is not loaded.");
    }
    return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
}

function downloadFile(fileName, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function normalizeRepoPath(prefix, fileName) {
    const trimmed = prefix.replace(/^\/+|\/+$/g, "");
    return trimmed ? `${trimmed}/${fileName}` : fileName;
}

function toBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function encodeGitHubPath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
}

async function getExistingSha(token, owner, repo, branch, path) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(branch)}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
        },
    });
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`Unable to read ${path}: ${response.status}`);
    }
    const payload = await response.json();
    return payload.sha || null;
}

async function putGitHubFile({ token, owner, repo, branch, path, content, message }) {
    const sha = await getExistingSha(token, owner, repo, branch, path);
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message,
            branch,
            content: toBase64(content),
            ...(sha ? { sha } : {}),
        }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed for ${path}: ${response.status} ${text}`);
    }
}

async function handlePublishToGitHub() {
    const token = githubTokenInput.value.trim();
    const owner = githubOwnerInput.value.trim();
    const repo = githubRepoInput.value.trim();
    const branch = githubBranchInput.value.trim() || "main";
    const basePath = githubPathInput.value.trim();
    const message = githubMessageInput.value.trim() || "Update personal website";

    if (!token || !owner || !repo) {
        publishStatus.textContent = "Owner, repo, and token are required.";
        return;
    }

    publishStatus.textContent = "Uploading files to GitHub...";
    saveGitHubDraft();

    try {
        const templateCss = getTemplateCssText();
        const files = [
            { path: normalizeRepoPath(basePath, "index.html"), content: buildExportHtml() },
            { path: normalizeRepoPath(basePath, "site.css"), content: templateCss },
            { path: normalizeRepoPath(basePath, "site-data.json"), content: JSON.stringify(siteData, null, 2) },
        ];
        for (const file of files) {
            await putGitHubFile({
                token,
                owner,
                repo,
                branch,
                path: file.path,
                content: file.content,
                message,
            });
        }
        publishStatus.textContent = `Uploaded ${files.length} files to ${owner}/${repo}@${branch}.`;
    } catch (error) {
        publishStatus.textContent = error.message;
    }
}
