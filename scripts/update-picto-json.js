#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to automatically update pictogram JSON files with webp image paths
 * Run: node scripts/update-picto-json.js
 */

const PICTOS_DIR = path.join(__dirname, '../assets/pictos');
const DATA_DIR = path.join(__dirname, '../data/pictograms');

// Normalize ID for matching (handle _ and - differences)
function normalizeId(id) {
  return id.toLowerCase().replace(/[-_]/g, '');
}

// Get all webp files for a category
function getWebpFilesForCategory(category) {
  const categoryDir = path.join(PICTOS_DIR, category);

  if (!fs.existsSync(categoryDir)) {
    return [];
  }

  const files = fs.readdirSync(categoryDir);
  return files
    .filter(file => file.endsWith('.webp'))
    .map(file => ({
      filename: file,
      basename: file.replace('.webp', ''),
      normalized: normalizeId(file.replace('.webp', ''))
    }));
}

// Update a single JSON file
function updateCategoryJson(category) {
  const jsonPath = path.join(DATA_DIR, `${category}.json`);

  if (!fs.existsSync(jsonPath)) {
    console.log(`⚠️  No JSON file found for category: ${category}`);
    return { updated: 0, total: 0 };
  }

  // Read JSON
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(jsonContent);

  // Get available webp files
  const webpFiles = getWebpFilesForCategory(category);

  if (webpFiles.length === 0) {
    console.log(`📂 ${category}: No webp images found`);
    return { updated: 0, total: data.pictograms?.length || 0 };
  }

  // Create a map for quick lookup
  const webpMap = {};
  for (const file of webpFiles) {
    webpMap[file.normalized] = file.filename;
  }

  // Update pictograms
  let updatedCount = 0;

  if (data.pictograms && Array.isArray(data.pictograms)) {
    for (const picto of data.pictograms) {
      const normalizedId = normalizeId(picto.id);

      // Check if we have a matching webp file
      if (webpMap[normalizedId]) {
        const webpPath = `assets/pictos/${category}/${webpMap[normalizedId]}`;

        // Only update if it's currently an emoji (not already a path)
        if (!picto.image.includes('.webp')) {
          picto.image = webpPath;
          updatedCount++;
        }
      }
    }
  }

  // Write back to file (with pretty formatting)
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');

  return {
    updated: updatedCount,
    total: data.pictograms?.length || 0,
    category: category
  };
}

// Main function
function updateAllCategories() {
  console.log('🔍 Scanning for categories with webp images...\n');

  // Get all category folders in assets/pictos
  const categories = fs.readdirSync(PICTOS_DIR)
    .filter(item => {
      const itemPath = path.join(PICTOS_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    });

  if (categories.length === 0) {
    console.log('❌ No category folders found in assets/pictos/');
    return;
  }

  let totalUpdated = 0;
  let totalPictos = 0;
  const results = [];

  for (const category of categories) {
    const result = updateCategoryJson(category);
    totalUpdated += result.updated;
    totalPictos += result.total;

    if (result.total > 0) {
      results.push(result);

      if (result.updated > 0) {
        console.log(`✅ ${category}: ${result.updated}/${result.total} pictograms updated`);
      } else {
        console.log(`   ${category}: ${result.total} pictograms (already up to date)`);
      }
    }
  }

  console.log(`\n✨ Done! Updated ${totalUpdated} pictograms across ${results.length} categories`);

  if (totalUpdated > 0) {
    console.log('\n💡 Next step: Run "npm run generate-pictos" to update the image mapping');
  }
}

// Run
try {
  updateAllCategories();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
