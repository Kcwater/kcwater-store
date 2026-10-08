/** ==========================================================================
 *  KC WATER POS SYSTEM - ALL MODULES ENGINE (pos-modules.js)
 *  (Stock, Bottle Loans, Expenses, Customers, Special Prices & Settings)
 *  ========================================================================== */

// ==========================================
// 📦 ១. គ្រប់គ្រងស្តុក (STOCK MANAGEMENT & RESTOCK)
// ==========================================
function renderStockModule() {
  var area = document.getElementById('contentArea');
  var aid = "P-" + Math.floor(Math.random() * 9000 + 1000);

  area.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' +
    '<div class="card border-t-4 border-green-700 shadow-xl">' +
      '<h2 id="sT" class="font-bold text-center mb-4 text-green-900 text-base sm:text-lg flex items-center justify-center gap-2">' +
        '<i class="fas fa-boxes-stacked text-green-600"></i>គ្រប់គ្រងទំនិញ (Products)' +
      '</h2>' +
      '<div class="grid gap-3">' +
        '<input type="text" id="pI" value="' + aid + '" readonly class="bg-gray-100 font-bold text-blue-600 text-sm border p-2.5 rounded-xl">' +
        '<input type="text" id="pN" placeholder="ឈ្មោះទំនិញ (*)" class="font-bold border p-2.5 rounded-xl">' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<select id="pTy" onchange="tCF()" class="border p-2.5 rounded-xl font-bold">' +
            '<option value="ផលិតឯង">ផលិតខ្លួនឯង</option>' +
            '<option value="ទិញគេ">ទិញគេមកលក់បន្ត</option>' +
          '</select>' +
          '<select id="pCu" class="border p-2.5 rounded-xl font-bold">' +
            '<option value="KHR">KHR (៛)</option>' +
            '<option value="THB">THB (฿)</option>' +
            '<option value="USD">USD ($)</option>' +
          '</select>' +
        '</div>' +
        '<div id="cSec" style="display:none">' +
          '<input type="number" id="pCo" placeholder="ថ្លៃដើមទិញចូល (Cost)" class="border p-2.5 rounded-xl font-bold w-full">' +
        '</div>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">' +
          '<div>' +
            '<label class="text-[10px] font-extrabold text-amber-900 uppercase block mb-1">🚚 តម្លៃបោះដុំដេប៉ូ (POS) *</label>' +
            '<input type="number" id="pPr" placeholder="ឧ៖ ៦០០" class="font-black text-amber-900 bg-white border border-amber-300 rounded-xl p-2.5 w-full outline-none">' +
          '</div>' +
          '<div>' +
            '<label class="text-[10px] font-extrabold text-emerald-900 uppercase block mb-1">🌐 តម្លៃលក់លើ Web តាមផ្ទះ *</label>' +
            '<input type="number" id="pOnlinePr" placeholder="ឧ៖ ១៥០០" class="font-black text-emerald-800 bg-white border border-emerald-300 rounded-xl p-2.5 w-full outline-none">' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="number" id="pMin" placeholder="កម្រិតដំណឹងស្តុកទាប (ឧ៖ 5)" class="border p-2.5 rounded-xl font-bold">' +
          '<select id="pChannel" class="border p-2.5 rounded-xl font-bold">' +
            '<option value="ALL">🔄 លក់ទាំងសងខាង (POS + Web)</option>' +
            '<option value="ONLINE">🌐 លក់តែលើ Web</option>' +
            '<option value="POS">🚚 លក់តែលើ POS ដេប៉ូ</option>' +
          '</select>' +
        '</div>' +
        '<input type="text" id="pImgUrl" placeholder="Link រូបភាពទំនិញ (URL)" class="border p-2.5 rounded-xl text-xs">' +
        '<button onclick="saveProductToSupabase()" id="bP" class="btn-green">រក្សាទុកទំនិញ</button>' +
      '</div>' +
    '</div>' +

    '<div class="card border-t-4 border-blue-500 shadow-lg">' +
      '<h3 class="font-bold text-blue-800 mb-3 text-sm flex items-center gap-1.5"><i class="fas fa-plus-square"></i>បញ្ចូលស្តុកថ្មី (Restock In)</h3>' +
      '<div class="grid grid-cols-2 gap-3">' +
        '<select id="si_prod" class="text-xs font-bold border p-2.5 rounded-xl"><option value="">-- រើសទំនិញ --</option></select>' +
        '<input type="number" id="si_qty" placeholder="ចំនួនទិញចូល (*)" class="border p-2.5 rounded-xl font-bold text-center">' +
      '</div>' +
      '<div class="mt-2">' +
        '<input type="number" id="si_cost" placeholder="ថ្លៃដើមថ្មី (បើតម្លៃប្រែប្រួល)" class="border p-2.5 rounded-xl font-bold w-full text-xs">' +
      '</div>' +
      '<button onclick="saveStockInToSupabase()" class="btn-green bg-blue-600 mt-3 font-bold">យល់ព្រមបញ្ចូលស្តុក</button>' +
    '</div>' +

    '<div class="card p-0 overflow-x-auto shadow-lg rounded-2xl border">' +
      '<table class="w-full text-left text-xs border-collapse">' +
        '<thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-3">រូប</th><th class="p-3">ឈ្មោះទំនិញ</th><th class="p-3 text-center">តម្លៃដេប៉ូ / Web</th><th class="p-3 text-center">ស្តុក</th><th class="p-3 text-center">សកម្មភាព</th></tr></thead>' +
        '<tbody id="stockModuleTableBody"></tbody>' +
      '</table>' +
    '</div>' +
  '</div>';

  tCF();
  initStockModuleDropdowns();
  renderStockTableRows();
}

function tCF() {
  var pTy = document.getElementById('pTy');
  var c = document.getElementById('cSec');
  if (pTy && c) c.style.display = (pTy.value === 'ផលិតឯង' ? 'none' : 'block');
}

function initStockModuleDropdowns() {
  var siSel = document.getElementById('si_prod');
  if (!siSel) return;
  siSel.innerHTML = '<option value="">-- រើសទំនិញ --</option>';
  allProducts.forEach(function(p) {
    if (p.type === 'ទិញគេ') siSel.innerHTML += '<option value="' + p.id + '">' + p.name + '</option>';
  });
}

function renderStockTableRows() {
  var tbody = document.getElementById('stockModuleTableBody');
  if (!tbody) return;
  var html = '';

  allProducts.forEach(function(p) {
    var imgUrl = p.img || "https://cdn-icons-png.flaticon.com/512/3100/3100566.png";
    var prWholesale = Number(p.price || 0).toLocaleString() + ' ៛';
    var prOnline = Number(p.online_price || p.price || 0).toLocaleString() + ' ៛';

    html += '<tr class="border-b hover:bg-gray-50">' +
      '<td class="p-2.5"><img src="' + imgUrl + '" class="w-8 h-8 object-contain rounded border"></td>' +
      '<td class="p-2.5 font-bold text-gray-800">' + p.name + '<br><span class="text-[9px] text-gray-400 font-normal">' + p.type + '</span></td>' +
      '<td class="p-2.5 text-center text-[10px]">🚚 ' + prWholesale + '<br><span class="text-emerald-700 font-bold">🌐 ' + prOnline + '</span></td>' +
      '<td class="p-2.5 text-center font-black ' + (parseFloat(p.stock || 0) <= parseFloat(p.min_stock || 5) ? 'text-red-600' : 'text-blue-800') + '">' + p.stock + '</td>' +
      '<td class="p-2.5 text-center">' +
        '<button onclick="delProductFromSupabase(\'' + p.id + '\')" class="text-red-500 hover:text-red-700 p-1"><i class="fas fa-trash-can"></i></button>' +
      '</td>' +
    '</tr>';
  });

  tbody.innerHTML = html || '<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">គ្មានទំនិញ</td></tr>';
}

async function saveProductToSupabase() {
  var name = document.getElementById('pN').value.trim();
  if (!name) { showToast("សូមបញ្ចូលឈ្មោះទំនិញ!", "error"); return; }

  var payload = {
    id: document.getElementById('pI').value,
    name: name,
    type: document.getElementById('pTy').value,
    currency: document.getElementById('pCu').value,
    cost: parseFloat(document.getElementById('pCo') ? document.getElementById('pCo').value || 0 : 0),
    price: parseFloat(document.getElementById('pPr').value || 0),
    online_price: parseFloat(document.getElementById('pOnlinePr').value || 0),
    min_stock: parseFloat(document.getElementById('pMin').value || 5),
    channel: document.getElementById('pChannel').value,
    img: document.getElementById('pImgUrl').value.trim() || "https://cdn-icons-png.flaticon.com/512/3100/3100566.png",
    stock: 100
  };

  try {
    const { error } = await supabaseClient.from('products').upsert([payload]);
    if (error) throw error;
    showToast("បានរក្សាទុកទំនិញជោគជ័យ!", "success");
    await fetchInitialPOSData();
    renderStockModule();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

async function saveStockInToSupabase() {
  var id = document.getElementById('si_prod').value;
  var qty = parseFloat(document.getElementById('si_qty').value || 0);
  var cost = parseFloat(document.getElementById('si_cost').value || 0);

  if (!id || qty <= 0) { showToast("សូមជ្រើសរើសទំនិញ និងបញ្ចូលចំនួនទិញចូល!", "error"); return; }
  var prod = allProducts.find(function(p){ return p.id === id; });

  try {
    var newStock = parseFloat(prod.stock || 0) + qty;
    var updateObj = { stock: newStock };
    if (cost > 0) updateObj.cost = cost;

    await supabaseClient.from('products').update(updateObj).eq('id', id);
    await supabaseClient.from('stock_in').insert([{
      product_id: id,
      product_name: prod ? prod.name : "",
      qty: qty,
      cost: cost > 0 ? cost : (prod ? prod.cost : 0),
      admin_name: currentUser.fullName || "Admin"
    }]);

    showToast("បានបញ្ចូលស្តុកចំនួន +" + qty + " រួចរាល់!", "success");
    await fetchInitialPOSData();
    renderStockModule();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

async function delProductFromSupabase(id) {
  if (!confirm("តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?")) return;
  try {
    await supabaseClient.from('products').delete().eq('id', id);
    showToast("បានលុបទំនិញជោគជ័យ!", "success");
    await fetchInitialPOSData();
    renderStockTableRows();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

// ==========================================
// 🛢️ ២. ភ្ញៀវខ្ចីធុង / បរិក្ខារ (BOTTLE LOANS)
// ==========================================
function renderBottleLoanModule() {
  var area = document.getElementById('contentArea');
  area.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' +
    '<div class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<h2 class="font-extrabold text-blue-900 text-base sm:text-lg flex items-center gap-2"><i class="fas fa-boxes-packing text-blue-600"></i>កត់ត្រាភ្ញៀវខ្ចីធុង / បរិក្ខារ</h2>' +
        '<button onclick="fetchBottleLoansData()" class="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border active:scale-95 transition flex items-center gap-1"><i class="fas fa-sync-alt"></i> Refresh</button>' +
      '</div>' +
      '<div class="space-y-3">' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">' +
          '<input type="text" id="bl_cust_name" placeholder="*ឈ្មោះអ្នកខ្ចី (ឧ៖ មីង សុខា)" class="font-bold border p-2.5 rounded-xl">' +
          '<input type="text" id="bl_item_name" placeholder="*មុខអីវ៉ាន់ (ឧ៖ ធុង ២០L ពណ៌ស)" value="ធុង ២០L ពណ៌ស" class="font-bold border p-2.5 rounded-xl">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="number" id="bl_qty" placeholder="ចំនួនខ្ចី (*)" class="font-black text-blue-900 border p-2.5 rounded-xl">' +
          '<input type="number" id="bl_deposit" placeholder="ប្រាក់កក់ (៛ បើមាន)" class="font-black text-green-700 border p-2.5 rounded-xl">' +
        '</div>' +
        '<button onclick="submitBottleLoanToSupabase()" class="btn-green bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold">កត់ត្រាការខ្ចី (Save Loan)</button>' +
      '</div>' +
    '</div>' +
    '<div class="card border-t-4 border-orange-500 shadow-xl p-5 mb-0">' +
      '<h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-clock-rotate-left text-orange-600"></i>បញ្ជីអ្នកកំពុងខ្ចីសំបកធុង</h3>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">ថ្ងៃខ្ចី</th><th class="p-2.5">អ្នកខ្ចី</th><th class="p-2.5">អីវ៉ាន់ខ្ចី</th><th class="p-2.5 text-center">ខ្ចី</th><th class="p-2.5 text-center">បានសង</th><th class="p-2.5 text-center">នៅខ្វះ</th><th class="p-2.5 text-center">សង</th></tr></thead><tbody id="blTableBody"></tbody></table></div>' +
    '</div>' +
  '</div>';

  fetchBottleLoansData();
}

async function fetchBottleLoansData() {
  var tbody = document.getElementById('blTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-gray-400 italic">កំពុងទាញទិន្នន័យ...</td></tr>';

  try {
    const { data: list } = await supabaseClient.from('bottle_loans').select('*').eq('status', 'Borrowing').order('created_at', { ascending: false });
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-green-600 font-bold"><i class="fas fa-check-circle mr-1"></i> គ្មានអ្នកជំពាក់សំបកធុងឡើយ</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function(item) {
      var remaining = Math.max(0, parseFloat(item.borrowed_qty || 0) - parseFloat(item.returned_qty || 0));
      var dateStr = new Date(item.created_at).toLocaleDateString('km-KH');

      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 text-gray-500 text-[10px]">' + dateStr + '</td>' +
        '<td class="p-2.5 font-bold text-gray-800">' + item.customer_name + '</td>' +
        '<td class="p-2.5">' + item.item_name + '</td>' +
        '<td class="p-2.5 text-center font-bold text-blue-700">' + item.borrowed_qty + '</td>' +
        '<td class="p-2.5 text-center font-bold text-green-700">' + item.returned_qty + '</td>' +
        '<td class="p-2.5 text-center font-black text-orange-700">' + remaining + '</td>' +
        '<td class="p-2.5 text-center"><button onclick="quickReturnBottleLoan(\'' + item.loan_id + '\', ' + remaining + ', ' + item.returned_qty + ', ' + item.borrowed_qty + ')" class="px-2.5 py-1 bg-green-600 text-white rounded-lg font-bold text-xs active:scale-95 transition">សង</button></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

async function submitBottleLoanToSupabase() {
  var name = document.getElementById('bl_cust_name').value.trim();
  var item = document.getElementById('bl_item_name').value.trim();
  var qty = parseFloat(document.getElementById('bl_qty').value || 0);
  var deposit = parseFloat(document.getElementById('bl_deposit').value || 0);

  if (!name || !item || qty <= 0) { showToast("សូមបំពេញឈ្មោះ អីវ៉ាន់ និងចំនួនខ្ចី!", "error"); return; }

  try {
    await supabaseClient.from('bottle_loans').insert([{
      loan_id: "BL-" + new Date().getTime(),
      customer_name: name,
      item_name: item,
      borrowed_qty: qty,
      returned_qty: 0,
      deposit: deposit,
      status: 'Borrowing',
      admin_name: currentUser.fullName || "Admin"
    }]);

    showToast("បានកត់ត្រាការខ្ចីជោគជ័យ!", "success");
    document.getElementById('bl_cust_name').value = "";
    document.getElementById('bl_qty').value = "";
    document.getElementById('bl_deposit').value = "";
    fetchBottleLoansData();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

async function quickReturnBottleLoan(loanId, remaining, returned, borrowed) {
  var val = prompt("សងសំបកធុង (នៅជំពាក់ " + remaining + " ធុង)៖ សូមវាយចំនួនសង៖", remaining);
  var returnQty = parseFloat(val);
  if (isNaN(returnQty) || returnQty <= 0) return;

  var newReturned = returned + returnQty;
  var newStatus = (newReturned >= borrowed) ? 'Returned' : 'Borrowing';

  try {
    await supabaseClient.from('bottle_loans').update({
      returned_qty: newReturned,
      status: newStatus
    }).eq('loan_id', loanId);

    showToast("បានកត់ត្រាការសងជោគជ័យ!", "success");
    fetchBottleLoansData();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

// ==========================================
// 💸 ៣. កត់ត្រាការចំណាយ (EXPENSES)
// ==========================================
function renderExpensesModule() {
  var area = document.getElementById('contentArea');
  area.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' +
    '<div class="card border-t-4 border-red-500 shadow-xl p-5 mb-0">' +
      '<h2 class="font-extrabold text-red-900 text-base mb-3 flex items-center gap-2"><i class="fas fa-money-bill-wave text-red-600"></i>កត់ត្រាការចំណាយប្រចាំថ្ងៃ</h2>' +
      '<div class="space-y-3">' +
        '<select id="exp_cat" class="font-bold border p-2.5 rounded-xl w-full">' +
          '<option value="ថ្លៃប្រេងសាំង (ឡាន/ម៉ូតូ)">⛽ ថ្លៃប្រេងសាំង (ឡាន/ម៉ូតូដឹកទឹក)</option>' +
          '<option value="ថ្លៃអគ្គិសនី & ទឹក">⚡ ថ្លៃអគ្គិសនី & ទឹក</option>' +
          '<option value="ថ្លៃជួសជុលម៉ាស៊ីន">🔧 ថ្លៃជួសជុលម៉ាស៊ីនចម្រោះ / បរិក្ខារ</option>' +
          '<option value="ថ្លៃគម្របធុង & ផ្លាកសញ្ញា">🏷️ ថ្លៃគម្របធុង, ផ្លាកសញ្ញា, ថង់</option>' +
          '<option value="ថ្លៃបាយទឹកបុគ្គលិក">🍚 ថ្លៃម្ហូបអាហារ / បាយទឹកបុគ្គលិក</option>' +
          '<option value="ចំណាយផ្សេងៗ">📦 ចំណាយផ្សេងៗ...</option>' +
        '</select>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="number" id="exp_amt" placeholder="ចំនួនទឹកប្រាក់ (*)" class="font-black text-red-700 border p-2.5 rounded-xl">' +
          '<select id="exp_curr" class="font-bold border p-2.5 rounded-xl"><option value="KHR">KHR (៛)</option><option value="THB">THB (฿)</option><option value="USD">USD ($)</option></select>' +
        '</div>' +
        '<input type="text" id="exp_note" placeholder="ចំណាំលម្អិត (បើមាន)..." class="border p-2.5 rounded-xl w-full text-xs">' +
        '<button onclick="submitExpenseToSupabase()" class="btn-green bg-red-600 hover:bg-red-700 py-3 text-sm font-bold">រក្សាទុកការចំណាយ</button>' +
      '</div>' +
    '</div>' +
    '<div class="card border-t-4 border-gray-700 shadow-xl p-5 mb-0">' +
      '<h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-history"></i>ប្រវត្តិការចំណាយ</h3>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">កាលបរិច្ឆេទ</th><th class="p-2.5">ប្រភេទចំណាយ</th><th class="p-2.5 text-right">ចំនួនទឹកប្រាក់</th><th class="p-2.5 text-center">លុប</th></tr></thead><tbody id="expTableBody"></tbody></table></div>' +
    '</div>' +
  '</div>';

  fetchExpensesHistory();
}

async function fetchExpensesHistory() {
  var tbody = document.getElementById('expTableBody');
  if (!tbody) return;

  try {
    const { data: list } = await supabaseClient.from('expenses').select('*').order('created_at', { ascending: false }).limit(20);
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 italic">គ្មានទិន្នន័យចំណាយ</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function(item) {
      var dateStr = new Date(item.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 text-gray-500 text-[10px]">' + dateStr + '</td>' +
        '<td class="p-2.5 font-bold text-gray-800">' + item.category + (item.note ? '<br><small class="text-gray-400 font-normal">' + item.note + '</small>' : '') + '</td>' +
        '<td class="p-2.5 text-right font-black text-red-700">' + Number(item.amount).toLocaleString() + ' ' + item.currency + '</td>' +
        '<td class="p-2.5 text-center"><button onclick="delExpenseFromSupabase(\'' + item.expense_id + '\')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-can"></i></button></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

async function submitExpenseToSupabase() {
  var cat = document.getElementById('exp_cat').value;
  var amt = parseFloat(document.getElementById('exp_amt').value || 0);
  var curr = document.getElementById('exp_curr').value;
  var note = document.getElementById('exp_note').value.trim();

  if (amt <= 0) { showToast("សូមបញ្ចូលចំនួនទឹកប្រាក់ធំជាង ០!", "error"); return; }

  try {
    await supabaseClient.from('expenses').insert([{
      expense_id: "EXP-" + new Date().getTime(),
      category: cat,
      amount: amt,
      currency: curr,
      note: note,
      admin_name: currentUser.fullName || "Admin"
    }]);

    showToast("បានកត់ត្រាការចំណាយជោគជ័យ!", "success");
    document.getElementById('exp_amt').value = "";
    document.getElementById('exp_note').value = "";
    fetchExpensesHistory();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

async function delExpenseFromSupabase(id) {
  if (!confirm("តើអ្នកពិតជាចង់លុបការចំណាយនេះមែនទេ?")) return;
  try {
    await supabaseClient.from('expenses').delete().eq('expense_id', id);
    showToast("បានលុបការចំណាយជោគជ័យ!", "success");
    fetchExpensesHistory();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}
// ==========================================
// 👥 ៤. គ្រប់គ្រងគណនី & តម្លៃពិសេស (CUSTOMERS & MONTHLY PRICES)
// ==========================================
function renderCustomersModule() {
  var area = document.getElementById('contentArea');
  if (!area) return;
  
  var custOptions = '<option value="">-- រើសអតិថិជន / ម៉ូយ --</option>';
  (allCustomers || []).forEach(function(c) {
    if (c.role !== 'Admin' && c.full_name !== 'Walk-in') {
      var tag = (c.type === 'Monthly') ? ' [ប្រចាំខែ]' : ' [អ្នកលក់បន្ត]';
      custOptions += '<option value="' + c.full_name + '">' + c.full_name + tag + '</option>';
    }
  });

  var prodOptions = '<option value="">-- រើសទំនិញ --</option>';
  (allProducts || []).forEach(function(p) {
    prodOptions += '<option value="' + p.name + '">' + p.name + '</option>';
  });

  var bossOptions = '<option value="">-- ជ្រើសរើសពីបញ្ជីម៉ូយ ឬវាយខាងក្រោម --</option>';
  (allCustomers || []).forEach(function(c) {
    if (c.role === 'Customer' || c.type === 'Regular' || c.type === 'Monthly') {
      bossOptions += '<option value="' + c.full_name + '">' + c.full_name + '</option>';
    }
  });

  area.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' +
    // ១. កាតបង្កើតគណនី
    '<div class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0">' +
      '<h2 class="font-extrabold text-blue-900 text-base mb-3 flex items-center gap-2">' +
        '<i class="fas fa-user-plus text-blue-600"></i>បង្កើតគណនី Admin / អ្នកដឹក / អតិថិជន' +
      '</h2>' +
      '<div class="space-y-3">' +
        '<div>' +
          '<label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">ប្រភេទគណនីដែលត្រូវបង្កើត</label>' +
          '<select id="mem_role_type" onchange="toggleCustTypeFields()" class="font-bold border-2 border-blue-200 p-2.5 rounded-xl w-full bg-white">' +
            '<option value="MONTHLY">🏢 អតិថិជនប្រចាំខែ (Monthly - គ្មាន Login, Admin បញ្ចូលឱ្យ)</option>' +
            '<option value="RESELLER">🚚 អតិថិជនប្រចាំ - អ្នកលក់បន្ត (Reseller - មាន Login)</option>' +
            '<option value="DRIVER">🛵 កូនចៅ/អ្នកដឹក (Driver - ដកទឹកជំនួសមេ)</option>' +
            '<option value="COMPANY_DRIVER">🚚 អ្នកដឹកជញ្ជូនរោងចក្រ (Company Driver)</option>' +
            '<option value="SELLER">🛒 បុគ្គលិកលក់នៅកន្លែង (Seller / Cashier)</option>' +
            '<option value="ADMIN">👑 Admin អ្នកគ្រប់គ្រង (Admin)</option>' +
          '</select>' +
        '</div>' +

        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="text" id="mem_name" placeholder="*ឈ្មោះពេញ (ឧ៖ ក្រុមហ៊ុន A ឬ តារា)" class="font-bold border p-2.5 rounded-xl">' +
          '<input type="text" id="mem_phone" placeholder="លេខទូរស័ព្ទ (បើមាន)" class="border p-2.5 rounded-xl">' +
        '</div>' +

        // ប្រអប់រើសឈ្មោះមេ (សម្រាប់តែ Driver កូនចៅដកទឹក)
        '<div id="driverBossContainer" class="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-1.5 hidden">' +
          '<label class="text-[10px] font-black text-amber-950 uppercase block">ឈ្មោះមេ (អតិថិជនដែលកូនចៅនេះមកដកទឹកជំនួស) *</label>' +
          '<select id="mem_boss_select" onchange="document.getElementById(\'mem_boss_custom\').value=this.value" class="font-bold text-amber-950 border border-amber-300 bg-white rounded-xl p-2 w-full text-xs">' +
            bossOptions +
          '</select>' +
          '<input type="text" id="mem_boss_custom" placeholder="ឬវាយឈ្មោះមេនៅទីនេះ (បើមិនទាន់មានក្នុងបញ្ជី)..." class="font-bold border border-amber-300 bg-white rounded-xl p-2 w-full text-xs">' +
        '</div>' +

        // ប្រអប់ Username & Password (លាក់ចោលតែពេលរើស MONTHLY មួយគត់!)
        '<div id="loginCredsContainer" class="grid grid-cols-2 gap-2 p-3 bg-blue-50/60 rounded-2xl border border-blue-200 hidden">' +
          '<div>' +
            '<label class="text-[9.5px] font-bold text-blue-900 uppercase block mb-1">Username ចូលប្រើ *</label>' +
            '<input type="text" id="mem_user" placeholder="ឧ៖ user123" class="font-bold border p-2 rounded-xl w-full bg-white text-xs">' +
          '</div>' +
          '<div>' +
            '<label class="text-[9.5px] font-bold text-blue-900 uppercase block mb-1">Password លេខសម្ងាត់ *</label>' +
            '<input type="text" id="mem_pass" placeholder="លេខសម្ងាត់" class="font-bold border p-2 rounded-xl w-full bg-white text-xs">' +
          '</div>' +
        '</div>' +

        '<button onclick="saveUserToSupabase()" id="btnSaveUserAction" class="btn-green shadow-lg py-3 text-sm font-bold">រក្សាទុកគណនី (Save Account)</button>' +
      '</div>' +
    '</div>' +

    // ២. កាតកំណត់តម្លៃពិសេស (សម្រាប់អតិថិជន Monthly & Reseller)
    '<div class="card border-t-4 border-orange-500 shadow-xl p-5 mb-0">' +
      '<h3 class="font-extrabold text-orange-900 text-base mb-1 flex items-center gap-2">' +
        '<i class="fas fa-tags text-orange-600"></i>កំណត់តម្លៃពិសេសសម្រាប់អតិថិជន (Contract Prices)' +
      '</h3>' +
      '<p class="text-[11px] text-gray-500 mb-3 leading-relaxed">' +
        '💡 <b>ចំណាំសម្រាប់អតិថិជន Monthly៖</b> កំណត់មុខទំនិញ និងតម្លៃនៅទីនេះ ដើម្បីឱ្យទំនិញនោះបង្ហាញលើផ្ទាំង POS ពេលលក់ឱ្យគាត់ (ទំនិញក្រៅពីនេះនឹងមិនបង្ហាញឡើយ)។' +
      '</p>' +
      '<div class="space-y-3">' +
        '<div>' +
          '<label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">១. ជ្រើសរើសម៉ូយ</label>' +
          '<select id="spCustSelect" class="w-full font-bold border p-2.5 rounded-xl bg-white">' + custOptions + '</select>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">២. ជ្រើសរើសទំនិញ</label>' +
            '<select id="spProdSelect" class="font-bold border p-2.5 rounded-xl bg-white w-full">' + prodOptions + '</select>' +
          '</div>' +
          '<div>' +
            '<label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">៣. តម្លៃពិសេស (៛)</label>' +
            '<input type="number" id="spPriceInput" placeholder="ឧ៖ ៥០០" class="font-black text-orange-700 border p-2.5 rounded-xl text-center w-full">' +
          '</div>' +
        '</div>' +
        '<button onclick="saveSpecialPriceToSupabase()" class="btn-green bg-orange-600 hover:bg-orange-700 py-3 text-sm font-bold">រក្សាទុកតម្លៃពិសេស (Save Price)</button>' +
      '</div>' +
    '</div>' +

    // ៣. តារាងតម្លៃពិសេស
    '<div class="card border-t-4 border-orange-400 shadow-lg p-5 mb-0">' +
      '<h4 class="font-bold text-gray-800 text-sm mb-2"><i class="fas fa-list-check text-orange-600 mr-1.5"></i>បញ្ជីតម្លៃពិសេសដែលបានកំណត់</h4>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">អតិថិជន</th><th class="p-2.5">មុខទំនិញ</th><th class="p-2.5 text-right">តម្លៃពិសេស</th><th class="p-2.5 text-center">លុប</th></tr></thead><tbody id="specialPricesTableBody"></tbody></table></div>' +
    '</div>' +

    // ៤. តារាងគណនីទាំងអស់
    '<div class="card border-t-4 border-gray-700 shadow-xl p-5 mb-0">' +
      '<h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-users"></i>បញ្ជីគណនីទាំងអស់</h3>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">ឈ្មោះ</th><th class="p-2.5">ព័ត៌មានគណនី</th><th class="p-2.5 text-center">តួនាទី / ប្រភេទ</th><th class="p-2.5 text-center">លុប</th></tr></thead><tbody id="usersModuleTableBody"></tbody></table></div>' +
    '</div>' +
  '</div>';

  toggleCustTypeFields();
  fetchUsersModuleTable();
  fetchSpecialPricesTable();
}

// មុខងារបង្ហាញ/លាក់ប្រអប់៖ លាក់ Username/Pass តែពេលរើស MONTHLY មួយគត់!
function toggleCustTypeFields() {
  var roleTypeEl = document.getElementById('mem_role_type');
  var roleType = roleTypeEl ? roleTypeEl.value : 'MONTHLY';
  var bossBox = document.getElementById('driverBossContainer');
  var loginBox = document.getElementById('loginCredsContainer');

  if (bossBox) {
    if (roleType === 'DRIVER') bossBox.classList.remove('hidden');
    else bossBox.classList.add('hidden');
  }

  // ✅ អតិថិជនប្រចាំខែ (MONTHLY) តែមួយគត់ដែលលាក់ប្រអប់ Username/Password
  if (loginBox) {
    if (roleType === 'MONTHLY') {
      loginBox.classList.add('hidden');
    } else {
      loginBox.classList.remove('hidden');
    }
  }
}

// 🛠️ មុខងារជំនួយអានតម្លៃ Input ដោយសុវត្ថិភាព (គ្មានថ្ងៃគាំង null.value ទៀតឡើយ)
function getElVal(id) {
  var el = document.getElementById(id);
  return el ? (el.value || '').trim() : '';
}

// ✅ មុខងាររក្សាទុកគណនី (ដំណើរការជោគជ័យ ១០០% គ្រប់ប្រភេទគណនី)
async function saveUserToSupabase() {
  var name = getElVal('mem_name');
  var roleType = getElVal('mem_role_type') || getElVal('mem_role') || 'MONTHLY';
  var phone = getElVal('mem_phone');
  
  if (!name) { 
    showToast("សូមបញ្ចូលឈ្មោះពេញ!", "error"); 
    var nameInp = document.getElementById('mem_name');
    if (nameInp) nameInp.focus();
    return; 
  }

  var role = "Customer";
  var type = "Regular";
  var linkedBoss = "";
  var user = getElVal('mem_user');
  var pass = getElVal('mem_pass');

  // ១. អតិថិជនប្រចាំខែ (Monthly តែមួយគត់ដែលគ្មាន Username & Password)
  if (roleType === 'MONTHLY') {
    role = 'Customer';
    type = 'Monthly';
    // បង្កើតកូដសម្គាល់ក្នុង Database អូតូ (ភ្ញៀវមិនបាច់វាយឡើយ)
    user = "monthly_" + (phone ? phone.replace(/[^0-9]/g, '') : "") + "_" + Date.now();
    pass = "1234";

  // ២. អតិថិជនប្រចាំ - អ្នកលក់បន្ត (Reseller - មាន Login ដូចក្នុងរូបភាពរបស់បង)
  } else if (roleType === 'RESELLER') {
    role = 'Customer';
    type = 'Regular';
    if (!user || !pass) {
      showToast("សូមវាយ Username និង Password សម្រាប់ម៉ូយ Login!", "error");
      return;
    }

  // ៣. កូនចៅ/អ្នកដឹកដកទឹកជំនួសមេ
  } else if (roleType === 'DRIVER') {
    role = 'Driver';
    type = 'Driver';
    var customBoss = getElVal('mem_boss_custom') || getElVal('mem_boss');
    var selectBoss = getElVal('mem_boss_select') || getElVal('driverBossSel');
    linkedBoss = customBoss || selectBoss;

    if (!user || !pass) {
      showToast("សូមវាយ Username និង Password សម្រាប់អ្នកដឹក Login!", "error");
      return;
    }

  // ៤. អ្នកដឹកជញ្ជូនរោងចក្រ (Company Driver)
  } else if (roleType === 'COMPANY_DRIVER') {
    role = 'Driver';
    type = 'CompanyDriver';
    linkedBoss = 'KC WATER';
    if (!user || !pass) {
      showToast("សូមវាយ Username និង Password សម្រាប់អ្នកដឹក!", "error");
      return;
    }

  // ៥. បុគ្គលិកលក់នៅកន្លែង (Seller)
  } else if (roleType === 'SELLER') {
    role = 'Seller';
    type = 'Retail';
    if (!user || !pass) {
      showToast("សូមវាយ Username និង Password សម្រាប់បុគ្គលិកលក់!", "error");
      return;
    }

  // ៦. Admin អ្នកគ្រប់គ្រង
  } else if (roleType === 'ADMIN') {
    role = 'Admin';
    type = 'Admin';
    if (!user || !pass) {
      showToast("សូមវាយ Username និង Password សម្រាប់ Admin!", "error");
      return;
    }
  }

  var btn = document.getElementById('btnSaveUserAction');
  if (btn) { btn.disabled = true; btn.innerText = "កំពុងរក្សាទុក..."; }

  try {
    const { error } = await supabaseClient.from('users').insert([{
      full_name: name,
      username: user,
      password: pass,
      role: role,
      type: type,
      phone: phone,
      linked_boss: linkedBoss
    }]);

    if (error) throw error;

    showToast("បានបង្កើត [" + name + "] ជោគជ័យ!", "success");

    // សម្អាតប្រអប់
    var elName = document.getElementById('mem_name'); if (elName) elName.value = "";
    var elPhone = document.getElementById('mem_phone'); if (elPhone) elPhone.value = "";
    var elUser = document.getElementById('mem_user'); if (elUser) elUser.value = "";
    var elPass = document.getElementById('mem_pass'); if (elPass) elPass.value = "";
    var elBoss = document.getElementById('mem_boss_custom'); if (elBoss) elBoss.value = "";

    await fetchInitialPOSData();
    renderCustomersModule();

  } catch(err) {
    console.error("Save user error:", err);
    showToast("កំហុស៖ " + (err.message || err), "error");
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = "រក្សាទុកគណនី (Save Account)"; }
  }
}
async function fetchUsersModuleTable() {
  var tbody = document.getElementById('usersModuleTableBody');
  if (!tbody) return;

  try {
    const { data: users, error } = await supabaseClient.from('users').select('*').order('id', { ascending: false });
    if (error) throw error;
    if (!users) return;

    var html = '';
    users.forEach(function(u) {
      var badgeHtml = '';
      if (u.type === 'Monthly') {
        badgeHtml = '<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-orange-100 text-orange-800 border border-orange-300">🏢 ប្រចាំខែ</span>';
      } else if (u.type === 'CompanyDriver') {
        badgeHtml = '<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300">🚚 អ្នកដឹក KC WATER</span>';
      } else if (u.type === 'Driver') {
        badgeHtml = '<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">🛵 កូនចៅដកទឹក (មេ: ' + (u.linked_boss || '-') + ')</span>';
      } else if (u.role === 'Admin') {
        badgeHtml = '<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-900">👑 Admin</span>';
      } else if (u.role === 'Seller') {
        badgeHtml = '<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-900">🛒 បុគ្គលិកលក់</span>';
      } else {
        badgeHtml = '<span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-green-100 text-green-800">🚚 អ្នកលក់បន្ត</span>';
      }

      var credsText = (u.type === 'Monthly') ? 
        '<span class="text-gray-400 text-[11px] italic">ម៉ូយប្រចាំខែ (គ្មាន Login)</span>' : 
        ('<span class="font-mono text-xs"><b>' + (u.username || '-') + '</b> / ' + (u.password || '-') + '</span>');

      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 font-bold text-gray-800">' + u.full_name + '<br><small class="text-gray-400 font-normal">' + (u.phone || '-') + '</small></td>' +
        '<td class="p-2.5">' + credsText + '</td>' +
        '<td class="p-2.5 text-center">' + badgeHtml + '</td>' +
        '<td class="p-2.5 text-center"><button onclick="delUserFromSupabase(' + u.id + ')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-can"></i></button></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {
    console.error("Fetch users error:", e);
  }
}

async function fetchSpecialPricesTable() {
  var tbody = document.getElementById('specialPricesTableBody');
  if (!tbody) return;

  try {
    const { data: list } = await supabaseClient.from('customer_prices').select('*').order('id', { ascending: false });
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 italic">មិនទាន់មានតម្លៃពិសេសនៅឡើយ</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function(sp) {
      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 font-bold text-gray-800">' + sp.customer_name + '</td>' +
        '<td class="p-2.5">' + sp.product_name + '</td>' +
        '<td class="p-2.5 text-right font-black text-orange-700">៛ ' + Number(sp.price).toLocaleString() + '</td>' +
        '<td class="p-2.5 text-center"><button onclick="delSpecialPriceFromSupabase(' + sp.id + ')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-can"></i></button></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

async function saveSpecialPriceToSupabase() {
  var cust = document.getElementById('spCustSelect').value;
  var prod = document.getElementById('spProdSelect').value;
  var price = parseFloat(document.getElementById('spPriceInput').value || 0);

  if (!cust || !prod || price <= 0) { 
    showToast("សូមជ្រើសរើសម៉ូយ ទំនិញ និងតម្លៃពិសេស!", "error"); 
    return; 
  }

  try {
    await supabaseClient.from('customer_prices').upsert([{
      customer_name: cust,
      product_name: prod,
      price: price,
      currency: "KHR"
    }]);

    showToast("បានរក្សាទុកតម្លៃពិសេសជោគជ័យ!", "success");
    document.getElementById('spPriceInput').value = "";
    fetchSpecialPricesTable();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

async function delSpecialPriceFromSupabase(id) {
  if (!confirm("តើអ្នកចង់លុបតម្លៃពិសេសនេះមែនទេ?")) return;
  try {
    await supabaseClient.from('customer_prices').delete().eq('id', id);
    showToast("បានលុបតម្លៃពិសេសជោគជ័យ!", "success");
    fetchSpecialPricesTable();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

async function delUserFromSupabase(id) {
  if (!confirm("តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?")) return;
  try {
    await supabaseClient.from('users').delete().eq('id', id);
    showToast("បានលុបគណនីជោគជ័យ!", "success");
    await fetchInitialPOSData();
    renderCustomersModule();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

// ==========================================
// ⚙️ ៥. ការកំណត់ប្រព័ន្ធ & PROMOTION (SETTINGS)
// ==========================================
function renderSettingsModule() {
  var area = document.getElementById('contentArea');
  var prodOptions = '<option value="ALL">🔄 គ្រប់មុខទំនិញទាំងអស់ (All Products)</option>';
  allProducts.forEach(function(p) {
    prodOptions += '<option value="' + p.name + '">📦 ' + p.name + '</option>';
  });

  area.innerHTML = '<div class="max-w-2xl mx-auto space-y-4">' +
    // ម៉ោងធ្វើការ & សេវាដឹក
    '<div class="card border-t-4 border-indigo-600 shadow-xl p-5 mb-0 space-y-3">' +
      '<h2 class="font-extrabold text-indigo-950 text-base flex items-center gap-2"><i class="fas fa-clock text-indigo-600"></i>ម៉ោងទទួលកុម្ម៉ង់ & សេវាដឹក (Store Rules)</h2>' +
      '<div class="grid grid-cols-2 gap-2 text-xs">' +
        '<div><label class="font-bold text-gray-500 uppercase block">ម៉ោងបើក (Open)</label><input type="time" id="set_open_time" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
        '<div><label class="font-bold text-gray-500 uppercase block">ម៉ោងបិទ (Close)</label><input type="time" id="set_close_time" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2 text-xs">' +
        '<div><label class="font-bold text-gray-500 uppercase block">ថ្លៃដឹកធម្មតា (៛)</label><input type="number" id="set_del_fee" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
        '<div><label class="font-bold text-gray-500 uppercase block">កុម្ម៉ង់ចាប់ពី (X ធុង) ដឹក FREE</label><input type="number" id="set_del_min" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
      '</div>' +
    '</div>' +

    // ប្រព័ន្ធ Promotion លើ Web
    '<div class="card border-t-4 border-amber-500 shadow-xl p-5 mb-0 space-y-3">' +
      '<div class="flex justify-between items-center">' +
        '<h3 class="font-extrabold text-amber-950 text-base flex items-center gap-2"><i class="fas fa-gift text-amber-600"></i>ប្រព័ន្ធ Promotion លើ Website</h3>' +
        '<select id="set_promo_status" class="text-xs font-bold border border-amber-300 rounded-xl p-1.5"><option value="OFF">🔕 បិទ (OFF)</option><option value="ON">🔔 បើក (ON)</option></select>' +
      '</div>' +
      '<div class="space-y-2 text-xs">' +
        '<select id="set_promo_product" class="w-full font-bold border border-amber-300 rounded-xl p-2 bg-white">' + prodOptions + '</select>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="number" id="set_promo_buy_qty" placeholder="ទិញគ្រប់ (X ធុង)" class="border border-amber-300 p-2 rounded-xl text-center font-bold">' +
          '<input type="number" id="set_promo_free_qty" placeholder="ថែម Free (Y ធុង)" class="border border-emerald-300 p-2 rounded-xl text-center font-bold text-emerald-800">' +
        '</div>' +
        '<input type="text" id="set_promo_banner" placeholder="ពាក្យផ្សាយ Promotion លើក្បាលទំព័រ..." class="border p-2 rounded-xl w-full font-bold">' +
      '</div>' +
    '</div>' +

    // Telegram Bot
    '<div class="card border-t-4 border-green-600 shadow-xl p-5 mb-0 space-y-3">' +
      '<div class="flex justify-between items-center">' +
        '<h3 class="font-extrabold text-green-950 text-base flex items-center gap-2"><i class="fab fa-telegram text-blue-500"></i>Telegram Bot Alert</h3>' +
        '<button type="button" onclick="testTelegramAlertNow()" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200">🔔 តេស្តផ្ញើសារ</button>' +
      '</div>' +
      '<div class="space-y-2 text-xs">' +
        '<input type="text" id="set_tg_token" placeholder="Telegram Bot Token" class="border p-2 rounded-xl w-full font-mono">' +
        '<input type="text" id="set_tg_chatid" placeholder="Telegram Chat ID" class="border p-2 rounded-xl w-full font-mono">' +
      '</div>' +
      '<button onclick="saveSettingsToSupabase()" class="btn-green py-3 text-sm font-bold">រក្សាទុកការកំណត់ទាំងអស់</button>' +
    '</div>' +
  '</div>';

  loadSettingsForm();
}

async function loadSettingsForm() {
  try {
    const { data } = await supabaseClient.from('settings').select('*');
    if (!data) return;
    data.forEach(function(r) {
      if (r.key === 'Store_Open_Time') document.getElementById('set_open_time').value = r.value;
      if (r.key === 'Store_Close_Time') document.getElementById('set_close_time').value = r.value;
      if (r.key === 'Delivery_Fee_Standard') document.getElementById('set_del_fee').value = r.value;
      if (r.key === 'Delivery_Free_Min_Qty') document.getElementById('set_del_min').value = r.value;
      if (r.key === 'Telegram_Token') document.getElementById('set_tg_token').value = r.value;
      if (r.key === 'Telegram_ChatID') document.getElementById('set_tg_chatid').value = r.value;
      if (r.key === 'Promo_Status') document.getElementById('set_promo_status').value = r.value;
      if (r.key === 'Promo_Target_Product') document.getElementById('set_promo_product').value = r.value;
      if (r.key === 'Promo_Buy_Qty') document.getElementById('set_promo_buy_qty').value = r.value;
      if (r.key === 'Promo_Free_Qty') document.getElementById('set_promo_free_qty').value = r.value;
      if (r.key === 'Promo_Banner_Text') document.getElementById('set_promo_banner').value = r.value;
    });
  } catch(e) {}
}

async function saveSettingsToSupabase() {
  var rows = [
    { key: 'Store_Open_Time', value: document.getElementById('set_open_time').value || "07:00" },
    { key: 'Store_Close_Time', value: document.getElementById('set_close_time').value || "18:00" },
    { key: 'Delivery_Fee_Standard', value: document.getElementById('set_del_fee').value || "2000" },
    { key: 'Delivery_Free_Min_Qty', value: document.getElementById('set_del_min').value || "2" },
    { key: 'Telegram_Token', value: document.getElementById('set_tg_token').value.trim() },
    { key: 'Telegram_ChatID', value: document.getElementById('set_tg_chatid').value.trim() },
    { key: 'Promo_Status', value: document.getElementById('set_promo_status').value },
    { key: 'Promo_Target_Product', value: document.getElementById('set_promo_product').value },
    { key: 'Promo_Buy_Qty', value: document.getElementById('set_promo_buy_qty').value || "5" },
    { key: 'Promo_Free_Qty', value: document.getElementById('set_promo_free_qty').value || "1" },
    { key: 'Promo_Banner_Text', value: document.getElementById('set_promo_banner').value.trim() }
  ];

  try {
    await supabaseClient.from('settings').upsert(rows);
    showToast("បានរក្សាទុកការកំណត់ជោគជ័យ!", "success");
    await loadSettingsAndTelegram();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

function testTelegramAlertNow() {
  sendTelegramAlert("🔔 <b>[KC WATER - តេស្តប្រព័ន្ធ]</b>\n\nTelegram Bot បានតភ្ជាប់ជាមួយប្រព័ន្ធ Vercel + Supabase ជោគជ័យ ១០០% ហើយ!\n🕒 ម៉ោង៖ " + new Date().toLocaleTimeString('km-KH'));
  showToast("បានផ្ញើសារតេស្តទៅ Telegram!", "success");
}
// ==========================================
// 🏠 ៦. ទំព័រដើមគណនីម៉ូយប្រចាំ (CUSTOMER PORTAL - CUSTPORTAL)
// ==========================================
var custPortalDataCache = null;

async function renderCustomerPortalHome() {
  var area = document.getElementById('contentArea');
  if (!area) return;

  area.innerHTML = '<div class="max-w-2xl mx-auto space-y-4">' +
    // ១. កាតស្វាគមន៍ & ព័ត៌មានម៉ូយ
    '<div class="card border-t-4 border-green-600 bg-gradient-to-r from-green-800 to-green-700 text-white p-5 shadow-xl rounded-3xl">' +
      '<div class="flex justify-between items-start">' +
        '<div>' +
          '<span id="cpBadgeType" class="text-[10px] bg-green-900/80 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-400/40">គណនីម៉ូយប្រចាំ KC WATER</span>' +
          '<h2 class="text-xl sm:text-2xl font-black mt-1">👋 សួស្តី, ' + currentUser.fullName + '</h2>' +
          '<p class="text-[11px] text-green-100 mt-0.5">ប្រព័ន្ធត្រួតពិនិត្យការដកទឹក តម្លៃ និងទូទាត់ប្រាក់</p>' +
        '</div>' +
        '<div class="flex gap-1.5">' +
          '<button onclick="openChangePasswordModal()" title="ប្តូរលេខសម្ងាត់" class="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm active:scale-95 transition shadow-sm"><i class="fas fa-key"></i></button>' +
          '<button onclick="openContactEnterpriseModal()" title="ទាក់ទងរោងចក្រ" class="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm active:scale-95 transition shadow-sm"><i class="fas fa-phone"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-green-600/60">' +
        '<button onclick="openMyPricesModal()" class="py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition"><i class="fas fa-tags text-yellow-300"></i> តម្លៃទឹករបស់ខ្ញុំ</button>' +
        '<button onclick="viewMyMonthlyStatement()" class="py-2 px-3 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition"><i class="fas fa-file-invoice text-emerald-300"></i> កាតគ្រីខែនេះ</button>' +
      '</div>' +
    '</div>' +

    // ២. កាតស្ថិតិ ៣ (ដកទឹកថ្ងៃនេះ, បំណុលចាស់, សំបកធុងខ្ចី)
    '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
      '<div class="dash-card border-l-4 border-blue-500 shadow-md p-4 bg-white rounded-2xl"><div class="text-xs font-bold text-gray-500 uppercase">ដកទឹកថ្ងៃនេះ</div><div id="cpTodayTotal" class="mt-2 text-base sm:text-lg font-black text-blue-900">0 ៛</div></div>' +
      '<div class="dash-card border-l-4 border-orange-500 shadow-md p-4 bg-white rounded-2xl"><div class="text-xs font-bold text-gray-500 uppercase">បំណុលចាស់ពីមុន</div><div id="cpOldDebt" class="mt-2 text-base sm:text-lg font-black text-orange-700">0 ៛</div></div>' +
      '<div onclick="loadModule(\'CustBottles\')" class="dash-card border-l-4 border-purple-500 shadow-md p-4 bg-white rounded-2xl cursor-pointer hover:bg-purple-50/50 transition active:scale-95"><div class="text-xs font-bold text-gray-500 uppercase flex justify-between items-center"><span>សំបកធុងកំពុងខ្ចី</span><i class="fas fa-chevron-right text-gray-400 text-xs"></i></div><div id="cpBorrowedBottles" class="mt-2 text-base sm:text-lg font-black text-purple-800">0 ធុង</div></div>' +
    '</div>' +

    // ៣. កាតបំណុលសរុប & ប៊ូតុងបង់លុយ
    '<div class="card border-t-4 border-emerald-600 bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 text-center space-y-3 shadow-lg">' +
      '<div class="text-xs font-bold text-emerald-900 uppercase tracking-wider">សរុបទឹកប្រាក់ត្រូវទូទាត់ទាំងអស់</div>' +
      '<div id="cpGrandTotalDue" class="text-2xl sm:text-3xl font-black text-emerald-800">0 ៛</div>' +
      '<div class="grid grid-cols-2 gap-2.5 pt-1">' +
        '<button type="button" onclick="submitQuickPaymentRequest(\'CASH\')" class="py-3 px-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition">' +
          '<i class="fas fa-money-bill-wave text-base"></i> 💵 បង់លុយសុទ្ធ (ជូនអ្នកដឹក)' +
        '</button>' +
        '<button type="button" onclick="openCustomerAbaModal()" class="py-3 px-2 bg-gradient-to-r from-red-600 via-pink-600 to-blue-700 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition">' +
          '<i class="fas fa-qrcode text-base"></i> 📱 ស្កេន ABA KHQR' +
        '</button>' +
      '</div>' +
    '</div>' +

    // ៤. តារាងទឹកដកថ្ងៃនេះ
    '<div class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0">' +
      '<div class="flex justify-between items-center mb-3">' +
        '<h3 class="font-extrabold text-gray-800 text-sm sm:text-base flex items-center gap-2"><i class="fas fa-boxes text-blue-600"></i>ទំនិញដកថ្ងៃនេះ (មិនទាន់ទូទាត់)</h3>' +
        '<button onclick="loadModule(\'CustHistory\')" class="text-xs font-bold text-blue-600 hover:underline">មើលប្រវត្តិដកទំនិញ ➔</button>' +
      '</div>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">ម៉ោង</th><th class="p-2.5">មុខទំនិញ</th><th class="p-2.5 text-center">ចំនួន</th><th class="p-2.5 text-right">សរុប</th></tr></thead><tbody id="cpTodayItemsTbody"><tr><td colspan="4" class="p-4 text-center text-gray-400 italic">កំពុងទាញទិន្នន័យ...</td></tr></tbody></table></div>' +
    '</div>' +
  '</div>';

  await fetchCustomerPortalData();
}

async function fetchCustomerPortalData() {
  try {
    var todayStr = new Date().toISOString().split('T')[0];

    // ១. ជើងទឹកដកទាំងអស់របស់គាត់
    const { data: trans } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('customer_name', currentUser.fullName)
      .eq('status', 'Unpaid')
      .order('created_at', { ascending: false });

    // ២. បំណុលចាស់ពី settlements
    const { data: lastSet } = await supabaseClient
      .from('settlements')
      .select('balance_khr')
      .eq('customer_name', currentUser.fullName)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    var oldDebt = lastSet ? parseFloat(lastSet.balance_khr || 0) : 0;
    var todayTotal = 0;
    var prevUnpaid = 0;
    var todayItems = [];

    (trans || []).forEach(function(t) {
      var tot = parseFloat(t.total || 0);
      var isToday = String(t.created_at).startsWith(todayStr);
      if (isToday) {
        todayTotal += tot;
        todayItems.push(t);
      } else {
        prevUnpaid += tot;
      }
    });

    var grandOldDebt = oldDebt + prevUnpaid;
    var grandTotalDue = grandOldDebt + todayTotal;

    // ៣. សំបកធុងខ្ចី
    const { data: loans } = await supabaseClient
      .from('bottle_loans')
      .select('borrowed_qty, returned_qty')
      .eq('status', 'Borrowing')
      .ilike('customer_name', '%' + currentUser.fullName + '%');

    var totalBottles = 0;
    (loans || []).forEach(function(l) {
      totalBottles += Math.max(0, parseFloat(l.borrowed_qty || 0) - parseFloat(l.returned_qty || 0));
    });

    custPortalDataCache = {
      todayTotal: todayTotal,
      oldDebt: grandOldDebt,
      grandTotalDue: grandTotalDue,
      borrowedBottles: totalBottles,
      todayItems: todayItems
    };

    document.getElementById('cpTodayTotal').innerText = '៛ ' + todayTotal.toLocaleString();
    document.getElementById('cpOldDebt').innerText = '៛ ' + grandOldDebt.toLocaleString();
    document.getElementById('cpGrandTotalDue').innerText = '៛ ' + grandTotalDue.toLocaleString();
    document.getElementById('cpBorrowedBottles').innerText = totalBottles + ' ធុង';

    var tbody = document.getElementById('cpTodayItemsTbody');
    if (tbody) {
      if (todayItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 italic">មិនទាន់មានការដកទំនិញថ្ងៃនេះទេ</td></tr>';
      } else {
        var html = '';
        todayItems.forEach(function(i) {
          var timeStr = new Date(i.created_at).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
          html += '<tr class="border-b hover:bg-gray-50">' +
            '<td class="p-2.5 text-gray-500 text-[10px]">' + timeStr + '</td>' +
            '<td class="p-2.5 font-bold text-gray-800">' + i.product_name + '</td>' +
            '<td class="p-2.5 text-center font-bold text-blue-700">' + i.qty + '</td>' +
            '<td class="p-2.5 text-right font-black text-green-700">៛ ' + Number(i.total).toLocaleString() + '</td>' +
          '</tr>';
        });
        tbody.innerHTML = html;
      }
    }
  } catch(e) {
    console.error("Portal error:", e);
  }
}

// ==========================================
// 📜 ៧. ផ្ទាំងប្រវត្តិដកទំនិញ (CUSTHISTORY)
// ==========================================
function renderCustomerHistoryModule() {
  var area = document.getElementById('contentArea');
  if (!area) return;

  var now = new Date();
  var thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  var today = now.toISOString().split('T')[0];

  area.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' +
    '<div class="flex bg-white p-1.5 rounded-2xl border shadow-sm gap-1.5">' +
      '<button id="chTabBtnUnpaid" onclick="switchCustHistoryTab(\'unpaid\')" class="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-orange-600 text-white shadow flex items-center justify-center gap-1.5"><i class="fas fa-list-check"></i> ពិនិត្យទឹកជំពាក់ទាំងអស់</button>' +
      '<button id="chTabBtnItems" onclick="switchCustHistoryTab(\'items\')" class="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-1.5"><i class="fas fa-calendar-days"></i> ប្រវត្តិដកតាមថ្ងៃ</button>' +
      '<button id="chTabBtnPayments" onclick="switchCustHistoryTab(\'payments\')" class="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-1.5"><i class="fas fa-receipt"></i> ប្រវត្តិបង់ប្រាក់</button>' +
    '</div>' +

    // Tab 1: ជើងទឹកជំពាក់ទាំងអស់
    '<div id="chSecUnpaid" class="space-y-3">' +
      '<div class="card border-t-4 border-orange-600 shadow-xl p-5 mb-0">' +
        '<h4 class="font-black text-orange-950 text-sm mb-3 flex items-center gap-1.5"><i class="fas fa-file-invoice-dollar text-orange-600"></i> បញ្ជីមុខទឹកជំពាក់ទាំងអស់ (មិនទាន់ទូទាត់)</h4>' +
        '<div class="overflow-x-auto max-h-[450px] overflow-y-auto rounded-2xl border"><table class="w-full text-left text-xs border-collapse"><thead class="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b"><tr><th class="p-2.5 text-[10px]">ថ្ងៃ/ម៉ោងដក</th><th class="p-2.5">មុខទំនិញ</th><th class="p-2.5 text-center">ចំនួន</th><th class="p-2.5 text-right">តម្លៃរាយ</th><th class="p-2.5 text-right">តម្លៃសរុប</th><th class="p-2.5 text-center">ស្ថានភាព</th></tr></thead><tbody id="chAllUnpaidTbody"><tr><td colspan="6" class="p-4 text-center text-gray-400 italic">កំពុងទាញទិន្នន័យ...</td></tr></tbody></table></div>' +
      '</div>' +
    '</div>' +

    // Tab 2: ប្រវត្តិដកតាមថ្ងៃ
    '<div id="chSecItems" class="space-y-3 hidden">' +
      '<div class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0">' +
        '<div class="grid grid-cols-2 gap-2 mb-2"><div><label class="text-[10px] font-bold text-gray-500 uppercase">ចាប់ពីថ្ងៃ</label><input type="date" id="ch_sd" value="' + thirtyDaysAgo + '" class="font-bold border p-2 rounded-xl w-full text-xs"></div><div><label class="text-[10px] font-bold text-gray-500 uppercase">ដល់ថ្ងៃ</label><input type="date" id="ch_ed" value="' + today + '" class="font-bold border p-2 rounded-xl w-full text-xs"></div></div>' +
        '<button onclick="fetchCustomHistoryByDate()" class="btn-green bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold">ស្វែងរកតាមថ្ងៃ</button>' +
        '<div class="overflow-x-auto max-h-80 overflow-y-auto rounded-2xl border mt-3"><table class="w-full text-left text-xs border-collapse"><thead class="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b"><tr><th class="p-2.5 text-[10px]">ថ្ងៃ/ម៉ោង</th><th class="p-2.5">មុខទំនិញ</th><th class="p-2.5 text-center">ចំនួន</th><th class="p-2.5 text-right">សរុប</th><th class="p-2.5 text-center">ស្ថានភាព</th></tr></thead><tbody id="chItemsByDateTbody"></tbody></table></div>' +
      '</div>' +
    '</div>' +

    // Tab 3: ប្រវត្តិបង់ប្រាក់
    '<div id="chSecPayments" class="space-y-3 hidden">' +
      '<div class="card border-t-4 border-green-600 shadow-xl p-5 mb-0">' +
        '<h4 class="font-black text-green-950 text-sm mb-3 flex items-center gap-1.5"><i class="fas fa-receipt text-green-600"></i> ប្រវត្តិប្រាក់បានបង់សងរោងចក្រ</h4>' +
        '<div class="overflow-x-auto max-h-80 overflow-y-auto rounded-2xl border"><table class="w-full text-left text-xs border-collapse"><thead class="sticky top-0 bg-gray-100 text-gray-700 font-bold border-b"><tr><th class="p-2.5 text-[10px]">កាលបរិច្ឆេទ</th><th class="p-2.5 text-right">ប្រាក់បានបង់</th><th class="p-2.5 text-center">វិធីបង់</th><th class="p-2.5 text-center">អ្នកទទួល</th></tr></thead><tbody id="chPaymentsHistoryTbody"></tbody></table></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  loadAllUnpaidHistory();
}

function switchCustHistoryTab(tab) {
  document.getElementById('chSecUnpaid').classList.add('hidden');
  document.getElementById('chSecItems').classList.add('hidden');
  document.getElementById('chSecPayments').classList.add('hidden');

  document.getElementById('chTabBtnUnpaid').className = 'flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-1.5';
  document.getElementById('chTabBtnItems').className = 'flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-1.5';
  document.getElementById('chTabBtnPayments').className = 'flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center gap-1.5';

  if (tab === 'unpaid') {
    document.getElementById('chSecUnpaid').classList.remove('hidden');
    document.getElementById('chTabBtnUnpaid').className = 'flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-orange-600 text-white shadow flex items-center justify-center gap-1.5';
    loadAllUnpaidHistory();
  } else if (tab === 'items') {
    document.getElementById('chSecItems').classList.remove('hidden');
    document.getElementById('chTabBtnItems').className = 'flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-blue-600 text-white shadow flex items-center justify-center gap-1.5';
    fetchCustomHistoryByDate();
  } else {
    document.getElementById('chSecPayments').classList.remove('hidden');
    document.getElementById('chTabBtnPayments').className = 'flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition bg-green-600 text-white shadow flex items-center justify-center gap-1.5';
    loadPaymentsHistory();
  }
}

async function loadAllUnpaidHistory() {
  var tbody = document.getElementById('chAllUnpaidTbody');
  if (!tbody) return;

  try {
    const { data: unpaids } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('customer_name', currentUser.fullName)
      .eq('status', 'Unpaid')
      .order('created_at', { ascending: false });

    if (!unpaids || unpaids.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-green-600 font-bold"><i class="fas fa-check-circle mr-1"></i> អបអរសាទរ! អ្នកមិនមានទឹកជំពាក់ឡើយ</td></tr>';
      return;
    }

    var html = '';
    unpaids.forEach(function(i) {
      var dateStr = new Date(i.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
      html += '<tr class="border-b hover:bg-orange-50/40">' +
        '<td class="p-2.5 text-gray-500 text-[10px] whitespace-nowrap">' + dateStr + '</td>' +
        '<td class="p-2.5 font-bold text-gray-800">' + i.product_name + '</td>' +
        '<td class="p-2.5 text-center font-bold text-blue-700">' + i.qty + '</td>' +
        '<td class="p-2.5 text-right">' + Number(i.price).toLocaleString() + '</td>' +
        '<td class="p-2.5 text-right font-black text-orange-700 whitespace-nowrap">៛ ' + Number(i.total).toLocaleString() + '</td>' +
        '<td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-100 text-orange-800 border border-orange-200">⚠️ ជំពាក់</span></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

async function fetchCustomHistoryByDate() {
  var sd = document.getElementById('ch_sd').value;
  var ed = document.getElementById('ch_ed').value;
  var tbody = document.getElementById('chItemsByDateTbody');
  if (!tbody) return;

  try {
    const { data: list } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('customer_name', currentUser.fullName)
      .gte('created_at', sd + 'T00:00:00Z')
      .lte('created_at', ed + 'T23:59:59Z')
      .order('created_at', { ascending: false });

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">គ្មានទិន្នន័យដកក្នុងចន្លោះថ្ងៃនេះ</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function(i) {
      var dateStr = new Date(i.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 text-gray-500 text-[10px]">' + dateStr + '</td>' +
        '<td class="p-2.5 font-bold text-gray-800">' + i.product_name + '</td>' +
        '<td class="p-2.5 text-center font-bold text-blue-700">' + i.qty + '</td>' +
        '<td class="p-2.5 text-right font-black text-green-700">៛ ' + Number(i.total).toLocaleString() + '</td>' +
        '<td class="p-2.5 text-center"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold ' + (i.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800') + '">' + (i.status === 'Paid' ? 'បង់រួច' : 'ជំពាក់') + '</span></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

async function loadPaymentsHistory() {
  var tbody = document.getElementById('chPaymentsHistoryTbody');
  if (!tbody) return;

  try {
    const { data: payments } = await supabaseClient
      .from('settlements')
      .select('*')
      .eq('customer_name', currentUser.fullName)
      .order('settled_at', { ascending: false });

    if (!payments || payments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 italic">មិនទាន់មានប្រវត្តិបង់ប្រាក់នៅឡើយ</td></tr>';
      return;
    }

    var html = '';
    payments.forEach(function(p) {
      var dateStr = new Date(p.settled_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });
      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 text-gray-500 text-[10px]">' + dateStr + '</td>' +
        '<td class="p-2.5 text-right font-black text-green-700">៛ ' + Number(p.paid_khr).toLocaleString() + '</td>' +
        '<td class="p-2.5 text-center text-xs font-bold text-blue-800">' + p.pay_method + '</td>' +
        '<td class="p-2.5 text-center text-xs text-gray-600">' + p.admin_name + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

// ==========================================
// 🛢️ ៨. ផ្ទាំងសំបកធុងកំពុងខ្ចី (CUSTBOTTLES)
// ==========================================
async function renderCustomerBottlesModule() {
  var area = document.getElementById('contentArea');
  if (!area) return;

  area.innerHTML = '<div class="max-w-2xl mx-auto space-y-4">' +
    '<div class="card border-t-4 border-purple-600 shadow-xl p-5 mb-0">' +
      '<h3 class="font-extrabold text-purple-900 text-base mb-3 flex items-center gap-2"><i class="fas fa-boxes-packing text-purple-600"></i>សំបកធុង និងឧបករណ៍ដែលខ្ញុំកំពុងខ្ចី</h3>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">ថ្ងៃខ្ចី</th><th class="p-2.5">មុខទំនិញ/ឧបករណ៍</th><th class="p-2.5 text-center">ខ្ចី</th><th class="p-2.5 text-center">បានសង</th><th class="p-2.5 text-center">នៅខ្វះ</th></tr></thead><tbody id="cbBottlesTbody"><tr><td colspan="5" class="p-4 text-center text-gray-400 italic">កំពុងទាញទិន្នន័យ...</td></tr></tbody></table></div>' +
    '</div>' +
  '</div>';

  try {
    const { data: list } = await supabaseClient
      .from('bottle_loans')
      .select('*')
      .eq('status', 'Borrowing')
      .ilike('customer_name', '%' + currentUser.fullName + '%');

    var tbody = document.getElementById('cbBottlesTbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-green-600 font-bold"><i class="fas fa-check-circle mr-1"></i> អ្នកមិនមានជំពាក់សំបកធុង ឬឧបករណ៍ណាមួយឡើយ</td></tr>';
      return;
    }

    var html = '';
    list.forEach(function(b) {
      var remaining = Math.max(0, parseFloat(b.borrowed_qty || 0) - parseFloat(b.returned_qty || 0));
      var dateStr = new Date(b.created_at).toLocaleDateString('km-KH');
      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 text-gray-500 text-[10px]">' + dateStr + '</td>' +
        '<td class="p-2.5 font-bold text-gray-800">' + b.item_name + '</td>' +
        '<td class="p-2.5 text-center font-bold text-blue-700">' + b.borrowed_qty + '</td>' +
        '<td class="p-2.5 text-center font-bold text-green-700">' + b.returned_qty + '</td>' +
        '<td class="p-2.5 text-center font-black text-orange-700">' + remaining + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

// ==========================================
// 💡 ៩. MODALS ជំនួយសម្រាប់ម៉ូយ (PRICES, PASSWORD, CONTACT)
// ==========================================
async function openMyPricesModal() {
  try {
    const { data: list } = await supabaseClient.from('customer_prices').select('*').eq('customer_name', currentUser.fullName);
    var rows = '';
    if (!list || list.length === 0) {
      rows = '<tr><td colspan="2" class="p-4 text-center text-gray-400 italic">តម្លៃធម្មតាតាមតម្លៃបោះដុំរោងចក្រ</td></tr>';
    } else {
      list.forEach(function(item) {
        rows += '<tr class="border-b"><td class="p-2.5 font-bold text-gray-800">' + item.product_name + '</td><td class="p-2.5 text-right font-black text-green-700">៛ ' + Number(item.price).toLocaleString() + '</td></tr>';
      });
    }

    var html = '<div id="myPricesModal" class="fixed inset-0 z-[7500] flex items-center justify-center p-4">' +
      '<div class="absolute inset-0 bg-black/60 backdrop-blur-xs" onclick="document.getElementById(\'myPricesModal\').remove()"></div>' +
      '<div class="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-sm p-5 space-y-3 relative border text-center">' +
        '<div class="flex justify-between items-center border-b pb-2"><h3 class="font-black text-blue-900 text-base"><i class="fas fa-tags text-yellow-500 mr-1"></i> តម្លៃទឹករបស់ខ្ញុំ</h3><button onclick="document.getElementById(\'myPricesModal\').remove()" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button></div>' +
        '<div class="overflow-x-auto max-h-60 overflow-y-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead class="bg-gray-100 font-bold text-gray-600"><tr><th class="p-2.5">មុខទំនិញ</th><th class="p-2.5 text-right">តម្លៃព្រមព្រៀង</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<button onclick="document.getElementById(\'myPricesModal\').remove()" class="w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs active:scale-95 transition">រួចរាល់</button>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  } catch(e) {}
}

function openChangePasswordModal() {
  var html = '<div id="changePassModal" class="fixed inset-0 z-[7500] flex items-center justify-center p-4">' +
    '<div class="absolute inset-0 bg-black/60 backdrop-blur-xs" onclick="document.getElementById(\'changePassModal\').remove()"></div>' +
    '<div class="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-sm p-5 space-y-3 relative border text-center">' +
      '<div class="flex justify-between items-center border-b pb-2"><h3 class="font-black text-gray-800 text-base"><i class="fas fa-key text-blue-600 mr-1"></i> ប្តូរលេខសម្ងាត់ផ្ទាល់ខ្លួន</h3><button onclick="document.getElementById(\'changePassModal\').remove()" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button></div>' +
      '<div class="space-y-2 text-left">' +
        '<div><label class="text-[10px] font-bold text-gray-500 uppercase">លេខសម្ងាត់ចាស់</label><input type="password" id="cp_old_pass" placeholder="លេខសម្ងាត់បច្ចុប្បន្ន" class="text-xs border p-2 rounded-xl w-full font-bold"></div>' +
        '<div><label class="text-[10px] font-bold text-gray-500 uppercase">លេខសម្ងាត់ថ្មី</label><input type="password" id="cp_new_pass" placeholder="លេខសម្ងាត់ថ្មី" class="text-xs border p-2 rounded-xl w-full font-bold"></div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2 pt-2"><button onclick="document.getElementById(\'changePassModal\').remove()" class="py-2.5 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs">បោះបង់</button><button onclick="submitChangePassword()" class="py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs shadow">យល់ព្រមប្តូរ</button></div>' +
    '</div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

async function submitChangePassword() {
  var oldP = document.getElementById('cp_old_pass').value.trim();
  var newP = document.getElementById('cp_new_pass').value.trim();
  if (!oldP || !newP) { showToast("សូមបំពេញលេខសម្ងាត់ចាស់ និងថ្មី!", "error"); return; }

  try {
    const { data: user } = await supabaseClient.from('users').select('password').eq('id', currentUser.id).single();
    if (!user || user.password !== oldP) {
      showToast("លេខសម្ងាត់ចាស់មិនត្រឹមត្រូវឡើយ!", "error");
      return;
    }

    await supabaseClient.from('users').update({ password: newP }).eq('id', currentUser.id);
    showToast("បានប្តូរលេខសម្ងាត់ថ្មីជោគជ័យ!", "success");
    document.getElementById('changePassModal').remove();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

function openContactEnterpriseModal() {
  var html = '<div id="contactEnterpriseModal" class="fixed inset-0 z-[7500] flex items-center justify-center p-4">' +
    '<div class="absolute inset-0 bg-black/60 backdrop-blur-xs" onclick="document.getElementById(\'contactEnterpriseModal\').remove()"></div>' +
    '<div class="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-sm p-5 space-y-3.5 relative border text-center">' +
      '<div class="flex justify-between items-center border-b pb-2"><h3 class="font-black text-green-950 text-base"><i class="fas fa-headset text-green-600 mr-1"></i> ទំនាក់ទំនងរោងចក្រ KC WATER</h3><button onclick="document.getElementById(\'contactEnterpriseModal\').remove()" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button></div>' +
      '<div class="p-3 bg-green-50 rounded-2xl border border-green-200 text-left space-y-2">' +
        '<div class="text-[10px] text-green-700 font-bold uppercase">លេខទូរស័ព្ទរោងចក្រ</div>' +
        '<div class="flex justify-between items-center"><b class="text-xs text-green-900">077 934 748, 066 934 748</b><a href="tel:077934748" class="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold shadow"><i class="fas fa-phone"></i> ខល</a></div>' +
      '</div>' +
      '<div class="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">' +
        '<div><div class="text-[10px] text-blue-700 font-bold uppercase">Telegram ផ្លូវការ</div><b class="text-xs text-blue-950">@KcWater</b></div>' +
        '<a href="http://t.me/KcWater" target="_blank" class="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1"><i class="fab fa-telegram"></i> ឆាត</a>' +
      '</div>' +
      '<button onclick="document.getElementById(\'contactEnterpriseModal\').remove()" class="w-full py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">បិទ</button>' +
    '</div></div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

// 💵 សំណើបង់លុយសុទ្ធ (ជូនដំណឹងទៅ Admin)
async function submitQuickPaymentRequest(method) {
  var due = custPortalDataCache ? custPortalDataCache.grandTotalDue : 0;
  if (due <= 0) { showToast("អ្នកមិនមានបំណុលត្រូវទូទាត់ឡើយ!", "info"); return; }
  if (!confirm("តើអ្នកចង់ផ្ញើសំណើទូទាត់ប្រាក់សុទ្ធចំនួន ៛ " + due.toLocaleString() + " ជូនអ្នកដឹកមែនទេ?")) return;

  try {
    await supabaseClient.from('pending_payments').insert([{
      id: "PAY-" + new Date().getTime(),
      customer_name: currentUser.fullName,
      method: "CASH (លុយសុទ្ធទាំងអស់)",
      khr_total: due,
      status: "Pending"
    }]);

    showToast("បានផ្ញើសំណើទូទាត់ទៅកាន់រោងចក្ររួចរាល់!", "success");
    sendTelegramAlert("🔔 <b>[KC WATER - សំណើទូទាត់ប្រាក់សុទ្ធ]</b>\n\n👤 <b>អតិថិជន៖</b> " + currentUser.fullName + "\n💵 <b>ទឹកប្រាក់៖</b> <b>៛ " + due.toLocaleString() + "</b> (បង់លុយសុទ្ធជូនអ្នកដឹក)\n🕒 <b>ម៉ោង៖</b> " + new Date().toLocaleTimeString('km-KH'));
  } catch(e) {
    showToast("កំហុស៖ " + e.message, "error");
  }
}

// 📱 បើក ABA Modal សម្រាប់ម៉ូយស្កេនបង់លុយ
function openCustomerAbaModal() {
  var due = custPortalDataCache ? custPortalDataCache.grandTotalDue : 0;
  if (due <= 0) { showToast("អ្នកមិនមានបំណុលត្រូវទូទាត់ឡើយ!", "info"); return; }
  document.getElementById('posKhqrAmountText').innerText = "៛ " + due.toLocaleString();
  document.getElementById('posKhqrModal').classList.remove('hidden');
}

function viewMyMonthlyStatement() {
  loadModule('MonthlyRep');
  setTimeout(function() {
    switchRepTab('customer');
    var drop = document.getElementById('custSelectDropdown');
    if (drop) { drop.value = currentUser.fullName; }
    var inp = document.getElementById('custSearchInp');
    if (inp) { inp.value = currentUser.fullName; }
    fetchFullStatementFromSupabase();
  }, 300);
}
