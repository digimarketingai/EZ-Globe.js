# EZ-Globe: A Simple Interactive 3D Globe
# EZ-Globe：一個簡單的互動式3D地球儀

A lightweight, self-contained JavaScript library for creating beautiful, interactive 3D globes. The only file you need to edit is `index.html` to change the data points. The library handles everything else.

一個輕量級、獨立自足的 JavaScript 函式庫，用於創建精美、可互動的3D地球儀。您唯一需要編輯的檔案是 `index.html`，用以修改資料點。函式庫會處理其他所有事情。

---

### Live Demo / 線上預覽

You can view a live demo of this project once you deploy it to GitHub Pages.
**https://digimarketingai.github.io/EZ-Globe.js/**

---

### Features / 功能特色

*   **Easy to Use / 簡單易用**: Just edit a single data array in `index.html`. No need to touch complex code.
*   **Self-Contained / 獨立自足**: The library automatically loads all dependencies (like Three.js) and injects all necessary CSS and HTML.
*   **Direct CDN Linking / 直接 CDN 連結**: Use the library in any project with a single `<script>` tag, no download required.
*   **Responsive Design / 響應式設計**: The UI adapts gracefully to both desktop and mobile screens.
*   **User-Controlled / 由使用者控制**: The globe is static by default and only moves when the user interacts with it.

---

### How to Use / 如何使用

There are two ways to use EZ-Globe: by direct linking (recommended for most users) or by downloading the files.

有兩種使用 EZ-Globe 的方式：透過直接連結（推薦給大多數使用者）或下載檔案。

#### Method 1: Direct Linking via CDN (Recommended) / 方法一：透過 CDN 直接連結 (推薦)

You can include `EZ-Globe.js` in your own HTML file without downloading anything. Just add the following script tags to your HTML page. This is the easiest way to use the library in your own projects.

您可以在自己的 HTML 檔案中引入 `EZ-Globe.js` 而無需下載任何東西。只需將以下 script 標籤添加到您的 HTML 頁面中。這是將此函式庫應用於您自己專案的最簡單方法。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Awesome Globe</title>
</head>
<body>
    <div style="font-family: sans-serif; text-align: center; padding-top: 20vh; color: #ccc;">Loading Globe...</div>

    <!-- 1. Define your data -->
    <script>
        const customConfig = {
            title: "My Custom Globe Title",
            developerName: "My Name"
        };
        const mySpotsData = [
            {
                "name": "Eiffel Tower",
                "lat": 48.8584,
                "lon": 2.2945,
                "desc_en": "A famous landmark in Paris, France.",
                "desc_zh": "法國巴黎的著名地標。",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons.jpg/250px-Tour_Eiffel_Wikimedia_Commons.jpg"
            }
        ];
    </script>

    <!-- 2. Include the EZ-Globe library from the CDN -->
    <script src="https://cdn.jsdelivr.net/gh/digimarketingai/EZ-Globe.js@latest/EZ-Globe.js"></script>

</body>
</html>
