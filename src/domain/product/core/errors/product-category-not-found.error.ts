export class ProductCategoryNotFound extends Error {
  constructor(categoryId: number) {
    super(`Product category with ID "${categoryId}" not found.`);
  }
}
