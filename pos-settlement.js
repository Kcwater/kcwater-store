/** ==========================================================================
 *  KC WATER POS SYSTEM - SETTLEMENT ENGINE (pos-settlement.js)
 *  (Debt Settlement, Split Payment, Pending Approval Banner & Invoicing)
 *  ========================================================================== */

var currentActivePendingPaymentId = null;

// ==========================================
// 💳 ១. ផ្ទាំងទូទាត់លុយ SETTLEMENT UI
// ==========================================
async function renderSettlementModule() {
  var area = document.getElementById('contentArea');
  currentSettlementCustomer = "";
  currentSettlementItems = [];
  currentSettlementPayMode = "Cash";
  currentActivePendingPaymentId = null;

  area.innerHTML = '<div class="max-w-4xl mx-auto space-y-4">' +
    // ក្បាលទំព័រ
    '<div class="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">' +
      '<div>' +
        '<h2 class="text-base sm:text-xl font-extrabold text-blue-900 flex items-center gap-2">' +
          '<i class="fas fa-calculator text-blue-600"></i>ប្រព័ន្ធទូទាត់ប្រាក់ និងជម្រះបញ្ជីជំពាក់ (Settlement)' +
        '</h2>' +
        '<p class="text-xs text-gray-500 mt-0.5">ពិនិត្យជើងទឹកជំពាក់ និងចេញវិក្កយបត្រជូនអតិថិជន Realtime</p>' +
      '</div>' +
      '<button onclick="renderSettlementModule()" class="px-3.5 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 active:scale-95 transition flex items-center gap-1.5 shadow-2xs">' +
        '<i class="fas fa-sync-alt"></i> Refresh' +
      '</button>' +
    '</div>' +

    // 🔔 បដាសំណើទូទាត់រង់ចាំពីម៉ូយ (PENDING APPROVAL BANNER)
    '<div id="pendingPaymentsBanner" class="hidden card border-t-4 border-yellow-500 bg-yellow-50/80 p-4 shadow-md mb-0 space-y-2">' +
      '<div class="flex justify-between items-center">' +
        '<h3 class="font-extrabold text-yellow-950 text-xs sm:text-sm flex items-center gap-2">' +
          '<i class="fas fa-bell text-yellow-600 animate-bounce"></i> សំណើទូទាត់រង់ចាំផ្ទៀងផ្ទាត់ពីម៉ូយ (Pending Approval)' +
        '</h3>' +
        '<span id="pendingCountBadge" class="bg-yellow-200 text-yellow-900 text-[10px] font-black px-2.5 py-0.5 rounded-full"></span>' +
      '</div>' +
      '<div id="pendingCardsContainer" class="space-y-2 pt-1"></div>' +
    '</div>' +

    // បញ្ជីឈ្មោះម៉ូយជំពាក់
    '<div class="card border-t-4 border-orange-500 shadow-md p-4 mb-0">' +
      '<h3 class="font-bold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-1.5">' +
        '<i class="fas fa-users text-orange-600"></i> ជ្រើសរើសឈ្មោះម៉ូយជំពាក់ដើម្បីទូទាត់៖' +
      '</h3>' +
      '<div id="settleDebtorsBadgesContainer" class="flex flex-wrap gap-2 pt-1 text-xs">' +
        '<i class="fas fa-spinner fa-spin text-orange-600"></i> កំពុងឆែកបញ្ជីជំពាក់...' +
      '</div>' +
    '</div>' +

    // កាតលម្អិតជើងទឹកជំពាក់ & ការគិតលុយ
    '<div id="settlementDetailCard" class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0 hidden">' +
      '<div class="flex justify-between items-center border-b pb-3 mb-3">' +
        '<div>' +
          '<span class="text-[10px] text-gray-400 uppercase font-bold block">អតិថិជនកំពុងទូទាត់</span>' +
          '<h3 id="settleTargetCustName" class="text-base sm:text-lg font-black text-blue-900"></h3>' +
        '</div>' +
        '<span id="settleSelectedCountBadge" class="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">0 ជើងទឹក</span>' +
      '</div>' +

      // តារាងជើងទឹកជំពាក់
      '<div class="overflow-x-auto max-h-60 overflow-y-auto rounded-xl border mb-3">' +
        '<table class="w-full text-left text-xs border-collapse">' +
          '<thead class="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b z-10">' +
            '<tr>' +
              '<th class="p-2.5 text-center w-10">' +
                '<input type="checkbox" id="settleSelectAllCb" onchange="toggleSelectAllSettle(this.checked)" checked class="w-4 h-4 accent-green-600 cursor-pointer">' +
              '</th>' +
              '<th class="p-2.5 text-[10px]">កាលបរិច្ឆេទ</th>' +
              '<th class="p-2.5">មុខទំនិញ</th>' +
              '<th class="p-2.5 text-center">ចំនួន</th>' +
              '<th class="p-2.5 text-right">តម្លៃរាយ</th>' +
              '<th class="p-2.5 text-right">សរុប</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody id="settleItemsTableBody"></tbody>' +
        '</table>' +
      '</div>' +

      // ប្រអប់សង្ខេបបំណុល & Checkbox បំណុលចាស់
      '<div class="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs space-y-1.5 mb-3 text-orange-950 font-bold">' +
        '<div class="flex justify-between">' +
          '<span>សរុបទំនិញដែលបានធីក (+)៖</span>' +
          '<b id="settleSelectedSubtotal" class="text-sm text-blue-900">0 ៛</b>' +
        '</div>' +
        '<div id="settleOldDebtRow" class="flex justify-between items-center border-t border-orange-200 pt-1.5">' +
          '<label class="flex items-center gap-2 cursor-pointer">' +
            '<input type="checkbox" id="cbIncludeOldDebt" onchange="recalcSettlementCalculation()" checked class="w-4 h-4 accent-orange-600 cursor-pointer">' +
            '<span>បូកបញ្ចូលបំណុលចាស់ពីមុន៖</span>' +
          '</label>' +
          '<b id="settleOldDebtVal" class="text-orange-700">0 ៛</b>' +
        '</div>' +
        '<div class="flex justify-between text-sm sm:text-base font-black text-orange-950 border-t border-orange-300 pt-1.5 mt-1">' +
          '<span>សរុបត្រូវបង់លើកនេះ (=)៖</span>' +
          '<span id="settleTotalDueText" class="text-base sm:text-lg text-orange-800">0 ៛</span>' +
        '</div>' +
      '</div>' +

      // ផ្នែកជ្រើសរើសវិធីបង់ប្រាក់ (Cash, ABA, Split)
      '<div class="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3">' +
        '<div class="flex justify-between items-center">' +
          '<label class="text-xs font-bold text-blue-900 uppercase">វិធីទូទាត់ប្រាក់ជាក់ស្តែង</label>' +
          '<button onclick="fillExactSettlementPay()" class="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-300 shadow-2xs active:scale-95 transition">លុយគ្រប់</button>' +
        '</div>' +

        '<div class="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border">' +
          '<button type="button" id="btnSettleCash" onclick="setSettlePayMode(\'Cash\')" class="py-2.5 rounded-lg text-xs font-bold bg-green-700 text-white shadow"><i class="fas fa-money-bill-wave mr-1"></i> លុយសុទ្ធ</button>' +
          '<button type="button" id="btnSettleAba" onclick="setSettlePayMode(\'ABA\')" class="py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"><i class="fas fa-qrcode mr-1"></i> ស្កេន ABA</button>' +
          '<button type="button" id="btnSettleSplit" onclick="setSettlePayMode(\'Split\')" class="py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"><i class="fas fa-layer-group mr-1"></i> ចម្រុះ</button>' +
        '</div>' +

        // បង់ធម្មតា (លុយសុទ្ធ ឬ ABA)
        '<div id="settleSingleInputArea" class="space-y-1">' +
          '<label class="text-[10px] font-bold text-gray-500 uppercase">ប្រាក់បានបង់ជាក់ស្តែង (៛)</label>' +
          '<input type="number" id="settlePaidInput" oninput="calcSettleChange()" placeholder="0" class="w-full text-center text-xl font-black text-blue-900 bg-white border-2 border-blue-200 focus:border-blue-600 rounded-xl p-2.5 outline-none">' +
        '</div>' +

        // 🔀 បង់ចម្រុះ (SPLIT PAYMENT: លុយសុទ្ធ + ស្កេន ABA)
        '<div id="settleSplitInputArea" class="hidden space-y-2 bg-white p-3 rounded-2xl border border-blue-200">' +
          '<div class="text-[11px] font-black text-blue-900 uppercase flex items-center gap-1"><i class="fas fa-layer-group text-blue-600"></i> បែងចែកការទូទាត់ចម្រុះ (៛)៖</div>' +
          '<div class="grid grid-cols-2 gap-2">' +
            '<div>' +
              '<label class="text-[9.5px] font-bold text-gray-600 block mb-0.5">💵 ទទួលលុយសុទ្ធ (៛)</label>' +
              '<input type="number" id="splitKhrCash" oninput="calcSettleChange()" placeholder="0" class="w-full text-center font-bold text-xs p-2 bg-gray-50 rounded-xl border outline-none">' +
            '</div>' +
            '<div>' +
              '<label class="text-[9.5px] font-black text-blue-700 block mb-0.5">📱 ស្កេន ABA (៛)</label>' +
              '<input type="number" id="splitKhrScan" oninput="calcSettleChange()" placeholder="0" class="w-full text-center font-black text-xs p-2 bg-white rounded-xl border-2 border-blue-300 text-blue-800 outline-none">' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div id="settleChangeArea" class="rounded-xl transition-all duration-200 hidden"></div>' +
      '</div>' +

      '<button onclick="submitSettlementPayment()" id="btnSubmitSettlement" class="btn-green shadow-xl py-4 text-base font-black flex items-center justify-center gap-2 active:scale-95 transition mt-3">' +
        '<i class="fas fa-file-invoice-dollar text-xl"></i> ទូទាត់ & ចេញវិក្កយបត្រ (Save Settlement)' +
      '</button>' +
    '</div>' +
  '</div>';

  checkAdminPendingPayments();
  await loadSettlementDebtorsList();
}

// ==========================================
// 🔔 ២. ឆែកមើលសំណើទូទាត់រង់ចាំពីម៉ូយ (PENDING APPROVAL)
// ==========================================
async function checkAdminPendingPayments() {
  var banner = document.getElementById('pendingPaymentsBanner');
  var container = document.getElementById('pendingCardsContainer');
  var badge = document.getElementById('pendingCountBadge');
  if (!banner || !container) return;

  try {
    const { data: list } = await supabaseClient
      .from('pending_payments')
      .select('*')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (!list || list.length === 0) {
      banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');
    if (badge) badge.innerText = list.length + " សំណើ";

    var html = '';
    list.forEach(function(item) {
      var dateStr = new Date(item.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
      var safeName = String(item.customer_name || '').replace(/'/g, "\\'");

      html += '<div class="bg-white p-3 rounded-2xl border border-yellow-300 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">' +
        '<div class="space-y-1">' +
          '<div class="flex items-center gap-2">' +
            '<b class="text-xs sm:text-sm text-gray-900"><i class="fas fa-user-circle text-yellow-600 mr-1"></i>' + item.customer_name + '</b>' +
            '<span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-bold text-[10px]">' + item.method + '</span>' +
            '<small class="text-[10px] text-gray-400">' + dateStr + '</small>' +
          '</div>' +
          '<div class="text-xs font-black text-green-700">៛ ' + Number(item.khr_total || 0).toLocaleString() + '</div>' +
          (item.ref_code ? '<div class="text-[10px] text-gray-500 font-bold">Ref: <code>' + item.ref_code + '</code></div>' : '') +
        '</div>' +
        '<div class="flex items-center gap-1.5 self-end sm:self-auto">' +
          '<button onclick="applyPendingPaymentToSettlement(\'' + item.id + '\', \'' + safeName + '\', ' + (item.khr_total || 0) + ', \'' + (item.method || '') + '\')" class="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black shadow active:scale-95 transition flex items-center gap-1 whitespace-nowrap">' +
            '<i class="fas fa-hand-holding-dollar"></i> យកមកទូទាត់' +
          '</button>' +
          '<button onclick="dismissPendingCard(\'' + item.id + '\')" title="បដិសេធ" class="p-2 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl text-xs active:scale-90 transition">' +
            '<i class="fas fa-times text-sm"></i>' +
          '</button>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;
  } catch(e) {}
}

async function applyPendingPaymentToSettlement(pendingId, custName, amount, method) {
  currentActivePendingPaymentId = pendingId;
  await selectCustomerForSettlement(custName);

  if (method && method.indexOf('ABA') !== -1) {
    setSettlePayMode('ABA');
  } else {
    setSettlePayMode('Cash');
  }

  document.getElementById('settlePaidInput').value = amount > 0 ? amount : "";
  calcSettleChange();

  var card = document.getElementById('settlementDetailCard');
  if (card) card.scrollIntoView({ behavior: 'smooth' });

  showToast("បានបញ្ចូលសំណើទូទាត់របស់ [" + custName + "] រួចរាល់!", "success");
}

async function dismissPendingCard(pendingId) {
  if (!confirm("តើអ្នកចង់បដិសេធសំណើទូទាត់នេះមែនទេ?")) return;
  try {
    await supabaseClient.from('pending_payments').update({ status: 'Cancelled' }).eq('id', pendingId);
    showToast("បានបដិសេធសំណើជោគជ័យ!", "info");
    checkAdminPendingPayments();
  } catch(e) {}
}

// ==========================================
// 📋 ៣. ស្រង់បញ្ជីឈ្មោះម៉ូយជំពាក់ពី SUPABASE
// ==========================================
async function loadSettlementDebtorsList() {
  var badgesContainer = document.getElementById('settleDebtorsBadgesContainer');
  if (!badgesContainer) return;

  try {
    const { data: unpaids } = await supabaseClient
      .from('transactions')
      .select('customer_name, total')
      .eq('status', 'Unpaid');

    if (!unpaids || unpaids.length === 0) {
      badgesContainer.innerHTML = '<span class="text-green-600 font-bold text-xs"><i class="fas fa-check-circle mr-1"></i> អបអរសាទរ! គ្មានអតិថិជនណាជំពាក់ប្រាក់ឡើយ</span>';
      return;
    }

    var custMap = {};
    unpaids.forEach(function(u) {
      var cName = (u.customer_name || "").trim();
      if (cName && cName !== "Walk-in") {
        custMap[cName] = (custMap[cName] || 0) + parseFloat(u.total || 0);
      }
    });

    var html = '';
    for (var name in custMap) {
      html += '<button onclick="selectCustomerForSettlement(\'' + name.replace(/'/g, "\\'") + '\')" class="px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-900 rounded-xl border border-blue-200 font-bold shadow-2xs active:scale-95 transition flex items-center gap-1.5">' +
        '<i class="fas fa-user text-blue-600"></i> ' + name + ' <span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.2 rounded-full font-black">៛ ' + custMap[name].toLocaleString() + '</span>' +
      '</button>';
    }

    badgesContainer.innerHTML = html || '<span class="text-green-600 font-bold text-xs">គ្មានអតិថិជនជំពាក់ឡើយ</span>';
  } catch(e) {
    console.error("Debtors list load error:", e);
  }
}

// ==========================================
// 🔍 ៤. ជ្រើសរើសម៉ូយ & ទាញជើងទឹកជំពាក់ជាក់ស្តែង
// ==========================================
async function selectCustomerForSettlement(custName) {
  currentSettlementCustomer = custName;
  document.getElementById('settleTargetCustName').innerText = custName;
  document.getElementById('settlementDetailCard').classList.remove('hidden');

  var tbody = document.getElementById('settleItemsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-400 italic"><i class="fas fa-spinner fa-spin mr-1"></i> កំពុងទាញជើងទឹក...</td></tr>';

  try {
    const { data: items } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('customer_name', custName)
      .eq('status', 'Unpaid')
      .order('id', { ascending: true });

    currentSettlementItems = items || [];

    const { data: lastSet } = await supabaseClient
      .from('settlements')
      .select('balance_khr')
      .eq('customer_name', custName)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    currentSettlementOldDebt = lastSet ? parseFloat(lastSet.balance_khr || 0) : 0;
    document.getElementById('settleOldDebtVal').innerText = '៛ ' + currentSettlementOldDebt.toLocaleString();

    var html = '';
    currentSettlementItems.forEach(function(item) {
      var dateStr = new Date(item.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
      var recTag = item.recorded_by ? '<br><span class="text-[9px] text-amber-800 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200 inline-block mt-0.5"><i class="fas fa-truck mr-1"></i>ដកដោយ៖ ' + item.recorded_by + '</span>' : '';

      html += '<tr class="border-b hover:bg-blue-50/40 transition">' +
        '<td class="p-2 text-center">' +
          '<input type="checkbox" class="settle-item-cb w-4 h-4 accent-green-600 cursor-pointer" data-id="' + item.id + '" data-total="' + item.total + '" onchange="recalcSettlementCalculation()" checked>' +
        '</td>' +
        '<td class="p-2 text-gray-500 text-[10px] whitespace-nowrap">' + dateStr + '</td>' +
        '<td class="p-2 font-bold text-gray-800">' + item.product_name + recTag + '</td>' +
        '<td class="p-2 text-center font-bold text-blue-700">' + item.qty + '</td>' +
        '<td class="p-2 text-right">' + Number(item.price).toLocaleString() + '</td>' +
        '<td class="p-2 text-right font-black text-green-700 whitespace-nowrap">' + Number(item.total).toLocaleString() + ' ៛</td>' +
      '</tr>';
    });

    tbody.innerHTML = html || '<tr><td colspan="6" class="p-4 text-center text-gray-400 italic">គ្មានទំនិញជំពាក់</td></tr>';
    recalcSettlementCalculation();
    fillExactSettlementPay();

  } catch(err) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500 font-bold">កំហុស៖ ' + err.message + '</td></tr>';
  }
}

function toggleSelectAllSettle(isChecked) {
  document.querySelectorAll('.settle-item-cb').forEach(function(cb) { cb.checked = isChecked; });
  recalcSettlementCalculation();
  fillExactSettlementPay();
}

function getSelectedSettlementTotal() {
  var sum = 0;
  document.querySelectorAll('.settle-item-cb:checked').forEach(function(cb) {
    sum += parseFloat(cb.getAttribute('data-total') || 0);
  });
  return sum;
}

function recalcSettlementCalculation() {
  var sub = getSelectedSettlementTotal();
  var count = document.querySelectorAll('.settle-item-cb:checked').length;
  
  // ឆែកប្រអប់ធីកបូកបំណុលចាស់
  var cbOldDebt = document.getElementById('cbIncludeOldDebt');
  var includeOldDebt = cbOldDebt ? cbOldDebt.checked : true;
  var oldDebtAmount = includeOldDebt ? currentSettlementOldDebt : 0;
  var totalDue = sub + oldDebtAmount;

  document.getElementById('settleSelectedCountBadge').innerText = count + ' ជើងទឹក';
  document.getElementById('settleSelectedSubtotal').innerText = '៛ ' + sub.toLocaleString();
  document.getElementById('settleTotalDueText').innerText = '៛ ' + totalDue.toLocaleString();

  calcSettleChange();
}

function fillExactSettlementPay() {
  var sub = getSelectedSettlementTotal();
  var cbOldDebt = document.getElementById('cbIncludeOldDebt');
  var includeOldDebt = cbOldDebt ? cbOldDebt.checked : true;
  var totalDue = sub + (includeOldDebt ? currentSettlementOldDebt : 0);

  if (currentSettlementPayMode === "Split") {
    var cK = document.getElementById('splitKhrCash');
    var sK = document.getElementById('splitKhrScan');
    if (sK) sK.value = totalDue > 0 ? totalDue : "";
    if (cK) cK.value = "";
  } else {
    document.getElementById('settlePaidInput').value = totalDue > 0 ? totalDue : "";
  }
  calcSettleChange();
}

function getSettlementActualPaid() {
  if (currentSettlementPayMode === "Split") {
    var cK = parseFloat(document.getElementById('splitKhrCash') ? document.getElementById('splitKhrCash').value || 0 : 0);
    var sK = parseFloat(document.getElementById('splitKhrScan') ? document.getElementById('splitKhrScan').value || 0 : 0);
    return cK + sK;
  } else {
    return parseFloat(document.getElementById('settlePaidInput') ? document.getElementById('settlePaidInput').value || 0 : 0);
  }
}

function calcSettleChange() {
  var area = document.getElementById('settleChangeArea');
  if (!area) return;

  var sub = getSelectedSettlementTotal();
  var cbOldDebt = document.getElementById('cbIncludeOldDebt');
  var includeOldDebt = cbOldDebt ? cbOldDebt.checked : true;
  var totalDue = sub + (includeOldDebt ? currentSettlementOldDebt : 0);

  var paid = getSettlementActualPaid();

  if (paid === 0 || totalDue === 0) { area.classList.add('hidden'); return; }
  var diff = paid - totalDue;

  if (diff > 0) {
    area.className = 'p-3 rounded-xl font-bold text-center border-2 bg-green-100 text-green-900 border-green-400';
    area.innerHTML = '<div class="text-[11px] uppercase text-green-700 font-bold mb-0.5">ប្រាក់អាប់ជូនវិញ</div><div class="text-lg font-black text-green-800">៛ ' + diff.toLocaleString() + '</div>';
    area.classList.remove('hidden');
  } else if (diff < 0) {
    area.className = 'p-3 rounded-xl font-bold text-center border-2 bg-orange-100 text-orange-900 border-orange-400';
    area.innerHTML = '<div class="text-[11px] uppercase text-orange-700 font-bold mb-0.5">នៅជំពាក់សល់</div><div class="text-lg font-black text-orange-800">៛ ' + Math.abs(diff).toLocaleString() + '</div>';
    area.classList.remove('hidden');
  } else {
    area.className = 'p-2.5 rounded-xl font-bold text-center border-2 bg-blue-100 text-blue-900 border-blue-300';
    area.innerHTML = '<i class="fas fa-check-circle text-blue-600 mr-1.5"></i> បង់លុយគ្រប់ចំនួន (គ្មានជំពាក់សល់)';
    area.classList.remove('hidden');
  }
}

function setSettlePayMode(mode) {
  currentSettlementPayMode = mode;
  var btnCash = document.getElementById('btnSettleCash');
  var btnAba = document.getElementById('btnSettleAba');
  var btnSplit = document.getElementById('btnSettleSplit');
  var singleArea = document.getElementById('settleSingleInputArea');
  var splitArea = document.getElementById('settleSplitInputArea');

  btnCash.className = "py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";
  btnAba.className = "py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";
  btnSplit.className = "py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";

  if (mode === 'Cash') {
    btnCash.className = "py-2.5 rounded-lg text-xs font-bold bg-green-700 text-white shadow";
    if (singleArea) singleArea.classList.remove('hidden');
    if (splitArea) splitArea.classList.add('hidden');
  } else if (mode === 'ABA') {
    btnAba.className = "py-2.5 rounded-lg text-xs font-bold bg-blue-700 text-white shadow";
    if (singleArea) singleArea.classList.remove('hidden');
    if (splitArea) splitArea.classList.add('hidden');
  } else if (mode === 'Split') {
    btnSplit.className = "py-2.5 rounded-lg text-xs font-bold bg-purple-700 text-white shadow";
    if (singleArea) singleArea.classList.add('hidden');
    if (splitArea) splitArea.classList.remove('hidden');
  }

  calcSettleChange();
}

// ==========================================
// 💾 ៥. បញ្ជាក់ការទូទាត់លុយ (SUBMIT SETTLEMENT ទៅ SUPABASE)
// ==========================================
var isSubmittingSettleLock = false;

async function submitSettlementPayment() {
  if (isSubmittingSettleLock) return;

  var checkedCbs = document.querySelectorAll('.settle-item-cb:checked');
  var selectedIds = [];
  checkedCbs.forEach(function(cb) { selectedIds.push(parseInt(cb.getAttribute('data-id'))); });

  var sub = getSelectedSettlementTotal();
  var cbOldDebt = document.getElementById('cbIncludeOldDebt');
  var includeOldDebt = cbOldDebt ? cbOldDebt.checked : true;
  var totalDue = sub + (includeOldDebt ? currentSettlementOldDebt : 0);

  var paid = getSettlementActualPaid();

  if (selectedIds.length === 0 && (!includeOldDebt || currentSettlementOldDebt === 0)) {
    showToast("សូមធីកជ្រើសរើសយ៉ាងហោចណាស់ ១ ជួរដើម្បីទូទាត់!", "error"); 
    return;
  }
  if (paid === 0) {
    showToast("សូមបញ្ចូលចំនួនប្រាក់ដែលបានបង់!", "error"); 
    return;
  }

  var remainingBalance = Math.max(0, totalDue - paid);
  var cashKhrRecorded = 0;
  var scanKhrRecorded = 0;

  if (currentSettlementPayMode === 'Split') {
    cashKhrRecorded = parseFloat(document.getElementById('splitKhrCash') ? document.getElementById('splitKhrCash').value || 0 : 0);
    scanKhrRecorded = parseFloat(document.getElementById('splitKhrScan') ? document.getElementById('splitKhrScan').value || 0 : 0);
  } else if (currentSettlementPayMode === 'Cash') {
    cashKhrRecorded = paid;
  } else {
    scanKhrRecorded = paid;
  }

  var btn = document.getElementById('btnSubmitSettlement');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i> កំពុងទូទាត់ប្រាក់...';
  isSubmittingSettleLock = true;

  try {
    // ១. ប្តូរ status ទៅ 'Paid' ក្នុង transactions table
    if (selectedIds.length > 0) {
      const { error: updErr } = await supabaseClient
        .from('transactions')
        .update({ status: 'Paid' })
        .in('id', selectedIds);
      if (updErr) throw updErr;
    }

    // ២. កត់ត្រាចូល settlements table ក្នុង Supabase
    const { error: setErr } = await supabaseClient.from('settlements').insert([{
      customer_name: currentSettlementCustomer,
      total_due_khr: totalDue,
      paid_khr: Math.min(paid, totalDue),
      balance_khr: remainingBalance,
      admin_name: currentUser.fullName || "Admin",
      pay_method: currentSettlementPayMode,
      cash_khr: cashKhrRecorded,
      scan_khr: scanKhrRecorded
    }]);
    if (setErr) throw setErr;

    // ៣. បិទបញ្ចប់សំណើ Pending Payment បើមាន
    if (currentActivePendingPaymentId) {
      await supabaseClient.from('pending_payments').update({ status: 'Approved' }).eq('id', currentActivePendingPaymentId);
      currentActivePendingPaymentId = null;
    }

    // ៤. បាញ់ Telegram Alert
    try {
      var methodLabel = (currentSettlementPayMode === 'ABA') ? '📱 ស្កេន ABA' : 
                        (currentSettlementPayMode === 'Split' ? '🔀 ចម្រុះ (លុយសុទ្ធ: ៛ ' + cashKhrRecorded.toLocaleString() + ' + ABA: ៛ ' + scanKhrRecorded.toLocaleString() + ')' : '💵 លុយសុទ្ធ');

      var tgMsg = "🙏 <b>[KC WATER - ទូទាត់ប្រាក់ជោគជ័យ]</b>\n\n" +
                  "👤 <b>អតិថិជន៖</b> " + currentSettlementCustomer + "\n" +
                  "💳 <b>វិធីទូទាត់៖</b> " + methodLabel + "\n" +
                  "💰 <b>សរុបត្រូវបង់៖</b> <b>៛ " + totalDue.toLocaleString() + "</b>\n" +
                  "✅ <b>ប្រាក់បានបង់៖</b> <b>៛ " + paid.toLocaleString() + "</b>\n" +
                  "⚠️ <b>នៅជំពាក់សល់៖</b> <b>៛ " + remainingBalance.toLocaleString() + "</b>\n" +
                  "✍️ <b>អ្នកទទួល៖</b> " + (currentUser.fullName || "Admin") + "\n" +
                  "🕒 <b>ម៉ោង៖</b> " + new Date().toLocaleTimeString('km-KH');
      sendTelegramAlert(tgMsg);
    } catch(e) {}

    // ៥. បង្កើតវិក្កយបត្ររូបភាព (Receipt PNG)
    var receiptItems = currentSettlementItems.filter(i => selectedIds.indexOf(i.id) !== -1);
    generateReceiptImage("SET-" + new Date().getTime(), currentSettlementCustomer, totalDue, paid, receiptItems, "វិក្កយបត្រទូទាត់ប្រាក់ (SETTLEMENT)");

    showToast("បានទូទាត់ប្រាក់ និងជម្រះបញ្ជីជោគជ័យ!", "success");
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    // Refresh ឡើងវិញ
    document.getElementById('settlementDetailCard').classList.add('hidden');
    checkAdminPendingPayments();
    await loadSettlementDebtorsList();

  } catch(err) {
    showToast("កំហុសទូទាត់ប្រាក់៖ " + err.message, "error");
  } finally {
    isSubmittingSettleLock = false;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-invoice-dollar text-xl"></i> ទូទាត់ & ចេញវិក្កយបត្រ (Save Settlement)';
  }
}
