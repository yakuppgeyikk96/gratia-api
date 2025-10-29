// src/modules/seed/services/seed.service.ts

import Category, { CategoryDoc } from "../../../shared/models/category.model";
import Collection from "../../../shared/models/collection.model";
import Product from "../../../shared/models/product.model";

interface SeedResult {
  collections: number;
  categories: number;
  products: number;
}

export const seedDatabaseService = async (): Promise<SeedResult> => {
  /**
   * Delete all collections, categories and products
   */
  await Collection.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  /**
   * Create collections
   */
  const collections = await Collection.insertMany([
    {
      name: "New Arrivals",
      slug: "new",
      description: "Latest arrivals",
      collectionType: "new",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Trending Now",
      slug: "trending",
      description: "Trending products",
      collectionType: "trending",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Sale",
      slug: "sale",
      description: "On sale products",
      collectionType: "sale",
      isActive: true,
      sortOrder: 3,
    },
  ]);

  const collectionSlugs = collections.map((c) => c.slug);

  /**
   * Get random collections
   */
  const getRandomCollections = (): string[] => {
    const count = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...collectionSlugs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  /**
   * Build category path
   */
  const buildCategoryPath = async (categoryId: string): Promise<string> => {
    const slugs: string[] = [];
    let currentCategoryId: string | null = categoryId;

    while (currentCategoryId) {
      const category: CategoryDoc | null = await Category.findById(
        currentCategoryId
      );
      if (!category) break;

      slugs.unshift(category.slug);

      if (category.parentId) {
        currentCategoryId = category.parentId.toString();
      } else {
        currentCategoryId = null;
      }
    }

    return slugs.join("#");
  };

  /**
   * Main categories
   */
  const mainCategories = ["Men", "Women", "Kids"];
  const level1Categories = {
    Men: ["Clothing", "Shoes"],
    Women: ["Clothing", "Shoes"],
    Kids: ["Clothing", "Shoes"],
  };
  const level2Categories = {
    Clothing: ["Jackets", "T-Shirts", "Jeans"],
    Shoes: ["Sneakers", "Boots", "Sandals"],
  };

  const createdCategories: any = {
    Men: null,
    Women: null,
    Kids: null,
  };

  /**
   * Create main categories
   */
  for (const mainCat of mainCategories) {
    const category = await Category.create({
      name: mainCat,
      slug: mainCat.toLowerCase(),
      level: 0,
      isActive: true,
      sortOrder: mainCategories.indexOf(mainCat) + 1,
    });
    createdCategories[mainCat] = category;
  }

  /**
   * Create level 1 categories
   */
  const level1Map: any = {};
  for (const [mainCat, subs] of Object.entries(level1Categories)) {
    level1Map[mainCat] = {};
    for (const subCat of subs) {
      const category = await Category.create({
        name: subCat,
        slug: `${createdCategories[mainCat].slug}-${subCat.toLowerCase()}`,
        parentId: createdCategories[mainCat]._id,
        level: 1,
        isActive: true,
        sortOrder: subs.indexOf(subCat) + 1,
      });
      level1Map[mainCat][subCat] = category;
    }
  }

  /**
   * Create level 2 categories
   */
  const level2Map: any = {};
  for (const [mainCat, level1Cats] of Object.entries(level1Map)) {
    level2Map[mainCat] = {};

    for (const [level1Cat, level1Doc] of Object.entries(
      level1Cats as Record<string, any>
    )) {
      level2Map[mainCat][level1Cat] = {};
      const subSubs =
        level2Categories[level1Cat as keyof typeof level2Categories];
      for (const subSub of subSubs) {
        const category = await Category.create({
          name: subSub,
          slug: `${(level1Doc as any).slug}-${subSub.toLowerCase()}`,
          parentId: (level1Doc as any)._id,
          level: 2,
          isActive: true,
          sortOrder: subSubs.indexOf(subSub) + 1,
        });
        level2Map[mainCat][level1Cat][subSub] = category;
      }
    }
  }

  /**
   * Create products
   */
  const products: any[] = [];
  const colors = ["Black", "White", "Red", "Blue", "Brown"];
  const sizes = ["S", "M", "L", "XL"];

  for (const [mainCat, level1Cats] of Object.entries(level2Map)) {
    for (const [level1Cat, level2Cats] of Object.entries(
      level1Cats as Record<string, any>
    )) {
      for (const [level2Cat, level2Doc] of Object.entries(
        level2Cats as Record<string, any>
      )) {
        const categoryPath = await buildCategoryPath(
          (level2Doc as any)._id.toString()
        );

        /**
         * Create products
         */
        for (let i = 1; i <= 2; i++) {
          const productSlug = `${(level2Doc as any).slug}-product-${i}`;
          const productName = `${level2Cat} Product ${i}`;
          const basePrice = Math.floor(Math.random() * 300) + 50;
          const discountedPrice = basePrice * 0.8;

          /**
           * Create variants
           */
          const variants = [];
          const variantColors = colors.slice(0, 2);
          const variantSizes = sizes.slice(0, 2);

          for (const color of variantColors) {
            for (const size of variantSizes) {
              variants.push({
                attributes: {
                  color,
                  size,
                },
                sku: `${productSlug}-${color.toLowerCase()}-${size}`,
                stock: Math.floor(Math.random() * 20) + 5,
                price: basePrice,
                discountedPrice: discountedPrice,
              });
            }
          }

          products.push({
            name: productName,
            slug: productSlug,
            description: `Premium quality ${productName.toLowerCase()} with modern design.`,
            sku: `SKU-${productSlug.toUpperCase()}`,
            categoryId: (level2Doc as any)._id,
            categoryPath,
            collectionSlugs: getRandomCollections(),
            basePrice,
            baseDiscountedPrice: discountedPrice,
            images: [
              `https://example.com/images/${productSlug}-1.jpg`,
              `https://example.com/images/${productSlug}-2.jpg`,
            ],
            variants,
            isActive: true,
          });
        }
      }
    }
  }

  await Product.insertMany(products);

  return {
    collections: collections.length,
    categories: await Category.countDocuments(),
    products: products.length,
  };
};
