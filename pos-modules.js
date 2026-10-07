/** ==========================================================================
 *  KC WATER POS SYSTEM - ALL MODULES ENGINE (pos-modules.js)
 *  (Stock, Bottle Loans, Expenses, Customers & Settings)
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
// 👥 ៤. គ្រប់គ្រងគណនីអតិថិជន & តម្លៃពិសេស (CUSTOMERS)
// ==========================================
function renderCustomersModule() {
  var area = document.getElementById('contentArea');
  area.innerHTML = '<div class="max-w-3xl mx-auto space-y-4">' +
    '<div class="card border-t-4 border-blue-600 shadow-xl p-5 mb-0">' +
      '<h2 class="font-extrabold text-blue-900 text-base mb-3 flex items-center gap-2"><i class="fas fa-user-plus text-blue-600"></i>បង្កើតគណនី Admin / អ្នកដឹក / ម៉ូយ</h2>' +
      '<div class="space-y-3">' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="text" id="mem_name" placeholder="*ឈ្មោះពេញ (ឧ៖ តារា - អ្នកដឹក)" class="font-bold border p-2.5 rounded-xl">' +
          '<input type="text" id="mem_phone" placeholder="លេខទូរស័ព្ទ" class="border p-2.5 rounded-xl">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<input type="text" id="mem_user" placeholder="*Username ចូលប្រើ" class="font-bold border p-2.5 rounded-xl">' +
          '<input type="text" id="mem_pass" placeholder="*Password លេខសម្ងាត់" class="font-bold border p-2.5 rounded-xl">' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<select id="mem_role" class="font-bold border p-2.5 rounded-xl">' +
            '<option value="Driver">🚚 អ្នកដឹកជញ្ជូនរោងចក្រ (Driver)</option>' +
            '<option value="Customer">🏢 អតិថិជន / ម៉ូយប្រចាំ (Customer)</option>' +
            '<option value="Seller">🛒 បុគ្គលិកលក់នៅកន្លែង (Seller)</option>' +
            '<option value="Admin">👑 Admin អ្នកគ្រប់គ្រង (Admin)</option>' +
          '</select>' +
          '<input type="text" id="mem_boss" placeholder="ឈ្មោះមេ (បើជាកូនចៅម៉ូយ)" class="border p-2.5 rounded-xl text-xs">' +
        '</div>' +
        '<button onclick="saveUserToSupabase()" class="btn-green shadow-lg py-3 text-sm font-bold">រក្សាទុកគណនី (Save Account)</button>' +
      '</div>' +
    '</div>' +
    '<div class="card border-t-4 border-gray-700 shadow-xl p-5 mb-0">' +
      '<h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-users"></i>បញ្ជីគណនីទាំងអស់</h3>' +
      '<div class="overflow-x-auto rounded-xl border"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-gray-100 text-gray-700 font-bold border-b"><th class="p-2.5">ឈ្មោះ</th><th class="p-2.5">Username / Pass</th><th class="p-2.5 text-center">តួនាទី</th><th class="p-2.5 text-center">លុប</th></tr></thead><tbody id="usersModuleTableBody"></tbody></table></div>' +
    '</div>' +
  '</div>';

  fetchUsersModuleTable();
}

async function fetchUsersModuleTable() {
  var tbody = document.getElementById('usersModuleTableBody');
  if (!tbody) return;

  try {
    const { data: users } = await supabaseClient.from('users').select('*').order('id', { ascending: true });
    if (!users) return;

    var html = '';
    users.forEach(function(u) {
      html += '<tr class="border-b hover:bg-gray-50">' +
        '<td class="p-2.5 font-bold text-gray-800">' + u.full_name + '<br><small class="text-gray-400 font-normal">' + (u.phone || '-') + '</small></td>' +
        '<td class="p-2.5 font-mono text-xs"><b>' + u.username + '</b> / ' + u.password + '</td>' +
        '<td class="p-2.5 text-center"><span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-100 text-blue-800">' + u.role + '</span></td>' +
        '<td class="p-2.5 text-center"><button onclick="delUserFromSupabase(' + u.id + ')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash-can"></i></button></td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  } catch(e) {}
}

async function saveUserToSupabase() {
  var name = document.getElementById('mem_name').value.trim();
  var user = document.getElementById('mem_user').value.trim();
  var pass = document.getElementById('mem_pass').value.trim();
  var role = document.getElementById('mem_role').value;
  var phone = document.getElementById('mem_phone').value.trim();
  var boss = document.getElementById('mem_boss').value.trim();

  if (!name || !user || !pass) { showToast("សូមបំពេញឈ្មោះ, Username, និង Password!", "error"); return; }

  try {
    await supabaseClient.from('users').insert([{
      full_name: name,
      username: user,
      password: pass,
      role: role,
      type: role === 'Driver' ? 'CompanyDriver' : 'Regular',
      phone: phone,
      linked_boss: boss
    }]);

    showToast("បានបង្កើតគណនីជោគជ័យ!", "success");
    document.getElementById('mem_name').value = "";
    document.getElementById('mem_user').value = "";
    document.getElementById('mem_pass').value = "";
    document.getElementById('mem_phone').value = "";
    await fetchInitialPOSData();
    fetchUsersModuleTable();
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
    fetchUsersModuleTable();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}

// ==========================================
// ⚙️ ៥. ការកំណត់ប្រព័ន្ធ (SETTINGS)
// ==========================================
function renderSettingsModule() {
  var area = document.getElementById('contentArea');
  area.innerHTML = '<div class="max-w-2xl mx-auto space-y-4">' +
    '<div class="card border-t-4 border-indigo-600 shadow-xl p-5 mb-0 space-y-3">' +
      '<h2 class="font-extrabold text-indigo-950 text-base flex items-center gap-2"><i class="fas fa-cog text-indigo-600"></i>ការកំណត់ប្រព័ន្ធ KC WATER (Settings)</h2>' +
      '<div class="grid grid-cols-2 gap-2 text-xs">' +
        '<div><label class="font-bold text-gray-500 uppercase block">ម៉ោងបើកទទួលកុម្ម៉ង់ (Open)</label><input type="time" id="set_open_time" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
        '<div><label class="font-bold text-gray-500 uppercase block">ម៉ោងបិទទទួលកុម្ម៉ង់ (Close)</label><input type="time" id="set_close_time" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
      '</div>' +
      '<div class="grid grid-cols-2 gap-2 text-xs">' +
        '<div><label class="font-bold text-gray-500 uppercase block">ថ្លៃដឹកធម្មតា (៛)</label><input type="number" id="set_del_fee" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
        '<div><label class="font-bold text-gray-500 uppercase block">កុម្ម៉ង់ចាប់ពី (X ធុង) ដឹក FREE</label><input type="number" id="set_del_min" class="font-black border p-2 rounded-xl w-full text-center"></div>' +
      '</div>' +
      '<div class="space-y-1 text-xs">' +
        '<label class="font-bold text-gray-500 uppercase block">Telegram Bot Token</label><input type="text" id="set_tg_token" class="border p-2 rounded-xl w-full font-mono text-xs">' +
        '<label class="font-bold text-gray-500 uppercase block">Telegram Chat ID</label><input type="text" id="set_tg_chatid" class="border p-2 rounded-xl w-full font-mono text-xs">' +
      '</div>' +
      '<button onclick="saveSettingsToSupabase()" class="btn-green py-3 text-sm font-bold">រក្សាទុកការកំណត់</button>' +
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
    { key: 'Telegram_ChatID', value: document.getElementById('set_tg_chatid').value.trim() }
  ];

  try {
    await supabaseClient.from('settings').upsert(rows);
    showToast("បានរក្សាទុកការកំណត់ជោគជ័យ!", "success");
    await loadSettingsAndTelegram();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}
