Here is a professionally structured `README.md` for your repository. It uses a clean layout, modern icons, and placeholders for your screenshots to make the project look high-quality.

---

# 📝 Note Watch Anime

[![GitHub license](https://img.shields.io/github/license/krisnachandra/note-watch-anime?style=flat-square)](https://github.com/krisnachandra/note-watch-anime/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/krisnachandra/note-watch-anime?style=flat-square)](https://github.com/krisnachandra/note-watch-anime/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/krisnachandra/note-watch-anime?style=flat-square)](https://github.com/krisnachandra/note-watch-anime/issues)

**Note Watch Anime** is a streamlined web application designed for anime enthusiasts to organize, track, and manage their watchlists. Never lose track of which episode you're on or which series you've planned to watch next.

---

## 🚀 Features

* **Watchlist Management:** Easily add, update, or remove anime titles from your collection.
* **Progress Tracking:** Keep a precise record of the current episode you are watching.
* **Status Categorization:** Organize titles into categories like *Plan to Watch*, *Watching*, and *Completed*.
* **Personal Notes:** Add custom notes or reviews for each series to remember your favorite moments.
* **Responsive Design:** Optimized for a seamless experience on both desktop and mobile devices.

---

## 📸 Preview
<img width="372" height="588" alt="Screenshot 2026-03-23 at 09 48 08" src="https://github.com/user-attachments/assets/cbaf75f7-4b76-470f-a0bc-ff307c3668d1" />
<img width="382" height="676" alt="Screenshot 2026-03-23 at 09 48 38" src="https://github.com/user-attachments/assets/57e8a1d2-181c-4310-8d9a-2a229066deb0" />
<img width="375" height="670" alt="Screenshot 2026-03-23 at 09 48 48" src="https://github.com/user-attachments/assets/db1a03a1-30d8-4edb-bc18-c4462efe2609" />
<img width="380" height="673" alt="Screenshot 2026-03-23 at 09 49 01" src="https://github.com/user-attachments/assets/b330e116-ef3c-4faa-9f83-cc5a911d20fc" />
<img width="381" height="604" alt="Screenshot 2026-03-23 at 09 49 21" src="https://github.com/user-attachments/assets/90e5913a-2daf-4739-89c2-4833deb7a72e" />
<img width="376" height="669" alt="Screenshot 2026-03-23 at 10 01 28" src="https://github.com/user-attachments/assets/46a77143-5b87-412f-8c5b-f5089f024fd0" />

### Mobile View


*Track your anime on the go with a mobile-friendly layout.*

---

## 🛠️ Tech Stack

This project is built using:

* **Frontend:** Expo Dev
* **Storage:** Supabase

---

## ▶️ Run from sql editor supabase
```
CREATE TABLE watch_list (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  anime_id bigint UNIQUE NOT NULL,
  title text NOT NULL,
  cover_image text,
  total_episodes int NOT NULL,
  status text NOT NULL DEFAULT 'ON_PROGRESS'
);

CREATE TABLE watched_episodes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  watch_list_id uuid REFERENCES watch_list(id) ON DELETE CASCADE,
  episode_number int NOT NULL,
  UNIQUE(watch_list_id, episode_number)
);
```

## ⚙️ Installation & Setup

Follow these steps to get the project running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/krisnachandra/note-watch-anime.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd note-watch-anime
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the development server:**
    ```bash
    npm start
    ```

---

## 📂 Project Structure

```text
note-watch-anime/
├── public/          # Static assets (images, icons)
├── src/             # Main application logic
│   ├── components/  # Modular UI components
│   ├── assets/      # Stylesheets and media
│   └── hooks/       # Custom logic and state management
├── index.html       # Entry point
└── package.json     # Project dependencies and scripts
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

**Developed with ❤️ by [Krisna Chandra](https://github.com/krisnachandra)**

---

**Tip:** To display your actual images, replace the `via.placeholder` URLs with the paths to your screenshots inside your `public/` or `assets/` folder.

Would you like me to help you write a specific "How to Use" section based on your app's unique workflow?
