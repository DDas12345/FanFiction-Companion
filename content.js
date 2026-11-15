(() => {
  // ==========================================
  // FanFiction Companion - Content Script
  // ==========================================

  // Identify the currently open FanFiction.Net story.
  function getCurrentStory() {
    const match = window.location.pathname.match(/\/s\/(\d+)(?:\/|$)/);

    if (!match) return null;

    const titleElement = document.querySelector("#profile_top b.xcontrast_txt");

    const authorElement = document.querySelector(
      "#profile_top a.xcontrast_txt",
    );

    return {
      id: match[1],
      title: titleElement?.textContent.trim() || document.title,
      author: authorElement?.textContent.trim() || "Unknown author",
      url: window.location.href.split("#")[0],
    };
  }

  // ==========================================
  // Communication with the Chrome popup
  // ==========================================

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Get the currently open story.
    if (request.action === "GET_CURRENT_STORY") {
      sendResponse({
        story: getCurrentStory(),
      });

      return false;
    }

    // Save the currently open story.
    if (request.action === "SAVE_CURRENT_STORY") {
      (async () => {
        const story = getCurrentStory();

        if (!story) {
          return {
            message: "Please open a story first.",
          };
        }

        const result = await chrome.storage.local.get("savedStories");
        const savedStories = result.savedStories || [];

        const alreadySaved = savedStories.some(
          (item) => item.url === story.url,
        );

        if (alreadySaved) {
          return {
            message: "This story is already in your library!",
          };
        }

        savedStories.push({
          title: story.title,
          author: story.author,
          url: story.url,
          storyId: story.id,
          status: "Reading",
          dateSaved: new Date().toISOString(),
        });

        await chrome.storage.local.set({ savedStories });

        return {
          message: `"${story.title}" saved successfully!`,
        };
      })()
        .then(sendResponse)
        .catch((error) => {
          console.error("Saving story failed:", error);

          sendResponse({
            message: "Couldn't save the story. Please try again.",
          });
        });

      return true;
    }

    // Toggle dark mode on the actual webpage.
    if (request.action === "TOGGLE_WEBPAGE_THEME") {
      document.body.classList.toggle("ffc-dark-mode");

      const enabled = document.body.classList.contains("ffc-dark-mode");

      sendResponse({
        enabled,
        message: enabled
          ? "Webpage dark mode enabled."
          : "Webpage dark mode disabled.",
      });

      return false;
    }

    return false;
  });
})();
