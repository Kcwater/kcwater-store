/** ==========================================================================
 *  KC WATER POS SYSTEM - SETTLEMENT ENGINE (pos-settlement.js)
 *  (Debt Tracking, Multi-Currency Payments & Invoicing)
 *  ========================================================================== */

// ==========================================
// 💳 ១. ផ្ទាំងទូទាត់លុយ SETTLEMENT UI
// ==========================================
async function renderSettlementModule() {
  var area = document.getElementById('contentArea');
  currentSettlementCustomer = "";
  currentSettlementItems = [];
  currentSettlementPayMode = "Cash";

  area.innerHTML = '<div class="max-w-4xl mx-auto space-y-4">' +
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

    '<div class="card border-t-4 border-orange-500 shadow-md p-4 mb-0">' +
      '<h3 class="font-bold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-1.5">' +
        '<i class="fas fa-users text-orange-600"></i> ជ្រើសរើសឈ្មោះម៉ូយជំពាក់ដើម្បីទូទាត់៖' +
      '</h3>' +
      '<div id="settleDebtorsBadgesContainer" class="flex flex-wrap gap-2 pt-1 text-xs">' +
        '<i class="fas fa-spinner fa-spin text-orange-600"></i> កំពុងឆែកបញ្ជីជំពាក់...' +
      '</div>' +
    '</div>' +

    '<div id="settlementDetailCard" class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0 hidden">' +
      '<div class="flex justify-between items-center border-b pb-3 mb-3">' +
        '<div>' +
          '<span class="text-[10px] text-gray-400 uppercase font-bold block">អតិថិជនកំពុងទូទាត់</span>' +
          '<h3 id="settleTargetCustName" class="text-base sm:text-lg font-black text-blue-900"></h3>' +
        '</div>' +
        '<span id="settleSelectedCountBadge" class="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">0 ជើងទឹក</span>' +
      '</div>' +

      '<div class="overflow-x-auto max-h-60 overflow-y-auto rounded-xl border mb-3">' +
        '<table class="w-full text-left text-xs border-collapse">' +
          '<thead class="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b">' +
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

      '<div class="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs space-y-1 mb-3 text-orange-950 font-bold">' +
        '<div class="flex justify-between">' +
          '<span>សរុបទំនិញដែលបានធីក (+)៖</span>' +
          '<b id="settleSelectedSubtotal" class="text-sm text-blue-900">0 ៛</b>' +
        '</div>' +
        '<div id="settleOldDebtRow" class="flex justify-between border-t border-orange-200 pt-1">' +
          '<span>បំណុលចាស់ពីមុន៖</span>' +
          '<b id="settleOldDebtVal" class="text-orange-700">0 ៛</b>' +
        '</div>' +
        '<div class="flex justify-between text-sm sm:text-base font-black text-orange-950 border-t border-orange-300 pt-1.5 mt-1">' +
          '<span>សរុបត្រូវបង់លើកនេះ (=)៖</span>' +
          '<span id="settleTotalDueText" class="text-base sm:text-lg text-orange-800">0 ៛</span>' +
        '</div>' +
      '</div>' +

      '<div class="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3">' +
        '<div class="flex justify-between items-center">' +
          '<label class="text-xs font-bold text-blue-900 uppercase">វិធីទូទាត់ប្រាក់</label>' +
          '<button onclick="fillExactSettlementPay()" class="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-lg border border-blue-300 shadow-2xs active:scale-95 transition">លុយគ្រប់</button>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border">' +
          '<button type="button" id="btnSettleCash" onclick="setSettlePayMode(\'Cash\')" class="py-2.5 rounded-lg text-xs font-bold bg-green-700 text-white shadow"><i class="fas fa-money-bill-wave mr-1"></i> លុយសុទ្ធ</button>' +
          '<button type="button" id="btnSettleAba" onclick="setSettlePayMode(\'ABA\')" class="py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"><i class="fas fa-qrcode mr-1"></i> ស្កេន ABA</button>' +
        '</div>' +
        '<div class="space-y-1">' +
          '<label class="text-[10px] font-bold text-gray-500 uppercase">ប្រាក់បានបង់ជាក់ស្តែង (៛)</label>' +
          '<input type="number" id="settlePaidInput" oninput="calcSettleChange()" placeholder="0" class="w-full text-center text-xl font-black text-blue-900 bg-white border-2 border-blue-200 focus:border-blue-600 rounded-xl p-2.5 outline-none">' +
        '</div>' +
        '<div id="settleChangeArea" class="rounded-xl transition-all duration-200 hidden"></div>' +
      '</div>' +

      '<button onclick="submitSettlementPayment()" id="btnSubmitSettlement" class="btn-green shadow-xl py-4 text-base font-black flex items-center justify-center gap-2 active:scale-95 transition mt-3">' +
        '<i class="fas fa-file-invoice-dollar text-xl"></i> ទូទាត់ & ចេញវិក្កយបត្រ (Save Settlement)' +
      '</button>' +
    '</div>' +
  '</div>';

  await loadSettlementDebtorsList();
}

// ==========================================
// 📋 ២. ស្រង់បញ្ជីឈ្មោះម៉ូយជំពាក់ពី SUPABASE
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
// 🔍 ៣. ជ្រើសរើសម៉ូយ & ទាញជើងទឹកជំពាក់ជាក់ស្តែង
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
      html += '<tr class="border-b hover:bg-blue-50/40 transition">' +
        '<td class="p-2 text-center">' +
          '<input type="checkbox" class="settle-item-cb w-4 h-4 accent-green-600 cursor-pointer" data-id="' + item.id + '" data-total="' + item.total + '" onchange="recalcSettlementCalculation()" checked>' +
        '</td>' +
        '<td class="p-2 text-gray-500 text-[10px] whitespace-nowrap">' + dateStr + '</td>' +
        '<td class="p-2 font-bold text-gray-800">' + item.product_name + '</td>' +
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
  var totalDue = sub + currentSettlementOldDebt;

  document.getElementById('settleSelectedCountBadge').innerText = count + ' ជើងទឹក';
  document.getElementById('settleSelectedSubtotal').innerText = '៛ ' + sub.toLocaleString();
  document.getElementById('settleTotalDueText').innerText = '៛ ' + totalDue.toLocaleString();

  calcSettleChange();
}

function fillExactSettlementPay() {
  var sub = getSelectedSettlementTotal();
  var totalDue = sub + currentSettlementOldDebt;
  document.getElementById('settlePaidInput').value = totalDue > 0 ? totalDue : "";
  calcSettleChange();
}

function calcSettleChange() {
  var area = document.getElementById('settleChangeArea');
  if (!area) return;

  var sub = getSelectedSettlementTotal();
  var totalDue = sub + currentSettlementOldDebt;
  var paid = parseFloat(document.getElementById('settlePaidInput').value || 0);

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
  if (mode === 'Cash') {
    btnCash.className = "py-2.5 rounded-lg text-xs font-bold bg-green-700 text-white shadow";
    btnAba.className = "py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";
  } else {
    btnAba.className = "py-2.5 rounded-lg text-xs font-bold bg-blue-700 text-white shadow";
    btnCash.className = "py-2.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200";
  }
}

// ==========================================
// 💾 ៤. បញ្ជាក់ការទូទាត់លុយ (SUBMIT SETTLEMENT ទៅ SUPABASE)
// ==========================================
var isSubmittingSettleLock = false;

async function submitSettlementPayment() {
  if (isSubmittingSettleLock) return;

  var checkedCbs = document.querySelectorAll('.settle-item-cb:checked');
  var selectedIds = [];
  checkedCbs.forEach(function(cb) { selectedIds.push(parseInt(cb.getAttribute('data-id'))); });

  var sub = getSelectedSettlementTotal();
  var totalDue = sub + currentSettlementOldDebt;
  var paid = parseFloat(document.getElementById('settlePaidInput').value || 0);

  if (selectedIds.length === 0 && currentSettlementOldDebt === 0) {
    showToast("សូមធីកជ្រើសរើសយ៉ាងហោចណាស់ ១ ជួរដើម្បីទូទាត់!", "error"); 
    return;
  }
  if (paid === 0) {
    showToast("សូមបញ្ចូលចំនួនប្រាក់ដែលបានបង់!", "error"); 
    return;
  }

  var remainingBalance = Math.max(0, totalDue - paid);
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
      cash_khr: (currentSettlementPayMode === 'Cash') ? paid : 0,
      scan_khr: (currentSettlementPayMode === 'ABA') ? paid : 0
    }]);
    if (setErr) throw setErr;

    // ៣. បាញ់ Telegram Alert
    try {
      var tgMsg = "🙏 <b>[KC WATER - ទូទាត់ប្រាក់ជោគជ័យ]</b>\n\n" +
                  "👤 <b>អតិថិជន៖</b> " + currentSettlementCustomer + "\n" +
                  "💳 <b>វិធីទូទាត់៖</b> " + (currentSettlementPayMode === 'ABA' ? '📱 ស្កេន ABA' : '💵 លុយសុទ្ធ') + "\n" +
                  "💰 <b>សរុបត្រូវបង់៖</b> <b>៛ " + totalDue.toLocaleString() + "</b>\n" +
                  "✅ <b>ប្រាក់បានបង់៖</b> <b>៛ " + paid.toLocaleString() + "</b>\n" +
                  "⚠️ <b>នៅជំពាក់សល់៖</b> <b>៛ " + remainingBalance.toLocaleString() + "</b>\n" +
                  "✍️ <b>អ្នកទទួល៖</b> " + (currentUser.fullName || "Admin") + "\n" +
                  "🕒 <b>ម៉ោង៖</b> " + new Date().toLocaleTimeString('km-KH');
      sendTelegramAlert(tgMsg);
    } catch(e) {}

    // ៤. បង្កើតវិក្កយបត្ររូបភាព (Receipt PNG)
    var receiptItems = currentSettlementItems.filter(function(i){ return selectedIds.indexOf(i.id) !== -1; });
    generateReceiptImage("SET-" + new Date().getTime(), currentSettlementCustomer, totalDue, paid, receiptItems, "វិក្កយបត្រទូទាត់ប្រាក់ (SETTLEMENT)");

    showToast("បានទូទាត់ប្រាក់ និងជម្រះបញ្ជីជោគជ័យ!", "success");
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    // Refresh ឡើងវិញ
    document.getElementById('settlementDetailCard').classList.add('hidden');
    await loadSettlementDebtorsList();

  } catch(err) {
    showToast("កំហុសទូទាត់ប្រាក់៖ " + err.message, "error");
  } finally {
    isSubmittingSettleLock = false;
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-invoice-dollar text-xl"></i> ទូទាត់ & ចេញវិក្កយបត្រ (Save Settlement)';
  }
}
