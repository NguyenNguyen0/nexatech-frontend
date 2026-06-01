/**
 * Menu category types — specialized for 3-tier category menu display.
 * Separate from general ProductCategory to avoid impacting other flows.
 */

export interface MenuCategory {
    id: string;
    name: string;
    slug?: string;
    sortOrder?: number;
    children?: MenuCategory[];
}

export interface MenuCategoryNode {
    level: 1 | 2 | 3;
    id: string;
    name: string;
    slug?: string;
    sortOrder?: number;
    parent?: MenuCategoryNode;
    children?: MenuCategoryNode[];
}
