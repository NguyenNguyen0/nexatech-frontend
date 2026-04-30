@echo off
echo Cleaning up leftover root files...
cd /d "d:\TaiLieuHocTap\Tai_Lieu_HK2_Nam4\KienTrucVaThietKePhanMem\e-commerce\nexatech-frontend"

rmdir /S /Q ".next" 2>nul
rmdir /S /Q "node_modules" 2>nul
del /Q "cleanup.bat" 2>nul
del /Q "restructure.bat" 2>nul

echo Committing changes...
git add -A
git commit -m "refactor: restructure frontend into client/ + admin/ siblings

- client/ = Next.js storefront (port 3000)
- admin/ = Vite+React admin panel (port 4000)
- Both at same level for independent deployment
- Fixed header navigation links (order, marketing)
- Added checkout page and order tracking page
- Cleaned up old scripts and build artifacts"

echo.
echo Done! You can delete this file: del final-cleanup.bat
pause
