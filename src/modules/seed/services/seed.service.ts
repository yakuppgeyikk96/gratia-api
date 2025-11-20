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
   * Helper function to get category-specific image seed
   * Her kategori için farklı bir seed ID döndürür
   */
  const getCategoryImageSeed = (
    categoryName: string,
    color: string,
    index: number
  ): number => {
    const categorySeeds: Record<string, number> = {
      Jackets: 100,
      "T-Shirts": 200,
      Jeans: 300,
      Sneakers: 400,
      Boots: 500,
      Sandals: 600,
    };
    const colorSeeds: Record<string, number> = {
      black: 0,
      white: 10,
      red: 20,
      blue: 30,
    };
    const baseSeed = categorySeeds[categoryName] || 0;
    const colorSeed = colorSeeds[color] || 0;
    return baseSeed + colorSeed + index;
  };

  /**
   * Create products (each variant is now a separate product)
   */
  const products: any[] = [];
  const colors = ["black", "white", "red", "blue"]; // Lowercase for standardization
  const sizes = ["S", "M", "L", "XL"]; // Uppercase for standardization

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
         * Create product groups (each with multiple variants)
         */
        for (let i = 1; i <= 2; i++) {
          const baseProductSlug = `${(level2Doc as any).slug}-product-${i}`;
          const baseProductName = `${level2Cat} Product ${i}`;
          const basePrice = Math.floor(Math.random() * 300) + 50;
          const discountedPrice = Math.round(basePrice * 0.8);

          // Generate a unique product group ID
          const productGroupId = `pg_${baseProductSlug}`;

          // Select colors and sizes for this product group
          const variantColors = colors.slice(0, 2);
          const variantSizes = sizes.slice(0, 2);

          /**
           * Create individual products for each color+size combination
           */
          for (const color of variantColors) {
            for (const size of variantSizes) {
              const variantSlug = `${baseProductSlug}-${color}-${size.toLowerCase()}`;
              const variantSku = `SKU-${variantSlug.toUpperCase()}`;

              // Color ve size bilgisini isme ekle
              const variantName = `${baseProductName} - ${
                color.charAt(0).toUpperCase() + color.slice(1)
              } ${size}`;

              products.push({
                name: variantName,
                slug: variantSlug,
                description: `Premium quality ${baseProductName.toLowerCase()} with modern design. Available in ${color} color and ${size} size.`,
                sku: variantSku,
                categoryId: (level2Doc as any)._id,
                categoryPath,
                collectionSlugs: getRandomCollections(),
                price: basePrice,
                discountedPrice: discountedPrice,
                stock: Math.floor(Math.random() * 50) + 10,
                attributes: {
                  color,
                  size,
                },
                images: [
                  `https://picsum.photos/seed/${getCategoryImageSeed(
                    level2Cat,
                    color,
                    1
                  )}/800/800`,
                  `https://picsum.photos/seed/${getCategoryImageSeed(
                    level2Cat,
                    color,
                    2
                  )}/800/800`,
                  `https://picsum.photos/seed/${getCategoryImageSeed(
                    level2Cat,
                    color,
                    3
                  )}/800/800`,
                ],
                productGroupId,
                isActive: true,
              });
            }
          }
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
