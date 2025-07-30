let products = [];

async function loadProducts() {
  const CACHE_KEY = "labex_cache";
  const CACHE_TIME_KEY = "labex_cache_time";
  const CACHE_VALIDITY_DAYS = 1;

  try {
    const response = await fetch('labex_data.json', { cache: "no-store" });
    if (!response.ok) throw new Error('Failed to fetch JSON');

    const jsonData = await response.json();
    if (Array.isArray(jsonData)) {
      products = jsonData;
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString()); // ذخیره زمان
    } else {
      throw new Error('Invalid JSON structure');
    }
  } catch (error) {
    console.warn("⚠️ دریافت آنلاین با خطا مواجه شد، بررسی کش محلی...");

    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedData && cachedTime) {
      const ageInDays = (Date.now() - parseInt(cachedTime)) / (1000 * 60 * 60 * 24);

      if (ageInDays <= CACHE_VALIDITY_DAYS) {
        products = JSON.parse(cachedData);
        console.log(`✅ داده‌ها از کش معتبر (${ageInDays.toFixed(1)} روز پیش) بارگذاری شد.`);
        return;
      } else {
        console.warn(`⚠️ کش قدیمی (${ageInDays.toFixed(1)} روز)، قابل استفاده نیست.`);
      }
    }

    // اگه نه کش معتبری داشتیم و نه fetch موفق بود:
    const container = document.querySelector(".table-container");
    if (container) {
      container.innerHTML = `
        <p class="text-danger p-3 text-center fw-bold">
          ❌ خطا در بارگذاری اطلاعات.<br>
          لطفاً اتصال اینترنت را بررسی کرده و صفحه را مجدد بارگذاری کنید.
        </p>`;
    }

    products = [];
  }
}


// نمایش محصولات در جدول با fade in/out
function displayProducts(productsToShow) {
  const tbody = document.getElementById('productTableBody');
  const table = document.getElementById('productTable');
  const container = document.querySelector('.table-container');
console.log('Filtered products:', productsToShow);
  if (!tbody || !table || !container) return;

  if (productsToShow.length === 0) {
    // اگر نتیجه‌ای نیست، جدول رو مخفی کن
    container.classList.remove('show');
    table.classList.add('d-none');
    tbody.innerHTML = ''; // پاک کردن سطرها
    return;
  }

  // اگر نتیجه‌ای هست، جدول رو نشون بده و سطرها رو بساز
  tbody.innerHTML = ''; // پاک‌سازی اولیه
console.log('tbody cleared, children count:', tbody.children.length);
console.log('rows added:', tbody.children.length);
console.log('tbody childNodes:', tbody.childNodes);
console.log('Products to show count:', productsToShow.length);

  productsToShow.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.product}</td>
      <td>${p.model}</td>
      <td>${p.brand}</td>
      <td>${p.price.toLocaleString('en-US')}</td>
    `;
    console.log("adding row:", p.product, p.model, p.brand);
    tbody.appendChild(tr);
  });
  console.log('tbody children count after append:', tbody.children.length);
console.log('Table rows count:', tbody.children.length);  

  table.classList.remove('d-none');
  container.classList.add('show');
}


// پر کردن منوی برند به صورت خودکار
function fillBrandFilter() {
  const brandFilter = document.getElementById('brandFilter');
  if (!brandFilter) return;
  brandFilter.innerHTML = '<option value="">Sort by Brand</option>';

  // گرفتن برندهای یکتا با حروف کوچک برای جلوگیری از تکرار
  const brandsSet = new Set();
  products.forEach(p => {
    if (p.brand) brandsSet.add(p.brand.toLowerCase());
  });
  const brands = Array.from(brandsSet).sort();

  brands.forEach(b => {
    const opt = document.createElement('option');
    // حروف بزرگ اول کلمه
    opt.value = b;
    opt.textContent = b.charAt(0).toUpperCase() + b.slice(1);
    brandFilter.appendChild(opt);
  });
}

function filterAndSearch() {
  const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
  const brandValue = document.getElementById('brandFilter').value;
  const priceSortValue = document.getElementById('priceSort').value;

  console.log('Search:', searchValue, 'Brand:', brandValue, 'Sort:', priceSortValue);

  if (searchValue.length === 0) {
    displayProducts([]);
    return;
  }
  // تبدیل جستجو به کلمات جداگانه
  const searchWords = searchValue.split(/\s+/);
  console.log('Search words:', searchWords);

  let filtered = products.filter(p => {
  const combined = `${p.product} ${p.model} ${p.brand}`
    .toLowerCase()
    .replace(/\s+/g, ' ')         // فاصله‌های اضافی بین کلمات
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // حذف کاراکترهای نامرئی
    .trim(); // حذف فاصله ابتدایی و انتهایی
const results = searchWords.map(word => ({
    word,
    includes: combined.includes(word)
  }));
  console.log('Checking product:', p, 'Results:', results);

  return searchWords.every(word => combined.includes(word));
});
  console.log('Filtered count after search:', filtered.length);
  console.log('Filtered items:', filtered);

  if (brandValue !== '') {
    filtered = filtered.filter(p => p.brand.toLowerCase() === brandValue);
  }
  console.log('Filtered count after brand filter:', filtered.length);

  if (priceSortValue === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceSortValue === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  displayProducts(filtered);
}



document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  console.log("Loaded products:", products);
  fillBrandFilter();

  // نمایش اولیه نده (تا کاربر چیزی تایپ کنه)
  displayProducts([]);

  // رویدادهای ورودی کاربر
  document.getElementById('searchInput').addEventListener('input', filterAndSearch);
  document.getElementById('brandFilter').addEventListener('change', filterAndSearch);
  document.getElementById('priceSort').addEventListener('change', filterAndSearch);
  const title = document.querySelector(".title-container");
  const searchFilter = document.querySelector(".search-filter-container");

  // ابتدا fade-in title در وسط صفحه
  setTimeout(() => {
    title.style.opacity = "1";
  }, 200);

  // بعد 2 ثانیه، title به موقعیتش میره و search نمایش داده میشه
  setTimeout(() => {
    title.classList.add("move-to-position");
  }, 400);

  // بعد از حرکت title (یک ثانیه بعد)، نوار جستجو نمایش داده بشه
  setTimeout(() => {
    searchFilter.classList.add("show");
  }, 800);
});