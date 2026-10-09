// ========== تبدیل تاریخ میلادی به شمسی ==========
function getJalaliDate(date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  const gy2 = (gy <= 1600) ? (gy - 621) : (gy - 1600);
  const gm2 = gm - 1;
  let days = (365 * gy2) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm2];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm, jd;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

// ========== تبدیل شمسی به میلادی ==========
function jalaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 1; gm <= 12; gm++) {
    if (gd <= sal_a[gm]) break;
    gd -= sal_a[gm];
  }
  return { gy, gm, gd };
}

const monthNames = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const weekDays = ["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"];

function toPersianNum(num) {
  return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

// ========== ساعت زنده بالای صفحه ==========
function updateLiveClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const clockEl = document.getElementById('liveClock');
  const dateEl = document.getElementById('liveDate');
  if (clockEl) clockEl.textContent = toPersianNum(h + ':' + m + ':' + s);

  const j = getJalaliDate(now);
  const dayName = weekDays[now.getDay()];
  if (dateEl) {
    dateEl.textContent = toPersianNum(`${dayName} ${j.jd} ${monthNames[j.jm - 1]} ${j.jy}`);
  }
}

updateLiveClock();
setInterval(updateLiveClock, 1000);

// ========== پیدا کردن شنبه بعدی ==========
function getNextSaturday() {
  const today = new Date();
  const currentDay = today.getDay(); // 0=یکشنبه ... 6=شنبه

  // فاصله تا شنبه بعدی
  // اگه امروز شنبه بود، ۷ روز بعد (شنبه هفته بعد)
  // اگه امروز جمعه بود (5)، ۱ روز بعد
  let daysUntilSaturday = (6 - currentDay + 7) % 7;
  if (daysUntilSaturday === 0) daysUntilSaturday = 7; // اگه امروز شنبه بود، برو هفته بعد

  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday;
}

// ========== پر کردن Select ها ==========
function fillDatePickers() {
  // تاریخ پیش‌فرض: شنبه هفته بعد
  const nextSaturday = getNextSaturday();
  const jDefault = getJalaliDate(nextSaturday);

  // سال‌ها: از امسال تا ۵ سال بعد
  const yearSelect = document.getElementById('yearSelect');
  for (let y = jDefault.jy; y <= jDefault.jy + 5; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = toPersianNum(y);
    yearSelect.appendChild(opt);
  }
  yearSelect.value = jDefault.jy;

  // ماه‌ها
  const monthSelect = document.getElementById('monthSelect');
  monthNames.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = name;
    monthSelect.appendChild(opt);
  });
  monthSelect.value = jDefault.jm;

  // روزها - اول با ماه پیش‌فرض پر کن
  updateDays();
  // بعد روز پیش‌فرض (شنبه) رو انتخاب کن
  document.getElementById('daySelect').value = jDefault.jd;

  // ساعت‌ها (۰ تا ۲۳) - با گزینه خالی "انتخاب کنید"
  const hourSelect = document.getElementById('hourSelect');
  const emptyHour = document.createElement('option');
  emptyHour.value = "";
  emptyHour.textContent = "ساعت";
  emptyHour.disabled = true;
  emptyHour.selected = true;
  hourSelect.appendChild(emptyHour);

  for (let h = 0; h <= 23; h++) {
    const opt = document.createElement('option');
    opt.value = h;
    opt.textContent = toPersianNum(String(h).padStart(2, '0'));
    hourSelect.appendChild(opt);
  }

  // دقیقه‌ها (هر ۵ دقیقه) - با گزینه خالی "دقیقه"
  const minuteSelect = document.getElementById('minuteSelect');
  const emptyMinute = document.createElement('option');
  emptyMinute.value = "";
  emptyMinute.textContent = "دقیقه";
  emptyMinute.disabled = true;
  emptyMinute.selected = true;
  minuteSelect.appendChild(emptyMinute);

  for (let m = 0; m <= 55; m += 5) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = toPersianNum(String(m).padStart(2, '0'));
    minuteSelect.appendChild(opt);
  }

  // تغییر ماه یا سال → روزها آپدیت بشن
  monthSelect.addEventListener('change', updateDays);
  yearSelect.addEventListener('change', updateDays);
}

// ========== تعداد روزهای ماه شمسی ==========
function getDaysInJalaliMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const isLeap = ((jy + 12) % 33) % 4 === 1;
  return isLeap ? 30 : 29;
}

function updateDays() {
  const jy = parseInt(document.getElementById('yearSelect').value);
  const jm = parseInt(document.getElementById('monthSelect').value);
  const daySelect = document.getElementById('daySelect');
  const currentDay = parseInt(daySelect.value) || 1;

  daySelect.innerHTML = '';
  const daysCount = getDaysInJalaliMonth(jy, jm);
  for (let d = 1; d <= daysCount; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = toPersianNum(d);
    daySelect.appendChild(opt);
  }
  daySelect.value = Math.min(currentDay, daysCount);
}

fillDatePickers();

// ========== دکمه نه که فرار می‌کنه ==========
let noCount = 0;
const noTexts = ["نه 🙈", "مطمئنی؟ 🥺", "یه بار دیگه فکر کن 😢", "دلم می‌شکنه 💔", "بگو آره دیگه 🥹", "قبول کن دیگه 😭", "نه رو بزن ولی... 😅"];

function moveNoBtn() {
  const btn = document.getElementById('noBtn');
  noCount++;
  btn.textContent = noTexts[Math.min(noCount, noTexts.length - 1)];
  const x = (Math.random() - 0.5) * 200;
  const y = (Math.random() - 0.5) * 200;
  btn.style.transform = `translate(${x}px, ${y}px)`;
  btn.style.transition = 'transform 0.3s ease';
}

// ========== پاسخ مثبت با تاریخ و ساعت انتخابی ==========
function sayYes() {
  const jy = parseInt(document.getElementById('yearSelect').value);
  const jm = parseInt(document.getElementById('monthSelect').value);
  const jd = parseInt(document.getElementById('daySelect').value);
  const hourValue = document.getElementById('hourSelect').value;
  const minuteValue = document.getElementById('minuteSelect').value;

  // بررسی انتخاب ساعت و دقیقه
  if (hourValue === "" || minuteValue === "") {
    alert("لطفاً ساعت و دقیقه دیت رو انتخاب کن عزیزم 💕");
    return;
  }

  const hour = parseInt(hourValue);
  const minute = parseInt(minuteValue);

  // محاسبه روز هفته
  const g = jalaliToGregorian(jy, jm, jd);
  const gDate = new Date(g.gy, g.gm - 1, g.gd);
  const dayName = weekDays[gDate.getDay()];

  document.getElementById('responseDate').textContent =
    toPersianNum(`${dayName} ${jd} ${monthNames[jm - 1]} ${jy}`);
  document.getElementById('responseTime').textContent =
    toPersianNum(`ساعت ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);

  document.getElementById('mainPage').style.display = 'none';
  document.getElementById('responsePage').style.display = 'block';

  // انفجار قلب
  for (let i = 0; i < 30; i++) {
    setTimeout(createHeart, i * 60);
  }
}

function goBack() {
  document.getElementById('responsePage').style.display = 'none';
  document.getElementById('mainPage').style.display = 'block';
  const btn = document.getElementById('noBtn');
  btn.style.transform = 'translate(0,0)';
  btn.textContent = "نه 🙈";
  noCount = 0;
}

// ========== قلب‌های شناور ==========
function createHeart() {
  const heart = document.createElement('div');
  heart.classList.add('heart');
  heart.textContent = ['❤️','💕','💖','💗','🌹','💘'][Math.floor(Math.random() * 6)];
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (15 + Math.random() * 25) + 'px';
  heart.style.animationDuration = (4 + Math.random() * 4) + 's';
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 8000);
}

for (let i = 0; i < 10; i++) {
  setTimeout(createHeart, i * 400);
}
setInterval(createHeart, 800);