/** ==========================================================================
 *  KC WATER POS SYSTEM - CONFIGURATION & UTILITIES (pos-config.js)
 *  (Supabase Client, Global App State & Telegram Alerts)
 *  ========================================================================== */

// 🔑 ១. SUPABASE CLIENT INITIALIZATION
const SUPABASE_URL = "https://ntftdylkcnkxsytptket.supabase.co";
const SUPABASE_KEY = "sb_publishable_58qNd6IpyWqlvuI5BpuHRw__pTm7g7v";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🌐 ២. GLOBAL APP STATE (អថេររួមទូទាំងកម្មវិធី POS)
var currentUser = {};
var allProducts = [];
var allCustomers = [];
var specialPrices = window.specialPrices || [];
var cart = [];
var selectedModalProduct = null;
var currentPosCategoryFilter = 'ALL';
var currentPosPayMethod = 'Cash';
var telegramConfig = { token: "", chatId: "", status: "ON" };

// អថេរសម្រាប់ទូទាត់លុយ (Settlement State)
var currentSettlementCustomer = "";
var currentSettlementItems = [];
var currentSettlementPayMode = "Cash";
var currentSettlementOldDebt = 0;

// 🔔 ៣. មុខងារ TOAST NOTIFICATION (សារដំណឹង)
function showToast(msg, type) {
  type = type || 'success';
  var toast = document.getElementById('toast');
  var msgEl = document.getElementById('toastMsg');
  var iconEl = document.getElementById('toastIcon');
  var content = document.getElementById('toastContent');
  if (!toast || !msgEl) return;

  msgEl.innerText = msg;
  content.className = 'bg-white border-l-4 p-4 shadow-2xl rounded-r-2xl flex items-center min-w-[260px] pointer-events-auto ' + 
    (type === 'success' ? 'border-green-600' : 'border-red-500');
  iconEl.innerHTML = type === 'success' ? 
    '<i class="fas fa-check-circle text-green-600"></i>' : 
    '<i class="fas fa-exclamation-circle text-red-500"></i>';

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(function() { 
    toast.classList.add('translate-y-20', 'opacity-0'); 
  }, 3000);
}

// 📱 ៤. មុខងារ SIDEBAR (បើក និងបិទម៉ឺនុយ)
function toggleSidebar() {
  var sb = document.getElementById('sidebar');
  var bd = document.getElementById('sidebarBackdrop');
  if (!bd) {
    bd = document.createElement('div');
    bd.id = 'sidebarBackdrop';
    bd.onclick = closeSidebar;
    document.body.appendChild(bd);
  }
  if (sb) {
    if (sb.classList.contains('hidden-sidebar')) {
      sb.classList.remove('hidden-sidebar');
      if (window.innerWidth < 1024) bd.classList.add('active');
    } else { 
      closeSidebar(); 
    }
  }
}

function closeSidebar() {
  var sb = document.getElementById('sidebar');
  var bd = document.getElementById('sidebarBackdrop');
  if (sb) sb.classList.add('hidden-sidebar');
  if (bd) bd.classList.remove('active');
}

// ⚙️ ៥. ទាញយកការកំណត់ SETTINGS & TELEGRAM BOT ពី SUPABASE
async function loadSettingsAndTelegram() {
  try {
    const { data } = await supabaseClient.from('settings').select('*');
    if (data) {
      data.forEach(function(r) {
        if (r.key === 'Telegram_Token') telegramConfig.token = r.value;
        if (r.key === 'Telegram_ChatID') telegramConfig.chatId = r.value;
        if (r.key === 'Telegram_Alert_Status') telegramConfig.status = r.value.toUpperCase();
      });
    }
  } catch(e) {
    console.error("Settings load error:", e);
  }
}

// 📲 ៦. មុខងារផ្ញើសារដំណឹងទៅកាន់ TELEGRAM BOT
async function sendTelegramAlert(message) {
  if (!telegramConfig.token || !telegramConfig.chatId || telegramConfig.status === 'OFF') return;
  try {
    await fetch("https://api.telegram.org/bot" + telegramConfig.token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: telegramConfig.chatId, 
        text: message, 
        parse_mode: "HTML" 
      })
    });
  } catch(e) {
    console.error("Telegram alert error:", e);
  }
}

// 📦 ៧. មុខងារទាញយកទិន្នន័យដំបូង (ទំនិញ, អតិថិជន និងតម្លៃពិសេស) ពី SUPABASE
async function fetchInitialPOSData() {
  try {
    // ១. ទាញទំនិញទាំងអស់
    const { data: prods } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    if (prods) allProducts = prods;

    // ២. ទាញអតិថិជនទាំងអស់
    const { data: custs } = await supabaseClient
      .from('users')
      .select('*')
      .order('full_name', { ascending: true });
    if (custs) allCustomers = custs;

    // ៣. ទាញតម្លៃពិសេស (Contract Prices) សម្រាប់ម៉ូយប្រចាំ និង Monthly
    const { data: prices } = await supabaseClient
      .from('customer_prices')
      .select('*');
    if (prices) {
      specialPrices = prices;
      window.specialPrices = prices;
    }
  } catch(e) {
    console.error("Initial data load error:", e);
  }
}
// ==========================================
// 🌟 ៨. KC POS CUSTOM DIALOG ENGINE (CONFIRM & PROMPT)
// ==========================================
function kcConfirm(opts) {
  return new Promise(function(resolve) {
    opts = opts || {};
    var modal = document.getElementById('kcDialogModal');
    var titleEl = document.getElementById('kcDialogTitle');
    var msgEl = document.getElementById('kcDialogMessage');
    var iconBox = document.getElementById('kcDialogIconBox');
    var iconEl = document.getElementById('kcDialogIcon');
    var inputArea = document.getElementById('kcDialogInputArea');
    var btnConfirm = document.getElementById('kcDialogBtnConfirm');
    var btnCancel = document.getElementById('kcDialogBtnCancel');
    var backdrop = document.getElementById('kcDialogBackdrop');

    if (!modal) { resolve(confirm(opts.message || "")); return; }

    var isDanger = (opts.type === 'danger');
    titleEl.innerText = opts.title || (isDanger ? "បញ្ជាក់ការលុប" : "បញ្ជាក់ប្រតិបត្តិការ");
    msgEl.innerText = opts.message || "តើអ្នកប្រាកដដែរឬទេ?";
    inputArea.classList.add('hidden');

    if (isDanger) {
      iconBox.className = "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-red-100 text-red-600";
      iconEl.className = "fas fa-trash-can animate-pulse";
      btnConfirm.className = "py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md active:scale-95 transition";
      btnConfirm.innerText = opts.confirmText || "យល់ព្រមលុប";
    } else {
      iconBox.className = "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-emerald-100 text-emerald-700";
      iconEl.className = "fas fa-circle-question";
      btnConfirm.className = "py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md active:scale-95 transition";
      btnConfirm.innerText = opts.confirmText || "យល់ព្រម";
    }

    modal.classList.remove('hidden');

    function cleanUp(result) {
      modal.classList.add('hidden');
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      backdrop.onclick = null;
      resolve(result);
    }

    btnConfirm.onclick = function() { cleanUp(true); };
    btnCancel.onclick = function() { cleanUp(false); };
    backdrop.onclick = function() { cleanUp(false); };
  });
}

function kcPrompt(opts) {
  return new Promise(function(resolve) {
    opts = opts || {};
    var modal = document.getElementById('kcDialogModal');
    var titleEl = document.getElementById('kcDialogTitle');
    var msgEl = document.getElementById('kcDialogMessage');
    var iconBox = document.getElementById('kcDialogIconBox');
    var iconEl = document.getElementById('kcDialogIcon');
    var inputArea = document.getElementById('kcDialogInputArea');
    var inputEl = document.getElementById('kcDialogInput');
    var btnConfirm = document.getElementById('kcDialogBtnConfirm');
    var btnCancel = document.getElementById('kcDialogBtnCancel');
    var backdrop = document.getElementById('kcDialogBackdrop');

    if (!modal) { resolve(prompt(opts.message || "", opts.defaultValue || "")); return; }

    titleEl.innerText = opts.title || "បញ្ចូលព័ត៌មាន";
    msgEl.innerText = opts.message || "";
    iconBox.className = "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-blue-100 text-blue-700";
    iconEl.className = "fas fa-keyboard";
    btnConfirm.className = "py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md active:scale-95 transition";
    btnConfirm.innerText = opts.confirmText || "យល់ព្រម";

    inputArea.classList.remove('hidden');
    inputEl.value = (opts.defaultValue !== undefined) ? opts.defaultValue : "";
    if (opts.inputType) inputEl.type = opts.inputType;

    modal.classList.remove('hidden');
    setTimeout(function() { inputEl.focus(); inputEl.select(); }, 150);

    function cleanUp(val) {
      modal.classList.add('hidden');
      inputArea.classList.add('hidden');
      btnConfirm.onclick = null;
      btnCancel.onclick = null;
      backdrop.onclick = null;
      resolve(val);
    }

    btnConfirm.onclick = function() { cleanUp(inputEl.value.trim()); };
    btnCancel.onclick = function() { cleanUp(null); };
    backdrop.onclick = function() { cleanUp(null); };
    inputEl.onkeyup = function(e) { if (e.key === 'Enter') cleanUp(inputEl.value.trim()); };
  });
}
