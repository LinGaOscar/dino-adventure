# 部署到 GitHub Pages

## 1. 建立 GitHub 儲存庫

- 登入你的 [GitHub](https://github.com/) 帳號。
- 點擊右上角的 `+` 號，選擇 `New repository`。
- 命名為 `dino-adventure`，然後點擊 `Create repository`。

## 2. 上傳程式碼

在專案資料夾內執行：

```bash
git init
git add .
git commit -m "Initial commit: Dino Adventure Game"
git branch -M main
git remote add origin https://github.com/你的使用者名稱/dino-adventure.git
git push -u origin main
```

## 3. 啟用 GitHub Pages

- 進入 GitHub 儲存庫頁面 → **Settings** → **Pages**。
- "Build and deployment" 選 `Deploy from a branch`。
- 分支選 `main`，資料夾選 `/(root)`，點擊 **Save**。

幾分鐘後即可透過 `https://你的使用者名稱.github.io/dino-adventure/` 遊玩。
