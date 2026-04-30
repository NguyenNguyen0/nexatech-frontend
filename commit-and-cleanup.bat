@echo off
echo ============================================
echo NexaTech Monolith Migration - Commit Script
echo ============================================

cd /d "%~dp0"

echo.
echo [1/7] Committing: Foundation Setup
git add .gitignore package.json tsconfig.json next.config.ts postcss.config.mjs components.json eslint.config.mjs .env.local next-env.d.ts
git commit -m "chore: initialize Next.js monolith foundation"

echo.
echo [2/7] Committing: Design System + Shared Utilities
git add app/globals.css lib/utils.ts lib/constants.ts lib/axios-client.ts types/auth.ts types/cart.ts
git commit -m "feat: add unified design system, API client, and shared utilities"

echo.
echo [3/7] Committing: Root Layout + Theme Provider
git add app/layout.tsx app/not-found.tsx components/shared/theme-provider.tsx
git commit -m "feat: add root layout with theme provider and toast notifications"

echo.
echo [4/7] Committing: Shadcn UI Components (single source)
git add components/ui/
git commit -m "feat: add Shadcn UI components (button, input, card, carousel)"

echo.
echo [5/7] Committing: Auth Domain
git add features/auth/ app/(auth)/ components/layout/header.tsx components/layout/footer.tsx middleware.ts
git commit -m "feat: add auth domain with login/register, JWT session, and middleware"

echo.
echo [6/7] Committing: Storefront Domain (Home, Cart, Product, User, Marketing)
git add app/(storefront)/ features/home/ features/cart/
git commit -m "feat: add storefront domain with home, cart, product pages"

echo.
echo [7/7] Committing: Internal Admin Domain
git add app/(internal)/
git commit -m "feat: add internal admin domain with dashboard and sidebar layout"

echo.
echo ============================================
echo All commits done! Now deleting legacy modules...
echo ============================================

echo.
echo Deleting legacy micro-frontend directories...

rmdir /S /Q host-app
rmdir /S /Q auth
rmdir /S /Q product
rmdir /S /Q cart
rmdir /S /Q user
rmdir /S /Q marketing
rmdir /S /Q internal

echo.
echo [FINAL] Committing cleanup
git add -A
git commit -m "chore: remove legacy micro-frontend modules (7 dirs)"

echo.
echo ============================================
echo DONE! All legacy modules removed.
echo Run 'npm run dev' to start the monolith.
echo ============================================
pause
