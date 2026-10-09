#!/usr/bin/env bash
# Push conversation archive from Qin branch to wang-qin54/VPN
set -euo pipefail

TMP_DIR="${TMPDIR:-/tmp}/vpn-sync-$$"
BRANCH="cursor/cursor-vpn-c488"
QIN_REPO="https://github.com/wang-qin54/Qin.git"
VPN_REPO="https://github.com/wang-qin54/VPN.git"

git clone -b "$BRANCH" --single-branch "$QIN_REPO" "$TMP_DIR"
cd "$TMP_DIR/cursor-vpn"

git init
git add .
git commit -m "Initial commit: Cursor VPN conversation archive"
git branch -M main
git remote add origin "$VPN_REPO"
git push -u origin main

cd /
rm -rf "$TMP_DIR"
echo "Done. See https://github.com/wang-qin54/VPN"
