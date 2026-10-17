/** ==========================================================================
 *  KC WATER POS SYSTEM - ONLINE ORDERS & DELIVERY ENGINE (pos-orders.js)
 *  (Realtime Sync with Store_Preview.html, Driver Assignment & Google Maps)
 *  ========================================================================== */

var lastKnownPendingOrderCount = 0;
var ordersRealtimeChannel = null;

// ==========================================
// 🔔 ១. សំឡេងរោទ៍ & ឆែកមើលការកុម្ម៉ង់ ONLINE ថ្មី
// ==========================================
function playOrderChime() {
  try {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      var ctx = new AudioContext();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // សំឡេង ដូ
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // សំឡេង មី
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // សំឡេង សូល
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch(e) {}
}

async function checkPendingOnlineOrdersBadge() {
  var btn = document.getElementById('navOnlineOrdersBtn');
  var badge = document.getElementById('navOnlineOrdersCount');
  if (!btn || !badge) return;

  // 👑 បង្ហាញ និងបន្លឺសំឡេងរោទ៍សម្រាប់តែ Admin ម្នាក់គត់ (លាក់ពី Seller/Driver ទាំងអស់)
  var isAdmin = (currentUser && currentUser.role === 'Admin');
  if (!isAdmin) {
    btn.classList.add('hidden');
    btn.style.setProperty('display', 'none', 'important');
    return;
  }

  try {
    const { count, error } = await supabaseClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Pending');

    if (error) throw error;
    var c = count || 0;

    btn.classList.remove('hidden');
    btn.style.setProperty('display', 'inline-flex', 'important');

    badge.innerText = c;
    if (c > 0) {
      badge.className = "w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black animate-pulse shadow-xs";
    } else {
      badge.className = "w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center font-bold";
    }

    if (c > lastKnownPendingOrderCount && lastKnownPendingOrderCount !== 0) {
      playOrderChime();
      showToast("🔔 [ដំណឹងថ្មី] មានការកុម្ម៉ង់ទឹក Online ថ្មីចូលមកដល់!", "info");
      if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60 });
    }
    lastKnownPendingOrderCount = c;
  } catch(e) {}
}
// ⚡ REALTIME LISTENER (ស្តាប់ការកុម្ម៉ង់ផ្ទាល់ពី SUPABASE ទាំង Admin និងអ្នកដឹក)
function initOrdersRealtimeListener() {
  try {
    ordersRealtimeChannel = supabaseClient
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, function(payload) {
        // ១. សម្រាប់ Admin និង Seller
        checkPendingOnlineOrdersBadge();
        var modal = document.getElementById('onlineOrdersAdminModal');
        if (modal && !modal.classList.contains('hidden')) {
          openOnlineOrdersModal();
        }

        // 🛵 ២. សម្រាប់អ្នកដឹកជញ្ជូនរោងចក្រ (Company Driver)
        if (currentUser && currentUser.type === 'CompanyDriver') {
          var driverContainer = document.getElementById('driverOrdersContainer');
          if (driverContainer) {
            renderCompanyDeliveriesModule();
          }

          // បើ Admin ចាត់ចែងការងារមកឱ្យអ្នកដឹកនេះ ឱ្យបន្លឺសំឡេងរោទ៍ & សារដំណឹងភ្លាម
          var newRecord = payload.new || {};
          if (newRecord.status === 'Assigned' && newRecord.driver_name === currentUser.fullName) {
            playOrderChime();
            showToast("🛵 [ការងារថ្មី] Admin បានចាត់ចែងការដឹកទឹកថ្មីឱ្យអ្នក!", "success");
          }
        }
      })
      .subscribe();
  } catch(e) {}
}

// ==========================================
// 📦 ២. ផ្ទាំង POPUP ពិនិត្យការកុម្ម៉ង់របស់ ADMIN
// ==========================================
function injectOnlineOrdersAdminModal() {
  if (document.getElementById('onlineOrdersAdminModal')) return;
  var html = '<div id="onlineOrdersAdminModal" class="fixed inset-0 z-[6000] flex items-center justify-center p-3 sm:p-4 hidden">' +
    '<div class="absolute inset-0 bg-black/60 backdrop-blur-xs" onclick="closeOnlineOrdersModal()"></div>' +
    '<div class="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden relative">' +
      '<div class="p-4 border-b flex justify-between items-center bg-amber-50/80">' +
        '<div class="flex items-center gap-2">' +
          '<div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-base shadow-xs">' +
            '<i class="fas fa-truck-fast"></i>' +
          '</div>' +
          '<div>' +
            '<h3 class="font-black text-amber-950 text-sm sm:text-base leading-none">បញ្ជីការកុម្ម៉ង់ទឹក Online តាមផ្ទះ</h3>' +
            '<p class="text-[10px] text-amber-800 font-bold mt-0.5">ក្រុងប៉ោយប៉ែត (Poipet Delivery - Supabase)</p>' +
          '</div>' +
        '</div>' +
        '<button type="button" onclick="closeOnlineOrdersModal()" class="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-gray-700 text-lg font-bold flex items-center justify-center shadow-xs">&times;</button>' +
      '</div>' +
      '<div id="onlineOrdersAdminListContainer" class="p-4 overflow-y-auto space-y-3 flex-1">' +
        '<div class="text-center py-8 text-gray-400 italic text-xs"><i class="fas fa-spinner fa-spin mr-1.5 text-amber-600"></i> កំពុងទាញយកបញ្ជីកុម្ម៉ង់...</div>' +
      '</div>' +
      '<div class="p-3 bg-gray-50 border-t flex justify-between items-center text-xs">' +
        '<button type="button" onclick="openOnlineOrdersModal()" class="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 shadow-2xs flex items-center gap-1 active:scale-95 transition"><i class="fas fa-sync-alt text-xs"></i> Refresh</button>' +
        '<button type="button" onclick="closeOnlineOrdersModal()" class="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-700 active:scale-95 transition">បិទ</button>' +
      '</div>' +
    '</div>' +
  '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 📦 មុខងារបើកផ្ទាំងពិនិត្យការកុម្ម៉ង់ Online (ធានាមានឈ្មោះអ្នកដឹកជានិច្ច & បង្ហាញព័ត៌មានលម្អិត)
async function openOnlineOrdersModal() {
  injectOnlineOrdersAdminModal();
  var modal = document.getElementById('onlineOrdersAdminModal');
  var container = document.getElementById('onlineOrdersAdminListContainer');
  if (modal) modal.classList.remove('hidden');
  if (container) container.innerHTML = '<div class="text-center py-8 text-gray-400 italic text-xs"><i class="fas fa-spinner fa-spin mr-1.5 text-amber-600"></i> កំពុងទាញយកបញ្ជីកុម្ម៉ង់...</div>';

  try {
    // ១. ការពារបញ្ហា Dropdown ទទេ៖ បើមិនទាន់មានទិន្នន័យអ្នកដឹក ឱ្យទាញពី Supabase ភ្លាម
    if (!allCustomers || allCustomers.length === 0) {
      const { data: custs } = await supabaseClient
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });
      if (custs) allCustomers = custs;
    }

    // ២. ទាញយកការកុម្ម៉ង់ដែលរង់ចាំ (Pending & Assigned)
    const { data: list, error } = await supabaseClient
      .from('orders')
      .select('*')
      .in('status', ['Pending', 'Assigned'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!list || list.length === 0) {
      container.innerHTML = '<div class="p-8 text-center space-y-2">' +
        '<div class="w-12 h-12 mx-auto rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl"><i class="fas fa-check"></i></div>' +
        '<b class="text-gray-700 text-xs sm:text-sm block">បច្ចុប្បន្នគ្មានការកុម្ម៉ង់ទឹកដែលរង់ចាំដឹកជញ្ជូនឡើយ!</b>' +
        '<p class="text-[10px] text-gray-400">រាល់ពេលភ្ញៀវកុម្ម៉ង់លើ Website វានឹងលោតមកទីនេះភ្លាមៗ</p>' +
      '</div>';
      return;
    }

    // ៣. ស្រង់ឈ្មោះអ្នកដឹកជញ្ជូនរោងចក្រ (Company Drivers)
    var driverOptions = '<option value="">-- រើសអ្នកដឹករបស់រោងចក្រ --</option>';
    allCustomers.forEach(function(c) {
      if (c.role === 'Driver' || c.type === 'CompanyDriver' || c.linked_boss === 'KC WATER') {
        var dPhone = c.phone ? (' (' + c.phone + ')') : '';
        driverOptions += '<option value="' + c.full_name + '" data-phone="' + (c.phone || '') + '">' + c.full_name + dPhone + '</option>';
      }
    });

    var html = '';
    list.forEach(function(o) {
      var isPending = (o.status === 'Pending');
      var statusBadge = isPending ? 
        '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">⏳ រង់ចាំចាត់ចែង</span>' : 
        '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">🚚 កំពុងដឹក' + (o.driver_name ? ' (ដោយ: ' + o.driver_name + ')' : '') + '</span>';

      var cleanPhone = String(o.phone || '').replace(/[^0-9]/g, '');
      var safeName = String(o.customer_name || '').replace(/'/g, "\\'");
      var dateStr = new Date(o.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });

      html += '<div class="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm space-y-2.5 hover:shadow-md transition">' +
        '<div class="flex justify-between items-start border-b border-gray-100 pb-2">' +
          '<div>' +
            '<div class="flex items-center gap-1.5">' +
              '<b class="text-xs sm:text-sm text-gray-900 font-black"><i class="fas fa-user-circle text-amber-600 mr-1"></i>' + o.customer_name + '</b>' +
              statusBadge +
            '</div>' +
            '<div class="text-[10px] text-gray-400 mt-0.5">កូដ៖ <code>' + o.order_id + '</code> | ម៉ោង៖ ' + dateStr + '</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="text-xs sm:text-sm font-black text-emerald-700">៛ ' + Number(o.total || 0).toLocaleString() + '</div>' +
            '<span class="text-[10px] font-bold text-gray-500">' + (o.payment_method || 'COD') + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 space-y-1 text-xs text-gray-700">' +
          '<div class="flex items-start gap-1.5">' +
            '<span class="text-gray-400 font-bold whitespace-nowrap">📦 ទំនិញ៖</span>' +
            '<b class="text-slate-900">' + o.items + '</b>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 text-[11px]">' +
            '<span class="text-gray-400 font-bold whitespace-nowrap">🛢️ សំបកធុង៖</span>' +
            '<span class="font-bold text-emerald-700">' + (o.barrel_swap || 'មានសំបកដូរ') + '</span>' +
          '</div>' +
          (o.address ? 
          '<div class="flex items-start gap-1.5 pt-0.5">' +
            '<span class="text-gray-400 font-bold whitespace-nowrap">📍 ទីតាំង & ចំណាំ៖</span>' +
            '<span class="text-slate-800 font-bold text-[11px] leading-snug">' + o.address + '</span>' +
          '</div>' : '') +
        '</div>' +

        // ផ្នែកចាត់ចែងអ្នកដឹក
        '<div class="p-2 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">' +
          '<div class="text-[10px] font-black text-blue-900 flex items-center gap-1"><i class="fas fa-motorcycle text-blue-600"></i> ចាត់ចែងអ្នកដឹកជញ្ជូនរោងចក្រ៖</div>' +
          '<div class="flex gap-1.5">' +
            '<select id="driver_sel_' + o.order_id + '" class="text-xs font-bold py-1.5 px-2 bg-white border border-blue-300 rounded-xl flex-1 outline-none">' +
              driverOptions +
            '</select>' +
            '<button type="button" onclick="assignDriverToOnlineOrder(\'' + o.order_id + '\', \'' + safeName + '\')" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition flex items-center gap-1 whitespace-nowrap">' +
              '<i class="fas fa-paper-plane text-[10px]"></i> ចាត់ចែង' +
            '</button>' +
          '</div>' +
        '</div>' +

        // ជួរប៊ូតុងសកម្មភាព (ខល, ផែនទី, បោះបង់, ដឹកដល់)
        '<div class="flex flex-wrap items-center justify-end gap-2 pt-0.5">' +
          (cleanPhone ? 
          '<a href="tel:' + cleanPhone + '" class="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-800 rounded-xl text-xs font-bold border border-green-200 shadow-2xs flex items-center gap-1 active:scale-95 transition" style="text-decoration:none;">' +
            '<i class="fas fa-phone text-xs text-green-600"></i> ខល ' + o.phone +
          '</a>' : '') +

         (o.location_url || o.address ? 
          '<button type="button" onclick="openOrderMap(\'' + (o.location_url || o.address).replace(/'/g, "\\'") + '\')" class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 shadow-2xs flex items-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-map-location-dot text-xs text-blue-600"></i> បើកផែនទី' +
          '</button>' : '') +

          (o.photo_url ? 
          '<button type="button" onclick="viewOrderHousePhoto(\'' + o.photo_url + '\', \'' + safeName + '\')" class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 shadow-2xs flex items-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-camera text-xs text-amber-600"></i> រូបផ្ទះ' +
          '</button>' : '') +

          '<button type="button" onclick="cancelOnlineOrder(\'' + o.order_id + '\', \'' + safeName + '\')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 shadow-2xs flex items-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-trash-can text-xs text-red-500"></i> បោះបង់' +
          '</button>' +

          '<button type="button" onclick="completeOnlineOrder(\'' + o.order_id + '\', \'' + safeName + '\', ' + (o.total || 0) + ', \'' + (o.items || '').replace(/'/g, "\\'") + '\', \'' + (o.driver_name || '').replace(/'/g, "\\'") + '\', \'' + (o.payment_method || 'COD').replace(/'/g, "\\'") + '\')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-check text-xs"></i> ដឹកជញ្ជូនរួចរាល់' +
          '</button>' +
        '</div>' +
      '</div>';
    });

    container.innerHTML = html;
  } catch(err) {
    container.innerHTML = '<div class="p-4 text-center text-red-500 font-bold text-xs">កំហុស៖ ' + err.message + '</div>';
  }
}
function closeOnlineOrdersModal() {
  var modal = document.getElementById('onlineOrdersAdminModal');
  if (modal) modal.classList.add('hidden');
  checkPendingOnlineOrdersBadge();
}

// 🚚 មុខងារចាត់ចែងអ្នកដឹក (បាញ់ព័ត៌មានលម្អិត ទឹកប្រាក់ & ផែនទី Google Maps ទៅ Telegram អូតូ)
async function assignDriverToOnlineOrder(orderId, custName) {
  var sel = document.getElementById('driver_sel_' + orderId);
  var driverName = sel ? sel.value.trim() : "";
  if (!driverName) {
    showToast("សូមជ្រើសរើសឈ្មោះអ្នកដឹកជញ្ជូន!", "error");
    if (sel) sel.focus();
    return;
  }

  var selectedOpt = sel.options[sel.selectedIndex];
  var driverPhone = selectedOpt ? selectedOpt.getAttribute('data-phone') : '';

  try {
    // ១. ទាញព័ត៌មានកុម្ម៉ង់លម្អិតពី Supabase
    const { data: orderInfo } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    // ២. Update ស្ថានភាពទៅជា Assigned ក្នុង Supabase
    const { error } = await supabaseClient
      .from('orders')
      .update({
        status: 'Assigned',
        driver_name: driverName,
        driver_phone: driverPhone
      })
      .eq('order_id', orderId);

    if (error) throw error;

    showToast("បានចាត់ចែងទៅឱ្យ " + driverName + " ជោគជ័យ!", "success");
    openOnlineOrdersModal();

    // ៣. បាញ់សារ Telegram Alert ពេញលេញ (មានលេខទូរស័ព្ទ, មុខទំនិញ, តម្លៃ & ផែនទីនាំផ្លូវ)
    try {
      var phoneText = orderInfo && orderInfo.phone ? orderInfo.phone : '-';
      var itemsText = orderInfo && orderInfo.items ? orderInfo.items : '-';
      var totalText = orderInfo && orderInfo.total ? Number(orderInfo.total).toLocaleString() : '0';
      var payText = orderInfo && orderInfo.payment_method ? orderInfo.payment_method : 'COD';
      var mapUrl = orderInfo ? (orderInfo.location_url || orderInfo.address || '') : '';

      var mapLine = '';
      if (mapUrl) {
        var matchLink = mapUrl.match(/https?:\/\/[^\s]+/);
        if (matchLink) {
          mapLine = "🗺️ <b>ផែនទីផ្ទះភ្ញៀវ៖</b> <a href='" + matchLink[0] + "'>ចុចបើក Google Maps នាំផ្លូវ</a>\n";
        } else {
          var searchMap = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(mapUrl + " ប៉ោយប៉ែត");
          mapLine = "🗺️ <b>ផែនទីផ្ទះភ្ញៀវ៖</b> <a href='" + searchMap + "'>ចុចបើក Google Maps នាំផ្លូវ</a>\n";
        }
      }

      var tgMsg = "🚚 <b>[KC WATER - បានចាត់ចែងអ្នកដឹកជញ្ជូនរួចរាល់]</b>\n\n" +
                  "🛵 <b>អ្នកដឹក៖</b> " + driverName + (driverPhone ? " (📞 " + driverPhone + ")" : "") + "\n" +
                  "🆔 <b>កូដកុម្ម៉ង់៖</b> <code>" + orderId + "</code>\n" +
                  "👤 <b>អតិថិជន៖</b> " + custName + " (📞 " + phoneText + ")\n" +
                  "📦 <b>ទំនិញ៖</b> " + itemsText + "\n" +
                  "💰 <b>ទឹកប្រាក់ត្រូវប្រមូល៖</b> <b>៛ " + totalText + "</b> (" + payText + ")\n" +
                  mapLine +
                  (orderInfo && orderInfo.address ? "📝 <b>ចំណាំទីតាំង៖</b> " + orderInfo.address + "\n" : "") +
                  "🕒 <b>ម៉ោងចាត់ចែង៖</b> " + new Date().toLocaleTimeString('km-KH');

      sendTelegramAlert(tgMsg);
    } catch(tgErr) {
      console.warn("Telegram alert error:", tgErr);
    }

  } catch(err) {
    showToast("កំហុសចាត់ចែង៖ " + err.message, "error");
  }
}
async function cancelOnlineOrder(orderId, custName) {
  // 🌟 ប្រើ Pop-up ថ្មីរបស់ KC POS ពណ៌ក្រហមច្បាស់ៗ
  var ok = await kcConfirm({
    title: "បោះបង់ការកុម្ម៉ង់ទឹក",
    message: "តើអ្នកពិតជាចង់បោះបង់ការកុម្ម៉ង់របស់ [" + custName + "] លេខកូដ [" + orderId + "] នេះមែនទេ?",
    type: "danger",
    confirmText: "យល់ព្រមបោះបង់"
  });
  if (!ok) return;

  try {
    const { error } = await supabaseClient
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('order_id', orderId);

    if (error) throw error;

    showToast("បានបោះបង់ការកុម្ម៉ង់ជោគជ័យ!", "success");
    openOnlineOrdersModal();
  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  }
}
// ==========================================
// 🛵 ផ្ទាំងបញ្ជាក់ការដឹកដល់ & ជ្រើសរើសវិធីបង់ប្រាក់ (CASH vs ABA)
// ==========================================
var activeDeliveryTaskData = null;

function injectCompleteDeliveryModal() {
  if (document.getElementById('completeDeliveryModal')) return;
  var html = '<div id="completeDeliveryModal" class="fixed inset-0 z-[7500] flex items-center justify-center p-4 hidden overflow-y-auto">' +
    '<div class="fixed inset-0 bg-slate-950/65 backdrop-blur-xs" onclick="closeCompleteDeliveryModal()"></div>' +
    '<div class="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-sm p-5 space-y-3.5 text-center relative border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">' +
      '<div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-inner">' +
        '<i class="fas fa-hand-holding-dollar"></i>' +
      '</div>' +
      '<div>' +
        '<h3 class="font-black text-slate-900 text-base leading-snug">បញ្ជាក់ការដឹកដល់ & ប្រមូលប្រាក់</h3>' +
        '<p id="cdmCustHint" class="text-xs text-slate-500 font-bold mt-0.5"></p>' +
      '</div>' +

      // ប្រអប់ទឹកប្រាក់សរុប
      '<div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">' +
        '<span class="text-[10px] font-bold text-emerald-800 uppercase block">ទឹកប្រាក់ដែលត្រូវប្រមូល</span>' +
        '<div id="cdmTotalText" class="text-xl font-black text-emerald-800 mt-0.5">0 ៛</div>' +
      '</div>' +

      // ជ្រើសរើសវិធីទូទាត់ជាក់ស្តែង (លុយសុទ្ធ vs ABA)
      '<div class="space-y-1.5 text-left">' +
        '<label class="text-[10px] font-bold text-slate-600 uppercase block">វិធីទូទាត់ប្រាក់ជាក់ស្តែង (Payment Method) *</label>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<label id="lblCdmPayCash" class="p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 transition">' +
            '<input type="radio" name="cdm_pay" value="Cash" checked onchange="onCdmPayMethodChange(\'Cash\')" class="accent-emerald-600">' +
            '<span>💵 លុយសុទ្ធ</span>' +
          '</label>' +
          '<label id="lblCdmPayAba" class="p-2.5 rounded-xl border-2 border-slate-200 bg-white flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700 hover:border-blue-300 transition">' +
            '<input type="radio" name="cdm_pay" value="ABA" onchange="onCdmPayMethodChange(\'ABA\')" class="accent-blue-600">' +
            '<span>📱 ស្កេន ABA</span>' +
          '</label>' +
        '</div>' +
      '</div>' +

      // ប៊ូតុងបើក QR ឱ្យភ្ញៀវស្កេន
      '<div id="cdmAbaQrRow" class="hidden pt-1">' +
        '<button type="button" onclick="openDriverAbaQrModal()" class="w-full py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition">' +
          '<i class="fas fa-qrcode text-sm"></i> 📱 បង្ហាញ ABA KHQR ឱ្យភ្ញៀវស្កេន' +
        '</button>' +
      '</div>' +

      // ប៊ូតុងបញ្ជាក់ និងបោះបង់
      '<div class="grid grid-cols-2 gap-2 pt-2">' +
        '<button type="button" onclick="closeCompleteDeliveryModal()" class="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs active:scale-95 transition">បោះបង់</button>' +
        '<button type="button" id="btnConfirmCompleteDelivery" onclick="executeFinalCompleteDelivery()" class="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1">' +
          '<i class="fas fa-check-circle"></i> ដឹកដល់រួចរាល់' +
        '</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

function onCdmPayMethodChange(mode) {
  var lblCash = document.getElementById('lblCdmPayCash');
  var lblAba = document.getElementById('lblCdmPayAba');
  var qrRow = document.getElementById('cdmAbaQrRow');

  if (mode === 'ABA') {
    lblAba.className = "p-2.5 rounded-xl border-2 border-blue-600 bg-blue-50 flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-950 transition";
    lblCash.className = "p-2.5 rounded-xl border-2 border-slate-200 bg-white flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700 transition";
    if (qrRow) qrRow.classList.remove('hidden');
  } else {
    lblCash.className = "p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 transition";
    lblAba.className = "p-2.5 rounded-xl border-2 border-slate-200 bg-white flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700 transition";
    if (qrRow) qrRow.classList.add('hidden');
  }
}

function openDriverAbaQrModal() {
  if (!activeDeliveryTaskData) return;
  var total = activeDeliveryTaskData.total || 0;
  if (typeof openPOSKHQR === 'function') {
    document.getElementById('posKhqrAmountText').innerText = "៛ " + Number(total).toLocaleString();
    document.getElementById('posKhqrModal').classList.remove('hidden');
  }
}

function closeCompleteDeliveryModal() {
  var modal = document.getElementById('completeDeliveryModal');
  if (modal) modal.classList.add('hidden');
  activeDeliveryTaskData = null;
}

// 🚀 មុខងារបើកផ្ទាំងបញ្ជាក់ការដឹកដល់
async function completeOnlineOrder(orderId, custName, total, itemsText, driverName, payMethod) {
  injectCompleteDeliveryModal();
  activeDeliveryTaskData = {
    orderId: orderId,
    custName: custName,
    total: total,
    itemsText: itemsText,
    driverName: driverName,
    payMethod: payMethod
  };

  document.getElementById('cdmCustHint').innerText = "អតិថិជន៖ [" + custName + "] | កូដ៖ " + orderId;
  document.getElementById('cdmTotalText').innerText = "៛ " + Number(total).toLocaleString();

  var isDefaultAba = (String(payMethod || '').indexOf('ABA') !== -1);
  var radioCash = document.querySelector('input[name="cdm_pay"][value="Cash"]');
  var radioAba = document.querySelector('input[name="cdm_pay"][value="ABA"]');

  if (isDefaultAba && radioAba) {
    radioAba.checked = true;
    onCdmPayMethodChange('ABA');
  } else if (radioCash) {
    radioCash.checked = true;
    onCdmPayMethodChange('Cash');
  }

  document.getElementById('completeDeliveryModal').classList.remove('hidden');
}

// 💾 មុខងារកត់ត្រាការដឹកដល់ បំបែកទំនិញចូល Transactions & កាត់ស្តុកត្រឹមត្រូវ ១០០%
async function executeFinalCompleteDelivery() {
  if (!activeDeliveryTaskData) return;

  var task = activeDeliveryTaskData;
  var orderId = task.orderId;
  var custName = task.custName;
  var total = parseFloat(task.total || 0);
  var itemsText = task.itemsText || '';
  var driverName = task.driverName || (currentUser.fullName || 'KC WATER');

  var checkedRadio = document.querySelector('input[name="cdm_pay"]:checked');
  var actualPayMethod = checkedRadio ? checkedRadio.value : 'Cash';
  var payTextLabel = (actualPayMethod === 'ABA') ? 'ស្កេន ABA KHQR' : 'លុយសុទ្ធ (Cash)';

  var btn = document.getElementById('btnConfirmCompleteDelivery');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> កំពុងកត់ត្រា...';

  try {
    // ១. ប្តូរ Status ក្នុង Orders ទៅ Delivered
    const { error: ordErr } = await supabaseClient
      .from('orders')
      .update({
        status: 'Delivered',
        payment_method: payTextLabel
      })
      .eq('order_id', orderId);

    if (ordErr) throw ordErr;

    // ២. ធានាថាមានបញ្ជីទំនិញក្នុងស្តុកដើម្បីផ្ទៀងផ្ទាត់
    if (!allProducts || allProducts.length === 0) {
      const { data: pList } = await supabaseClient.from('products').select('*');
      if (pList) allProducts = pList;
    }

    // ៣. បំបែកទំនិញម្តងមួយមុខ (Itemized) ចូលតារាង Transactions
    var tid = "TR-" + new Date().getTime();
    var itemParts = String(itemsText).split(',');
    var rowsToInsert = [];
    var totalAllocated = 0;

    itemParts.forEach(function(partStr) {
      var seg = partStr.split('x');
      if (seg.length === 2) {
        var rawName = seg[0].trim();
        var qty = parseFloat(seg[1].trim() || 1);

        // ស្វែងរកទំនិញក្នុងស្តុក
        var matchedProd = allProducts.find(function(p) {
          return p.name.trim().toLowerCase() === rawName.toLowerCase();
        });

        // ស្វែងរកករណីសំបកធុង
        if (!matchedProd && (rawName.indexOf('សំបក') !== -1 || rawName.indexOf('ធុង') !== -1)) {
          matchedProd = allProducts.find(function(p) {
            var n = p.name.toLowerCase();
            var isBarrelItem = (n.indexOf('សំបក') !== -1 || n.indexOf('empty') !== -1);
            if (rawName.indexOf('ខៀវ') !== -1) return isBarrelItem && (n.indexOf('ខៀវ') !== -1 || n.indexOf('blue') !== -1);
            if (rawName.indexOf('ស') !== -1) return isBarrelItem && (n.indexOf('ស') !== -1 || n.indexOf('white') !== -1);
            return isBarrelItem;
          });
        }

        var unitPrice = matchedProd ? parseFloat(matchedProd.online_price || matchedProd.price || 0) : 0;
        var lineTotal = unitPrice * qty;
        totalAllocated += lineTotal;

        rowsToInsert.push({
          transaction_id: tid,
          customer_name: custName,
          product_name: matchedProd ? matchedProd.name : rawName,
          qty: qty,
          price: unitPrice,
          currency: "KHR",
          total: lineTotal,
          paid_khr: lineTotal,
          recorded_by: driverName ? (driverName + " (អ្នកដឹក)") : "Admin",
          status: "Paid",
          payment_method: actualPayMethod
        });
      }
    });

    // បើមានថ្លៃដឹកជញ្ជូន ឬសល់ទឹកប្រាក់ខ្វះខាត ឱ្យបូកជាជួរថ្លៃដឹកជញ្ជូន
    var diff = total - totalAllocated;
    if (diff > 0) {
      rowsToInsert.push({
        transaction_id: tid,
        customer_name: custName,
        product_name: "សេវាដឹកជញ្ជូនដល់ផ្ទះ",
        qty: 1,
        price: diff,
        currency: "KHR",
        total: diff,
        paid_khr: diff,
        recorded_by: driverName ? (driverName + " (អ្នកដឹក)") : "Admin",
        status: "Paid",
        payment_method: actualPayMethod
      });
    }

    if (rowsToInsert.length > 0) {
      await supabaseClient.from('transactions').insert(rowsToInsert);
    }

    // ៤. កាត់ស្តុកទំនិញក្នុងឃ្លាំង Supabase (រួមទាំងសំបកធុងថ្មី និងទឹកយួរ)
    for (var i = 0; i < rowsToInsert.length; i++) {
      var row = rowsToInsert[i];
      var prodToDeduct = allProducts.find(function(p) {
        return p.name.trim().toLowerCase() === row.product_name.trim().toLowerCase();
      });

      if (prodToDeduct && prodToDeduct.type === 'ទិញគេ' && row.qty > 0) {
        var newStock = Math.max(0, parseFloat(prodToDeduct.stock || 0) - row.qty);
        await supabaseClient.from('products').update({ stock: newStock }).eq('id', prodToDeduct.id);
        prodToDeduct.stock = newStock;
      }
    }

    closeCompleteDeliveryModal();
    showToast("បានកត់ត្រាការដឹកដល់ និងបំបែកទំនិញចូលបញ្ជីជោគជ័យ!", "success");
    if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70 });

    // ៥. Refresh អេក្រង់ទៅតាមអ្នកប្រើប្រាស់
    if (currentUser && currentUser.type === 'CompanyDriver') {
      if (typeof renderCompanyDeliveriesModule === 'function') renderCompanyDeliveriesModule();
    } else {
      openOnlineOrdersModal();
    }

    // ៦. ផ្ញើសារដំណឹង Telegram Alert
    try {
      var tgMsg = "✅ <b>[KC WATER - ដឹកជញ្ជូនរួចរាល់ & ប្រមូលប្រាក់ជោគជ័យ!]</b>\n\n" +
                  "🆔 <b>កូដកុម្ម៉ង់៖</b> <code>" + orderId + "</code>\n" +
                  "👤 <b>អតិថិជន៖</b> " + custName + "\n" +
                  "🛵 <b>អ្នកដឹក៖</b> " + driverName + "\n" +
                  "📦 <b>ទំនិញ៖</b> " + itemsText + "\n" +
                  "💵 <b>វិធីទូទាត់ជាក់ស្តែង៖</b> <b>" + payTextLabel + "</b>\n" +
                  "💰 <b>ប្រាក់ទទួលបាន៖</b> <b>៛ " + Number(total).toLocaleString() + "</b>\n" +
                  "🕒 <b>ម៉ោង៖</b> " + new Date().toLocaleTimeString('km-KH');
      sendTelegramAlert(tgMsg);
    } catch(tgE) {}

  } catch(err) {
    showToast("កំហុស៖ " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> ដឹកដល់រួចរាល់';
  }
}
// 🖼️ មុខងារបើកមើលរូបថតមុខផ្ទះរបស់ភ្ញៀវ (សម្រាប់ Admin & អ្នកដឹក)
function viewOrderHousePhoto(photoUrl, custName) {
  if (!photoUrl) {
    showToast("ការកុម្ម៉ង់នេះមិនមានភ្ជាប់រូបថតមុខផ្ទះឡើយ!", "info");
    return;
  }
  var existing = document.getElementById('orderHousePhotoModal');
  if (existing) existing.remove();

  var html = '<div id="orderHousePhotoModal" class="fixed inset-0 z-[7000] flex items-center justify-center p-4 overflow-y-auto">' +
    '<div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" onclick="document.getElementById(\'orderHousePhotoModal\').remove()"></div>' +
    '<div class="bg-white rounded-3xl shadow-2xl z-10 w-full max-w-sm overflow-hidden p-4 space-y-3 relative border text-center animate-in zoom-in-95 duration-200 my-auto max-h-[90dvh] flex flex-col">' +
      '<div class="flex justify-between items-center border-b pb-2">' +
        '<div class="text-left">' +
          '<b class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5"><i class="fas fa-house-chimney text-emerald-600"></i> រូបថតមុខផ្ទះ / ច្រកចូល</b>' +
          '<p class="text-[10px] text-slate-500 font-bold mt-0.5">អតិថិជន៖ ' + (custName || 'ភ្ញៀវ') + '</p>' +
        '</div>' +
        '<button type="button" onclick="document.getElementById(\'orderHousePhotoModal\').remove()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 text-lg font-bold flex items-center justify-center">&times;</button>' +
      '</div>' +
      '<div class="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[58vh]">' +
        '<img src="' + photoUrl + '" class="w-full h-auto object-contain max-h-[58vh] rounded-xl shadow-xs" alt="House Photo">' +
      '</div>' +
      '<button type="button" onclick="document.getElementById(\'orderHousePhotoModal\').remove()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition">បិទផ្ទាំងរូបភាព</button>' +
    '</div>' +
  '</div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// 🗺️ មុខងារបើកផែនទី Google Maps
function openOrderMap(mapUrl) {
  if (!mapUrl || String(mapUrl).trim() === "") {
    showToast("មិនមានទីតាំង ឬអាសយដ្ឋានឡើយ!", "warning");
    return;
  }
  var raw = String(mapUrl).trim();
  var match = raw.match(/https?:\/\/[^\s]+/);
  if (match) {
    window.open(match[0], '_blank');
  } else {
    var searchAddress = encodeURIComponent(raw + " ប៉ោយប៉ែត");
    window.open("https://www.google.com/maps/search/?api=1&query=" + searchAddress, '_blank');
  }
}
// 🔄 ចាប់ផ្តើមដំណើរការស្កេន Realtime ពេលបើកទំព័រ
window.addEventListener('load', function() {
  var navBtn = document.getElementById('navOnlineOrdersBtn');
  if (navBtn) {
    navBtn.onclick = openOnlineOrdersModal;
  }
  checkPendingOnlineOrdersBadge();
  initOrdersRealtimeListener();

  // Polling រៀងរាល់ ១៥ វិនាទីម្តង (Auto-Sync ទាំង Admin និងអ្នកដឹក)
  setInterval(function() {
    checkPendingOnlineOrdersBadge();
    if (currentUser && currentUser.type === 'CompanyDriver') {
      var driverContainer = document.getElementById('driverOrdersContainer');
      if (driverContainer) {
        renderCompanyDeliveriesModule();
      }
    }
  }, 15000);
});
// 📱 មុខងារបើក ABA QR ផ្ទាល់សម្រាប់អ្នកដឹក
function openDriverDirectQr(amount, custName) {
  var qrModal = document.getElementById('posKhqrModal');
  var amtText = document.getElementById('posKhqrAmountText');
  if (qrModal && amtText) {
    amtText.innerText = "៛ " + Number(amount || 0).toLocaleString();
    qrModal.classList.remove('hidden');
  }
}

// 🚚 មុខងារបង្ហាញបេសកកម្មដឹកទឹករបស់អ្នកដឹកជញ្ជូនរោងចក្រ (Company Driver Cockpit - ទំនើប & ងាយស្រួល)
async function renderCompanyDeliveriesModule() {
  var area = document.getElementById('contentArea');
  if (!area) return;

  var driverName = (currentUser && currentUser.fullName) ? currentUser.fullName : '';

  area.innerHTML = '<div class="max-w-2xl mx-auto space-y-4">' +
    '<div class="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">' +
      '<div>' +
        '<h2 class="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">' +
          '<i class="fas fa-motorcycle text-emerald-600"></i>' +
          '<span>បេសកកម្មដឹកទឹករបស់ខ្ញុំថ្ងៃនេះ</span>' +
        '</h2>' +
        '<p class="text-[11px] text-slate-500 mt-0.5">អ្នកដឹកជញ្ជូន៖ <b class="text-emerald-800">' + driverName + '</b></p>' +
      '</div>' +
      '<button onclick="renderCompanyDeliveriesModule()" class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 active:scale-95 transition flex items-center gap-1.5 shadow-2xs">' +
        '<i class="fas fa-sync-alt"></i> Refresh' +
      '</button>' +
    '</div>' +
    '<div id="driverOrdersContainer" class="space-y-3">' +
      '<div class="text-center py-10 text-slate-400 italic text-xs">' +
        '<i class="fas fa-spinner fa-spin mr-1.5 text-emerald-600 text-base"></i> កំពុងទាញយកការងារដឹកជញ្ជូន...' +
      '</div>' +
    '</div>' +
  '</div>';

  var container = document.getElementById('driverOrdersContainer');

  try {
    const { data: list, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('status', 'Assigned')
      .eq('driver_name', driverName)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!list || list.length === 0) {
      container.innerHTML = '<div class="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">' +
        '<div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shadow-inner">' +
          '<i class="fas fa-circle-check"></i>' +
        '</div>' +
        '<b class="text-slate-800 text-sm block">គ្មានការងារដឹកទឹកដែលនៅសល់ឡើយ!</b>' +
        '<p class="text-xs text-slate-400">រាល់ការកុម្ម៉ង់ដែល Admin ចាត់ចែងឱ្យអ្នក នឹងបង្ហាញនៅទីនេះភ្លាមៗ។</p>' +
      '</div>';
      return;
    }

    var html = '';
    list.forEach(function(task) {
      var cleanPhone = String(task.phone || '').replace(/[^0-9]/g, '');
      var safeName = String(task.customer_name || '').replace(/'/g, "\\'");
      var mapTarget = task.location_url || task.address || '';
      var timeStr = new Date(task.created_at).toLocaleString('km-KH', { dateStyle: 'short', timeStyle: 'short' });

      // បង្កើតតំណភ្ជាប់ Telegram ទៅកាន់លេខទូរស័ព្ទភ្ញៀវ (+855)
      var intlPhone = cleanPhone.startsWith('0') ? ('855' + cleanPhone.substring(1)) : ('855' + cleanPhone);
      var tgChatLink = "https://t.me/+" + intlPhone;

      html += '<div class="bg-white p-4 rounded-3xl border-2 border-emerald-400 shadow-md space-y-3 animate-in zoom-in duration-200">' +
        // ក្បាលកាត
        '<div class="flex justify-between items-start border-b border-slate-100 pb-2.5">' +
          '<div>' +
            '<div class="flex items-center gap-1.5">' +
              '<b class="text-sm font-black text-slate-900"><i class="fas fa-user-circle text-emerald-600 mr-1"></i>' + task.customer_name + '</b>' +
              '<span class="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-900 border border-blue-200">🚚 កំពុងដឹក</span>' +
            '</div>' +
            '<div class="text-[10px] text-slate-400 font-mono mt-0.5">កូដ៖ ' + task.order_id + ' | ម៉ោង៖ ' + timeStr + '</div>' +
          '</div>' +
          '<div class="text-right">' +
            '<div class="text-sm font-black text-emerald-700">៛ ' + Number(task.total || 0).toLocaleString() + '</div>' +
            '<span class="text-[10px] font-bold text-slate-500">' + (task.payment_method || 'COD') + '</span>' +
          '</div>' +
        '</div>' +

        // ព័ត៌មានទឹក និងទីតាំង
        '<div class="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80 space-y-1.5 text-xs text-slate-700">' +
          '<div class="flex items-start gap-1.5">' +
            '<span class="text-slate-400 font-bold whitespace-nowrap">📦 ទឹកត្រូវដឹក៖</span>' +
            '<b class="text-slate-900">' + task.items + '</b>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 text-[11px]">' +
            '<span class="text-slate-400 font-bold whitespace-nowrap">🛢️ សំបកធុង៖</span>' +
            '<span class="font-bold text-emerald-700">' + (task.barrel_swap || 'មានសំបកដូរ') + '</span>' +
          '</div>' +
          (task.address ? 
          '<div class="flex items-start gap-1.5 pt-0.5">' +
            '<span class="text-slate-400 font-bold whitespace-nowrap">📍 ទីតាំង & ចំណាំ៖</span>' +
            '<span class="text-slate-800 font-bold text-[11px] leading-snug">' + task.address + '</span>' +
          '</div>' : '') +
        '</div>' +

        // ជួរប៊ូតុងជំនួយរហ័ស (ខល, Telegram, ផែនទី, រូបផ្ទះ, ABA QR)
        '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">' +
          (cleanPhone ? 
          '<a href="tel:' + cleanPhone + '" class="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl font-bold border border-blue-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition" style="text-decoration:none;">' +
            '<i class="fas fa-phone text-blue-600"></i> ខល ' + task.phone +
          '</a>' : '') +

          (cleanPhone ? 
          '<a href="' + tgChatLink + '" target="_blank" class="py-2 px-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-xl font-bold border border-sky-300 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition" style="text-decoration:none;">' +
            '<i class="fab fa-telegram text-sky-600 text-sm"></i> Telegram' +
          '</a>' : '') +

          (mapTarget ? 
          '<button type="button" onclick="openOrderMap(\'' + mapTarget.replace(/'/g, "\\'") + '\')" class="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold border border-emerald-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-map-location-dot text-emerald-600"></i> ផែនទី' +
          '</button>' : '') +

          (task.photo_url ? 
          '<button type="button" onclick="viewOrderHousePhoto(\'' + task.photo_url + '\', \'' + safeName + '\')" class="py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold border border-amber-300 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-camera text-amber-600"></i> រូបមុខផ្ទះ' +
          '</button>' : '') +

          '<button type="button" onclick="openDriverDirectQr(' + (task.total || 0) + ', \'' + safeName + '\')" class="col-span-2 sm:col-span-1 py-2 px-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-black border border-red-200 shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition">' +
            '<i class="fas fa-qrcode text-red-600"></i> ស្កេន ABA' +
          '</button>' +
        '</div>' +

        // ប៊ូតុងបញ្ចប់ការដឹក
        '<button type="button" onclick="completeOnlineOrder(\'' + task.order_id + '\', \'' + safeName + '\', ' + (task.total || 0) + ', \'' + (task.items || '').replace(/'/g, "\\'") + '\', \'' + driverName.replace(/'/g, "\\'") + '\', \'' + (task.payment_method || 'COD').replace(/'/g, "\\'") + '\')" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition">' +
          '<i class="fas fa-check-circle text-base"></i> ដឹកដល់ហើយ & ប្រមូលលុយរួច' +
        '</button>' +
      '</div>';
    });

    container.innerHTML = html;
  } catch(e) {
    container.innerHTML = '<div class="p-4 text-center text-red-500 font-bold text-xs">កំហុស៖ ' + e.message + '</div>';
  }
}
