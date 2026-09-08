# 彼岸水霧居 — GitHub Pages 完整網站原始檔

這個資料夾可直接部署為靜態網站，不需要 API Key、後端伺服器或 ChatGPT 登入。已包含 Three.js 函式庫、材質圖片、3D 場景程式與可下載設計底稿。開啟網站時會由程式建立模型；無需先下載 GLB。

## 用電腦上傳（最方便）

1. 先解壓縮 ZIP。你應該能在最外層看到 `index.html`、`app.js`、`assets`、`vendor` 等項目。
2. 在 GitHub 建立一個 Public repository，例如 `higan-water-house`。進入儲存庫，選 **Add file → Upload files**。
3. 把解壓縮後的全部檔案及資料夾拖進去，保留資料夾結構，再提交。**不要只上傳 ZIP；`index.html` 要直接位於儲存庫最外層。**
4. 到 **Settings → Pages → Build and deployment**，Source 選 **Deploy from a branch**，Branch 選 **main**，資料夾選 **/(root)**，按 Save。
5. 等部署完成，到同一個 Pages 頁面取得網址。把該網址傳給朋友即可開啟，不需要登入 ChatGPT。

如果你更新舊儲存庫，請先保留舊檔備份，再以這包的同名檔案更新。部署後若仍顯示舊画面，可重新整理或清除該頁快取。

官方說明：[設定 GitHub Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[上傳檔案](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。

## 檔案對照

| 項目 | 用途 |
| --- | --- |
| `index.html` | 網站首頁與按鈕介面 |
| `style.css` | 排版、手機適配與色彩 |
| `app.js` | 相機、拖曳、室內漫遊與操作 |
| `scene.js` | 房屋、室內、橋與基礎場景幾何 |
| `landscape.js` | 木屋細節、山林、材質與岩岸 |
| `atmosphere.js` | 反射溪水、夜空、低霧與動態效果 |
| `assets/` | 材質、參考圖、GLB 模型、SVG／DXF 底稿及下載包 |
| `vendor/`、`utils/` | 已附 Three.js 與所需工具，請一起上傳 |
| `tools/` | 開發用：重新輸出模型、繪製底稿的腳本，部署網站不必執行 |
| `package.json` | 僅供需要執行開發腳本的人安裝依賴；GitHub Pages 部署不需要安裝 |

## 在自己電腦預覽

ES Modules 和圖片載入需要 HTTP 網址。直接雙擊 `index.html` 的 `file://` 開啟方式可能被瀏覽器阻擋。

最簡單是在 VS Code 開啟資料夾，使用 Live Server 擴充功能，然後對 `index.html` 選 Open with Live Server。

也可以在這個資料夾的終端機執行 `python -m http.server 8000`，再於瀏覽器開啟 `http://localhost:8000`。

## 操作

- 拖曳旋轉，滾輪或雙指縮放。
- 「自由漫遊」後，拖曳環顧，以 WASD、方向鍵或手機畫面方向鈕移動；Esc 回到環繞。
- 「檢視設定」中可調霧量、流動速度，並切換動態、日光、屋頂與結構。
- 「設計底稿」可查看及下載平面、立面、剖面、基地圖。

## 模型與驗證範圍

本包包含較原始公開版本深化的材質、地景、動態水流與霧效程式。它是可編輯的概念設計，不是可施工圖，也不是工程流體模擬。

已檢查 JavaScript 語法、幾何資料、模型輸出及相對資源路徑。尚未在你的裝置上驗證實際畫面與效能。瀏覽器需支援 WebGL 2；畫面複雜度較高，舊手機可能較慢。

GLB 已含實體地景及材質；即時水流、霧與相機控制由網頁程式提供，不會隨 GLB 自動匯入 Blender／Unreal。

修改程式後，可選擇執行 `npm install` 再執行 `npm run export:model` 重新產生 GLB。Python 的 `tools/drawings.py` 可重新輸出線稿。僅部署網站不需這些步驟。
