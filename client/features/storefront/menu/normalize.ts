/**
 * Utilities to normalize and validate category menu data for 3-tier display.
 */

import type { ProductCategory } from '@/features/products/types';
import type { MenuCategory } from './types';

/**
 * Validate if a node has valid slug (non-empty, trimmed).
 * Nodes without slug will not render as clickable links in the menu.
 */
export function hasValidSlug(node: MenuCategory): boolean {
    return Boolean(node.slug?.trim());
}

/**
 * Sort children by sortOrder (ascending), maintaining original order for equal sortOrder.
 * Prevents unnecessary reordering if backend doesn't provide sortOrder.
 */
export function sortByOrder(nodes: MenuCategory[] | undefined): MenuCategory[] {
    if (!Array.isArray(nodes)) return [];

    return [...nodes].sort((a, b) => {
        const orderA = a.sortOrder ?? 0;
        const orderB = b.sortOrder ?? 0;
        return orderA - orderB;
    });
}

/**
 * Sanitize a category node: trim strings, sort children recursively.
 * Does NOT dedupe or remove nodes with missing slugs—keeps all per API response.
 */
export function sanitizeMenuNode(node: ProductCategory): MenuCategory {
    return {
        id: (node.id ?? '').trim(),
        name: (node.name ?? '').trim(),
        slug: node.slug ? node.slug.trim() : undefined,
        sortOrder: node.sortOrder,
        children: sanitizeMenuChildren(node.children),
    };
}

function fallbackGroup(
    parent: MenuCategory,
    groupName: string,
    children: Array<{ name: string; slug: string }>,
): MenuCategory[] {
    if (!parent.slug || (parent.children?.length ?? 0) > 0) {
        return parent.children ?? [];
    }

    return [
        {
            id: `${parent.id}-fallback-group`,
            name: groupName,
            sortOrder: 0,
            children: children.map((child, index) => ({
                id: `${parent.id}-fallback-${child.slug}`,
                name: child.name,
                slug: child.slug,
                sortOrder: index,
                children: [],
            })),
        },
    ];
}

function withFallbackMenuChildren(node: MenuCategory): MenuCategory {
    const slug = node.slug?.toLowerCase();
    if (slug === 'cpu') {
        return {
            ...node,
            children: fallbackGroup(node, 'Hãng', [
                { name: 'Intel', slug: 'cpu-intel' },
                { name: 'AMD', slug: 'cpu-amd' },
            ]),
        };
    }

    if (slug === 'mainboard') {
        return {
            ...node,
            children: fallbackGroup(node, 'Hãng', [
                { name: 'ASUS', slug: 'mainboard-asus' },
                { name: 'MSI', slug: 'mainboard-msi' },
                { name: 'Gigabyte', slug: 'mainboard-gigabyte' },
                { name: 'ASRock', slug: 'mainboard-asrock' },
            ]),
        };
    }

    if (slug === 'vga' || slug === 'gpu') {
        return {
            ...node,
            children: fallbackGroup(node, 'Hãng', [
                { name: 'ASUS', slug: `${slug}-asus` },
                { name: 'MSI', slug: `${slug}-msi` },
                { name: 'Gigabyte', slug: `${slug}-gigabyte` },
                { name: 'Zotac', slug: `${slug}-zotac` },
                { name: 'Galax', slug: `${slug}-galax` },
                { name: 'Sapphire', slug: `${slug}-sapphire` },
                { name: 'PowerColor', slug: `${slug}-powercolor` },
            ]),
        };
    }

    return {
        ...node,
        children: node.children?.map(withFallbackMenuChildren) ?? [],
    };
}

/**
 * Sanitize and sort children recursively.
 */
function sanitizeMenuChildren(children: ProductCategory[] | undefined): MenuCategory[] {
    if (!Array.isArray(children)) return [];

    const sanitized = children
        .filter((c) => c.id && c.name) // Only keep nodes with id + name
        .map(sanitizeMenuNode);

    return sortByOrder(sanitized);
}

/**
 * Normalize full menu: convert ProductCategory array → MenuCategory with validation.
 * - Sanitizes all nodes recursively.
 * - Sorts by sortOrder at each level.
 * - Keeps duplicate slugs/nodes as-is per API response.
 * - Filters out nodes without id/name.
 */
export function normalizeMenuCategories(categories: ProductCategory[] | undefined): MenuCategory[] {
    if (!Array.isArray(categories)) return [];

    return sanitizeMenuChildren(categories).map(withFallbackMenuChildren);
}

/**
 * Flatten a 3-tier category tree into linear list for level-based lookup.
 * Useful for finding a specific node by id across all 3 levels.
 */
export function flattenMenuTree(
    nodes: MenuCategory[],
    level: 1 | 2 | 3 = 1,
): Array<MenuCategory & { level: 1 | 2 | 3 }> {
    const result: Array<MenuCategory & { level: 1 | 2 | 3 }> = [];

    const visit = (node: MenuCategory, currentLevel: 1 | 2 | 3) => {
        result.push({ ...node, level: currentLevel });

        if (currentLevel < 3 && Array.isArray(node.children)) {
            const nextLevel = (currentLevel + 1) as 2 | 3;
            for (const child of node.children) {
                visit(child, nextLevel);
            }
        }
    };

    for (const node of nodes) {
        visit(node, level);
    }

    return result;
}
