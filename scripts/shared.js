// =====================================
// URL NORMALIZATION (Netlify & GitHub Compatibility)
// =====================================

function normalizePath(path) {
    return path
        .toLowerCase()
        .replace(".html", "")
        .replace(/\/$/, ""); // Removes trailing slash if present
}

// =====================================
// HEADER & FOOTER (With Event Hook for Async Loading)
// =====================================

fetch("/assets/header.html")
    .then(res => res.text())
    .then(data => {
        const header = document.getElementById("header");
        if (header) {
            header.innerHTML = data;
            // CRITICAL FIX: Jab header completely insert ho jaye, tabhi mobile nav attach karo
            initMobileNavigation();
        }
    })
    .catch(err => console.error("Error loading header:", err));

fetch("/assets/footer.html")
    .then(res => res.text())
    .then(data => {
        const footer = document.getElementById("footer");
        if (footer) footer.innerHTML = data;
    })
    .catch(err => console.error("Error loading footer:", err));

// =====================================
// SIDEBAR
// =====================================

const sidebar = document.getElementById("sidebar");

function renderSidebar() {
    if (!sidebar || !window.advancedTallyCourse) return;

    let html = "";

    advancedTallyCourse.forEach(module => {
        html += `
            <details>
                <summary>${module.module}</summary>
                <ul>
        `;

        module.topics.forEach(topic => {
            const title = topic.replaceAll("-", " ");

            html += `
                <li>
                    <a href="/advance-tally/${module.folder}/${topic}">
                        ${title}
                    </a>
                </li>
            `;
        });

        html += `
                </ul>
            </details>
        `;
    });

    sidebar.innerHTML = html;
    highlightCurrentPage();
}

// =====================================
// ACTIVE PAGE
// =====================================

function highlightCurrentPage() {
    const currentPath = normalizePath(location.pathname);

    document
        .querySelectorAll("#sidebar a")
        .forEach(link => {
            try {
                const url = new URL(link.href, window.location.origin);
                
                if (normalizePath(url.pathname) === currentPath) {
                    link.classList.add("active");

                    const details = link.closest("details");
                    if (details) {
                        details.open = true;
                    }
                }
            } catch (e) {
                console.error("Error parsing link URL:", e);
            }
        });
}

// =====================================
// TOPIC TITLE
// =====================================

function setTopicTitle() {
    const h1 = document.getElementById("topicTitle");
    if (!h1) return;

    const title = location.pathname
        .split("/")
        .pop()
        .replace(".html", "")
        .replaceAll("-", " ");

    h1.textContent = title;
}

// =====================================
// FIND CURRENT TOPIC
// =====================================

function getCurrentTopicData() {
    const currentPath = normalizePath(location.pathname);

    for (const module of advancedTallyCourse) {
        for (let i = 0; i < module.topics.length; i++) {
            const topic = module.topics[i];
            const url = `/advance-tally/${module.folder}/${topic}`;

            if (normalizePath(url) === currentPath) {
                return {
                    module,
                    topic,
                    index: i
                };
            }
        }
    }
    return null;
}

// =====================================
// BREADCRUMBS
// =====================================

function renderBreadcrumbs() {
    const container = document.getElementById("breadcrumbs");
    if (!container) return;

    const current = getCurrentTopicData();
    if (!current) return;

    container.innerHTML = `
        <a href="/index.html">Home</a>
        <span>›</span>
        <a href="/advanced-tally.html">Advanced Tally</a>
        <span>›</span>
        <span>${current.module.module}</span>
        <span>›</span>
        <strong>${current.topic.replaceAll("-", " ")}</strong>
    `;
}

// =====================================
// MODULE PROGRESS LIST
// =====================================

function renderModuleProgress() {
    const container = document.getElementById("moduleProgress");
    if (!container) return;

    const current = getCurrentTopicData();
    if (!current) return;

    let html = `
        <div class="module-progress-card">
            <h3>${current.module.module}</h3>
            <p>Topic ${current.index + 1} of ${current.module.topics.length}</p>
            <ol>
    `;

    current.module.topics.forEach((topic, index) => {
        const active = index === current.index ? "current-topic" : "";

        html += `
            <li class="${active}">
                <a href="/advance-tally/${current.module.folder}/${topic}">
                    ${topic.replaceAll("-", " ")}
                </a>
            </li>
        `;
    });

    html += `
            </ol>
        </div>
    `;

    container.innerHTML = html;
}

// =====================================
// IMAGE STYLE TOPIC NAVIGATOR
// =====================================

function renderTopicProgress() {
    const container = document.getElementById("topicProgress");
    if (!container) return;

    const current = getCurrentTopicData();
    if (!current) return;

    const topics = current.module.topics;
    let html = "";

    html += `
        <a class="step-control" href="/advance-tally/${current.module.folder}/${topics[0]}">«</a>
    `;

    if (current.index > 0) {
        html += `
            <a class="step-control" href="/advance-tally/${current.module.folder}/${topics[current.index - 1]}">‹</a>
        `;
    }

    topics.forEach((topic, index) => {
        const active = index === current.index ? "active" : "";

        html += `
            <a class="topic-step ${active}" 
               title="${topic.replaceAll("-", " ")}" 
               href="/advance-tally/${current.module.folder}/${topic}">
                ${index + 1}
            </a>
        `;
    });

    if (current.index < topics.length - 1) {
        html += `
            <a class="step-control" href="/advance-tally/${current.module.folder}/${topics[current.index + 1]}">›</a>
        `;
    }

    html += `
        <a class="step-control" href="/advance-tally/${current.module.folder}/${topics[topics.length - 1]}">»</a>
    `;

    container.innerHTML = html;
}

// =====================================
// PREV NEXT
// =====================================

function renderPrevNext() {
    const container = document.getElementById("prev-next");
    if (!container) return;

    const current = getCurrentTopicData();
    if (!current) return;

    let html = "";

    if (current.index > 0) {
        const prev = current.module.topics[current.index - 1];
        html += `
            <a class="prev-topic" href="/advance-tally/${current.module.folder}/${prev}">
                ← ${prev.replaceAll("-", " ")}
            </a>
        `;
    }

    if (current.index < current.module.topics.length - 1) {
        const next = current.module.topics[current.index + 1];
        html += `
            <a class="next-topic" href="/advance-tally/${current.module.folder}/${next}">
                ${next.replaceAll("-", " ")} →
            </a>
        `;
    }

    container.innerHTML = html;
}

// =====================================
// MOBILE SIDEBAR
// =====================================

function initMobileNavigation() {
    const nav = document.getElementById("sidebar");
    const navToggle = document.getElementById("navToggle");
    const overlay = document.getElementById("navOverlay");

    if (!nav || !navToggle) return;

    // Toggle logic for opening sidebar & background overlay
    navToggle.onclick = e => {
        e.stopPropagation();
        nav.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    };

    // Close navigation when clicking the dark overlay wrapper
    if (overlay) {
        overlay.onclick = () => {
            nav.classList.remove("active");
            overlay.classList.remove("active");
        };
    }

    // Close when clicking anywhere outside elements
    document.addEventListener("click", e => {
        const inside = nav.contains(e.target);
        const toggle = navToggle.contains(e.target);

        if (!inside && !toggle) {
            nav.classList.remove("active");
            if (overlay) overlay.classList.remove("active");
        }
    });
}

// =====================================
// INIT
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
    setTopicTitle();
    renderBreadcrumbs();
    renderModuleProgress();
    renderTopicProgress();
    renderPrevNext();
    // initMobileNavigation ko yahan se hata kar fetch loop ke callback me set kiya hai.
});
