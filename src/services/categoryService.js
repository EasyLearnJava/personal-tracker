const db = require('../db/database');

class CategoryService {
  // Get all categories
  static getAllCategories() {
    return db.readCategories();
  }

  // Get category by ID
  static getCategoryById(id) {
    const categories = db.readCategories();
    return categories.find(c => c.id === id);
  }

  // Get category by name
  static getCategoryByName(name) {
    const categories = db.readCategories();
    return categories.find(c => c.name === name);
  }

  // Add new category
  static addCategory(categoryData) {
    const categories = db.readCategories();
    const newId = Math.max(...categories.map(c => c.id), 0) + 1;
    
    const newCategory = {
      id: newId,
      name: categoryData.name,
      icon: categoryData.icon || '📌',
      color: categoryData.color || '#E0BBE4'
    };

    categories.push(newCategory);
    db.writeCategories(categories);
    return newCategory;
  }

  // Update category
  static updateCategory(id, updateData) {
    const categories = db.readCategories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return null;
    }

    const updated = {
      ...categories[index],
      ...updateData
    };

    categories[index] = updated;
    db.writeCategories(categories);
    return updated;
  }

  // Delete category
  static deleteCategory(id) {
    const categories = db.readCategories();
    const filtered = categories.filter(c => c.id !== id);
    
    if (filtered.length === categories.length) {
      return false;
    }

    db.writeCategories(filtered);
    return true;
  }
}

module.exports = CategoryService;

