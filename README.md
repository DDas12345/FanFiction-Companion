# FanFiction Companion

A Chrome extension for **FanFiction.Net** that helps readers organise their reading experience. Save stories, manage a personal library, keep private reading notes, and collect favourite quotes — all from a simple browser extension.

## Features

- **Save Story** — Save a story from FanFiction.Net to your personal library.
- **My Library** — View saved stories, update reading status, open a story, or remove it from the library.
- **Reading Status** — Track stories with the available status selector.
- **My Notes** — Write and save notes for individual stories.
- **Favourite Quotes** — Save quotes, browse and search saved quotes, copy them, and open the related story.
- **Duplicate Prevention** — Avoid saving the same story or favourite quote more than once.
- **Dark Mode** — Toggle a darker reading companion interface.
- **Local Persistence** — Uses Chrome's `chrome.storage.local` API to keep library data, notes, and favourite quotes in the browser.

## Built With

- JavaScript
- HTML
- CSS
- Chrome Extension APIs (Manifest V3)
- `chrome.storage.local`

## Installation (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/DDas12345/FanFiction-Companion.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the project folder containing `manifest.json`.
6. Open a FanFiction.Net story page and use the extension from Chrome's extensions menu.

## Usage

1. Open a story on FanFiction.Net.
2. Use **Save Story** to add it to your library.
3. Open **My Library** to manage saved stories and their reading status.
4. Use **My Notes** to keep notes for a specific story.
5. Save lines you like in **Favourite Quotes** and search or copy them later.
6. Toggle **Dark Mode** to change the extension's appearance.


## 📸 Screenshots

### Extension Home
![FanFiction Companion Home](Screenshots/home.png)

### My Library
![My Library](Screenshots/library.png)

### My Notes
![My Notes](Screenshots/notes.png)

### Favourite Quotes
![Favourite Quotes](Screenshots/favourite-quotes.png)

## Data and Privacy

The extension stores its library, notes, and favourite quotes locally using Chrome storage. The project documentation does not claim cloud synchronisation or a remote backend. Data stored with `chrome.storage.local` belongs to the browser profile where the extension is installed.

## Project Status

This project is actively developed as a personal learning project. The features listed above reflect the functionality implemented so far.

## Future Improvements

Potential next steps include:
- Export and import saved library data.
- Add tags and filters for saved stories.
- Improve accessibility and keyboard navigation.
- Add automated tests for storage and UI behaviour.

## Author

**Debanshika Das**

- GitHub: [@DDas12345](https://github.com/DDas12345)
- LinkedIn: [Debanshika Das](https://www.linkedin.com/in/debanshika-das-b7b42a37b/)

---

Built to make keeping track of favourite FanFiction.Net stories a little easier.
