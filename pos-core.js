/** ==========================================================================
 *  KC WATER POS SYSTEM - CORE ENGINE (pos-core.js)
 *  (Authentication, Dashboard & POS Sales System)
 *  ========================================================================== */

// ==========================================
// ១. AUTHENTICATION & LOGIN (ផ្ទៀងផ្ទាត់ SUPABASE)
// ==========================================
async function login() {
  var userEl = document.getElementById('user');
  var passEl = document.getElementById('pass');
  var btnEl = document.getElementById('loginBtn');
  var remEl = document.getElementById('rememberMe');
  if (!userEl || !passEl) return;

  var u = userEl.value.trim();
  var p = passEl.value.trim();
  if (!u || !p) { 
    showToast("សូមបញ្ចូល Username និង Password!", "error"); 
    return; 
  }

  btnEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> កំពុងផ្ទៀងផ្ទាត់...';
  btnEl.disabled = true;

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', u)
      .eq('password', p)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      currentUser = {
        id: data.id,
        username: data.username,
        fullName: data.full_name,
        role: data.role,
        type: data.type,
        phone: data.phone,
        linkedBoss: data.linked_boss || ""
      };

      if (remEl && remEl.checked) {
        localStorage.setItem('kc_pos_user', u);
        localStorage.setItem('kc_pos_pass', p);
      } else {
        localStorage.removeItem('kc_pos_user');
        localStorage.removeItem('kc_pos_pass');
      }

      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('mainApp').classList.remove('hidden');
      document.getElementById('userInfo').innerText = currentUser.role + "៖ " + currentUser.fullName;

      renderSidebarMenu();
      await loadSettingsAndTelegram();
      await fetchInitialPOSData();
      loadModule('Dashboard');
      showToast("ចូលប្រើប្រាស់ជោគជ័យ! សួស្តី " + currentUser.fullName, "success");
    } else {
      showToast("ឈ្មោះ ឬលេខសម្ងាត់មិនត្រឹមត្រូវឡើយ!", "error");
    }
  } catch (err) {
    showToast("កំហុសតភ្ជាប់៖ " + err.message, "error");
  } finally {
    btnEl.innerHTML = '<span>ចូលប្រើប្រាស់</span>';
    btnEl.disabled = false;
  }
}

function logout() {
  localStorage.removeItem('kc_pos_user');
  localStorage.removeItem('kc_pos_pass');
  currentUser = {};
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loginPage').style.display = 'flex';
  closeSidebar();
  showToast("បានចាកចេញពីប្រព័ន្ធ!", "info");
}

function renderSidebarMenu() {
  var sNav = document.getElementById('sidebarMenuContainer');
  if (!sNav) return;
  var html = '';

  if (currentUser.role === 'Admin') {
    html += '<button onclick="loadModule(\'Dashboard\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-chart-pie mr-3 w-5 text-center"></i>Dashboard</button>';
    html += '<div class="text-[10px] font-bold text-green-300 uppercase px-3 pt-3 pb-1 opacity-80 tracking-wider">ការលក់ & ទូទាត់</div>';
    html += '<button onclick="loadModule(\'POS\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-shopping-cart mr-3 w-5 text-center"></i>ផ្ទាំងលក់ (POS)</button>';
    html += '<button onclick="loadModule(\'Settlement\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-calculator mr-3 w-5 text-center"></i>ទូទាត់លុយ</button>';
    html += '<div class="text-[10px] font-bold text-green-300 uppercase px-3 pt-3 pb-1 opacity-80 tracking-wider">ឃ្លាំង & ស្តុក</div>';
    html += '<button onclick="loadModule(\'Stock\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-box mr-3 w-5 text-center"></i>គ្រប់គ្រងស្តុក</button>';
    html += '<button onclick="loadModule(\'BottleLoan\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-dolly mr-3 w-5 text-center"></i>ភ្ញៀវខ្ចីធុង</button>';
    html += '<div class="text-[10px] font-bold text-green-300 uppercase px-3 pt-3 pb-1 opacity-80 tracking-wider">ចំណាយ & អតិថិជន</div>';
    html += '<button onclick="loadModule(\'Expenses\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-money-bill-wave mr-3 w-5 text-center"></i>កត់ត្រាការចំណាយ</button>';
    html += '<button onclick="loadModule(\'Customers\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-users mr-3 w-5 text-center"></i>គ្រប់គ្រងអតិថិជន</button>';
    html += '<button onclick="loadModule(\'Settings\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold text-yellow-300"><i class="fas fa-cog mr-3 w-5 text-center"></i>ការកំណត់ (Settings)</button>';
  } else {
    html += '<button onclick="loadModule(\'POS\')" class="w-full text-left p-3 hover:bg-green-700 rounded-xl transition flex items-center font-bold"><i class="fas fa-shopping-cart mr-3 w-5 text-center"></i>ផ្ទាំងលក់ (POS)</button>';
  }

  html += '<hr class="border-green-800 my-3">';
  html += '<button onclick="logout()" class="w-full text-left p-3 text-red-300 hover:bg-red-800 rounded-xl transition flex items-center font-bold"><i class="fas fa-sign-out-alt mr-3 w-5 text-center"></i>ចាកចេញ</button>';
  sNav.innerHTML = html;
}

function loadModule(name) {
  closeSidebar();
  if (name === 'Dashboard') renderDashboardModule();
  else if (name === 'POS') renderPOSModule();
  else if (name === 'Settlement' && typeof renderSettlementModule === 'function') renderSettlementModule();
  else if (name === 'Stock' && typeof renderStockModule === 'function') renderStockModule();
  else if (name === 'BottleLoan' && typeof renderBottleLoanModule === 'function') renderBottleLoanModule();
  else if (name === 'Expenses' && typeof renderExpensesModule === 'function') renderExpensesModule();
  else if (name === 'Customers' && typeof renderCustomersModule === 'function') renderCustomersModule();
  else if (name === 'Settings' && typeof renderSettingsModule === 'function') renderSettingsModule();
}

// ==========================================
// 📊 ២. ផ្ទាំង DASHBOARD (ទាញទិន្នន័យពី SUPABASE)
// ==========================================
async function renderDashboardModule() {
  var area = document.getElementById('contentArea');
  area.innerHTML = '<div class="max-w-5xl mx-auto space-y-4">' +
    '<div class="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">' +
      '<div><h2 class="text-base sm:text-xl font-extrabold text-green-900 flex items-center gap-2"><i class="fas fa-chart-pie text-green-600"></i>ផ្ទាំងសង្ខេបអាជីវកម្ម KC WATER (Supabase)</h2><p class="text-xs text-gray-500 mt-0.5">ទិដ្ឋភាពទូទៅនៃការលក់ សាច់ប្រាក់ និងស្តុកទំនិញ Realtime</p></div>' +
      '<button onclick="renderDashboardModule()" class="px-3.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold border border-green-200 active:scale-95 transition flex items-center gap-1.5 shadow-2xs"><i class="fas fa-sync-alt"></i> Refresh</button>' +
    '</div>' +
    '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">' +
      '<div class="dash-card border-l-4 border-blue-500 p-4 bg-white rounded-2xl"><div class="text-gray-500 text-xs font-bold uppercase">លក់បានថ្ងៃនេះ</div><div id="dashTodaySales" class="mt-2 font-black text-blue-800 text-lg">0 ៛</div></div>' +
      '<div class="dash-card border-l-4 border-green-600 p-4 bg-white rounded-2xl"><div class="text-gray-500 text-xs font-bold uppercase">សាច់ប្រាក់ប្រមូលបាន</div><div id="dashTodayCash" class="mt-2 font-black text-green-800 text-lg">0 ៛</div></div>' +
      '<div class="dash-card border-l-4 border-red-500 p-4 bg-white rounded-2xl cursor-pointer hover:bg-red-50/50 transition" onclick="loadModule(\'Settlement\')"><div class="text-gray-500 text-xs font-bold uppercase flex justify-between"><span>បំណុលគេជំពាក់សរុប</span><i class="fas fa-chevron-right text-xs text-red-400"></i></div><div id="dashTotalDebt" class="mt-2 font-black text-red-700 text-lg">0 ៛</div></div>' +
    '</div>' +
    '<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">' +
      '<div class="card p-5 border-t-4 border-blue-600 shadow-lg mb-0"><h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-boxes text-blue-600"></i>ចំនួនទឹកដកលក់ថ្ងៃនេះ</h3><div id="dashProductQtyArea" class="space-y-2 text-xs">កំពុងគណនា...</div></div>' +
      '<div class="card p-5 border-t-4 border-orange-500 shadow-lg mb-0"><h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-boxes-stacked text-orange-500"></i>ស្តុកទំនិញក្នុងឃ្លាំង & ដំណឹងជិតអស់</h3><div id="dashStockAlertArea" class="space-y-2 text-xs">កំពុងឆែកមើលស្តុក...</div></div>' +
    '</div>' +
  '</div>';

  await loadDashboardData();
}

async function loadDashboardData() {
  try {
    var today = new Date().toISOString().split('T')[0];
    const { data: trans } = await supabaseClient
      .from('transactions')
      .select('*')
      .gte('created_at', today + 'T00:00:00Z');
    
    var todaySalesKHR = 0;
    var todayCashKHR = 0;
    var prodQty = {};

    if (trans) {
      trans.forEach(function(t) {
        todaySalesKHR += parseFloat(t.total || 0);
        todayCashKHR += parseFloat(t.paid_khr || 0);
        if (t.product_name) {
          prodQty[t.product_name] = (prodQty[t.product_name] || 0) + parseFloat(t.qty || 0);
        }
      });
    }

    document.getElementById('dashTodaySales').innerText = '៛ ' + todaySalesKHR.toLocaleString();
    document.getElementById('dashTodayCash').innerText = '៛ ' + todayCashKHR.toLocaleString();

    const { data: unpaids } = await supabaseClient
      .from('transactions')
      .select('total')
      .eq('status', 'Unpaid');

    var debtTotal = 0;
    if (unpaids) unpaids.forEach(function(u) { debtTotal += parseFloat(u.total || 0); });
    document.getElementById('dashTotalDebt').innerText = '៛ ' + debtTotal.toLocaleString();

    var pqArea = document.getElementById('dashProductQtyArea');
    var pqHtml = "";
    for (var p in prodQty) {
      pqHtml += '<div class="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border"><span class="font-bold text-gray-800">' + p + '</span><span class="px-3 py-1 bg-blue-100 text-blue-800 font-black rounded-lg">' + prodQty[p] + '</span></div>';
    }
    pqArea.innerHTML = pqHtml || '<p class="text-gray-400 italic text-center py-4">មិនទាន់មានការលក់ថ្ងៃនេះនៅឡើយទេ</p>';

    var alertArea = document.getElementById('dashStockAlertArea');
    var saHtml = "";
    allProducts.forEach(function(prod) {
      var isLow = parseFloat(prod.stock || 0) <= parseFloat(prod.min_stock || 5);
      saHtml += '<div class="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border"><span><b>' + prod.name + '</b></span><span class="px-2.5 py-1 font-black rounded-lg ' + (isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700') + '">' + prod.stock + ' ឯកតា</span></div>';
    });
    alertArea.innerHTML = saHtml || '<p class="text-gray-400 italic text-center py-4">គ្មានទិន្នន័យស្តុក</p>';
  } catch(e) {
    console.error("Dashboard load error:", e);
  }
}

// ==========================================
// 🛒 ៣. ផ្ទាំងលក់ POS & កាត់ស្តុក
// ==========================================
function renderPOSModule() {
  var area = document.getElementById('contentArea');
  var custOptions = '<option value="Walk-in">🛒 -- លក់នៅកន្លែង (Walk-in) --</option>';
  allCustomers.forEach(function(c) {
    if (c.role !== 'Admin' && c.full_name !== 'Walk-in') {
      custOptions += '<option value="' + c.full_name + '">' + c.full_name + ' (' + c.role + ')</option>';
    }
  });

  area.innerHTML = '<div class="max-w-4xl mx-auto space-y-4">' +
    '<div class="card border-l-4 border-blue-500 py-3 shadow-sm mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">' +
      '<div class="flex-1 w-full sm:w-auto">' +
        '<label class="text-xs font-bold text-gray-500 block mb-1"><i class="fas fa-user-tag text-blue-600 mr-1.5"></i>ជ្រើសរើសអតិថិជន / ម៉ូយ</label>' +
        '<select id="posCustSelect" class="w-full font-bold text-gray-800 border-2 border-blue-200 rounded-xl p-2.5 bg-white outline-none">' + custOptions + '</select>' +
      '</div>' +
      '<button onclick="fetchInitialPOSData().then(rPG)" class="px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-200 active:scale-95 transition flex items-center gap-1 shadow-2xs self-end sm:self-auto"><i class="fas fa-sync-alt"></i> Refresh ស្តុក</button>' +
    '</div>' +
    '<div class="flex flex-wrap gap-2 pb-1">' +
      '<button onclick="setPosCategoryFilter(\'ALL\')" id="catTab_ALL" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-green-700 text-white shadow-md active:scale-95 transition"><i class="fas fa-border-all mr-1"></i> ទាំងអស់</button>' +
      '<button onclick="setPosCategoryFilter(\'BARREL\')" id="catTab_BARREL" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border hover:bg-gray-50 active:scale-95 transition"><i class="fas fa-wine-bottle text-blue-600 mr-1"></i> ទឹកធុង ២០L</button>' +
      '<button onclick="setPosCategoryFilter(\'PACK\')" id="catTab_PACK" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border hover:bg-gray-50 active:scale-95 transition"><i class="fas fa-box-open text-amber-600 mr-1"></i> ទឹកយួរ/ដប</button>' +
    '</div>' +
    '<div id="pGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5"></div>' +
    '<div class="card border-t-4 border-green-600 shadow-xl p-4 sm:p-5">' +
      '<div class="flex justify-between items-center mb-3"><h3 class="font-extrabold text-gray-800 text-sm sm:text-base flex items-center"><i class="fas fa-shopping-cart mr-2 text-green-600"></i>បញ្ជីទំនិញក្នុងកន្ត្រក</h3><span id="cartCountBadge" class="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-bold">0 មុខ</span></div>' +
      '<div class="overflow-x-auto rounded-xl border border-gray-100 mb-3"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">ទំនិញ</th><th class="p-2.5 text-center">ចំនួន</th><th class="p-2.5 text-right">តម្លៃរាយ</th><th class="p-2.5 text-right">សរុប</th><th class="p-2.5 text-center">លុប</th></tr></thead><tbody id="cItemsTableBody"><tr><td colspan="5" class="p-4 text-center text-gray-400 italic">កន្ត្រកទទេ</td></tr></tbody></table></div>' +
      '<div class="bg-green-50 p-3.5 rounded-xl border border-green-200 flex justify-between items-center text-green-900 mb-3 font-extrabold text-sm sm:text-base"><span>សរុបទឹកប្រាក់ត្រូវបង់៖</span><span id="cTotalVal" class="text-green-700 text-base sm:text-lg">0 ៛</span></div>' +
      '<div class="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-3 mt-3">' +
        '<div class="flex justify-between items-center"><span class="text-xs font-bold text-blue-900 uppercase tracking-wider"><i class="fas fa-coins text-blue-600 mr-1.5"></i>ទូទាត់ប្រាក់</span><button onclick="fillExactPOSPay()" class="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 text-xs font-extrabold rounded-lg border border-blue-300 shadow-2xs active:scale-95 transition">លុយគ្រប់</button></div>' +
        '<div class="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border">' +
          '<button type="button" id="btnPosPayCash" onclick="setPosPaymentMethod(\'Cash\')" class="py-2 rounded-lg text-xs font-bold bg-green-700 text-white shadow"><i class="fas fa-money-bill-wave"></i> 💵 លុយសុទ្ធ</button>' +
          '<button type="button" id="btnPosPayAba" onclick="setPosPaymentMethod(\'ABA\')" class="py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"><i class="fas fa-qrcode"></i> 📱 ស្កេន ABA</button>' +
        '</div>' +
        '<div class="space-y-1"><label class="text-[10px] font-bold text-gray-500 uppercase">ប្រាក់រៀលទទួល (៛)</label><input type="number" id="pK" oninput="calcPOSChange()" placeholder="0" class="text-center font-black text-xl text-blue-900 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-600 p-2.5 w-full outline-none"></div>' +
        '<div class="flex gap-2 pt-1 text-xs">' +
          '<button onclick="setPOSQuickCash(10000)" class="flex-1 py-1.5 bg-white hover:bg-green-50 text-gray-700 font-bold rounded-xl border shadow-2xs active:scale-95 transition">10,000</button>' +
          '<button onclick="setPOSQuickCash(20000)" class="flex-1 py-1.5 bg-white hover:bg-green-50 text-gray-700 font-bold rounded-xl border shadow-2xs active:scale-95 transition">20,000</button>' +
          '<button onclick="setPOSQuickCash(50000)" class="flex-1 py-1.5 bg-white hover:bg-green-50 text-gray-700 font-bold rounded-xl border shadow-2xs active:scale-95 transition">50,000</button>' +
        '</div>' +
        '<div id="posChangeArea" class="rounded-xl transition-all duration-200 hidden"></div>' +
        '<button onclick="openPOSKHQR()" type="button" class="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-2 active:scale-95 transition"><i class="fas fa-qrcode text-base"></i> បង្ហាញ ABA KHQR</button>' +
      '</div>' +
      '<button onclick="confirmSale()" id="sBtn" class="btn-green shadow-xl active:scale-95 transition mt-4 py-3.5 text-base flex items-center justify-center w-full font-bold">រក្សាទុកការលក់ (Save Sale)</button>' +
    '</div>' +
  '</div>';

  rPG();
  rC();
}

function setPosCategoryFilter(cat) {
  currentPosCategoryFilter = cat;
  ['ALL', 'BARREL', 'PACK'].forEach(function(t) {
    var btn = document.getElementById('catTab_' + t);
    if (!btn) return;
    if (t === cat) btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-green-700 text-white shadow-md active:scale-95 transition";
    else btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border hover:bg-gray-50 active:scale-95 transition";
  });
  rPG();
}

function rPG() {
  var grid = document.getElementById('pGrid');
  if (!grid) return;
  var html = '';

  var filtered = allProducts.filter(function(p) {
    if (p.channel === 'ONLINE') return false;
    var nameLower = (p.name || '').toLowerCase();
    if (currentPosCategoryFilter === 'BARREL') return (nameLower.indexOf('ធុង') !== -1 || nameLower.indexOf('20l') !== -1);
    if (currentPosCategoryFilter === 'PACK') return (nameLower.indexOf('យួរ') !== -1 || nameLower.indexOf('ដប') !== -1);
    return true;
  });

  filtered.forEach(function(p) {
    var imgUrl = p.img || "https://cdn-icons-png.flaticon.com/512/3100/3100566.png";
    html += '<div onclick="openProductModal(\'' + p.id + '\')" class="bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-green-400 transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-between text-center relative group">' +
      '<span class="absolute top-2 right-2 bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">សល់ ' + p.stock + '</span>' +
      '<div class="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1"><img src="' + imgUrl + '" class="max-w-full max-h-full object-contain drop-shadow-sm"></div>' +
      '<h4 class="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 h-8 flex items-center justify-center">' + p.name + '</h4>' +
      '<p class="text-xs sm:text-sm font-extrabold text-green-600 mt-1">' + Number(p.price || 0).toLocaleString() + ' ៛</p>' +
      '<div class="mt-2 w-full py-1.5 bg-green-50 group-hover:bg-green-600 text-green-700 group-hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"><i class="fas fa-plus text-[10px]"></i> រើសទិញ</div>' +
    '</div>';
  });

  grid.innerHTML = html || '<p class="col-span-full py-8 text-center text-gray-400 text-xs italic">មិនមានទំនិញក្នុងប្រភេទនេះឡើយ</p>';
}

function openProductModal(id) {
  var p = allProducts.find(function(item) { return item.id === id; });
  if (!p) return;
  selectedModalProduct = p;

  document.getElementById('modalProdImg').src = p.img || "https://cdn-icons-png.flaticon.com/512/3100/3100566.png";
  document.getElementById('modalProdTitle').innerText = p.name;
  document.getElementById('modalStockStatusBadge').innerText = "សល់ក្នុងស្តុក៖ " + p.stock;
  document.getElementById('modalPriceInput').value = p.price || 0;
  document.getElementById('modalQtyInput').value = 1;
  updateModalSubtotal();
  document.getElementById('productSelectModal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productSelectModal').classList.add('hidden');
  selectedModalProduct = null;
}

function changeModalQty(delta) {
  var inp = document.getElementById('modalQtyInput');
  var val = (parseInt(inp.value) || 1) + delta;
  if (val < 1) val = 1;
  inp.value = val;
  updateModalSubtotal();
}

function updateModalSubtotal() {
  var q = parseFloat(document.getElementById('modalQtyInput').value || 1);
  var p = parseFloat(document.getElementById('modalPriceInput').value || 0);
  document.getElementById('modalSubtotalText').innerText = Number(q * p).toLocaleString() + ' ៛';
}

function confirmAddToCart() {
  if (!selectedModalProduct) return;
  var q = parseInt(document.getElementById('modalQtyInput').value) || 1;
  var pr = parseFloat(document.getElementById('modalPriceInput').value) || 0;

  cart.push({
    id: selectedModalProduct.id,
    name: selectedModalProduct.name,
    price: pr,
    qty: q,
    currency: "KHR"
  });

  closeProductModal();
  rC();
  showToast("បានបញ្ចូលទំនិញក្នុងកន្ត្រក!", "success");
}

function rC() {
  var tbody = document.getElementById('cItemsTableBody');
  var totalValEl = document.getElementById('cTotalVal');
  var badge = document.getElementById('cartCountBadge');

  if (!tbody) return;
  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">កន្ត្រកទទេ</td></tr>';
    if (totalValEl) totalValEl.innerText = "0 ៛";
    if (badge) badge.innerText = "0 មុខ";
    calcPOSChange();
    return;
  }

  var html = '', total = 0;
  cart.forEach(function(i, idx) {
    var sub = i.qty * i.price;
    total += sub;
    html += '<tr class="border-b hover:bg-gray-50">' +
      '<td class="p-2.5 font-bold text-gray-800">' + i.name + '</td>' +
      '<td class="p-2.5 text-center font-bold text-blue-700">' + i.qty + '</td>' +
      '<td class="p-2.5 text-right">' + Number(i.price).toLocaleString() + '</td>' +
      '<td class="p-2.5 text-right font-black text-green-700">' + Number(sub).toLocaleString() + ' ៛</td>' +
      '<td class="p-2.5 text-center"><button onclick="cart.splice(' + idx + ', 1); rC();" class="text-red-400 hover:text-red-600 p-1"><i class="fas fa-trash-can"></i></button></td>' +
    '</tr>';
  });

  tbody.innerHTML = html;
  badge.innerText = cart.length + " មុខ";
  totalValEl.innerText = Number(total).toLocaleString() + " ៛";
  calcPOSChange();
}

function getCartTotal() {
  return cart.reduce(function(sum, i) { return sum + (i.qty * i.price); }, 0);
}

function calcPOSChange() {
  var area = document.getElementById('posChangeArea');
  if (!area) return;
  var total = getCartTotal();
  var paid = parseFloat(document.getElementById('pK') ? document.getElementById('pK').value || 0 : 0);

  if (total === 0 || paid === 0) { area.classList.add('hidden'); return; }
  var diff = paid - total;

  if (diff > 0) {
    area.className = 'p-3 rounded-xl font-bold text-center border-2 bg-green-100 text-green-900 border-green-400';
    area.innerHTML = '<div class="text-[11px] uppercase text-green-700 font-bold mb-0.5">ប្រាក់អាប់ជូនភ្ញៀវវិញ</div><div class="text-lg font-black text-green-800">៛ ' + diff.toLocaleString() + '</div>';
    area.classList.remove('hidden');
  } else if (diff < 0) {
    area.className = 'p-3 rounded-xl font-bold text-center border-2 bg-orange-100 text-orange-900 border-orange-400';
    area.innerHTML = '<div class="text-[11px] uppercase text-orange-700 font-bold mb-0.5">ប្រាក់នៅខ្វះ</div><div class="text-lg font-black text-orange-800">៛ ' + Math.abs(diff).toLocaleString() + '</div>';
    area.classList.remove('hidden');
  } else {
    area.className = 'p-2.5 rounded-xl font-bold text-center border-2 bg-blue-100 text-blue-900 border-blue-300';
    area.innerHTML = '<i class="fas fa-check-circle text-blue-600 mr-1.5"></i> បង់លុយគ្រប់ចំនួន';
    area.classList.remove('hidden');
  }
}

function fillExactPOSPay() {
  var tot = getCartTotal();
  if (document.getElementById('pK')) document.getElementById('pK').value = tot > 0 ? tot : "";
  calcPOSChange();
}

function setPOSQuickCash(amt) {
  if (document.getElementById('pK')) document.getElementById('pK').value = amt;
  calcPOSChange();
}

function setPosPaymentMethod(mode) {
  currentPosPayMethod = mode;
  var btnCash = document.getElementById('btnPosPayCash'), btnAba = document.getElementById('btnPosPayAba');
  if (mode === 'Cash') {
    btnCash.className = "py-2 rounded-lg text-xs font-bold bg-green-700 text-white shadow";
    btnAba.className = "py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";
  } else {
    btnAba.className = "py-2 rounded-lg text-xs font-bold bg-blue-700 text-white shadow";
    btnCash.className = "py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";
  }
}

function openPOSKHQR() {
  var total = getCartTotal();
  if (total === 0) { showToast("សូមជ្រើសរើសទំនិញក្នុងកន្ត្រកជាមុនសិន!", "error"); return; }
  document.getElementById('posKhqrAmountText').innerText = "៛ " + total.toLocaleString();
  document.getElementById('posKhqrModal').classList.remove('hidden');
}

function closePOSKHQR() { 
  document.getElementById('posKhqrModal').classList.add('hidden'); 
}

// ==========================================
// 💾 ៤. រក្សាទុកការលក់ (SUBMIT SALE & កាត់ស្តុក)
// ==========================================
var isSubmittingSaleLock = false;

async function confirmSale() {
  if (isSubmittingSaleLock) return;
  if (cart.length === 0) { showToast("កន្ត្រកទទេ! សូមរើសទំនិញជាមុនសិន", "error"); return; }

  var custName = document.getElementById('posCustSelect').value;
  var total = getCartTotal();
  var paid = parseFloat(document.getElementById('pK') ? document.getElementById('pK').value || 0 : 0);
  var isWalkIn = (custName === 'Walk-in');
  var status = (isWalkIn && paid >= total) ? 'Paid' : 'Unpaid';

  var tid = "TR-" + new Date().getTime();
  var btn = document.getElementById('sBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> កំពុងកត់ត្រាការលក់...';
  isSubmittingSaleLock = true;

  try {
    var rowsToInsert = [];
    cart.forEach(function(item) {
      rowsToInsert.push({
        transaction_id: tid,
        customer_name: custName,
        product_name: item.name,
        qty: item.qty,
        price: item.price,
        currency: "KHR",
        total: item.qty * item.price,
        paid_khr: isWalkIn ? (item.qty * item.price) : paid,
        recorded_by: currentUser.fullName || "Admin",
        status: status,
        payment_method: currentPosPayMethod
      });
    });

    const { error: insErr } = await supabaseClient.from('transactions').insert(rowsToInsert);
    if (insErr) throw insErr;

    // កាត់ស្តុកក្នុង Products
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var prodObj = allProducts.find(function(p){ return p.id === item.id; });
      if (prodObj && prodObj.type === 'ទិញគេ') {
        var newStock = Math.max(0, parseFloat(prodObj.stock || 0) - item.qty);
        await supabaseClient.from('products').update({ stock: newStock }).eq('id', item.id);
        prodObj.stock = newStock;
      }
    }

    // ផ្ញើសារដំណឹង Telegram
    try {
      var itemSummary = cart.map(function(item){ return "  • " + item.name + " x " + item.qty + " = ៛ " + (item.qty * item.price).toLocaleString(); }).join("\n");
      var tgMsg = "💧 <b>[KC WATER - លក់នៅកន្លែង POS]</b>\n\n" +
                  "🆔 <b>កូដ៖</b> <code>" + tid + "</code>\n" +
                  "👤 <b>អតិថិជន៖</b> " + custName + "\n" +
                  "✍️ <b>អ្នកគិតលុយ៖</b> " + (currentUser.fullName || "Admin") + "\n" +
                  "📦 <b>ទំនិញ៖</b>\n" + itemSummary + "\n" +
                  "💰 <b>សរុប៖</b> <b>៛ " + total.toLocaleString() + "</b>\n" +
                  "💵 <b>ប្រាក់ទទួល៖</b> <b>៛ " + paid.toLocaleString() + "</b>\n" +
                  "📌 <b>ស្ថានភាព៖</b> <b>" + (status === 'Paid' ? 'ទូទាត់រួច' : 'ជំពាក់') + "</b>\n" +
                  "🕒 <b>ម៉ោង៖</b> " + new Date().toLocaleTimeString('km-KH');
      sendTelegramAlert(tgMsg);
    } catch(e) {}

    generateReceiptImage(tid, custName, total, paid, cart, "វិក្កយបត្រលក់ទំនិញ (RECEIPT)");

    cart = [];
    rC();
    if (document.getElementById('pK')) document.getElementById('pK').value = "";
    calcPOSChange();
    showToast("បានកត់ត្រាការលក់ និងកាត់ស្តុកជោគជ័យ!", "success");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

  } catch(err) {
    showToast("កំហុសកត់ត្រាការលក់៖ " + err.message, "error");
  } finally {
    isSubmittingSaleLock = false;
    btn.disabled = false;
    btn.innerHTML = 'រក្សាទុកការលក់ (Save Sale)';
  }
}

// ==========================================
// 🧾 ៥. មុខងារបង្កើតរូបវិក្កយបត្រ (RECEIPT PNG)
// ==========================================
function generateReceiptImage(tid, cust, total, paid, items, titleText) {
  var dateStr = new Date().toLocaleString('km-KH');
  var change = Math.max(0, paid - total);

  var itemsHtml = '';
  (items || []).forEach(function(i) {
    var pName = i.name || i.product_name || "ទំនិញ";
    var tot = (i.qty * i.price);
    itemsHtml += '<tr style="border-bottom:1px dashed #cbd5e1;">' +
      '<td style="padding:6px 4px;">' + pName + '</td>' +
      '<td align="center" style="padding:6px 4px; font-weight:bold; color:#1d4ed8;">' + i.qty + '</td>' +
      '<td align="right" style="padding:6px 4px; font-weight:bold;">' + tot.toLocaleString() + ' ៛</td>' +
    '</tr>';
  });

  var h = '<div id="pos-canvas-box" style="width:360px; padding:20px; background:white; color:#0f172a; font-family:\'Battambang\', sans-serif; border-radius:12px;">' +
    '<div style="text-align:center; border-bottom:2px dashed #16a34a; padding-bottom:8px; margin-bottom:10px;">' +
      '<b style="font-size:16px; color:#15803d;">KC WATER</b><br>' +
      '<span style="font-size:11px; color:#64748b; font-weight:bold;">' + (titleText || 'វិក្កយបត្រ (RECEIPT)') + '</span>' +
    '</div>' +
    '<div style="font-size:10.5px; line-height:1.6; margin-bottom:10px; color:#334155;">' +
      'លេខកូដ៖ <b>' + tid + '</b><br>' +
      'អតិថិជន៖ <b>' + cust + '</b><br>' +
      'កាលបរិច្ឆេទ៖ ' + dateStr + '<br>' +
      'អ្នកគិតលុយ៖ <b>' + (currentUser.fullName || "Admin") + '</b>' +
    '</div>' +
    '<table style="width:100%; font-size:11px; border-collapse:collapse; margin-bottom:10px;">' +
      '<tr style="background:#f1f5f9; color:#475569; border-bottom:1px solid #cbd5e1;"><th align="left" style="padding:5px 4px;">ទំនិញ</th><th align="center" style="padding:5px 4px;">ចំនួន</th><th align="right" style="padding:5px 4px;">សរុប</th></tr>' +
      (itemsHtml || '<tr><td colspan="3" align="center" style="padding:10px; color:#94a3b8;">ទូទាត់បំណុលចាស់</td></tr>') +
    '</table>' +
    '<div style="background:#f0fdf4; padding:10px; border-radius:8px; font-size:11px; line-height:1.7; border:1px solid #bbf7d0;">' +
      '<div style="display:flex; justify-content:space-between; font-weight:bold;"><span>សរុបត្រូវបង់៖</span><b>៛ ' + total.toLocaleString() + '</b></div>' +
      '<div style="display:flex; justify-content:space-between; color:#1d4ed8;"><span>ប្រាក់ទទួលបាន៖</span><b>៛ ' + paid.toLocaleString() + '</b></div>' +
      (change > 0 ? '<div style="display:flex; justify-content:space-between; color:#15803d; font-weight:bold; border-top:1px dashed #86efac; padding-top:4px; margin-top:4px;"><span>ប្រាក់អាប់ជូនវិញ៖</span><b>៛ ' + change.toLocaleString() + '</b></div>' : '') +
    '</div>' +
    '<div style="text-align:center; margin-top:12px; border-top:1px dashed #cbd5e1; padding-top:8px;">' +
      '<span style="font-size:9.5px; color:#64748b;">សូមអរគុណ! សូមអញ្ជើញមកពិសាម្តងទៀត 🙏</span>' +
    '</div>' +
  '</div>';

  var hiddenArea = document.getElementById('hidden_receipt_canvas');
  hiddenArea.innerHTML = h;

  html2canvas(document.getElementById('pos-canvas-box'), { scale: 3 }).then(function(canvas) {
    var imgUrl = canvas.toDataURL("image/png");
    document.getElementById('posModalReceiptImg').src = imgUrl;
    document.getElementById('posModalReceiptDownloadBtn').href = imgUrl;
    document.getElementById('posSaleReceiptModal').classList.remove('hidden');
  });
}

function closePOSReceiptModal() { 
  document.getElementById('posSaleReceiptModal').classList.add('hidden'); 
}

function sharePOSReceiptImage() {
  var img = document.getElementById('posModalReceiptImg');
  if (img && navigator.share) {
    fetch(img.src).then(r => r.blob()).then(blob => {
      navigator.share({ files: [new File([blob], 'Receipt.png', { type: 'image/png' })], title: 'វិក្កយបត្រ KC WATER' });
    });
  } else {
    document.getElementById('posModalReceiptDownloadBtn').click();
  }
}

// 🔄 Auto-Login បើមាន Remember Me
window.addEventListener('load', function() {
  var savedU = localStorage.getItem('kc_pos_user');
  var savedP = localStorage.getItem('kc_pos_pass');
  if (savedU && savedP) {
    document.getElementById('user').value = savedU;
    document.getElementById('pass').value = savedP;
    document.getElementById('rememberMe').checked = true;
    login();
  }
});
