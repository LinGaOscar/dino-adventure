# dev.md

## 本地開發

沒有建置流程、沒有套件管理、沒有 lint／測試工具。純靜態 HTML/CSS/JS。

最簡單方式：直接用瀏覽器開啟 `index.html`。

若需要本機伺服器（例如測試相對路徑或避免瀏覽器的 file:// 限制）：

```bash
python -m http.server
```

然後開啟 http://localhost:8000/。

## 專案結構

```
index.html          # 進入點：canvas + 開始/結束畫面 UI
css/style.css        # 版面與視覺樣式（CSS 變數定義色彩）
js/script.js          # 全部遊戲邏輯（繪圖、物理、碰撞、狀態機）
doc/github-pages.md   # GitHub Pages 部署步驟
```

沒有 `assets/` 目錄——恐龍與仙人掌都是 `script.js` 內用 Canvas 2D API 畫出來的向量圖形（`drawDinoShape`、`drawCactusShape`），不是圖片素材。

## 修改時的注意事項

- 遊戲數值（重力、跳躍力、地面高度、障礙速度）在 `resize()` 內會依畫布高度等比縮放，調整平衡性時建議連同這幾個係數一起看。
- 開發時可在遊戲中按 `D` 鍵切換 hitbox 除錯疊圖，方便微調碰撞判定。
- 沒有自動化測試，修改後請直接在瀏覽器手動測試遊玩流程（開始、跳躍、雙跳、撞擊結束、飛翔模式觸發）。

## 部署

透過 GitHub Pages，從 `main` 分支根目錄部署，步驟見 [doc/github-pages.md](doc/github-pages.md)。線上版：https://lingaoscar.github.io/dino-adventure/
