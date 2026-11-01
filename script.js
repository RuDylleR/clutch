"use strict";

// Clutch — script.js
// Порядок: общие части страницы → время и год → калькулятор → данные авто →
// главная (превью) → каталог → мобильное меню.
// Все функции безопасны для обеих страниц: если нужного элемента нет, они ничего не делают.


// ---------- Общие части страницы: шапка и футер ----------

const SITE_NAME = "Clutch";
const LOGO_HTML = "CLUTCH<span>.</span>";

// Посилання на спільноту — тільки тут. Discord-запрошення діє 30 днів:
// при заміні міняй лише рядок discord нижче, в HTML нічого чіпати не треба.
const SITE_LINKS = {
    discord: "https://discord.gg/9Vbu4pKhP",
    telegram: "https://t.me/+GKtbCcR9k7EzYzcy"
};

const NAV_LINKS = [
    { href: "index.html#home", label: "Головна", page: "home" },
    { href: "index.html#calculator", label: "Калькулятор" },
    { href: "cars.html", label: "Авто учасників", page: "cars" },
    { href: "index.html#community", label: "Приєднатися", className: "nav__join" },
    { href: "index.html#clubs", label: "Автоклуби" }
];

const currentPage = document.body.dataset.page;

function renderNavLinks() {
    return NAV_LINKS.map((link) => {
        const current = link.page === currentPage ? ' aria-current="page"' : "";
        const className = link.className ? ` class="${link.className}"` : "";

        return `<a href="${link.href}"${className}${current}>${link.label}</a>`;
    }).join("");
}

function renderHeader() {
    const header = document.querySelector("[data-site-header]");

    if (!header) {
        return;
    }

    header.innerHTML = `
        <div class="container header__inner">
            <a class="logo" href="index.html">${LOGO_HTML}</a>

            <nav id="site-nav" class="nav" aria-label="Головна навігація">
                ${renderNavLinks()}
            </nav>

            <div class="kyiv-time">
                <span class="kyiv-time__label">Київ</span>
                <time id="kyiv-time">--:--:--</time>
            </div>

            <button class="menu-toggle" type="button" aria-label="Відкрити меню" aria-expanded="false" aria-controls="site-nav">
                <span></span><span></span><span></span>
            </button>
        </div>
    `;
}

function renderFooter() {
    const footer = document.querySelector("[data-site-footer]");

    if (!footer) {
        return;
    }

    footer.innerHTML = `
        <div class="container footer__inner">
            <div>
                <a class="logo" href="index.html">${LOGO_HTML}</a>
                <p>Створено людьми, які люблять автомобілі.</p>
                <p class="footer__social">
                    <a href="${SITE_LINKS.discord}" target="_blank" rel="noopener noreferrer">Discord</a>
                    <a href="${SITE_LINKS.telegram}" target="_blank" rel="noopener noreferrer">Telegram</a>
                </p>
            </div>

            <nav class="footer__nav" aria-label="Навігація у футері">
                ${renderNavLinks()}
            </nav>

            <p class="footer__copyright">
                © <span id="current-year">${new Date().getFullYear()}</span> ${SITE_NAME}
            </p>
        </div>
    `;
}

// Ссылки в HTML с data-link="discord" / "telegram" берут адрес из SITE_LINKS
function applySiteLinks() {
    document.querySelectorAll("[data-link]").forEach((link) => {
        const url = SITE_LINKS[link.dataset.link];

        if (url) {
            link.href = url;
        }
    });
}

// Шапка и футер должны появиться до всего остального:
// ниже скрипт ищет в них #kyiv-time и кнопку меню.
renderHeader();
renderFooter();
applySiteLinks();


// ---------- Время в Киеве ----------

const kyivTimeElement = document.getElementById("kyiv-time");

function updateKyivTime() {
    if (!kyivTimeElement) {
        return;
    }

    kyivTimeElement.textContent = new Intl.DateTimeFormat("uk-UA", {
        timeZone: "Europe/Kyiv",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date());
}

updateKyivTime();
setInterval(updateKyivTime, 1000);


// ---------- Калькулятор (только index.html) ----------

const fmt = (n, digits = 1) => n.toLocaleString("uk-UA", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
});

// Положительное число из поля или null, если поле пустое / неверное
function readPositive(id) {
    const element = document.getElementById(id);

    if (!element || element.value.trim() === "") {
        return null;
    }

    const value = Number(element.value);

    return Number.isFinite(value) && value > 0 ? value : null;
}

// к.с./т, кг/к.с., кВт
function metrics(power, weight) {
    return {
        ratio: power * 1000 / weight,
        kg: weight / power,
        kw: power * 0.73549875
    };
}

// Режим «Один автомобіль»

const resultElement = document.getElementById("power-to-weight");

function calculatePowerToWeight() {
    if (!resultElement) {
        return;
    }

    const power = readPositive("power");
    const weight = readPositive("weight");
    const error = document.getElementById("single-error");

    if (power === null || weight === null) {
        resultElement.textContent = "—";
        document.getElementById("kg-per-hp").textContent = "—";
        document.getElementById("power-kw").textContent = "—";
        error.textContent = "Введіть додатні значення потужності та маси.";
        return;
    }

    error.textContent = "";

    const result = metrics(power, weight);

    resultElement.textContent = fmt(result.ratio);
    document.getElementById("kg-per-hp").textContent = fmt(result.kg, 2);
    document.getElementById("power-kw").textContent = fmt(result.kw);
}

const calculateButton = document.getElementById("calculate-button");

if (calculateButton) {
    calculateButton.addEventListener("click", calculatePowerToWeight);
}

// Enter в поле запускает расчёт
function onEnter(id, handler) {
    const input = document.getElementById(id);

    if (input) {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                handler();
            }
        });
    }
}

onEnter("power", calculatePowerToWeight);
onEnter("weight", calculatePowerToWeight);

// Вкладки

const tabSingle = document.getElementById("tab-single");
const tabCompare = document.getElementById("tab-compare");

function selectCalcTab(compare) {
    if (!tabSingle || !tabCompare) {
        return;
    }

    tabSingle.classList.toggle("is-active", !compare);
    tabCompare.classList.toggle("is-active", compare);
    tabSingle.setAttribute("aria-selected", String(!compare));
    tabCompare.setAttribute("aria-selected", String(compare));
    document.getElementById("panel-single").hidden = compare;
    document.getElementById("panel-compare").hidden = !compare;
}

if (tabSingle) {
    tabSingle.addEventListener("click", () => selectCalcTab(false));
}

if (tabCompare) {
    tabCompare.addEventListener("click", () => selectCalcTab(true));
}

// Режим «Порівняння»

function compareCars() {
    const aPower = readPositive("compare-power-a");
    const aWeight = readPositive("compare-weight-a");
    const bPower = readPositive("compare-power-b");
    const bWeight = readPositive("compare-weight-b");

    const error = document.getElementById("compare-error");
    const note = document.getElementById("compare-note");
    const panels = [
        document.getElementById("compare-results-a"),
        document.getElementById("compare-results-b")
    ];

    // Сброс предыдущего результата
    panels.forEach((panel) => {
        panel.querySelectorAll("strong").forEach((element) => {
            element.textContent = "—";
            element.classList.remove("is-winner");
        });
    });

    if ([aPower, aWeight, bPower, bWeight].some((value) => value === null)) {
        error.textContent = "Введіть додатні значення потужності та маси для обох авто.";
        note.textContent = "Введіть характеристики обох автомобілів.";
        return;
    }

    error.textContent = "";

    const results = [metrics(aPower, aWeight), metrics(bPower, bWeight)];

    results.forEach((result, i) => {
        const other = results[1 - i];

        for (const key of ["ratio", "kg", "kw"]) {
            const element = panels[i].querySelector(`[data-metric="${key}"]`);

            element.textContent = fmt(result[key], key === "kg" ? 2 : 1);

            if (result[key] === other[key]) {
                continue;
            }

            // Для кг/к.с. лучше меньшее значение, для остальных — большее
            const isBetter = key === "kg" ? result[key] < other[key] : result[key] > other[key];

            if (isBetter) {
                element.classList.add("is-winner");
            }
        }
    });

    const difference = Math.abs(results[0].ratio - results[1].ratio);

    if (difference < 0.00001) {
        note.textContent = "Питома потужність однакова.";
        return;
    }

    const winner = results[0].ratio > results[1].ratio ? "A" : "B";
    const percent = difference / Math.min(results[0].ratio, results[1].ratio) * 100;

    note.textContent = `Перевага автомобіля ${winner}: +${fmt(difference)} к.с./т (+${fmt(percent)}%).`;
}

const compareButton = document.getElementById("compare-button");

if (compareButton) {
    compareButton.addEventListener("click", compareCars);
}

["compare-power-a", "compare-weight-a", "compare-power-b", "compare-weight-b"]
    .forEach((id) => onEnter(id, compareCars));


// ---------- Данные авто (cars.json) ----------

const CARS_URL = "cars.json";

let carsPromise = null;

// Файл загружается один раз; главная и каталог получают один и тот же список
function loadCars() {
    if (!carsPromise) {
        carsPromise = fetch(CARS_URL).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return response.json();
        });
    }

    return carsPromise;
}

// Любой текст из данных вставляется в HTML только через эту функцию
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function carName(car) {
    return `${car.brand} ${car.model}`;
}

// id из cars.json; если его забыли — собираем из марки, модели и года
function carId(car) {
    return car.id || `${car.brand}-${car.model}-${car.year}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function carUrl(car) {
    return `car.html?id=${encodeURIComponent(carId(car))}`;
}

function powerToWeight(car) {
    return metrics(car.power, car.weight).ratio;
}

function showCarsError(container, error) {
    console.error("Не вдалося завантажити cars.json:", error);

    // Страница открыта прямо с диска (file://) — браузер блокирует fetch
    const hint = location.protocol === "file:"
        ? " Схоже, сторінку відкрито напряму з диска: запусти сайт через локальний сервер (див. README.md)."
        : " Спробуй оновити сторінку.";

    container.innerHTML = `<p class="cars-message">Не вдалося завантажити список авто.${hint}</p>`;
}


// ---------- Калькулятор: авто из каталога и ссылки ?car= / ?compare= ----------

const carSelects = document.querySelectorAll("[data-fill]");

// Какие поля калькулятора заполняет каждый select
const FILL_TARGETS = {
    single: ["power", "weight"],
    a: ["compare-power-a", "compare-weight-a"],
    b: ["compare-power-b", "compare-weight-b"]
};

function fillCalculator(target, car) {
    const [powerId, weightId] = FILL_TARGETS[target];

    document.getElementById(powerId).value = car.power;
    document.getElementById(weightId).value = car.weight;
    document.querySelector(`[data-fill="${target}"]`).value = carId(car);
}

function compareInputsFilled() {
    return [...FILL_TARGETS.a, ...FILL_TARGETS.b].every((id) => readPositive(id) !== null);
}

// ?compare=id1,id2 открывает «Порівняння», ?car=id — «Один автомобіль»
function applyCalculatorQuery(cars) {
    const params = new URLSearchParams(location.search);
    const findCar = (id) => cars.find((car) => carId(car) === id);

    const pair = (params.get("compare") || "").split(",").map(findCar);
    const single = findCar(params.get("car"));

    if (pair.length === 2 && pair.every(Boolean)) {
        selectCalcTab(true);
        fillCalculator("a", pair[0]);
        fillCalculator("b", pair[1]);
        compareCars();
    } else if (single) {
        fillCalculator("single", single);
        calculatePowerToWeight();
    }
}

function initCalculatorPickers(cars) {
    const options = cars.map((car) => `
        <option value="${escapeHTML(carId(car))}">
            ${escapeHTML(carName(car))} ${escapeHTML(car.year)} · ${escapeHTML(car.power)} к.с. · ${escapeHTML(car.weight)} кг
        </option>
    `).join("");

    carSelects.forEach((select) => {
        const target = select.dataset.fill;

        select.insertAdjacentHTML("beforeend", options);
        select.closest(".form-group").hidden = false;

        select.addEventListener("change", () => {
            const car = cars.find((item) => carId(item) === select.value);

            if (!car) {
                return;
            }

            fillCalculator(target, car);

            if (target === "single") {
                calculatePowerToWeight();
            } else if (compareInputsFilled()) {
                compareCars();
            }
        });

        // Ручной ввод означает, что это уже не авто из списка
        FILL_TARGETS[target].forEach((id) => {
            document.getElementById(id).addEventListener("input", () => {
                select.value = "";
            });
        });
    });

    applyCalculatorQuery(cars);
}

if (carSelects.length > 0) {
    loadCars()
        .then(initCalculatorPickers)
        .catch((error) => console.error("Калькулятор без списка авто:", error));
}


// ---------- Главная: превью авто ----------

const carsPreview = document.getElementById("cars-preview");

function createPreviewCard(car) {
    return `
        <a class="car-card" href="${carUrl(car)}">
            <div class="car-card__image">
                <img
                    src="${escapeHTML(car.image)}"
                    alt="${escapeHTML(carName(car))} ${escapeHTML(car.year)}"
                    loading="lazy"
                >
            </div>

            <div class="car-card__content">
                <p class="car-card__year">${escapeHTML(car.year)}</p>
                <h3>${escapeHTML(carName(car))}</h3>
                <p>${escapeHTML(car.engine)} · ${escapeHTML(car.transmission)} · ${escapeHTML(car.drive)}</p>

                <div class="car-card__specs">
                    <span>${escapeHTML(car.power)} к.с.</span>
                    <span>${escapeHTML(car.weight)} кг</span>
                </div>
            </div>
        </a>
    `;
}

function renderPreview(cars) {
    // На главной показываем авто с "featured": true (не больше трёх)
    const featured = cars.filter((car) => car.featured).slice(0, 3);

    carsPreview.innerHTML = featured.map(createPreviewCard).join("");
}

if (carsPreview) {
    loadCars()
        .then(renderPreview)
        .catch((error) => showCarsError(carsPreview, error));
}


// ---------- Каталог (cars.html) ----------

const carsGrid = document.getElementById("cars-grid");

function createCarCard(car) {
    const ratio = powerToWeight(car).toFixed(1);

    return `
        <article class="catalog-car">
            <div class="catalog-car__image">
                <img
                    src="${escapeHTML(car.image)}"
                    alt="${escapeHTML(carName(car))} ${escapeHTML(car.year)}"
                    loading="lazy"
                >

                <span class="catalog-car__ratio">${ratio} к.с./т</span>
            </div>

            <div class="catalog-car__content">
                <p class="catalog-car__year">${escapeHTML(car.year)}</p>
                <h3><a class="catalog-car__link" href="${carUrl(car)}">${escapeHTML(carName(car))}</a></h3>
                <p class="catalog-car__engine">
                    ${escapeHTML(car.engine)} · ${escapeHTML(car.transmission)} · ${escapeHTML(car.drive)}
                </p>

                <div class="catalog-car__specs">
                    <div class="catalog-car__spec">
                        <span>Потужність</span>
                        <strong>${escapeHTML(car.power)} к.с.</strong>
                    </div>

                    <div class="catalog-car__spec">
                        <span>Маса</span>
                        <strong>${escapeHTML(car.weight)} кг</strong>
                    </div>

                    <div class="catalog-car__spec">
                        <span>Привід</span>
                        <strong>${escapeHTML(car.drive)}</strong>
                    </div>
                </div>
            </div>

            <button
                class="compare-toggle"
                type="button"
                data-id="${escapeHTML(carId(car))}"
                aria-pressed="false"
                aria-label="Порівняти: ${escapeHTML(carName(car))}"
            >+ Порівняти</button>
        </article>
    `;
}

// Сортировка: значение select → функция сравнения ("default" = порядок из cars.json)
const SORTERS = {
    "power-desc": (a, b) => b.power - a.power,
    "power-asc": (a, b) => a.power - b.power,
    "ratio-desc": (a, b) => powerToWeight(b) - powerToWeight(a),
    "ratio-asc": (a, b) => powerToWeight(a) - powerToWeight(b),
    "year-desc": (a, b) => b.year - a.year,
    "year-asc": (a, b) => a.year - b.year
};

function initCatalog(cars) {
    const searchInput = document.getElementById("car-search");
    const driveFilter = document.getElementById("drive-filter");
    const transmissionFilter = document.getElementById("transmission-filter");
    const sortFilter = document.getElementById("sort-filter");
    const carsCount = document.getElementById("cars-count");
    const carsEmpty = document.getElementById("cars-empty");

    const compareBar = document.getElementById("compare-bar");
    const compareBarText = document.getElementById("compare-bar-text");
    const compareGo = document.getElementById("compare-go");

    // id выбранных авто в порядке выбора; больше двух не бывает
    const selectedIds = [];

    function updateCompareBar() {
        carsGrid.querySelectorAll(".compare-toggle").forEach((button) => {
            const selected = selectedIds.includes(button.dataset.id);

            button.setAttribute("aria-pressed", String(selected));
            button.textContent = selected ? "✓ Обрано" : "+ Порівняти";
        });

        compareBar.hidden = selectedIds.length === 0;

        if (selectedIds.length === 0) {
            return;
        }

        const names = selectedIds.map((id) => carName(cars.find((car) => carId(car) === id)));

        if (selectedIds.length === 1) {
            compareBarText.textContent = `${names[0]} — обери ще одне авто для порівняння або відкрий його в калькуляторі`;
            compareGo.textContent = "У калькулятор";
            compareGo.href = `index.html?car=${encodeURIComponent(selectedIds[0])}#calculator`;
        } else {
            compareBarText.textContent = `${names[0]} ↔ ${names[1]}`;
            compareGo.textContent = "Порівняти";
            compareGo.href = `index.html?compare=${selectedIds.map(encodeURIComponent).join(",")}#calculator`;
        }
    }

    carsGrid.addEventListener("click", (event) => {
        const button = event.target.closest(".compare-toggle");

        if (!button) {
            return;
        }

        const index = selectedIds.indexOf(button.dataset.id);

        if (index >= 0) {
            selectedIds.splice(index, 1);
        } else {
            selectedIds.push(button.dataset.id);

            // третье авто вытесняет самое раннее выбранное
            if (selectedIds.length > 2) {
                selectedIds.shift();
            }
        }

        updateCompareBar();
    });

    document.getElementById("compare-clear").addEventListener("click", () => {
        selectedIds.length = 0;
        updateCompareBar();
    });

    function updateCars() {
        const search = searchInput.value.trim().toLowerCase();

        let result = cars.filter((car) => {
            return (search === "" || carName(car).toLowerCase().includes(search))
                && (driveFilter.value === "all" || car.drive === driveFilter.value)
                && (transmissionFilter.value === "all" || car.transmission === transmissionFilter.value);
        });

        const sorter = SORTERS[sortFilter.value];

        if (sorter) {
            result = result.sort(sorter);
        }

        carsGrid.innerHTML = result.map(createCarCard).join("");
        carsCount.textContent = result.length;
        carsEmpty.hidden = result.length > 0;

        updateCompareBar();
    }

    function resetFilters() {
        searchInput.value = "";
        driveFilter.value = "all";
        transmissionFilter.value = "all";
        sortFilter.value = "default";

        updateCars();
    }

    searchInput.addEventListener("input", updateCars);
    driveFilter.addEventListener("change", updateCars);
    transmissionFilter.addEventListener("change", updateCars);
    sortFilter.addEventListener("change", updateCars);

    document.getElementById("filters-reset").addEventListener("click", resetFilters);
    document.getElementById("empty-reset").addEventListener("click", resetFilters);

    updateCars();
}

if (carsGrid) {
    loadCars()
        .then(initCatalog)
        .catch((error) => showCarsError(carsGrid, error));
}


// ---------- Страница авто (car.html?id=...) ----------

const carDetail = document.getElementById("car-detail");

// Необязательные поля: показываются, только если заполнены в cars.json
const OPTIONAL_SPECS = [
    { key: "torque", label: "Крутний момент", unit: "Нм" },
    { key: "acceleration", label: "Розгін 0–100", unit: "с" },
    { key: "owner", label: "Власник", unit: "" },
    { key: "city", label: "Місто", unit: "" }
];

function createSpec(label, value) {
    return `
        <div class="car-spec">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `;
}

function createCarDetail(car, cars) {
    const stats = metrics(car.power, car.weight);

    // Место среди всех авто по питомой потужности
    const rank = [...cars].sort((a, b) => powerToWeight(b) - powerToWeight(a))
        .findIndex((other) => carId(other) === carId(car)) + 1;

    const specs = [
        createSpec("Потужність", `${car.power} к.с.`),
        createSpec("Маса", `${car.weight} кг`),
        createSpec("кВт", fmt(stats.kw)),
        createSpec("кг / к.с.", fmt(stats.kg, 2)),
        createSpec("Двигун", car.engine),
        createSpec("Коробка", car.transmission),
        createSpec("Привід", car.drive),
        createSpec("Рік", car.year)
    ];

    OPTIONAL_SPECS.forEach(({ key, label, unit }) => {
        if (car[key]) {
            specs.push(createSpec(label, unit ? `${car[key]} ${unit}` : car[key]));
        }
    });

    const description = car.description
        ? `<p class="car-detail__description">${escapeHTML(car.description)}</p>`
        : "";

    return `
        <div class="car-detail__image">
            <img src="${escapeHTML(car.image)}" alt="${escapeHTML(carName(car))} ${escapeHTML(car.year)}">
        </div>

        <div class="car-detail__info">
            <p class="car-detail__year">${escapeHTML(car.year)}</p>
            <h1>${escapeHTML(carName(car))}</h1>
            <p class="car-detail__engine">
                ${escapeHTML(car.engine)} · ${escapeHTML(car.transmission)} · ${escapeHTML(car.drive)}
            </p>

            <div class="car-detail__ratio">
                <p>Питома потужність</p>
                <strong>${fmt(stats.ratio)}</strong>
                <span>к.с. / тонну${cars.length > 1 ? ` · №${rank} з ${cars.length} серед авто учасників` : ""}</span>
            </div>

            <div class="car-specs">${specs.join("")}</div>

            ${description}

            <div class="car-detail__actions">
                <a class="button button--primary" href="cars.html">← До каталогу</a>
                <a class="button button--secondary" href="index.html?car=${encodeURIComponent(carId(car))}#calculator">У калькулятор</a>
                ${cars.length > 1 ? `
                    <select class="catalog-select" id="car-compare" aria-label="Порівняти з іншим авто">
                        <option value="">Порівняти з…</option>
                        ${cars.filter((other) => carId(other) !== carId(car)).map((other) => `
                            <option value="${escapeHTML(carId(other))}">${escapeHTML(carName(other))} ${escapeHTML(other.year)}</option>
                        `).join("")}
                    </select>
                ` : ""}
            </div>
        </div>
    `;
}

function createCarNotFound() {
    return `
        <div class="cars-message car-detail__empty">
            <p>Такого автомобіля немає в каталозі.</p>
            <a class="button button--primary" href="cars.html">Дивитися всі авто</a>
        </div>
    `;
}

function renderCarPage(cars) {
    const id = new URLSearchParams(location.search).get("id");
    const car = cars.find((item) => carId(item) === id);

    if (!car) {
        document.title = "Авто не знайдено — Clutch";
        carDetail.innerHTML = createCarNotFound();
        return;
    }

    const stats = metrics(car.power, car.weight);

    document.title = `${carName(car)} ${car.year} — ${SITE_NAME}`;
    document.querySelector('meta[name="description"]').content =
        `${carName(car)} ${car.year}: ${car.engine}, ${car.transmission}, ${car.drive}, ` +
        `${car.power} к.с., ${car.weight} кг, ${fmt(stats.ratio)} к.с./т.`;

    carDetail.innerHTML = createCarDetail(car, cars);

    const compareSelect = document.getElementById("car-compare");

    if (compareSelect) {
        compareSelect.addEventListener("change", () => {
            location.href = `index.html?compare=${encodeURIComponent(carId(car))},${encodeURIComponent(compareSelect.value)}#calculator`;
        });

        // После «Назад» браузер оставляет выбранное значение — сбрасываем
        window.addEventListener("pageshow", () => {
            compareSelect.value = "";
        });
    }

    // «Інші авто»: до трёх других машин
    const others = cars.filter((item) => carId(item) !== carId(car)).slice(0, 3);
    const othersSection = document.getElementById("car-others");

    if (othersSection && others.length > 0) {
        document.getElementById("car-others-grid").innerHTML = others.map(createPreviewCard).join("");
        othersSection.hidden = false;
    }
}

if (carDetail) {
    loadCars()
        .then(renderCarPage)
        .catch((error) => showCarsError(carDetail, error));
}


// ---------- Мобильное меню ----------

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");

if (menuToggle && siteNav) {
    const setMenu = (opened) => {
        siteNav.classList.toggle("nav--open", opened);
        menuToggle.setAttribute("aria-expanded", String(opened));
        menuToggle.setAttribute("aria-label", opened ? "Закрити меню" : "Відкрити меню");
    };

    menuToggle.addEventListener("click", () => {
        setMenu(!siteNav.classList.contains("nav--open"));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenu(false);
        }
    });

    document.addEventListener("click", (event) => {
        if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
            setMenu(false);
        }
    });
}
