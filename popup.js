// ==========================================
// FanFiction Companion - Popup JavaScript
// ==========================================

// Get an element using its ID.
function getElement(id) {
  return document.getElementById(id);
}

// Show a message inside the popup.
function showMessage(message) {
  getElement("popup-message").textContent = message;
}

// Get the currently active browser tab.
async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs[0];
}

// Send a request to the content script.
async function sendToContentScript(action, data = {}) {
  const tab = await getActiveTab();

  if (
    !tab?.id ||
    !(
      tab.url?.startsWith("https://www.fanfiction.net/") ||
      tab.url?.startsWith("https://fanfiction.net/")
    )
  ) {
    showMessage("Please open a FanFiction.Net page first.");
    return null;
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, {
      action,
      ...data,
    });
  } catch (error) {
    console.error("Content script communication failed:", error);
    showMessage("Please refresh the FanFiction.Net page and try again.");
    return null;
  }
}

// Load the current story information.
async function loadCurrentStory() {
  const response = await sendToContentScript("GET_CURRENT_STORY");

  if (!response?.story) {
    getElement("current-story-title").textContent = "No story detected";
    getElement("current-story-author").textContent =
      "Open a FanFiction.Net story";
    return;
  }

  getElement("current-story-title").textContent = response.story.title;

  getElement("current-story-author").textContent =
    `By ${response.story.author}`;
}

// Save the current story.
async function saveCurrentStory() {
  const response = await sendToContentScript("SAVE_CURRENT_STORY");

  if (response?.message) {
    showMessage(response.message);
  }
}

// Display saved stories.
async function showLibrary() {
  const result = await chrome.storage.local.get("savedStories");
  const stories = result.savedStories || [];
  const view = getElement("feature-view");

  view.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "📚 My Library";
  view.appendChild(heading);

  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Search stories...";
  search.style.width = "100%";
  search.style.margin = "10px 0";
  view.appendChild(search);

  const list = document.createElement("div");
  view.appendChild(list);

  function renderStories() {
    list.replaceChildren();

    const term = search.value.toLowerCase().trim();

    const filtered = stories.filter(
      (story) =>
        (story.title || "").toLowerCase().includes(term) ||
        (story.author || "").toLowerCase().includes(term),
    );

    if (!filtered.length) {
      const message = document.createElement("p");
      message.textContent = stories.length
        ? "No matching stories found."
        : "Your library is empty.";
      list.appendChild(message);
      return;
    }

    filtered.forEach((story) => {
      const card = document.createElement("div");
      card.className = "popup-story-card";

      const title = document.createElement("strong");
      title.textContent = story.title;
      card.appendChild(title);

      const author = document.createElement("p");
      author.textContent = `By ${story.author}`;
      card.appendChild(author);

      const open = document.createElement("button");
      open.textContent = "Open Story";

      open.addEventListener("click", () => {
        chrome.tabs.create({ url: story.url });
      });

      card.appendChild(open);

      const remove = document.createElement("button");
      remove.textContent = "Remove";

      remove.addEventListener("click", async () => {
        const latest = await chrome.storage.local.get("savedStories");
        const remaining = (latest.savedStories || []).filter(
          (item) => item.url !== story.url,
        );

        await chrome.storage.local.set({
          savedStories: remaining,
        });

        showMessage("Story removed.");
        await showLibrary();
      });

      card.appendChild(remove);
      list.appendChild(card);
    });
  }

  search.addEventListener("input", renderStories);
  renderStories();
}

// Display notes for the current story.
async function showNotes() {
  const response = await sendToContentScript("GET_CURRENT_STORY");

  if (!response?.story) {
    showMessage("Open a story first to access its notes.");
    return;
  }

  const story = response.story;
  const result = await chrome.storage.local.get("storyNotes");
  const notes = result.storyNotes || {};
  const view = getElement("feature-view");

  view.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "📝 My Notes";
  view.appendChild(heading);

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Write your thoughts about this story...";
  textarea.value = notes[story.id] || "";
  textarea.style.width = "100%";
  textarea.style.minHeight = "100px";
  view.appendChild(textarea);

  const save = document.createElement("button");
  save.textContent = "Save Notes";

  save.addEventListener("click", async () => {
    const latest = await chrome.storage.local.get("storyNotes");
    const updated = latest.storyNotes || {};

    updated[story.id] = textarea.value;

    await chrome.storage.local.set({
      storyNotes: updated,
    });

    showMessage("Your notes have been saved!");
  });

  view.appendChild(save);
}

// Display favourite quotes.
async function showQuotes() {
  const result = await chrome.storage.local.get("favouriteQuotes");
  const quotes = result.favouriteQuotes || [];
  const view = getElement("feature-view");

  view.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "💬 Favourite Quotes";
  view.appendChild(heading);

  if (!quotes.length) {
    const message = document.createElement("p");
    message.textContent = "No favourite quotes saved yet.";
    view.appendChild(message);
    return;
  }

  quotes.forEach((quote) => {
    const card = document.createElement("div");
    card.className = "popup-quote-card";

    const text = document.createElement("p");
    text.textContent = `“${quote.text}”`;
    card.appendChild(text);

    const copy = document.createElement("button");
    copy.textContent = "Copy Quote";

    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(quote.text);
        showMessage("Quote copied!");
      } catch (error) {
        showMessage("Couldn't copy this quote.");
      }
    });

    card.appendChild(copy);

    const open = document.createElement("button");
    open.textContent = "Open Story";
    open.addEventListener("click", () => {
      chrome.tabs.create({ url: quote.url });
    });

    card.appendChild(open);
    view.appendChild(card);
  });

  const exportButton = document.createElement("button");
  exportButton.textContent = "📥 Export Quotes";

  exportButton.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-favourite-quotes.json";
    link.click();

    URL.revokeObjectURL(url);
  });

  view.appendChild(exportButton);
}

// Toggle dark and light appearance.
async function toggleTheme() {
  const result = await chrome.storage.local.get("popupLightMode");
  const lightMode = !result.popupLightMode;

  await chrome.storage.local.set({
    popupLightMode: lightMode,
  });

  document.body.classList.toggle("light-mode", lightMode);

  getElement("theme-toggle").textContent = lightMode
    ? "Light Mode"
    : "Dark Mode";
}

// Load saved appearance.
async function loadTheme() {
  const result = await chrome.storage.local.get("popupLightMode");
  const lightMode = result.popupLightMode || false;

  document.body.classList.toggle("light-mode", lightMode);

  getElement("theme-toggle").textContent = lightMode
    ? "Light Mode"
    : "Dark Mode";
}

// Connect all popup buttons.
getElement("save-story").addEventListener("click", saveCurrentStory);
getElement("open-library").addEventListener("click", showLibrary);
getElement("open-notes").addEventListener("click", showNotes);
getElement("open-quotes").addEventListener("click", showQuotes);
getElement("theme-toggle").addEventListener("click", toggleTheme);

// Initialise popup.
loadCurrentStory();
loadTheme();
