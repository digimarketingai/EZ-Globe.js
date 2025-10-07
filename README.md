# EZ-Globe: A Simple Interactive 3D Globe
# EZ-Globe：一個簡單的互動式3D地球儀

[![License: MIT]]

A lightweight, self-initializing JavaScript library for creating beautiful, interactive 3D globes. Just add your data to your HTML file and the library handles the rest.

一個輕量級、可自我初始化的 JavaScript 函式庫，用於創建精美、可互動的3D地球儀。只需將您的資料添加到 HTML 檔案中，函式庫就會處理剩下的所有事情。

---

### Live Demo / 線上預覽

You can view a live demo of this project once you deploy it to GitHub Pages.
**https://digimarketingai.github.io/EZ-Globe.js/**

---

### How to Use / 如何使用

Using EZ-Globe is incredibly simple. You only need to create an HTML file, add your data, and include the library.

使用 EZ-Globe 非常簡單。您只需要創建一個 HTML 檔案，添加您的資料，然後引入函式庫即可。

#### Step 1: Create your HTML file / 第一步：創建您的 HTML 檔案

Create an `index.html` file and paste the following structure.

創建一個 `index.html` 檔案並貼上以下結構。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Awesome Globe</title>
</head>
<body>
    <!-- This is a placeholder that the library will replace -->
    <div style="font-family: sans-serif; text-align: center; padding-top: 20vh;">Loading Globe...</div>

    <!-- Step 2: Add your configuration data -->
    <script id="ez-globe-config" type="application/json">
        {
            "title": "My Custom Globe Title",
            "developerName": "Your Name"
        }
    </script>

    <!-- Step 3: Add your location data -->
    <script id="ez-globe-data" type="application/json">
        [
            {
                "name": "Eiffel Tower",
                "lat": 48.8584,
                "lon": 2.2945,
                "desc_en": "A famous landmark in Paris, France.",
                "desc_zh": "法國巴黎的著名地標。",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons.jpg/250px-Tour_Eiffel_Wikimedia_Commons.jpg"
            },
            {
                "name": "Statue of Liberty",
                "lat": 40.6892,
                "lon": -74.0445,
                "desc_en": "A colossal neoclassical sculpture on Liberty Island in New York Harbor.",
                "desc_zh": "位於紐約港自由島上的一座巨大的新古典主義雕塑。",
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/220px-Statue_of_Liberty_7.jpg"
            }
        ]
    </script>
    
    <!-- Step 4: Include the library. It will run automatically. -->
    <script src="https://cdn.jsdelivr.net/gh/digimarketingai/EZ-Globe.js@latest/EZ-Globe.js"></script>

</body>
</html>
