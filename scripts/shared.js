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
                    }
                }
            } catch (e) {
                console.error("Error parsing link URL:", e);
            }
        });
}

// =====================================
// TOPIC TITLE INJECTION
// =====================================

function setTopicTitle() {
    const h1 = document.getElementById("topicTitle");
    if (!h1) return;

    // Plucks the final URL segment, cleans extensions, and restores readable text spaces
    const title = location.pathname
        .split("/")
        .pop()
        .replace(".html", "")
        .replaceAll("-", " ");

    h1.textContent = title;
}

// =====================================
// MOBILE NAVIGATION TOGGLE
// =====================================

function initMobileNavigation() {
    const nav = document.getElementById("sidebar");
    const navToggle = document.getElementById("navToggle");
    const overlay = document.getElementById("navOverlay");

    if (!nav || !navToggle) return;

    // Toggle drawer menu layout and dark background overlay
    navToggle.onclick = e => {
        e.stopPropagation();
        nav.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    };

    // Close menu instantly if background dim overlay is tapped
    if (overlay) {
        overlay.onclick = () => {
            nav.classList.remove("active");
            overlay.classList.remove("active");
        };
    }

    // Safety click-away document interceptor 
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
// APPLICATION INITIALIZATION
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    highlightCurrentPage();
    setTopicTitle();
    initMobileNavigation();
});
            position: relative;
        }

        .progress-bar-fill {
            height: 100%;
            width: 0%;
            background: repeating-linear-gradient(
                45deg,
                #00b4d8,
                #00b4d8 10px,
                #0077b6 10px,
                #0077b6 20px
            );
            box-shadow: 0 0 10px #00b4d8;
            transition: width 0.3s ease;
        }

        .loader-percentage {
            color: #00b4d8;
            font-size: 1.2rem;
            margin-top: 10px;
            letter-spacing: 1px;
        }

        .ui-loader-container.hidden {
            opacity: 0;
            visibility: hidden;
            display: none;
        }
    `;
    document.head.appendChild(style);
})();

// =====================================
// LOADER DOM INJECTION & ENGINE
// =====================================
let loaderContainer = null;

function createLoaderElement() {
    const headerWrapper = document.getElementById("header");
    if (!headerWrapper) return;

    loaderContainer = document.createElement("div");
    loaderContainer.id = "ui-loader";
    loaderContainer.className = "ui-loader-container";
    
    loaderContainer.innerHTML = `
        <div class="loader-text">loading</div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill"></div>
        </div>
        <div class="loader-percentage">0%</div>
    `;
    
    headerWrapper.parentNode.insertBefore(loaderContainer, headerWrapper.nextSibling);
}

function updateLoaderProgress(percentage) {
    if (!loaderContainer) return;
    
    const fill = loaderContainer.querySelector(".progress-bar-fill");
    const textPercent = loaderContainer.querySelector(".loader-percentage");
    
    if (fill) fill.style.width = `${percentage}%`;
    if (textPercent) textPercent.textContent = `${percentage}%`;
    
    if (percentage >= 100) {
        setTimeout(() => {
            if (loaderContainer) loaderContainer.classList.add("hidden");
        }, 400);
    }
}

// =====================================
// HEADER & FOOTER
// =====================================

let headerLoaded = false;
let footerLoaded = false;

function checkFetchStatuses() {
    if (headerLoaded && footerLoaded) {
        updateLoaderProgress(100);
    }
}

fetch("/assets/header.html")
    .then(res => res.text())
    .then(data => {
        const header = document.getElementById("header");
        if (header) {
            header.innerHTML = data;
            
            // Inject and initiate loader UI states
            createLoaderElement();
            updateLoaderProgress(45);
            
            // Initialize mobile nav event handlers safely
            initMobileNavigation();
        }
        headerLoaded = true;
        if (loaderContainer) updateLoaderProgress(75);
        checkFetchStatuses();
    })
    .catch(err => {
        console.error("Error loading header:", err);
        headerLoaded = true;
        checkFetchStatuses();
    });

fetch("/assets/footer.html")
    .then(res => res.text())
    .then(data => {
        const footer = document.getElementById("footer");
        if (footer) footer.innerHTML = data;
        footerLoaded = true;
        checkFetchStatuses();
    })
    .catch(err => {
        console.error("Error loading footer:", err);
        footerLoaded = true;
        checkFetchStatuses();
    });

// Helper function to safely compare URLs across environments (Netlify Clean Paths)
function normalizePath(path) {
    return path
        .toLowerCase()
        .replace(".html", "")
        .replace(/\/$/, ""); // Removes trailing slash if present
}

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
                // Safe URL generation utilizing baseline origin location fallbacks
                const url = new URL(link.getAttribute('href'), window.location.origin);
                
                if (normalizePath(url.pathname) === currentPath) {
                    link.classList.add("active");

                    const details = link.closest("details");
                    if (details) {
                        details.open = true;
                    }
                }
            } catch (e) {
                console.error("Error parsing link URL target asset:", e);
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

    if (!window.advancedTallyCourse) return null;

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

    navToggle.onclick = e => {
        e.stopPropagation();
        nav.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    };

    if (overlay) {
        overlay.onclick = () => {
            nav.classList.remove("active");
            overlay.classList.remove("active");
        };
    }

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
});
            position: relative;
        }

        .progress-bar-fill {
            height: 100%;
            width: 0%;
            background: repeating-linear-gradient(
                45deg,
                #00b4d8,
                #00b4d8 10px,
                #0077b6 10px,
                #0077b6 20px
            );
            box-shadow: 0 0 10px #00b4d8;
            transition: width 0.3s ease;
        }

        .loader-percentage {
            color: #00b4d8;
            font-size: 1.2rem;
            margin-top: 10px;
            letter-spacing: 1px;
        }

        .ui-loader-container.hidden {
            opacity: 0;
            visibility: hidden;
            display: none;
        }
    `;
    document.head.appendChild(style);
})();

// =====================================
// LOADER DOM INJECTION & ENGINE
// =====================================
let loaderContainer = null;

function createLoaderElement() {
    const headerWrapper = document.getElementById("header");
    if (!headerWrapper) return;

    loaderContainer = document.createElement("div");
    loaderContainer.id = "ui-loader";
    loaderContainer.className = "ui-loader-container";
    
    loaderContainer.innerHTML = `
        <div class="loader-text">loading</div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill"></div>
        </div>
        <div class="loader-percentage">0%</div>
    `;
    
    headerWrapper.parentNode.insertBefore(loaderContainer, headerWrapper.nextSibling);
}

function updateLoaderProgress(percentage) {
    if (!loaderContainer) return;
    
    const fill = loaderContainer.querySelector(".progress-bar-fill");
    const textPercent = loaderContainer.querySelector(".loader-percentage");
    
    if (fill) fill.style.width = `${percentage}%`;
    if (textPercent) textPercent.textContent = `${percentage}%`;
    
    if (percentage >= 100) {
        setTimeout(() => {
            if (loaderContainer) loaderContainer.classList.add("hidden");
        }, 400);
    }
}

// =====================================
// HEADER & FOOTER
// =====================================

let headerLoaded = false;
let footerLoaded = false;

function checkFetchStatuses() {
    if (headerLoaded && footerLoaded) {
        updateLoaderProgress(100);
    }
}

fetch("/assets/header.html")
    .then(res => res.text())
    .then(data => {
        const header = document.getElementById("header");
        if (header) {
            header.innerHTML = data;
            
            // Header load hote hi screen par layout component inject karein
            createLoaderElement();
            updateLoaderProgress(45);
            
            // CRITICAL IMPROVEMENT: Toggle listeners tabhi active honge jab element DOM me aa jayega
            initMobileNavigation();
        }
        headerLoaded = true;
        if (loaderContainer) updateLoaderProgress(75);
        checkFetchStatuses();
    })
    .catch(err => {
        console.error("Error loading header:", err);
        headerLoaded = true;
        checkFetchStatuses();
    });

fetch("/assets/footer.html")
    .then(res => res.text())
    .then(data => {
        const footer = document.getElementById("footer");
        if (footer) footer.innerHTML = data;
        footerLoaded = true;
        checkFetchStatuses();
    })
    .catch(err => {
        console.error("Error loading footer:", err);
        footerLoaded = true;
        checkFetchStatuses();
    });

// Helper function to safely compare URLs across environments (Netlify Clean Paths)
function normalizePath(path) {
    return path
        .toLowerCase()
        .replace(".html", "")
        .replace(/\/$/, ""); // Removes trailing slash if present
}

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

            // Clean URL mapping for standard ecosystem deployment
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

    navToggle.onclick = e => {
        e.stopPropagation();
        nav.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    };

    if (overlay) {
        overlay.onclick = () => {
            nav.classList.remove("active");
            overlay.classList.remove("active");
        };
    }

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
});
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
            position: relative;
        }

        .progress-bar-fill {
            height: 100%;
            width: 0%; /* Dynamic logic controls this */
            background: repeating-linear-gradient(
                45deg,
                #00b4d8,
                #00b4d8 10px,
                #0077b6 10px,
                #0077b6 20px
            );
            box-shadow: 0 0 10px #00b4d8;
            transition: width 0.3s ease;
        }

        .loader-percentage {
            color: #00b4d8;
            font-size: 1.2rem;
            margin-top: 10px;
            letter-spacing: 1px;
        }

        /* Loader utility helper class to hide it smoothly */
        .ui-loader-container.hidden {
            opacity: 0;
            visibility: hidden;
            display: none;
        }
    `;
    document.head.appendChild(style);
})();

// =====================================
// LOADER DOM INJECTION & ENGINE
// =====================================
let loaderContainer = null;

function createLoaderElement() {
    const headerWrapper = document.getElementById("header");
    if (!headerWrapper) return;

    loaderContainer = document.createElement("div");
    loaderContainer.id = "ui-loader";
    loaderContainer.className = "ui-loader-container";
    
    loaderContainer.innerHTML = `
        <div class="loader-text">loading</div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill"></div>
        </div>
        <div class="loader-percentage">0%</div>
    `;
    
    // Inserts loader directly right under the #header div container element
    headerWrapper.parentNode.insertBefore(loaderContainer, headerWrapper.nextSibling);
}

function updateLoaderProgress(percentage) {
    if (!loaderContainer) return;
    
    const fill = loaderContainer.querySelector(".progress-bar-fill");
    const textPercent = loaderContainer.querySelector(".loader-percentage");
    
    if (fill) fill.style.width = `${percentage}%`;
    if (textPercent) textPercent.textContent = `${percentage}%`;
    
    // Hide smoothly once processing reaches full completion status
    if (percentage >= 100) {
        setTimeout(() => {
            if (loaderContainer) loaderContainer.classList.add("hidden");
        }, 400);
    }
}

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
// HEADER & FOOTER FETCHING WITH LOADER HOOK
// =====================================

let headerLoaded = false;
let footerLoaded = false;

function checkFetchStatuses() {
    if (headerLoaded && footerLoaded) {
        updateLoaderProgress(100);
    }
}

// Fire fetches immediately for ultra-fast performance routing
fetch("/assets/header.html")
    .then(res => {
        // Initial setup marker right as header starts streaming down
        return res.text();
    })
    .then(data => {
        const header = document.getElementById("header");
        if (header) {
            header.innerHTML = data;
            
            // Build elements on DOM screen array map instantly
            createLoaderElement();
            updateLoaderProgress(45);
            
            // CRITICAL FIX: Attach mobile event click listeners now that elements exist
            initMobileNavigation();
        }
        headerLoaded = true;
        if (loaderContainer) updateLoaderProgress(75);
        checkFetchStatuses();
    })
    .catch(err => {
        console.error("Error loading header:", err);
        headerLoaded = true; 
        checkFetchStatuses();
    });

fetch("/assets/footer.html")
    .then(res => res.text())
    .then(data => {
        const footer = document.getElementById("footer");
        if (footer) footer.innerHTML = data;
        footerLoaded = true;
        checkFetchStatuses();
    })
    .catch(err => {
        console.error("Error loading footer:", err);
        footerLoaded = true;
        checkFetchStatuses();
    });

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

    navToggle.onclick = e => {
        e.stopPropagation();
        nav.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
    };

    if (overlay) {
        overlay.onclick = () => {
            nav.classList.remove("active");
            overlay.classList.remove("active");
        };
    }

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
});
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
