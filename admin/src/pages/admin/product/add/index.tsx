import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/custom/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/services/authApi";
import { createBrand, listBrands } from "@/services/brandApi";
import { listCategories } from "@/services/categoryApi";
import {
	createProduct,
	getProductById,
	updateProduct,
	uploadProductImages,
} from "@/services/productApi";
import type {
	BrandItem,
	CategoryItem,
	ProductItem,
	ProductUpsertPayload,
} from "@/types/catalog";

const PRODUCT_FORM_LIST_SIZE = 500;

const SPEC_TEMPLATES: Record<string, string[]> = {
	cpu: [
		"socket",
		"dong_cpu",
		"so_nhan",
		"so_luong",
		"tan_so_turbo_toi_a",
		"loai_bo_nho",
	],
	mainboard: ["socket", "chipset", "loai_ram", "kich_thuoc", "lan"],
	vga: [
		"graphics_processing_unit",
		"memory",
		"memory_bus",
		"core_clocks",
		"recommended_psu",
	],
	ram: ["dung_luong", "bus", "loai_ram", "do_tre"],
	ssd: ["dung_luong", "kich_thuoc", "giao_dien", "toc_do_doc_ghi"],
	hdd: ["dung_luong", "kich_thuoc", "toc_do_vong_quay"],
	psu: ["cong_suat", "chuan_hieu_suat", "modular"],
};

const BRAND_GROUP_NAMES = new Set(["brand", "brands", "hang"]);

type ProductFormState = {
	name: string;
	description: string;
	price: string;
	compareAtPrice: string;
	sku: string;
	categoryId: string;
	brandId: string;
	tags: string;
	specs: string;
	metadataSeoTitle: string;
	thumbnail: string;
};

type LocalPreviewImage = {
	id: string;
	file: File;
	previewUrl: string;
};

const initialForm: ProductFormState = {
	name: "",
	description: "",
	price: "",
	compareAtPrice: "",
	sku: "",
	categoryId: "",
	brandId: "",
	tags: "",
	specs: "",
	metadataSeoTitle: "",
	thumbnail: "",
};

function parseNumber(input: string): number | undefined {
	if (!input.trim()) return undefined;
	const value = Number(input);
	if (Number.isNaN(value) || value < 0) return undefined;
	return value;
}

function parseCommaSeparatedList(input: string): string[] | undefined {
	const values = input
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
	return values.length > 0 ? values : undefined;
}

function parseSpecs(input: string): Record<string, string> | undefined {
	if (!input.trim()) return undefined;

	const entries = input
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [key, ...rest] = line.split(":");
			return [key?.trim(), rest.join(":").trim()] as const;
		})
		.filter(([key, value]) => key && value);

	if (entries.length === 0) return undefined;
	return Object.fromEntries(entries);
}

function buildCategoryPath(
	category: CategoryItem,
	categoryMap: Record<string, CategoryItem>,
): CategoryItem[] {
	const path: CategoryItem[] = [];
	const visited = new Set<string>();
	let current: CategoryItem | undefined = category;

	while (current && !visited.has(current.id)) {
		path.unshift(current);
		visited.add(current.id);
		current = current.parentId ? categoryMap[current.parentId] : undefined;
	}

	return path;
}

function normalizeText(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

function isBrandGroup(category: CategoryItem): boolean {
	return (
		BRAND_GROUP_NAMES.has(normalizeText(category.name)) ||
		category.slug.endsWith("-brands")
	);
}

function buildCategoryChildrenMap(
	categories: CategoryItem[],
): Record<string, CategoryItem[]> {
	const childrenMap: Record<string, CategoryItem[]> = {};
	categories.forEach((category) => {
		if (!category.parentId) return;
		childrenMap[category.parentId] ??= [];
		childrenMap[category.parentId].push(category);
	});
	return childrenMap;
}

function isInBrandBranch(
	category: CategoryItem,
	categoryMap: Record<string, CategoryItem>,
): boolean {
	return buildCategoryPath(category, categoryMap).some(isBrandGroup);
}

function getBrandKeys(brands: BrandItem[]): Set<string> {
	return new Set(
		brands.flatMap((brand) => [
			normalizeText(brand.name),
			normalizeText(brand.slug),
		]),
	);
}

function isBrandCategory(
	category: CategoryItem,
	brandKeys: Set<string>,
): boolean {
	const categoryName = normalizeText(category.name);
	const categorySlug = normalizeText(category.slug);
	return (
		brandKeys.has(categoryName) ||
		brandKeys.has(categorySlug) ||
		[...brandKeys].some((brandSlug) =>
			categorySlug.endsWith(`-${brandSlug}`),
		)
	);
}

function isSelectableProductCategory(
	category: CategoryItem,
	categoryMap: Record<string, CategoryItem>,
	categoryChildrenMap: Record<string, CategoryItem[]>,
	brandKeys: Set<string>,
): boolean {
	const path = buildCategoryPath(category, categoryMap);
	if (path.length > 2) return false;
	if (isBrandGroup(category) || isInBrandBranch(category, categoryMap)) {
		return false;
	}
	if (isBrandCategory(category, brandKeys)) return false;

	if (path.length === 2) return true;

	return (categoryChildrenMap[category.id] ?? []).every(
		(child) =>
			!child.active ||
			isBrandGroup(child) ||
			isBrandCategory(child, brandKeys),
	);
}

function getSelectableCategories(
	categories: CategoryItem[],
	categoryMap: Record<string, CategoryItem>,
	categoryChildrenMap: Record<string, CategoryItem[]>,
	brands: BrandItem[],
): CategoryItem[] {
	const brandKeys = getBrandKeys(brands);

	return categories
		.filter((category) => category.active)
		.filter((category) =>
			isSelectableProductCategory(
				category,
				categoryMap,
				categoryChildrenMap,
				brandKeys,
			),
		)
		.sort((a, b) => {
			const pathA = buildCategoryPath(a, categoryMap)
				.map((item) => item.name)
				.join(" / ");
			const pathB = buildCategoryPath(b, categoryMap)
				.map((item) => item.name)
				.join(" / ");
			return pathA.localeCompare(pathB);
		});
}

function formatCategoryPath(
	category: CategoryItem,
	categoryMap: Record<string, CategoryItem>,
): string {
	return buildCategoryPath(category, categoryMap)
		.map((item) => item.name)
		.join(" / ");
}

function pickEditableCategoryId(
	product: ProductItem,
	categoryMap: Record<string, CategoryItem>,
	categoryChildrenMap: Record<string, CategoryItem[]>,
	brands: BrandItem[],
): string {
	const categoryIds = product.categoryIds ?? [];
	const brandKeys = getBrandKeys(brands);
	const selectableIds = new Set(
		getSelectableCategories(
			Object.values(categoryMap),
			categoryMap,
			categoryChildrenMap,
			brands,
		).map((category) => category.id),
	);
	const productCategoryId = categoryIds
		.filter((categoryId) => categoryMap[categoryId])
		.filter(
			(categoryId) =>
				!isInBrandBranch(categoryMap[categoryId], categoryMap),
		)
		.filter((categoryId) => selectableIds.has(categoryId))
		.at(-1);

	if (productCategoryId) return productCategoryId;

	const primaryCategory = product.primaryCategoryId
		? categoryMap[product.primaryCategoryId]
		: undefined;
	const primaryCategoryPath = primaryCategory
		? buildCategoryPath(primaryCategory, categoryMap)
		: [];
	const editableAncestor = primaryCategoryPath
		.slice(0, 2)
		.reverse()
		.find((category) =>
			isSelectableProductCategory(
				category,
				categoryMap,
				categoryChildrenMap,
				brandKeys,
			),
		);

	return editableAncestor?.id ?? product.primaryCategoryId ?? "";
}

function appendMissingSpecTemplate(
	currentSpecs: string,
	categorySlug?: string,
): string {
	const existingKeys = new Set(
		currentSpecs
			.split("\n")
			.map((line) => line.split(":")[0]?.trim())
			.filter(Boolean),
	);
	const keys = categorySlug ? SPEC_TEMPLATES[categorySlug] : undefined;
	if (!keys?.length) return currentSpecs;

	const missingLines = keys
		.filter((key) => !existingKeys.has(key))
		.map((key) => `${key}: `);

	if (missingLines.length === 0) return currentSpecs;
	return [currentSpecs.trim(), ...missingLines].filter(Boolean).join("\n");
}

function getDescendants(
	category: CategoryItem,
	categoryChildrenMap: Record<string, CategoryItem[]>,
): CategoryItem[] {
	const result: CategoryItem[] = [];
	const stack = [...(categoryChildrenMap[category.id] ?? [])];
	while (stack.length > 0) {
		const current = stack.shift();
		if (!current) continue;
		result.push(current);
		stack.push(...(categoryChildrenMap[current.id] ?? []));
	}
	return result;
}

function findBrandCategory(
	category: CategoryItem | undefined,
	brand: BrandItem | undefined,
	categoryChildrenMap: Record<string, CategoryItem[]>,
): CategoryItem | undefined {
	if (!category || !brand) return undefined;
	const brandName = normalizeText(brand.name);
	const brandSlug = normalizeText(brand.slug);
	return getDescendants(category, categoryChildrenMap).find((item) => {
		const itemName = normalizeText(item.name);
		const itemSlug = normalizeText(item.slug);
		return (
			itemName === brandName ||
			itemSlug === brandSlug ||
			itemSlug.endsWith(`-${brandSlug}`)
		);
	});
}

function getFilteredBrands(
	category: CategoryItem | undefined,
	brands: BrandItem[],
	categoryChildrenMap: Record<string, CategoryItem[]>,
): BrandItem[] {
	if (!category) return brands;
	const descendants = getDescendants(category, categoryChildrenMap);
	const categoryBrandKeys = new Set(
		descendants
			.filter((item) => !isBrandGroup(item))
			.flatMap((item) => [
				normalizeText(item.name),
				normalizeText(item.slug),
			]),
	);
	const filtered = brands.filter((brand) => {
		const brandName = normalizeText(brand.name);
		const brandSlug = normalizeText(brand.slug);
		return (
			categoryBrandKeys.has(brandName) ||
			categoryBrandKeys.has(brandSlug) ||
			[...categoryBrandKeys].some((key) => key.endsWith(`-${brandSlug}`))
		);
	});
	return filtered.length > 0 ? filtered : brands;
}

export default function ProductUpsertPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const isEditMode = Boolean(id);

	const [form, setForm] = useState<ProductFormState>(initialForm);
	const [loading, setLoading] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [categories, setCategories] = useState<CategoryItem[]>([]);
	const [brands, setBrands] = useState<BrandItem[]>([]);
	const [newBrandName, setNewBrandName] = useState<string>("");
	const [creatingBrand, setCreatingBrand] = useState<boolean>(false);
	const [existingImages, setExistingImages] = useState<string[]>([]);
	const [localImages, setLocalImages] = useState<LocalPreviewImage[]>([]);
	const [loadedProduct, setLoadedProduct] = useState<ProductItem | null>(
		null,
	);

	const hasAnyImage = existingImages.length > 0 || localImages.length > 0;

	const categoryMap = useMemo(
		() =>
			Object.fromEntries(
				categories.map((category) => [category.id, category]),
			),
		[categories],
	);
	const categoryChildrenMap = useMemo(
		() => buildCategoryChildrenMap(categories),
		[categories],
	);
	const selectableCategories = useMemo(
		() =>
			getSelectableCategories(
				categories,
				categoryMap,
				categoryChildrenMap,
				brands,
			),
		[categories, categoryMap, categoryChildrenMap, brands],
	);
	const selectedCategory = form.categoryId
		? categoryMap[form.categoryId]
		: undefined;
	const selectedCategoryPath = selectedCategory
		? buildCategoryPath(selectedCategory, categoryMap)
		: [];
	const templateCategorySlug = selectedCategory?.slug;
	const filteredBrands = useMemo(
		() => getFilteredBrands(selectedCategory, brands, categoryChildrenMap),
		[selectedCategory, brands, categoryChildrenMap],
	);
	const selectedBrand = brands.find((brand) => brand.id === form.brandId);
	const selectedBrandCategory = findBrandCategory(
		selectedCategory,
		selectedBrand,
		categoryChildrenMap,
	);
	const brandOptions =
		selectedBrand &&
		!filteredBrands.some((brand) => brand.id === selectedBrand.id)
			? [...filteredBrands, selectedBrand]
			: filteredBrands;
	const linkedCategoryPath = selectedBrandCategory
		? buildCategoryPath(selectedBrandCategory, categoryMap)
		: selectedCategoryPath;

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setLoading(true);
				const [categoriesResult, brandsResult] = await Promise.all([
					listCategories({ size: PRODUCT_FORM_LIST_SIZE }),
					listBrands({ size: PRODUCT_FORM_LIST_SIZE }),
				]);

				if (!mounted) return;
				setCategories(categoriesResult);
				setBrands(brandsResult);
				const nextCategoryMap = Object.fromEntries(
					categoriesResult.map((category) => [category.id, category]),
				);
				const nextCategoryChildrenMap =
					buildCategoryChildrenMap(categoriesResult);

				if (!id) return;

				const product = await getProductById(id);
				if (!mounted) return;

				setLoadedProduct(product);
				setExistingImages(product.images ?? []);
				setForm({
					name: product.name ?? "",
					description: product.description ?? "",
					price: product.price != null ? String(product.price) : "",
					compareAtPrice:
						product.compareAtPrice != null
							? String(product.compareAtPrice)
							: "",
					sku: product.sku ?? "",
					categoryId: pickEditableCategoryId(
						product,
						nextCategoryMap,
						nextCategoryChildrenMap,
						brandsResult,
					),
					brandId: product.brandId ?? "",
					tags: (product.tags ?? []).join(", "),
					specs: Object.entries(product.specs ?? {})
						.map(([key, value]) => `${key}: ${value}`)
						.join("\n"),
					metadataSeoTitle:
						typeof product.metadata?.seoTitle === "string"
							? product.metadata.seoTitle
							: "",
					thumbnail: product.thumbnail ?? "",
				});
			} catch (error) {
				if (!mounted) return;
				toast.error(
					getApiErrorMessage(error, "Load product form data failed"),
				);
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
			localImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
		};
	}, [id]);

	const updateForm = <K extends keyof ProductFormState>(
		key: K,
		value: ProductFormState[K],
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleCategoryChange = (categoryId: string) => {
		const nextCategory = categoryMap[categoryId];
		const nextBrands = getFilteredBrands(
			nextCategory,
			brands,
			categoryChildrenMap,
		);
		setForm((prev) => ({
			...prev,
			categoryId,
			brandId:
				prev.brandId &&
				nextBrands.some((brand) => brand.id === prev.brandId)
					? prev.brandId
					: "",
		}));
	};

	const handleCreateBrand = async () => {
		const name = newBrandName.trim();
		if (!name) {
			toast.error("Brand name is required");
			return;
		}

		try {
			setCreatingBrand(true);
			const created = await createBrand({ name });
			setBrands((prev) => [...prev, created]);
			updateForm("brandId", created.id);
			setNewBrandName("");
			toast.success("Brand created");
		} catch (error) {
			toast.error(getApiErrorMessage(error, "Create brand failed"));
		} finally {
			setCreatingBrand(false);
		}
	};

	const handleSelectLocalImages = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = Array.from(event.target.files ?? []);
		if (files.length === 0) return;

		const previews = files.map((file) => ({
			id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
			file,
			previewUrl: URL.createObjectURL(file),
		}));

		setLocalImages((prev) => [...prev, ...previews]);
		event.target.value = "";
	};

	const removeLocalImage = (previewId: string) => {
		setLocalImages((prev) => {
			const target = prev.find((item) => item.id === previewId);
			if (target) {
				URL.revokeObjectURL(target.previewUrl);
			}
			return prev.filter((item) => item.id !== previewId);
		});
	};

	const validateForm = (): boolean => {
		if (!form.name.trim()) {
			toast.error("Product name is required");
			return false;
		}

		if (!form.description.trim()) {
			toast.error("Product description is required");
			return false;
		}

		const price = parseNumber(form.price);
		if (price == null) {
			toast.error("Product price is required and must be >= 0");
			return false;
		}

		if (!form.categoryId) {
			toast.error("Category is required");
			return false;
		}

		if (!form.brandId) {
			toast.error("Brand is required");
			return false;
		}

		if (!hasAnyImage) {
			toast.error("At least one image is required");
			return false;
		}

		return true;
	};

	const buildPayload = (): ProductUpsertPayload => {
		const selectedCategory = categoryMap[form.categoryId];
		const selectedBrand = brands.find((brand) => brand.id === form.brandId);
		const brandCategory = findBrandCategory(
			selectedCategory,
			selectedBrand,
			categoryChildrenMap,
		);
		const categoryPath = selectedCategory
			? buildCategoryPath(selectedCategory, categoryMap)
			: [];
		const brandCategoryPath = brandCategory
			? buildCategoryPath(brandCategory, categoryMap)
			: [];
		const linkedCategories = [
			selectedCategory,
			...categoryPath,
			...brandCategoryPath,
		].filter(Boolean) as CategoryItem[];
		const uniqueLinkedCategories = Array.from(
			new Map(
				linkedCategories.map((category) => [category.id, category]),
			).values(),
		);

		return {
			name: form.name.trim(),
			description: form.description.trim(),
			descriptionHtml: `<p>${form.description.trim()}</p>`,
			price: Number(form.price),
			compareAtPrice: parseNumber(form.compareAtPrice),
			sku: form.sku.trim() || undefined,
			thumbnail: form.thumbnail.trim() || undefined,
			primaryCategoryId: selectedCategory?.id ?? form.categoryId,
			primaryCategorySlug: selectedCategory?.slug,
			categoryIds:
				uniqueLinkedCategories.length > 0
					? uniqueLinkedCategories.map((category) => category.id)
					: [form.categoryId],
			categorySlugs:
				uniqueLinkedCategories.length > 0
					? uniqueLinkedCategories
							.map((category) => category.slug)
							.filter(Boolean)
					: undefined,
			brandId: form.brandId,
			tags: parseCommaSeparatedList(form.tags),
			specs: parseSpecs(form.specs),
			metadata: form.metadataSeoTitle.trim()
				? { seoTitle: form.metadataSeoTitle.trim() }
				: undefined,
			images: existingImages.length > 0 ? existingImages : undefined,
		};
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setSubmitting(true);
			const payload = buildPayload();

			const savedProduct =
				isEditMode && id
					? await updateProduct(id, payload)
					: await createProduct(payload);

			if (localImages.length > 0) {
				await uploadProductImages(
					savedProduct.id,
					localImages.map((image) => image.file),
				);
			}

			toast.success(
				isEditMode
					? "Product updated successfully"
					: "Product created successfully",
			);
			navigate("/admin/product/products");
		} catch (error) {
			toast.error(
				getApiErrorMessage(
					error,
					isEditMode
						? "Update product failed"
						: "Create product failed",
				),
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<p className="text-sm text-muted-foreground">
				Loading product form...
			</p>
		);
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="flex items-center justify-between gap-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						{isEditMode ? "Edit Product" : "Add Product"}
					</h2>
					<p className="text-muted-foreground">
						{isEditMode
							? "Update product information and upload additional images."
							: "Create a new product and upload images after submission."}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button asChild variant="outline" type="button">
						<Link to="/admin/product/products">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to list
						</Link>
					</Button>
					<Button type="submit" loading={submitting}>
						{isEditMode ? "Save Changes" : "Create Product"}
					</Button>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Core Information</CardTitle>
							<CardDescription>
								Required fields for product creation and update.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={form.name}
									onChange={(event) =>
										updateForm("name", event.target.value)
									}
									placeholder="e.g. iPhone 15 Pro"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="description">
									Description *
								</Label>
								<Textarea
									id="description"
									value={form.description}
									onChange={(event) =>
										updateForm(
											"description",
											event.target.value,
										)
									}
									className="min-h-28"
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor="price">Price *</Label>
									<Input
										id="price"
										type="number"
										min={0}
										value={form.price}
										onChange={(event) =>
											updateForm(
												"price",
												event.target.value,
											)
										}
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="compareAtPrice">
										Compare At Price
									</Label>
									<Input
										id="compareAtPrice"
										type="number"
										min={0}
										value={form.compareAtPrice}
										onChange={(event) =>
											updateForm(
												"compareAtPrice",
												event.target.value,
											)
										}
									/>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor="category">Category *</Label>
									<Select
										value={form.categoryId}
										onValueChange={handleCategoryChange}
									>
										<SelectTrigger id="category">
											<SelectValue placeholder="Select product category path" />
										</SelectTrigger>
										<SelectContent>
											{selectableCategories.map(
												(category) => (
													<SelectItem
														key={category.id}
														value={category.id}
													>
														{formatCategoryPath(
															category,
															categoryMap,
														)}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									{linkedCategoryPath.length > 0 && (
										<p className="text-xs text-muted-foreground">
											Product will be linked to:{" "}
											{linkedCategoryPath
												.map(
													(category) => category.slug,
												)
												.join(" / ")}
										</p>
									)}
								</div>

								<div className="grid gap-2">
									<Label htmlFor="brand">Brand *</Label>
									<Select
										value={form.brandId}
										onValueChange={(value) =>
											updateForm("brandId", value)
										}
									>
										<SelectTrigger id="brand">
											<SelectValue placeholder="Select brand" />
										</SelectTrigger>
										<SelectContent>
											{brandOptions.map((brand) => (
												<SelectItem
													key={brand.id}
													value={brand.id}
												>
													{brand.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<div className="flex gap-2">
										<Input
											value={newBrandName}
											onChange={(event) =>
												setNewBrandName(
													event.target.value,
												)
											}
											placeholder="Add new brand"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleCreateBrand}
											loading={creatingBrand}
										>
											<Plus className="mr-2 h-4 w-4" />
											Add
										</Button>
									</div>
									<p className="text-xs text-muted-foreground">
										{selectedCategory
											? `${brandOptions.length} brand option(s) for this category.`
											: "Select a category to filter brand options."}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Advanced Fields</CardTitle>
							<CardDescription>
								Optional fields mapped to product API payload.
							</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="sku">SKU</Label>
								<Input
									id="sku"
									value={form.sku}
									onChange={(event) =>
										updateForm("sku", event.target.value)
									}
									placeholder="e.g. IP15PRO-256-BLK"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="thumbnail">
									Thumbnail URL (optional)
								</Label>
								<Input
									id="thumbnail"
									value={form.thumbnail}
									onChange={(event) =>
										updateForm(
											"thumbnail",
											event.target.value,
										)
									}
									placeholder="https://.../thumb.jpg"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="tags">
									Tags (comma separated)
								</Label>
								<Input
									id="tags"
									value={form.tags}
									onChange={(event) =>
										updateForm("tags", event.target.value)
									}
									placeholder="flagship, ios"
								/>
							</div>

							<div className="grid gap-2">
								<div className="flex items-center justify-between gap-2">
									<Label htmlFor="specs">
										Specs (one per line, format: key: value)
									</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={
											!templateCategorySlug ||
											!SPEC_TEMPLATES[
												templateCategorySlug
											]
										}
										onClick={() =>
											updateForm(
												"specs",
												appendMissingSpecTemplate(
													form.specs,
													templateCategorySlug,
												),
											)
										}
									>
										Apply template
									</Button>
								</div>
								<Textarea
									id="specs"
									value={form.specs}
									onChange={(event) =>
										updateForm("specs", event.target.value)
									}
									className="min-h-28"
									placeholder={
										"socket: LGA 1700\nchipset: Intel Z790\nloai_ram: DDR5"
									}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="seoTitle">SEO Title</Label>
								<Input
									id="seoTitle"
									value={form.metadataSeoTitle}
									onChange={(event) =>
										updateForm(
											"metadataSeoTitle",
											event.target.value,
										)
									}
									placeholder="iPhone 15 Pro"
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Images *</CardTitle>
							<CardDescription>
								Phase B flow: select and preview now, upload
								after product submit.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<Label
									htmlFor="image-upload"
									className="sr-only"
								>
									Upload images
								</Label>
								<Input
									id="image-upload"
									type="file"
									multiple
									accept="image/*"
									onChange={handleSelectLocalImages}
								/>
							</div>

							<p className="text-xs text-muted-foreground">
								Existing images: {existingImages.length} | New
								files: {localImages.length}
							</p>

							<div className="grid grid-cols-2 gap-2">
								{existingImages.map((url) => (
									<div
										key={url}
										className="relative overflow-hidden rounded-md border"
									>
										<img
											src={url}
											alt="Existing product image"
											className="aspect-square w-full object-cover"
										/>
									</div>
								))}

								{localImages.map((image) => (
									<div
										key={image.id}
										className="relative overflow-hidden rounded-md border"
									>
										<img
											src={image.previewUrl}
											alt="Local upload preview"
											className="aspect-square w-full object-cover"
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute right-1 top-1 h-6 w-6"
											onClick={() =>
												removeLocalImage(image.id)
											}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								))}
							</div>

							{!hasAnyImage && (
								<div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
									<ImagePlus className="mx-auto mb-2 h-4 w-4" />
									Select at least one image to continue.
								</div>
							)}
						</CardContent>
					</Card>

					{isEditMode && loadedProduct && (
						<Card>
							<CardHeader>
								<CardTitle>Current Product</CardTitle>
								<CardDescription>
									Loaded from API for update.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-1 text-sm">
								<p>
									<span className="text-muted-foreground">
										ID:
									</span>{" "}
									{loadedProduct.id}
								</p>
								<p>
									<span className="text-muted-foreground">
										Slug:
									</span>{" "}
									{loadedProduct.slug}
								</p>
								<p>
									<span className="text-muted-foreground">
										Active:
									</span>{" "}
									{loadedProduct.active ? "Yes" : "No"}
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</form>
	);
}
