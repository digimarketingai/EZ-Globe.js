# EZ-Globe: A Simple Interactive 3D Globe
# EZ-Globe：一個簡單的互動式3D地球儀

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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>World Scenic Wonders</title>
</head>
<body>
  <div id="globe-container"></div>
  <script src="https://cdn.jsdelivr.net/gh/digimarketingai/EZ-Globe.js/globe-bundle.js" defer>
  </script>
  <script>
    const DEMO_SPOTS = [
    {
      "name": "Giza Pyramid Complex",
      "lat": 29.9792,
      "lon": 31.1342,
      "desc_en": "An archaeological site on the Giza Plateau, Egypt. It includes the Great Pyramid of Giza, the Pyramid of Khafre, and the Pyramid of Menkaure, along with the Great Sphinx.",
      "desc_zh": "位于埃及吉萨高原的考古遗址。它包括吉萨大金字塔、哈夫拉金字塔和孟卡拉金字塔，以及著名的大狮身人面像。",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/320px-All_Gizah_Pyramids.jpg"
    },
    {
      "name": "Machu Picchu",
      "lat": -13.1631,
      "lon": -72.5450,
      "desc_en": "A 15th-century Inca citadel located in the Eastern Cordillera of southern Peru on a 2,430-meter mountain ridge. It is the most familiar icon of Inca civilization.",
      "desc_zh": "一座15世纪的印加城堡，位于秘鲁南部东科迪勒拉山脉海拔2430米的山脊上。它是印加文明最著名的标志。",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/320px-Machu_Picchu%2C_Peru.jpg"
    },
    {
      "name": "Iguazu Falls",
      "lat": -25.6953,
      "lon": -54.4367,
      "desc_en": "Waterfalls of the Iguazu River on the border of the Argentine province of Misiones and the Brazilian state of Paraná. Together, they make up the largest waterfall system in the world.",
      "desc_zh": "伊瓜苏河上的瀑布，位于阿根廷米西奥内斯省和巴西巴拉那州的边界上。它们共同构成了世界上最大的瀑布系统。",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Iguazu_Falls_in_Argentina_and_Brazil.jpg/320px-Iguazu_Falls_in_Argentina_and_Brazil.jpg"
    },
    {
      "name": "The Great Wall of China",
      "lat": 40.4319,
      "lon": 116.5704,
      "desc_en": "A series of fortifications that were built across the historical northern borders of ancient Chinese states and Imperial China as protection against various nomadic groups.",
      "desc_zh": "为抵御不同游牧民族的侵袭，在中国古代和帝制时期沿其北部边界修建的一系列防御工事。",
      "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/320px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg"
    }
  ];
  </script>  
</body>
</html>
