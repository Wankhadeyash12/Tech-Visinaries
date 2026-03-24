// Slug Generation Service
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
};

const createUniqueSlug = (baseSlug) => {
  return `${baseSlug}-${Date.now()}`;
};

module.exports = {
  generateSlug,
  createUniqueSlug,
};
