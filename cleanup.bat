@echo off
echo ============================================
echo  NexaTech: Cleanup and Move Admin
echo ============================================
echo.

cd /d "d:\TaiLieuHocTap\Tai_Lieu_HK2_Nam4\KienTrucVaThietKePhanMem\e-commerce\nexatech-frontend"

echo [1/4] Deleting duplicate route groups...
if exist "app\(client)" rmdir /S /Q "app\(client)"
if exist "app\(internal)" rmdir /S /Q "app\(internal)"
echo   Deleted: (client), (internal)
echo   Kept:    (storefront), (auth)

echo.
echo [2/4] Cleaning up old scripts...
if exist "commit-and-cleanup.bat" del /Q "commit-and-cleanup.bat"
if exist "check-git.bat" del /Q "check-git.bat"

echo.
echo [3/4] Copying admin (Vite+React) into project...
if exist "admin\" (
    echo   admin/ already exists, skipping copy.
) else (
    xcopy /E /I /Q "d:\TaiLieuHocTap\Tai_Lieu_HK2_Nam4\KienTrucVaThietKePhanMem\e-commerce\internal" "admin"
    echo   Copied internal/ to admin/
)

echo.
echo [4/4] Committing in small parts...
git add app/ middleware.ts tsconfig.json
git commit -m "refactor: cleanup client - remove duplicate (client) and (internal) route groups - keep (storefront) for customer pages and (auth) for login/register - simplify middleware for client-only routes - update tsconfig to exclude admin/"

git add admin/
git commit -m "feat: add admin panel (Vite+React) as standalone app - Copied from e-commerce/internal/ - Runs independently on port 4000 - Has own package.json, vite.config, routing"

git add -A
git commit -m "chore: cleanup old scripts and misc files" --allow-empty

echo.
echo ============================================
echo  DONE! Final structure:
echo.
echo   nexatech-frontend/
echo     app/(storefront)/  = Customer pages (port 3000)
echo     app/(auth)/        = Login/Register pages
echo     admin/             = Admin panel (port 4000)
echo.
echo  Run Client:  npm run dev
echo  Run Admin:   cd admin ^&^& npm run dev
echo ============================================
pause
