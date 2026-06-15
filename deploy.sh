#!/bin/bash

# 同仁社禮儀公司網頁 GitHub 部署輔助腳本

if [ -z "$1" ]; then
  echo "請提供您的 GitHub 儲存庫 URL！"
  echo "使用範例: ./deploy.sh https://github.com/您的帳號/tong-ren-she.git"
  exit 1
fi

REPO_URL=$1

echo "正在設定遠端儲存庫為: $REPO_URL"

# 檢查是否已設定過 origin，若有則更新，若無則新增
if git remote | grep -q 'origin'; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

# 將預設分支重新命名為 main
git branch -M main

echo "正在將網頁檔案推送到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo "--------------------------------------------------"
  echo "成功！檔案已推送至 GitHub。"
  echo "接下來請至您的 GitHub 儲存庫網頁："
  echo "1. 點擊右上角 的「Settings」(設定)"
  echo "2. 在左側選單點選「Pages」"
  echo "3. 在「Build and deployment」區塊下的 Branch 選擇「main」，並維持「/ (root)」"
  echo "4. 點擊右側的「Save」儲存按鈕"
  echo "5. 約等待 1 至 2 分鐘，您的網頁即可在線公開瀏覽！"
  echo "--------------------------------------------------"
else
  echo "推送失敗，請檢查您的網路連線或 GitHub 存取權限（如 Token 或 SSH 金鑰）。"
fi
