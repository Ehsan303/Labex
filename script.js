// آرایه برای ذخیره محصولات
let products = [];

// تابع تبدیل CSV به آرایه اشیاء با حذف تمام کاماهای اضافی در قیمت
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        // این regex کل مقادیر را جدا می‌کند حتی اگر داخل کوتیشن باشند
        const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
        const values = [];
        let match;
        while ((match = regex.exec(lines[i])) !== null) {
            let val = match[1];
            // حذف کوتیشن دور مقدار (اگر بود)
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1);
            }
            values.push(val);
        }

        if (values.length !== headers.length) {
            console.warn(`خط ${i + 1} ناقص است، رد شد:`, lines[i]);
            continue;
        }

        const obj = {};
        headers.forEach((header, idx) => {
            if (header === 'price') {
                obj[header] = parseInt(values[idx].replace(/,/g, '')) || 0;
            } else {
                obj[header] = values[idx];
            }
        });
        result.push(obj);
    }

    return result;
}


// تابع لود کردن CSV با نمایش دقیق‌تر لاگ‌ها
async function loadProducts() {
    try {
        console.log("شروع fetch فایل data.csv ...");
        const response = await fetch('data.csv');
        console.log("وضعیت پاسخ fetch:", response.status);
        if (!response.ok) {
            throw new Error(`خطا در لود فایل CSV: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();
        const parsedProducts = parseCSV(csvText);
        if (parsedProducts.length > 0) {
            products = parsedProducts;
            console.log('داده‌ها از CSV لود شدند:', products);
        } else {
            throw new Error('فایل CSV خالی یا نامعتبر است');
        }
    } catch (error) {
        console.error('خطا در fetch یا پردازش CSV:', error.message);
        console.warn('استفاده از داده‌های نمونه به جای CSV');
        products = [
            { name: "TSH", model: "96", brand: "Pishtaz", price: 10390000 },
            { name: "TSH", model: "192", brand: "Pishtaz", price: 22500000 },
            { name: "T4", model: "96", brand: "Ideal", price: 10580000 },
            { name: "T3", model: "96", brand: "MonoKit", price: 10560000 },
            { name: "TSH", model: "192", brand: "ideal", price: 22890000 }
        ];
    }
}


// نمایش داده‌ها در جدول
function displayProducts(productsToShow) {
    const tableBody = document.getElementById("productTableBody");
    const productTable = document.getElementById("productTable");
    const tableContainer = document.querySelector(".table-container");

    if (!tableBody || !productTable || !tableContainer) {
        console.error("عنصر جدول پیدا نشد!");
        return;
    }

    tableBody.innerHTML = "";

    if (productsToShow.length > 0) {
        tableContainer.classList.add("show");
        productTable.classList.remove("d-none");

        productsToShow.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.model}</td>
                <td>${product.brand}</td>
                <td>${product.price.toLocaleString("fa-IR")}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        tableContainer.classList.remove("show");
        setTimeout(() => {
            productTable.classList.add("d-none");
        }, 500);
    }
}

// جستجوی محصولات با فیلتر کردن آرایه
function searchProducts() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) {
        console.error("ورودی جستجو پیدا نشد!");
        return;
    }

    const searchTerm = searchInput.value.trim().toLowerCase();
    const tableContainer = document.querySelector(".table-container");

    if (searchTerm === "") {
        tableContainer.classList.remove("show");
        setTimeout(() => {
            document.getElementById("productTable").classList.add("d-none");
        }, 500);
        return;
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.model.toString().toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
    );

    displayProducts(filteredProducts);
}

// رویداد صفحه آماده شد
document.addEventListener("DOMContentLoaded", async () => {
    await loadProducts();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", searchProducts);
    }

    const productTable = document.getElementById("productTable");
    const tableContainer = document.querySelector(".table-container");
    if (productTable && tableContainer) {
        productTable.classList.add("d-none");
        tableContainer.classList.remove("show");
    }
});
