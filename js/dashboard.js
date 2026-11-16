(() => {
  const BACKEND_BASE = "https://gametale-vault.hackclub.app";
  const STORAGE_PREFIX = "gametale_draft_";

  const userGreeting = document.getElementById("userGreeting");
  const statusBadges = document.getElementById("statusBadges");
  const authActionLink = document.getElementById("authActionLink");
  const projectForm = document.getElementById("projectForm");
  const projectTitle = document.getElementById("projectTitle");
  const projectSynopsis = document.getElementById("projectSynopsis");
  const projectDemoUrl = document.getElementById("projectDemoUrl");
  const projectRepoUrl = document.getElementById("projectRepoUrl");
  const projectPill = document.getElementById("projectPill");
  const taleStatusValue = document.getElementById("taleStatusValue");
  const submitProjectBtn = document.getElementById("submitProjectBtn");
  const formFeedback = document.getElementById("formFeedback");

  function setFeedback(message, type) {
    if (!formFeedback) return;
    formFeedback.textContent = message;
    formFeedback.className = `form-feedback ${type}`;
    if (message) {
      setTimeout(() => {
        if (formFeedback.textContent === message) {
          formFeedback.textContent = "";
          formFeedback.className = "form-feedback";
        }
      }, 4000);
    }
  }

  function renderGuestState() {
    if (userGreeting) {
      userGreeting.textContent = "Welcome, Adventurer!";
    }
    if (statusBadges) {
      statusBadges.innerHTML = "";
      const loginBadge = document.createElement("a");
      loginBadge.href = `${BACKEND_BASE}/auth/login`;
      loginBadge.className = "badge badge-cta";
      loginBadge.textContent = "Log In with Hack Club";
      statusBadges.appendChild(loginBadge);
    }
    if (authActionLink) {
      authActionLink.textContent = "Log In";
      authActionLink.href = `${BACKEND_BASE}/auth/login`;
    }
  }

  function renderAuthenticatedState(user) {
    const displayName = user.name || user.nickname || "Adventurer";
    if (userGreeting) {
      userGreeting.textContent = `Welcome, ${displayName}!`;
    }
    if (statusBadges) {
      statusBadges.innerHTML = "";

      if (user.ysws_eligible === 1) {
        const eligibleBadge = document.createElement("span");
        eligibleBadge.className = "badge badge-eligible";
        eligibleBadge.textContent = "✓ YSWS Eligible";
        statusBadges.appendChild(eligibleBadge);
      }

      if (user.slack_id) {
        const slackBadge = document.createElement("span");
        slackBadge.className = "badge badge-slack";
        slackBadge.textContent = "✓ Slack Connected";
        statusBadges.appendChild(slackBadge);
      } else {
        const joinSlackBadge = document.createElement("a");
        joinSlackBadge.href = "https://hackclub.slack.com/archives/C0C4B8ZLPAB";
        joinSlackBadge.target = "_blank";
        joinSlackBadge.rel = "noopener noreferrer";
        joinSlackBadge.className = "badge badge-neutral";
        joinSlackBadge.textContent = "Join #gametale";
        statusBadges.appendChild(joinSlackBadge);
      }
    }
    if (authActionLink) {
      authActionLink.textContent = "Log Out";
      authActionLink.href = `${BACKEND_BASE}/auth/logout`;
    }
  }

  async function checkSession() {
    try {
      const response = await fetch(`${BACKEND_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        renderGuestState();
        return;
      }

      const data = await response.json();
      if (data && data.authenticated && data.user) {
        renderAuthenticatedState(data.user);
      } else {
        renderGuestState();
      }
    } catch {
      renderGuestState();
    }
  }

  function loadDraft() {
    if (!projectForm) return;
    try {
      const savedTitle = localStorage.getItem(`${STORAGE_PREFIX}title`) || "";
      const savedSynopsis = localStorage.getItem(`${STORAGE_PREFIX}synopsis`) || "";
      const savedDemo = localStorage.getItem(`${STORAGE_PREFIX}demo`) || "";
      const savedRepo = localStorage.getItem(`${STORAGE_PREFIX}repo`) || "";
      const savedStatus = localStorage.getItem(`${STORAGE_PREFIX}status`) || "Draft";

      projectTitle.value = savedTitle;
      projectSynopsis.value = savedSynopsis;
      projectDemoUrl.value = savedDemo;
      projectRepoUrl.value = savedRepo;

      if (projectPill) {
        projectPill.textContent = savedStatus;
      }
      if (taleStatusValue) {
        taleStatusValue.textContent = savedStatus === "Submitted" ? "In Review" : "Drafting";
      }
    } catch {}
  }

  function saveDraft() {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}title`, projectTitle.value.trim());
      localStorage.setItem(`${STORAGE_PREFIX}synopsis`, projectSynopsis.value.trim());
      localStorage.setItem(`${STORAGE_PREFIX}demo`, projectDemoUrl.value.trim());
      localStorage.setItem(`${STORAGE_PREFIX}repo`, projectRepoUrl.value.trim());
      setFeedback("Draft saved locally!", "success");
    } catch {
      setFeedback("Could not save draft locally.", "error");
    }
  }

  function handleSubmit() {
    const title = projectTitle.value.trim();
    const synopsis = projectSynopsis.value.trim();
    const demo = projectDemoUrl.value.trim();
    const repo = projectRepoUrl.value.trim();

    if (!title || !synopsis) {
      setFeedback("Please fill out both the title and story synopsis.", "error");
      return;
    }

    try {
      saveDraft();
      localStorage.setItem(`${STORAGE_PREFIX}status`, "Submitted");
      if (projectPill) {
        projectPill.textContent = "Submitted";
      }
      if (taleStatusValue) {
        taleStatusValue.textContent = "In Review";
      }
      setFeedback("Tale submitted for review! Check #gametale on Slack for updates.", "success");
    } catch {
      setFeedback("Failed to submit project.", "error");
    }
  }

  if (projectForm) {
    projectForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveDraft();
    });
  }

  if (submitProjectBtn) {
    submitProjectBtn.addEventListener("click", () => {
      handleSubmit();
    });
  }

  loadDraft();
  checkSession();
})();
