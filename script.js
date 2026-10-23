/**
 * HeritageLink — Core Interactive Logic Script
 * Supporting all 14 Homepage Sections, Explore, Detail, Heritage Profiles,
 * Passport, AI Itinerary, Bookings Lookup, and Role Portals.
 */

let allExperiences = [];
let allHeritageProfiles = [];
let activeFilter = 'all';
let currentUser = null;
let homeMap = null;
let homeMapMarkers = [];
let exploreMap = null;
let itinMap = null;

// Real authentic GPS Coordinates for Heritage Spots
const HERITAGE_COORDINATES = {
  1: { lat: 21.1448, lng: 106.1950, name: 'Gốm Phù Lãng', province: 'Bắc Ninh', region: 'north' },
  2: { lat: 23.3639, lng: 105.3186, name: 'Lô Lô Chải Lũng Cú', province: 'Hà Giang', region: 'north' },
  3: { lat: 20.8353, lng: 105.9754, name: 'Thêu Khoái Châu', province: 'Hưng Yên', region: 'north' },
  4: { lat: 16.0028, lng: 108.1481, name: 'Ẩm thực Hòa Vang', province: 'Đà Nẵng', region: 'central' },
  5: { lat: 20.2858, lng: 105.9083, name: 'Cố Đô Hoa Lư & Tràng An', province: 'Ninh Bình', region: 'north' },
  6: { lat: 15.8801, lng: 108.3380, name: 'Đèn lồng Hội An', province: 'Quảng Nam', region: 'central' },
  7: { lat: 21.1448, lng: 106.1950, name: 'Ấm chén gốm mộc Phù Lãng', province: 'Bắc Ninh', region: 'north' },
  8: { lat: 20.9784, lng: 105.7766, name: 'Lụa Vạn Phúc (Hà Đông)', province: 'Hà Nội', region: 'north' }
};

// Base API URL resolver: Supports both http://localhost:3000 and file:/// protocol
function resolveApiUrl(url) {
  if (window.location.protocol === 'file:' && url.startsWith('/api')) {
    return 'http://localhost:3000' + url;
  }
  return url;
}

// Utility fetch helper with auto-port & offline fallback
async function fetchJson(url, options = {}) {
  const targetUrl = resolveApiUrl(url);
  try {
    const response = await fetch(targetUrl, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Yêu cầu không thành công.');
    }
    return response.json();
  } catch (err) {
    // If running in local file:// mode and server is unreachable, provide offline fallback
    if (window.location.protocol === 'file:') {
      console.warn(`Local file mode: Falling back for ${url}:`, err.message);
      const fallback = getOfflineDataFallback(url);
      if (fallback !== null) return fallback;
    }
    throw err;
  }
}

// Built-in offline fallback data when opened directly via file:/// without running server
function getOfflineDataFallback(url) {
  const cleanUrl = url.split('?')[0];
  if (cleanUrl === '/api/experiences') {
    return [
      { id: 1, category: 'craft', segmentName: 'Làng nghề thủ công', title: 'Gốm truyền thống Phù Lãng – Nghệ thuật men da lươn 700 năm', location: 'Bắc Ninh', price: 850000, duration: '1 buổi (4 giờ)', maxGuests: 8, ambassador: 'Lê Minh Anh', rating: 4.9, reviewCount: 38, imageClass: 'images/gom-bacninh.jpg', badge: 'Đã kiểm duyệt' },
      { id: 2, category: 'culture', segmentName: 'Tour văn hóa & Lưu trú', title: 'Sống cùng đồng bào H\'Mông & Lô Lô Chải cao nguyên đá', location: 'Hà Giang', price: 1200000, duration: '2 ngày 1 đêm', maxGuests: 6, ambassador: 'Lê Minh Anh', rating: 4.9, reviewCount: 46, imageClass: 'images/hagiang.jpg', badge: 'Đã kiểm duyệt' },
      { id: 3, category: 'craft', segmentName: 'Làng nghề thủ công', title: 'Nghệ thuật thêu tay cung đình Khoái Châu – Tinh hoa sợi tơ tằm', location: 'Hưng Yên', price: 650000, duration: '3.5 giờ', maxGuests: 8, ambassador: 'Quốc Bình', rating: 4.8, reviewCount: 29, imageClass: 'images/theu-hungyen.jpg', badge: 'Đã kiểm duyệt' },
      { id: 4, category: 'food', segmentName: 'Ẩm thực địa phương', title: 'Mâm cơm đồng quê Hòa Vang – Hương vị gia đình miền Trung', location: 'Đà Nẵng', price: 750000, duration: '3 giờ', maxGuests: 10, ambassador: 'Lan Anh', rating: 4.8, reviewCount: 52, imageClass: 'images/amthuc-danang.jpg', badge: 'Đã kiểm duyệt' },
      { id: 5, category: 'culture', segmentName: 'Tour văn hóa & Di tích', title: 'Huyền sử Cố Đô Hoa Lư & Chèo thuyền xuyên thủy động Tràng An', location: 'Ninh Bình', price: 950000, duration: '1 ngày', maxGuests: 12, ambassador: 'Lê Minh Anh', rating: 4.9, reviewCount: 64, imageClass: 'images/ninhbinh.jpg', badge: 'Đã kiểm duyệt' },
      { id: 6, category: 'craft', segmentName: 'Làng nghề thủ công', title: 'Nghệ thuật làm đèn lồng lụa Hội An – Thắp sáng phố cổ', location: 'Quảng Nam', price: 450000, duration: '2.5 giờ', maxGuests: 15, ambassador: 'Quốc Bình', rating: 4.9, reviewCount: 88, imageClass: 'images/hoian.jpg', badge: 'Đã kiểm duyệt' },
      { id: 7, category: 'product', segmentName: 'Sản phẩm thủ công', title: 'Bộ ấm chén gốm mộc Phù Lãng khắc tay men da lươn độc bản', location: 'Bắc Ninh', price: 350000, duration: 'Giao hàng tận nơi', maxGuests: 1, ambassador: 'Trần Văn Hoàng', rating: 4.9, reviewCount: 15, imageClass: 'images/gom-bacninh.jpg', badge: 'Đã kiểm duyệt' },
      { id: 8, category: 'craft', segmentName: 'Làng nghề thủ công', title: 'Lụa Vạn Phúc – Nghệ thuật Lụa Vân nghìn năm đất Thăng Long', location: 'Hà Nội', price: 850000, duration: '1 buổi (3.5 giờ)', maxGuests: 8, ambassador: 'Trần Phương Linh', rating: 5.0, reviewCount: 32, imageClass: 'images/vanphuc/img_8039.jpg', videoUrl: 'images/vanphuc/lang-lua-van-phuc.mp4', badge: 'Đã kiểm duyệt' }
    ];
  }
  if (cleanUrl.startsWith('/api/experiences/')) {
    const id = Number(cleanUrl.replace('/api/experiences/', '')) || 1;
    const all = getOfflineDataFallback('/api/experiences');
    const item = all.find(x => x.id === id) || all[0];
    if (id === 8) {
      return {
        ...item,
        videoUrl: 'images/vanphuc/lang-lua-van-phuc.mp4',
        videoTitle: 'Phim tư liệu thực địa: Tiếng thoi đưa & Nghệ thuật dệt Lụa Vân Vạn Phúc',
        gallery: [
          'images/vanphuc/img_8039.jpg',
          'images/vanphuc/img_8034.jpg',
          'images/vanphuc/img_8035.jpg',
          'images/vanphuc/img_8036.jpg',
          'images/vanphuc/img_8037.jpg',
          'images/vanphuc/img_8038.jpg',
          'images/vanphuc/img_8040.jpg'
        ],
        story: 'Làng lụa Vạn Phúc bên dòng sông Nhuệ là cái nôi dệt tơ tằm cổ kính nhất Việt Nam với hơn một thiên niên kỷ thăng trầm. Nơi đây lưu giữ tuyệt kỹ dệt Lụa Vân – thứ gấm lụa cung đình tinh xảo với hoa văn chìm nổi huyền ảo theo từng góc độ ánh sáng. Trải nghiệm đưa bạn về với xưởng dệt cổ, tận mắt ngắm nhìn cỗ khung cửi Jacquard gỗ rọi ánh đèn vàng, nghe tiếng thoi đưa lách cách và chạm tay vào những súc lụa mềm mướt như dòng nước mùa thu.',
        heritageSlug: 'lua-van-phuc',
        layers: {
          layer1_observe: 'Quan sát giàn guồng xa quay cuộn hàng vạn sợi tơ tằm óng ả và đôi bàn tay nghệ nhân luồn từng sợi tơ lên cỗ khung cửi Jacquard gỗ đồ sộ.',
          layer1_image: 'images/vanphuc/img_8036.jpg',
          layer1_video: 'images/vanphuc/lang-lua-van-phuc.mp4',
          layer2_touch: 'Chạm tay vào bề mặt mát mịn óng ả của dải Lụa Vân vừa hoàn thiện trên khung dệt còn vương hương thơm mộc của sợi tơ tằm.',
          layer2_image: 'images/vanphuc/img_8040.jpg',
          layer3_do: 'Trực tiếp ngồi vào bàn quay tơ, học cách điều chỉnh con suốt và thử tay luồn sợi dệt dải lụa kỷ niệm dưới sự chỉ dẫn của nghệ nhân lão thành.',
          layer3_image: 'images/vanphuc/img_8034.jpg',
          layer4_listen: 'Lắng nghe huyền tích Bà tổ nghề Ả Lã Đê Nương thế kỷ thứ 9, giai thoại Lụa Vân tiến vua triều Nguyễn và niềm tự hào tham gia đấu xảo quốc tế Marseille.',
          layer4_image: 'images/vanphuc/img_8037.jpg'
        },
        artisan: { name: 'Nghệ nhân Nguyễn Thị Mai', years: '46 năm giữ lửa dệt Lụa Vân cổ truyền Vạn Phúc', quote: 'Lụa Vạn Phúc không chỉ là sợi vải, đó là mồ hôi, là tinh hoa của đất trời và linh hồn của nghìn năm Thăng Long dệt nên.', image: 'images/vanphuc/img_8037.jpg' }
      };
    }
    return {
      ...item,
      story: 'Làng gốm Phù Lãng bên bờ sông Cầu có lịch sử hơn 700 năm. Khác với men ngọc hay men rạn Bát Tràng, gốm Phù Lãng nổi tiếng với men da lươn tự nhiên thô mộc, tạo hình từ đất sét vàng đỏ và nung hoàn toàn bằng củi rơm truyền thống.',
      layers: {
        layer1_observe: 'Quan sát nghệ nhân chuốt gốm trên bàn xoay thủ công và kỹ thuật canh lửa lò nung củi rơm 3 ngày 3 đêm liên tục.',
        layer2_touch: 'Chạm tay vào khối đất sét phù sa ủ dẻo, cảm nhận bề mặt thô mộc ấm nóng của men da lươn vừa ra lò.',
        layer3_do: 'Trực tiếp nhào đất, tự tay chuốt chiếc cốc mộc hoặc bình hoa kỷ niệm dưới sự hướng dẫn 1:1 của nghệ nhân.',
        layer4_listen: 'Lắng nghe bác Nam kể huyền tích tổ nghề Hứa Vĩnh Kiều, chuyện làng gốm sơ tán thời chiến và triết lý sống hòa với đất.'
      },
      artisan: { name: 'Bác Phạm Văn Nam', years: '42 năm giữ nghề gốm mộc', quote: 'Gốm Phù Lãng không bóng bẩy tráng lệ, nó mang màu đất nâu ấm và khói rơm của làng quê Việt Nam.', image: 'images/person_2.jpg' }
    };
  }
  if (cleanUrl === '/api/session') {
    try {
      const u = localStorage.getItem('hl_user');
      return { user: u ? JSON.parse(u) : null };
    } catch (e) {
      return { user: null };
    }
  }
  if (cleanUrl === '/api/passport') {
    return {
      rank: 'Người khám phá (Explorer)',
      progress: 35,
      stampCount: 1,
      stamps: [{ stampId: 'STAMP-GOM-PHULANG', earnedAt: new Date().toISOString() }]
    };
  }
  return null;
}

function resolveImageUrl(imgClass) {
  if (!imgClass) return 'images/gom-bacninh.jpg';
  if (/^https?:\/\//i.test(imgClass) || imgClass.startsWith('images/')) {
    return imgClass;
  }
  if (imgClass === 'thumb-one') return 'images/gom-bacninh.jpg';
  if (imgClass === 'thumb-two') return 'images/hagiang.jpg';
  if (imgClass === 'thumb-three') return 'images/theu-hungyen.jpg';
  if (imgClass === 'thumb-four') return 'images/amthuc-danang.jpg';
  return 'images/gom-bacninh.jpg';
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('hl_wishlist') || '[]');
  } catch (e) {
    return [];
  }
}

function toggleWishlist(id) {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(Number(id));
  if (index >= 0) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(Number(id));
  }
  localStorage.setItem('hl_wishlist', JSON.stringify(wishlist));
  return wishlist.includes(Number(id));
}

// Sticky Navbar Scroll Listener
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-site-nav');
  if (nav && !nav.classList.contains('always-scrolled')) {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else if (!document.body.classList.contains('bg-warm-ivory') && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '')) {
      nav.classList.remove('scrolled');
    }
  }
});

/* ==========================================================================
   1. HOMEPAGE & EXPERIENCE RENDERING
   ========================================================================== */
function renderHomeExperiences() {
  const container = document.getElementById('home-experience-grid');
  if (!container) return;

  const filtered = activeFilter === 'all'
    ? allExperiences
    : allExperiences.filter(e => e.category === activeFilter);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="lead text-muted font-serif">Chưa có trải nghiệm nào trong danh mục này.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(exp => {
    const imgSrc = resolveImageUrl(exp.imageClass);
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="traditional-exp-card">
          <div class="exp-photo-box">
            <img src="${imgSrc}" alt="${exp.title}" loading="lazy">
            <div class="exp-seal-bar">
              <span class="exp-seal-tag">[ ${exp.location} • ${exp.segmentName || 'Làng nghề'} ]</span>
              <span class="exp-seal-status">${exp.badge || 'Nguyên bản'}</span>
            </div>
          </div>
          <div class="exp-body">
            <h3 class="exp-title">
              <a href="detail.html?id=${exp.id}">${exp.title}</a>
            </h3>
            <div class="exp-meta-line">
              <span>Thời lượng: ${exp.duration}</span>
              <span class="meta-dot">•</span>
              <span>Nhóm: 1-${exp.maxGuests || 8} khách</span>
              <span class="meta-dot">•</span>
              <span>Đánh giá: ${exp.rating}/5</span>
            </div>
            <div class="exp-ambassador-line">
              Đại sứ phụ trách: <strong>${exp.ambassador}</strong>
            </div>
            <div class="exp-foot">
              <div class="exp-price">
                <span class="price-val">${Number(exp.price).toLocaleString('vi-VN')}đ</span>
                <span class="price-unit">/ khách</span>
              </div>
              <a href="detail.html?id=${exp.id}" class="exp-link">
                Chi tiết hành trình →
              </a>
            </div>
          </div>
        </article>
      </div>
    `;
  }).join('');
}

window.onToggleWishlist = function(id, el) {
  const isFav = toggleWishlist(id);
  if (el) {
    el.classList.toggle('favorited', isFav);
  }
};

/* ==========================================================================
   2. INTERACTIVE LEAFLET HERITAGE MAP (SECTION 6)
   ========================================================================== */
function initHomeHeritageMap() {
  const mapEl = document.getElementById('heritage-leaflet-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Center on Vietnam with natural zoom
  homeMap = L.map('heritage-leaflet-map', {
    scrollWheelZoom: false
  }).setView([18.2, 106.5], 6);

  // 1. Bản đồ Tiếng Việt chuẩn xác (Google Maps Vietnam - 100% tiếng Việt, tên tỉnh thành, đường sá, không chữ ngoại ngữ)
  const googleMapVi = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi', {
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Bản đồ Việt Nam (Google Maps)'
  });

  // 2. Ảnh Vệ tinh thực tế có nhãn tiếng Việt (Hybrid Satellite)
  const googleSatVi = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi', {
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '&copy; Vệ tinh Google'
  });

  // 3. OpenStreetMap
  const osmStandard = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  });

  // Default to 100% Vietnamese map
  googleMapVi.addTo(homeMap);

  // Interactive Layer Switcher so user can choose Standard, Satellite, or OSM
  const baseMaps = {
    "Bản đồ Tiếng Việt": googleMapVi,
    "Ảnh Vệ tinh chi tiết": googleSatVi,
    "Bản đồ OpenStreetMap": osmStandard
  };
  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(homeMap);

  renderHomeMapMarkers('all');
  renderMapSidebarList('all');
}

function renderHomeMapMarkers(regionFilter = 'all') {
  if (!homeMap) return;

  // Clear existing
  homeMapMarkers.forEach(m => homeMap.removeLayer(m));
  homeMapMarkers = [];

  allExperiences.forEach((exp, idx) => {
    const coords = HERITAGE_COORDINATES[exp.id];
    if (!coords) return;

    if (regionFilter !== 'all' && coords.region !== regionFilter) return;

    // Custom Icon with Deep Forest Green styling
    const customIcon = L.divIcon({
      className: 'heritage-custom-pin-wrap',
      html: `<div class="heritage-custom-pin">${idx + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const popupContent = `
      <div class="heritage-popup-box">
        <img src="${resolveImageUrl(exp.imageClass)}" alt="${exp.title}" class="heritage-popup-img">
        <span class="heritage-popup-tag">[ ${exp.location} • ${exp.segmentName} ]</span>
        <h4 class="heritage-popup-title">${exp.title}</h4>
        <div class="heritage-popup-footer">
          <span class="heritage-popup-price">${Number(exp.price).toLocaleString('vi-VN')}đ <small>/ người</small></span>
          <a href="detail.html?id=${exp.id}" class="heritage-popup-link">Chi tiết →</a>
        </div>
      </div>
    `;

    const marker = L.marker([coords.lat, coords.lng], { icon: customIcon })
      .addTo(homeMap)
      .bindPopup(popupContent);

    marker.expId = exp.id;
    homeMapMarkers.push(marker);
  });
}

function renderMapSidebarList(regionFilter = 'all') {
  const sidebar = document.getElementById('map-sidebar-list');
  if (!sidebar) return;

  const items = allExperiences.filter(exp => {
    const coords = HERITAGE_COORDINATES[exp.id];
    if (!coords) return true;
    return regionFilter === 'all' || coords.region === regionFilter;
  });

  sidebar.innerHTML = items.map((exp, idx) => `
    <div class="traditional-map-item" onclick="focusOnMapSpot(${exp.id})" id="sidebar-item-${exp.id}">
      <div class="map-item-thumb">
        <img src="${resolveImageUrl(exp.imageClass)}" alt="${exp.title}">
      </div>
      <div class="map-item-content">
        <span class="map-item-seal">[ TỌA ĐỘ ${idx + 1} • ${exp.location} ]</span>
        <h4 class="map-item-title">${exp.title}</h4>
        <div class="map-item-byline">Đại sứ: ${exp.ambassador}</div>
        <div class="map-item-price">${Number(exp.price).toLocaleString('vi-VN')}đ <small>/ khách</small></div>
      </div>
    </div>
  `).join('');
}

window.focusOnMapSpot = function(id) {
  if (!homeMap) return;
  const coords = HERITAGE_COORDINATES[id];
  if (coords) {
    homeMap.flyTo([coords.lat, coords.lng], 10, { duration: 1.2 });
    const marker = homeMapMarkers.find(m => m.expId === id);
    if (marker) marker.openPopup();

    document.querySelectorAll('.traditional-map-item, .map-list-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`sidebar-item-${id}`);
    if (activeEl) activeEl.classList.add('active');
  }
};

/* ==========================================================================
   3. AI ITINERARY GENERATOR (SECTION 12 & /ai-itinerary)
   ========================================================================== */
function initAiItineraryHandlers() {
  const homeItinForm = document.getElementById('home-ai-itinerary-form');
  if (homeItinForm) {
    homeItinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dest = document.getElementById('itin-dest')?.value || 'all';
      const duration = document.getElementById('itin-duration')?.value || '2d1n';
      const style = document.getElementById('itin-style')?.value || 'craft';
      const guests = document.getElementById('itin-guests')?.value || 2;
      const btn = document.getElementById('home-itin-btn');

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Đang thiết kế lộ trình...';
      }

      try {
        const result = await fetchJson('/api/ai-itinerary/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: dest, duration, culturalStyle: style, groupSize: guests })
        });

        // Update UI
        const titleEl = document.getElementById('itin-output-title');
        const costEl = document.getElementById('itin-output-cost');
        if (titleEl) titleEl.textContent = result.title;
        if (costEl) costEl.textContent = result.formattedBudget;
      } catch (err) {
        console.error('Failed to generate AI itinerary:', err);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Tạo hành trình thông minh';
        }
      }
    });
  }

  // Standalone AI Itinerary page
  const standaloneForm = document.getElementById('standalone-ai-itinerary-form');
  if (standaloneForm) {
    standaloneForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dest = document.getElementById('ai-input-dest')?.value || 'all';
      const duration = document.getElementById('ai-input-duration')?.value || '2d1n';
      const style = document.getElementById('ai-input-style')?.value || 'craft';
      const guests = document.getElementById('ai-input-guests')?.value || 2;
      const btn = document.getElementById('btn-generate-ai-itin');

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Đang tạo lộ trình...';
      }

      try {
        const result = await fetchJson('/api/ai-itinerary/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: dest, duration, culturalStyle: style, groupSize: guests })
        });

        renderStandaloneAiResult(result);
      } catch (err) {
        alert(err.message || 'Lỗi khi tạo lộ trình.');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Tạo lại lộ trình';
        }
      }
    });

    // Initial trigger
    standaloneForm.dispatchEvent(new Event('submit'));
  }
}

function renderStandaloneAiResult(data) {
  const titleEl = document.getElementById('ai-result-title');
  const costEl = document.getElementById('ai-result-cost');
  const whyEl = document.getElementById('ai-result-why');
  const daysContainer = document.getElementById('ai-days-container');

  if (titleEl) titleEl.textContent = data.title;
  if (costEl) costEl.textContent = data.formattedBudget;
  if (whyEl) whyEl.textContent = data.whyRecommended;

  if (daysContainer && data.days) {
    daysContainer.innerHTML = data.days.map(d => `
      <div class="itinerary-day-node mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge badge-primary px-3 py-1 font-weight-bold" style="background-color: var(--color-primary);">Ngày ${d.day}</span>
          <span class="small text-muted font-weight-bold">${d.location}</span>
        </div>
        <h4 class="h5 font-weight-bold text-forest-green mb-3">${d.title}</h4>
        <div class="pl-2 border-left mb-3" style="border-left: 2px solid var(--color-accent) !important;">
          ${d.timeline.map(t => `
            <div class="mb-2 small">
              <strong class="text-accent">${t.time}:</strong> <span class="text-muted">${t.activity}</span>
            </div>
          `).join('')}
        </div>
        <div class="d-flex flex-wrap gap-2">
          ${d.highlights.map(h => `<span class="badge badge-light border text-dark small">${h}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // Draw Leaflet map route if map element exists
  const mapEl = document.getElementById('ai-itinerary-map');
  if (mapEl && typeof L !== 'undefined') {
    if (!itinMap) {
      itinMap = L.map('ai-itinerary-map', { scrollWheelZoom: false }).setView([21.0, 106.0], 8);
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Bản đồ Việt Nam'
      }).addTo(itinMap);
    }

    const routeCoords = [];
    data.days.forEach(d => {
      const coords = HERITAGE_COORDINATES[d.experienceId];
      if (coords) {
        routeCoords.push([coords.lat, coords.lng]);
        L.marker([coords.lat, coords.lng]).addTo(itinMap).bindPopup(`<strong>${d.title}</strong>`);
      }
    });

    if (routeCoords.length > 1) {
      L.polyline(routeCoords, { color: '#20372F', weight: 4, dashArray: '6, 8' }).addTo(itinMap);
      itinMap.fitBounds(L.latLngBounds(routeCoords), { padding: [30, 30] });
    } else if (routeCoords.length === 1) {
      itinMap.setView(routeCoords[0], 9);
    }
  }
}

/* ==========================================================================
   4. DETAIL PAGE INITIALIZER (detail.html)
   ========================================================================== */
async function initDetailPage() {
  const titleEl = document.getElementById('detail-title');
  if (!titleEl) return;

  // Extract ID from pathname /experience/:id or query param
  let expId = 1;
  const match = window.location.pathname.match(/\/experience\/(\d+)/);
  if (match) {
    expId = Number(match[1]);
  } else {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) expId = Number(params.get('id'));
  }

  try {
    const exp = await fetchJson(`/api/experiences/${expId}`);

    // Populate Hero & Header
    titleEl.textContent = exp.title;
    document.getElementById('page-title').textContent = `${exp.title} | HeritageLink`;
    document.getElementById('detail-breadcrumb-title').textContent = exp.title;
    document.getElementById('detail-location-header').textContent = `${exp.location}`;
    document.getElementById('detail-category-badge').textContent = exp.segmentName || 'Làng nghề';
    document.getElementById('detail-rating').textContent = exp.rating;
    document.getElementById('detail-review-count').textContent = exp.reviewCount || 38;
    document.getElementById('detail-duration').textContent = exp.duration;
    document.getElementById('detail-max-guests').textContent = `Tối đa ${exp.maxGuests || 8} khách/lượt`;
    document.getElementById('detail-ambassador-name').textContent = exp.ambassador;

    const mainImg = resolveImageUrl(exp.imageClass);
    if (document.getElementById('detail-hero-main-img')) {
      document.getElementById('detail-hero-main-img').src = mainImg;
    }
    if (exp.gallery && exp.gallery.length >= 2) {
      if (document.getElementById('detail-sub-img-1')) {
        document.getElementById('detail-sub-img-1').src = resolveImageUrl(exp.gallery[1] || exp.gallery[0]);
      }
      if (document.getElementById('detail-sub-img-2')) {
        document.getElementById('detail-sub-img-2').src = resolveImageUrl(exp.gallery[2] || exp.gallery[1]);
      }
    }
    const livingHeritageLink = document.getElementById('link-living-heritage');
    if (livingHeritageLink && exp.heritageSlug) {
      livingHeritageLink.href = `heritage.html?slug=${exp.heritageSlug}`;
    }

    // Apply Ambassador's Custom Detail UI Theme
    if (exp.customTheme) {
      const theme = exp.customTheme;
      if (theme.primaryColor) {
        document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
        document.documentElement.style.setProperty('--color-forest', theme.primaryColor);
      }
      if (theme.accentColor) {
        document.documentElement.style.setProperty('--color-accent', theme.accentColor);
      }
      if (theme.secondaryColor) {
        document.documentElement.style.setProperty('--color-bg-secondary', theme.secondaryColor);
      }
      if (theme.fontStyle === 'serif') {
        document.body.classList.add('theme-serif-mode');
      } else {
        document.body.classList.remove('theme-serif-mode');
      }

      // Custom Badge Text
      if (theme.badgeText && document.getElementById('detail-verified-badge')) {
        document.getElementById('detail-verified-badge').textContent = theme.badgeText;
      }

      // Ambassador Note Box
      const ambNoteBox = document.getElementById('detail-ambassador-custom-box');
      if (ambNoteBox) {
        if (theme.ambassadorNote) {
          ambNoteBox.classList.remove('d-none');
          if (document.getElementById('amb-custom-name')) {
            document.getElementById('amb-custom-name').textContent = exp.ambassador || 'Đại sứ Di sản';
          }
          if (document.getElementById('amb-custom-note')) {
            document.getElementById('amb-custom-note').textContent = `“${theme.ambassadorNote}”`;
          }
        }
      }

      // Audio Guide Box
      const audioBox = document.getElementById('detail-audio-guide-box');
      if (audioBox) {
        if (theme.audioTitle) {
          audioBox.classList.remove('d-none');
          if (document.getElementById('detail-audio-title')) {
            document.getElementById('detail-audio-title').textContent = theme.audioTitle;
          }
        }
      }

      // Cultural Tips Box
      const tipsBox = document.getElementById('detail-cultural-tips-box');
      if (tipsBox) {
        if (theme.culturalTips) {
          tipsBox.classList.remove('d-none');
          if (document.getElementById('detail-cultural-tips-text')) {
            document.getElementById('detail-cultural-tips-text').textContent = theme.culturalTips;
          }
        }
      }

      // Hero Layout Customization
      const heroContainer = document.getElementById('detail-hero-section');
      if (heroContainer) {
        if (theme.heroLayout === 'cinematic') {
          const stdHeader = document.getElementById('detail-standard-header');
          if (stdHeader) stdHeader.classList.add('d-none');
          const stdGrid = document.getElementById('detail-hero-grid');
          if (stdGrid) stdGrid.classList.add('d-none');

          let cinWrap = document.getElementById('detail-cinematic-wrapper');
          if (!cinWrap) {
            cinWrap = document.createElement('div');
            cinWrap.id = 'detail-cinematic-wrapper';
            heroContainer.appendChild(cinWrap);
          }
          cinWrap.className = 'hero-cinematic-banner rounded-20 p-4 p-md-5 mb-5 text-white shadow-lg position-relative overflow-hidden';
          cinWrap.style.background = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.78)), url('${mainImg}') center/cover no-repeat`;
          cinWrap.innerHTML = `
            <div class="row align-items-center" style="min-height: 380px;">
              <div class="col-lg-9">
                <span class="badge badge-accent px-3 py-2 text-white font-weight-bold mb-3 shadow-sm">${theme.badgeText || exp.badge || 'Trải nghiệm Di sản Sống'}</span>
                <h1 class="display-4 font-weight-bold text-white mb-3" style="text-shadow: 0 2px 10px rgba(0,0,0,0.5);">${exp.title}</h1>
                <p class="lead text-white-opacity mb-4" style="font-size: 1.15rem; line-height: 1.6;">${exp.specialIntro || exp.story || ''}</p>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="badge badge-light px-3 py-2 text-dark font-weight-bold">Địa điểm: ${exp.location}</span>
                  <span class="badge badge-light px-3 py-2 text-dark font-weight-bold">Thời lượng: ${exp.duration}</span>
                  <span class="badge badge-light px-3 py-2 text-dark font-weight-bold">Tối đa ${exp.maxGuests || 8} khách</span>
                  <span class="badge badge-light px-3 py-2 text-dark font-weight-bold">Đại sứ đồng hành: ${exp.ambassador}</span>
                </div>
              </div>
            </div>
          `;
        } else if (theme.heroLayout === 'story') {
          const stdHeader = document.getElementById('detail-standard-header');
          if (stdHeader) stdHeader.classList.add('d-none');
          const stdGrid = document.getElementById('detail-hero-grid');
          if (stdGrid) stdGrid.classList.add('d-none');

          let storyWrap = document.getElementById('detail-story-wrapper');
          if (!storyWrap) {
            storyWrap = document.createElement('div');
            storyWrap.id = 'detail-story-wrapper';
            heroContainer.appendChild(storyWrap);
          }
          storyWrap.className = 'hero-story-banner p-4 p-md-5 rounded-20 bg-white border shadow-sm mb-5';
          storyWrap.innerHTML = `
            <div class="row align-items-center">
              <div class="col-lg-7 mb-4 mb-lg-0">
                <div class="rounded-20 overflow-hidden shadow-sm" style="height: 380px;">
                  <img src="${mainImg}" alt="${exp.title}" class="w-100 h-100" style="object-fit: cover;">
                </div>
              </div>
              <div class="col-lg-5 pl-lg-4">
                <span class="badge badge-accent px-3 py-1 font-weight-bold text-white mb-2">${theme.badgeText || 'Hành trình Kể chuyện Di sản'}</span>
                <h2 class="h3 font-weight-bold text-forest-green mb-3">${exp.title}</h2>
                <div class="p-3 bg-warm-ivory rounded-15 border-left border-gold mb-3" style="border-left-width: 4px !important;">
                  <strong class="d-block text-dark small font-weight-bold mb-1">Lời tự sự từ Nghệ nhân & Đại sứ:</strong>
                  <p class="font-italic text-muted small mb-0">${exp.artisan ? `“${exp.artisan.quote}”` : exp.story}</p>
                </div>
                <div class="small text-muted mb-0">
                  <span>Địa điểm: ${exp.location}</span> • <span>Thời lượng: ${exp.duration}</span> • <span>Đại sứ đồng hành: <strong>${exp.ambassador}</strong></span>
                </div>
              </div>
            </div>
          `;
        }
      }
    }

    // Audio guide player interactive toggle
    const audioToggleBtn = document.getElementById('btn-audio-toggle');
    if (audioToggleBtn) {
      let isPlaying = false;
      audioToggleBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
          audioToggleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
          audioToggleBtn.classList.replace('btn-primary', 'btn-success');
        } else {
          audioToggleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
          audioToggleBtn.classList.replace('btn-success', 'btn-primary');
        }
      });
    }

    // Populate Tour Video Player (nếu có thước phim phóng sự thực địa)
    const tourVideoBox = document.getElementById('detail-tour-video-box');
    const tourVideoPlayer = document.getElementById('detail-tour-video-player');
    const tourVideoTitle = document.getElementById('detail-tour-video-title');
    if (tourVideoBox && tourVideoPlayer) {
      if (exp.videoUrl) {
        tourVideoPlayer.src = exp.videoUrl;
        if (tourVideoTitle && exp.videoTitle) {
          tourVideoTitle.textContent = exp.videoTitle;
        }
        tourVideoBox.classList.remove('d-none');
      } else {
        tourVideoBox.classList.add('d-none');
      }
    }

    // Populate Story & 4 Stages Media
    document.getElementById('detail-story-content').textContent = exp.story || '';
    
    // Stages data extraction (from exp.stages array or exp.layers)
    const stages = exp.stages || [];
    const layers = exp.layers || {};

    const stage1Desc = stages[0]?.desc || layers.layer1_observe || '';
    const stage1Img = stages[0]?.image || layers.layer1_image || '';
    const stage1Vid = stages[0]?.video || layers.layer1_video || '';
    if (document.getElementById('detail-layer1')) document.getElementById('detail-layer1').textContent = stage1Desc;
    if (stage1Img && document.getElementById('detail-layer1-img')) {
      document.getElementById('detail-layer1-img').src = stage1Img;
      document.getElementById('detail-layer1-img-box')?.classList.remove('d-none');
    }
    if (stage1Vid && document.getElementById('detail-layer1-vid')) {
      document.getElementById('detail-layer1-vid').src = stage1Vid;
      document.getElementById('detail-layer1-vid-box')?.classList.remove('d-none');
    }

    const stage2Desc = stages[1]?.desc || layers.layer2_touch || '';
    const stage2Img = stages[1]?.image || layers.layer2_image || '';
    const stage2Vid = stages[1]?.video || layers.layer2_video || '';
    if (document.getElementById('detail-layer2')) document.getElementById('detail-layer2').textContent = stage2Desc;
    if (stage2Img && document.getElementById('detail-layer2-img')) {
      document.getElementById('detail-layer2-img').src = stage2Img;
      document.getElementById('detail-layer2-img-box')?.classList.remove('d-none');
    }
    if (stage2Vid && document.getElementById('detail-layer2-vid')) {
      document.getElementById('detail-layer2-vid').src = stage2Vid;
      document.getElementById('detail-layer2-vid-box')?.classList.remove('d-none');
    }

    const stage3Desc = stages[2]?.desc || layers.layer3_do || '';
    const stage3Img = stages[2]?.image || layers.layer3_image || '';
    const stage3Vid = stages[2]?.video || layers.layer3_video || '';
    if (document.getElementById('detail-layer3')) document.getElementById('detail-layer3').textContent = stage3Desc;
    if (stage3Img && document.getElementById('detail-layer3-img')) {
      document.getElementById('detail-layer3-img').src = stage3Img;
      document.getElementById('detail-layer3-img-box')?.classList.remove('d-none');
    }
    if (stage3Vid && document.getElementById('detail-layer3-vid')) {
      document.getElementById('detail-layer3-vid').src = stage3Vid;
      document.getElementById('detail-layer3-vid-box')?.classList.remove('d-none');
    }

    const stage4Desc = stages[3]?.desc || layers.layer4_listen || '';
    const stage4Img = stages[3]?.image || layers.layer4_image || '';
    const stage4Vid = stages[3]?.video || layers.layer4_video || '';
    if (document.getElementById('detail-layer4')) document.getElementById('detail-layer4').textContent = stage4Desc;
    if (stage4Img && document.getElementById('detail-layer4-img')) {
      document.getElementById('detail-layer4-img').src = stage4Img;
      document.getElementById('detail-layer4-img-box')?.classList.remove('d-none');
    }
    if (stage4Vid && document.getElementById('detail-layer4-vid')) {
      document.getElementById('detail-layer4-vid').src = stage4Vid;
      document.getElementById('detail-layer4-vid-box')?.classList.remove('d-none');
    }

    // Artisan
    if (exp.artisan) {
      if (document.getElementById('detail-artisan-name')) document.getElementById('detail-artisan-name').textContent = exp.artisan.name;
      if (document.getElementById('detail-artisan-years')) document.getElementById('detail-artisan-years').textContent = exp.artisan.years;
      if (document.getElementById('detail-artisan-quote')) document.getElementById('detail-artisan-quote').textContent = `“${exp.artisan.quote}”`;
      if (document.getElementById('detail-artisan-img') && exp.artisan.image) document.getElementById('detail-artisan-img').src = exp.artisan.image;
    }

    // Populate Dynamic "Ai làm gì trong trải nghiệm này" Section (Prompt 3.4)
    if (typeof DETAIL_ROLES_BY_EXP_ID !== 'undefined') {
      const roleData = DETAIL_ROLES_BY_EXP_ID[exp.id] || DETAIL_ROLES_BY_EXP_ID.default;
      if (roleData) {
        const ambNameEl = document.getElementById('role-ambassador-name');
        const ambDescEl = document.getElementById('role-ambassador-desc');
        const artNameEl = document.getElementById('role-artisan-name');
        const artDescEl = document.getElementById('role-artisan-desc');
        const platDescEl = document.getElementById('role-platform-desc');

        if (ambNameEl) ambNameEl.textContent = roleData.ambassadorName || exp.ambassador;
        if (ambDescEl) ambDescEl.textContent = roleData.ambassadorRole;
        if (artNameEl) artNameEl.textContent = roleData.artisanName || (exp.artisan ? exp.artisan.name : 'Nghệ nhân bản địa');
        if (artDescEl) artDescEl.textContent = roleData.artisanRole;
        if (platDescEl) platDescEl.textContent = roleData.platformRole;
      }
    }

    // Populate Dedicated Ambassador Tab
    if (document.getElementById('detail-amb-name')) document.getElementById('detail-amb-name').textContent = exp.ambassador || 'Lê Minh Anh';
    if (document.getElementById('detail-amb-region')) document.getElementById('detail-amb-region').textContent = exp.location || 'Bắc Ninh';
    if (document.getElementById('detail-amb-badge')) document.getElementById('detail-amb-badge').textContent = (exp.customTheme && exp.customTheme.badgeText) || 'Khảo sát thực địa 100% cùng Nghệ nhân';
    if (document.getElementById('detail-amb-note')) document.getElementById('detail-amb-note').textContent = (exp.customTheme && exp.customTheme.ambassadorNote) ? `“${exp.customTheme.ambassadorNote}”` : `“Chào bạn, hãy cùng chúng mình trải nghiệm trọn vẹn văn hóa sống bản địa này nhé!”`;

    // Setup Interactive Tab Navigation
    const tabBtns = document.querySelectorAll('.detail-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.detail-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(targetTab);
        if (pane) pane.classList.add('active');
      });
    });

    // Pricing & Live Dynamic Tour Customizer Setup
    const cardPrice = document.getElementById('detail-card-price');
    const basePrice = Number(exp.price || 850000);
    if (cardPrice) cardPrice.textContent = `${basePrice.toLocaleString('vi-VN')}đ`;

    const pkgStandard = document.getElementById('pkg-card-standard');
    const pkgPremium = document.getElementById('pkg-card-premium');
    const pkgPriceStandard = document.getElementById('pkg-price-standard');
    if (pkgPriceStandard) pkgPriceStandard.textContent = `${basePrice.toLocaleString('vi-VN')}đ`;

    const guestsInput = document.getElementById('booking-input-guests');
    const btnMinus = document.getElementById('btn-guest-minus');
    const btnPlus = document.getElementById('btn-guest-plus');
    const dateInput = document.getElementById('booking-input-date');

    // Default to tomorrow
    if (dateInput && !dateInput.value) {
      const tomorrow = new Date(Date.now() + 86400000);
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.min = new Date().toISOString().split('T')[0];
    }

    // Dynamic calculation function
    function updateCalculator() {
      const guests = Number(guestsInput?.value || 2);
      const isPremium = document.querySelector('input[name="tourPackage"]:checked')?.value === 'premium';
      const unit = isPremium ? basePrice + 300000 : basePrice;

      const subtotal = guests * unit;
      let addonsTotal = 0;
      if (addonGiftbox?.checked) addonsTotal += 120000;
      if (addonPhoto?.checked) addonsTotal += 150000;

      const total = subtotal + addonsTotal;
      const hostRev = Math.round(total * 0.85);

      if (cardPrice) cardPrice.textContent = `${unit.toLocaleString('vi-VN')}đ`;
      const breakdownText = document.getElementById('calc-breakdown-text');
      if (breakdownText) {
        let text = `${unit.toLocaleString('vi-VN')}đ × ${guests} khách`;
        if (addonsTotal > 0) text += ` + ${addonsTotal.toLocaleString('vi-VN')}đ dịch vụ thêm`;
        breakdownText.textContent = text;
      }
      if (document.getElementById('calc-artisan-share')) {
        document.getElementById('calc-artisan-share').textContent = `${hostRev.toLocaleString('vi-VN')}đ`;
      }
      if (document.getElementById('calc-total-price')) {
        document.getElementById('calc-total-price').textContent = `${total.toLocaleString('vi-VN')}đ`;
      }
    }

    // Guest stepper
    const maxGuests = exp.maxGuests || 8;
    if (btnMinus && guestsInput) {
      btnMinus.addEventListener('click', () => {
        let val = Number(guestsInput.value || 1);
        if (val > 1) {
          guestsInput.value = val - 1;
          updateCalculator();
        }
      });
    }
    if (btnPlus && guestsInput) {
      btnPlus.addEventListener('click', () => {
        let val = Number(guestsInput.value || 1);
        if (val < maxGuests) {
          guestsInput.value = val + 1;
          updateCalculator();
        }
      });
    }

    // Package radio change
    const pkgRadios = document.querySelectorAll('input[name="tourPackage"]');
    pkgRadios.forEach(r => {
      r.addEventListener('change', () => {
        if (pkgStandard && pkgPremium) {
          pkgStandard.classList.toggle('selected', r.value === 'standard');
          pkgPremium.classList.toggle('selected', r.value === 'premium');
        }
        updateCalculator();
      });
    });

    // Addons change
    const addonGiftbox = document.getElementById('addon-giftbox');
    const addonPhoto = document.getElementById('addon-photo');
    [addonGiftbox, addonPhoto].forEach(el => {
      el?.addEventListener('change', updateCalculator);
    });

    updateCalculator();

    // Booking Submission Handler
    const bookingForm = document.getElementById('detail-booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = dateInput?.value;
        const slot = document.getElementById('booking-input-slot')?.value || 'afternoon';
        const guests = Number(guestsInput?.value || 2);
        const pkg = document.querySelector('input[name="tourPackage"]:checked')?.value || 'standard';
        const feedback = document.getElementById('booking-status-feedback');

        if (!date) {
          alert('Vui lòng chọn ngày trải nghiệm.');
          return;
        }

        try {
          feedback.innerHTML = '<span class="text-primary font-weight-bold">Đang xác nhận đặt chỗ...</span>';
          const res = await fetchJson('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              experienceId: exp.id,
              bookingDate: date,
              timeSlot: slot,
              package: pkg,
              guests,
              giftbox: addonGiftbox?.checked || false,
              photo: addonPhoto?.checked || false
            })
          });

          feedback.innerHTML = `<div class="alert alert-success p-2 small mt-2">${res.message} Chuyển sang xem thông tin vé...</div>`;
          setTimeout(() => {
            window.location.href = '/bookings.html';
          }, 1200);
        } catch (err) {
          feedback.innerHTML = `<div class="alert alert-danger p-2 small mt-2">${err.message || 'Cần đăng nhập để đặt chỗ.'} <a href="/login.html" class="font-weight-bold">Đăng nhập ngay</a></div>`;
        }
      });
    }

  } catch (err) {
    console.error('Failed to load experience details:', err);
  }
}

/* ==========================================================================
   5. LIVING HERITAGE SCROLLYTELLING (heritage.html)
   ========================================================================== */
async function initHeritageProfilesPage() {
  const articleBox = document.getElementById('heritage-article-box');
  if (!articleBox) return;

  try {
    allHeritageProfiles = await fetchJson('/api/heritage-profiles');

    const switcher = document.getElementById('heritage-slug-switcher');
    const searchParams = new URLSearchParams(window.location.search);
    const querySlug = searchParams.get('slug');
    const pathSlug = window.location.pathname.replace('/heritage/', '').replace('/heritage', '').replace('.html', '').replace('/', '');
    const currentSlug = querySlug || (pathSlug && pathSlug.length > 2 && !pathSlug.includes('index') ? pathSlug : 'gom-phu-lang');

    if (switcher) {
      switcher.value = currentSlug;
      switcher.addEventListener('change', () => {
        loadHeritageProfile(switcher.value);
      });
    }

    loadHeritageProfile(currentSlug);
  } catch (err) {
    console.error('Failed to load heritage profiles:', err);
  }
}

async function loadHeritageProfile(slug) {
  try {
    const profile = await fetchJson(`/api/heritage-profiles/${slug}`);

    document.getElementById('heritage-page-title').textContent = `${profile.title} | HeritageLink`;
    document.getElementById('profile-title').textContent = profile.title;
    document.getElementById('profile-category-tag').textContent = profile.categoryName;
    document.getElementById('profile-location-tag').textContent = profile.location;
    document.getElementById('profile-cover-img').src = resolveImageUrl(profile.coverImage);
    document.getElementById('profile-consent-text').textContent = profile.consentGranted;
    document.getElementById('profile-verified-date').textContent = `Đã kiểm duyệt: ${profile.verifiedDate}`;
    document.getElementById('profile-ambassador-info').textContent = `${profile.ambassadorName} • ${profile.ambassadorSchool}`;
    document.getElementById('profile-history-content').textContent = profile.history;

    // Steps
    const stepsContainer = document.getElementById('profile-steps-container');
    if (stepsContainer && profile.processSteps) {
      stepsContainer.innerHTML = profile.processSteps.map(s => `
        <div class="col-md-6 mb-3">
          <div class="p-3 bg-warm-ivory rounded-15 border h-100">
            <strong class="text-accent font-weight-bold d-block mb-1">${s.step}</strong>
            <p class="small text-muted mb-0">${s.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // Artisan
    if (profile.artisan) {
      document.getElementById('profile-artisan-name').textContent = profile.artisan.name;
      document.getElementById('profile-artisan-role').textContent = profile.artisan.role;
      document.getElementById('profile-artisan-quote').textContent = `“${profile.artisan.quote}”`;
      if (profile.artisan.image) document.getElementById('profile-artisan-img').src = profile.artisan.image;
    }

    // Linked Exp
    if (profile.relatedExperience) {
      document.getElementById('profile-linked-title').textContent = profile.relatedExperience.title;
      document.getElementById('profile-linked-btn').href = `/experience/${profile.relatedExperience.id}`;
    }
  } catch (err) {
    console.error('Failed to load profile details:', err);
  }
}

/* ==========================================================================
   6. BOOKINGS LOOKUP & QR CHECK-IN (/bookings)
   ========================================================================== */
function initBookingsPage() {
  const lookupForm = document.getElementById('booking-lookup-form');
  if (lookupForm) {
    lookupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('lookup-code').value.trim();
      const phone = document.getElementById('lookup-phone').value.trim();
      const resultBox = document.getElementById('lookup-result-box');

      try {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = '<span class="text-primary small">Đang tra cứu dữ liệu vé...</span>';

        const data = await fetchJson(`/api/bookings/lookup?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`);

        resultBox.innerHTML = `
          <div class="p-3 bg-light rounded-15 border">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge badge-primary px-3 py-1 font-weight-bold">Mã vé: ${data.bookingCode}</span>
              <span class="badge badge-${data.status === 'completed' ? 'success' : 'warning'} font-weight-bold">
                ${data.status === 'completed' ? 'Đã hoàn thành' : 'Chờ đón tiếp'}
              </span>
            </div>
            <h4 class="h6 font-weight-bold text-forest-green mb-1">${data.experienceTitle}</h4>
            <div class="small text-muted mb-2">Ngày hẹn: <strong>${data.bookingDate}</strong> • ${data.guests} khách • Tổng tiền: <strong class="text-primary">${Number(data.totalPrice).toLocaleString('vi-VN')}đ</strong></div>
            <div class="p-2 mb-3 bg-white rounded border text-muted small font-italic">
              &ldquo;Trong ${Number(data.totalPrice).toLocaleString('vi-VN')}đ thanh toán, <strong>${Math.round(data.totalPrice * 0.85).toLocaleString('vi-VN')}đ (85%)</strong> được đối soát trực tiếp cho nghệ nhân bản địa, <strong>${Math.round(data.totalPrice * 0.05).toLocaleString('vi-VN')}đ (5%)</strong> hỗ trợ Đại sứ sinh viên.&rdquo;
            </div>

            <div class="p-2 bg-white rounded border d-flex justify-content-between align-items-center">
              <div>
                <small class="text-muted d-block">Mã QR Check-in cá nhân:</small>
                <code class="font-weight-bold" style="font-size:14px;">${data.qrCode || 'HL-CHK-9988'}</code>
              </div>
              <div>
                ${data.status !== 'completed' ? `
                  <button type="button" class="btn btn-sm btn-success font-weight-bold px-3" onclick="simulateCheckIn(${data.id})">
                    Giả lập Quét QR Check-in
                  </button>
                ` : `
                  <span class="badge badge-success px-3 py-2">Đã nhận Tem Hộ chiếu</span>
                `}
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `<div class="alert alert-danger p-2 small">${err.message || 'Không tìm thấy thông tin đặt chỗ.'}</div>`;
      }
    });
  }

  loadUserBookingsList();
}

async function loadUserBookingsList() {
  const container = document.getElementById('user-bookings-container');
  if (!container) return;

  try {
    const bookings = await fetchJson('/api/bookings');
    if (!bookings.length) {
      container.innerHTML = '<p class="text-muted small">Bạn chưa có đặt chỗ nào. Hãy khám phá và đặt trải nghiệm di sản!</p>';
      return;
    }

    container.innerHTML = bookings.map(b => {
      const gmv = Number(b.totalPrice || 850000);
      const hostShare = b.hostRevenue || Math.round(gmv * 0.85);
      const ambShare = b.ambassadorCommission || Math.round(gmv * 0.05);
      const payShare = b.paymentFee || Math.round(gmv * 0.02);
      const netShare = b.netPlatformRevenue || Math.round(gmv * 0.08);

      return `
        <div class="p-4 bg-light rounded-20 border mb-4 shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <div>
              <span class="badge badge-primary px-3 py-1 font-weight-bold mr-2" style="background-color: var(--color-primary);">
                Mã: ${b.bookingCode || 'HL-BK01'}
              </span>
              <strong class="text-forest-green h6 mb-0">${b.experienceTitle}</strong>
            </div>
            <span class="badge badge-${b.status === 'completed' ? 'success' : 'warning'} px-3 py-1 font-weight-bold">
              ${b.status === 'completed' ? 'Đã hoàn thành & Đóng dấu' : 'Đã xác nhận đón tiếp'}
            </span>
          </div>

          <div class="small text-muted mb-3">
            Ngày trải nghiệm: <strong class="text-dark">${b.bookingDate}</strong> • Số lượng: <strong class="text-dark">${b.guests} khách</strong> • Tổng tiền: <strong class="text-primary font-weight-bold h6 mb-0">${gmv.toLocaleString('vi-VN')}đ</strong>
          </div>

          <!-- Transparent 85/5/2/8 Split (Docx Section 5) -->
          <div class="p-3 bg-white rounded-15 border mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong class="small text-forest-green">Phân bổ giá trị minh bạch (Cơ chế 85/5/2/8):</strong>
              <span class="badge badge-light border text-muted small">Khớp hồ sơ mục 5.1.1</span>
            </div>
            <p class="small text-muted mb-2 font-italic">
              &ldquo;Trong ${gmv.toLocaleString('vi-VN')}đ bạn trả, <strong>${hostShare.toLocaleString('vi-VN')}đ</strong> đến trực tiếp với nghệ nhân bản địa, <strong>${ambShare.toLocaleString('vi-VN')}đ</strong> hỗ trợ Đại sứ sinh viên.&rdquo;
            </p>
            <div class="row text-center no-gutters pt-2 border-top" style="font-size: 11px;">
              <div class="col-3 border-right p-1">
                <span class="text-muted d-block">Nghệ nhân (85%)</span>
                <strong class="text-success">${hostShare.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div class="col-3 border-right p-1">
                <span class="text-muted d-block">Đại sứ (5%)</span>
                <strong class="text-accent">${ambShare.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div class="col-3 border-right p-1">
                <span class="text-muted d-block">Cổng thanh toán (2%)</span>
                <strong class="text-muted">${payShare.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div class="col-3 p-1">
                <span class="text-muted d-block">Nền tảng (8%)</span>
                <strong class="text-forest-green">${netShare.toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>
          </div>

          <!-- Action & QR Check-in Box -->
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top">
            <div class="d-flex align-items-center">
              
              <div class="small">
                <span class="text-muted d-block">Mã QR Check-in tại điểm:</span>
                <code class="font-weight-bold" style="font-size: 13px;">${b.qrCode || 'HL-CHK-BK01'}</code>
              </div>
            </div>

            <div>
              ${b.status !== 'completed' ? `
                <button class="btn btn-sm btn-success font-weight-bold py-2 px-3 shadow-sm" onclick="simulateCheckIn(${b.id})">
                  Check-in tại xưởng & Nhận Tem di sản
                </button>
              ` : `
                <a href="passport.html" class="btn btn-sm btn-outline-primary font-weight-bold py-2 px-3">
                  Xem Tem trong Hộ chiếu số →
                </a>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-muted small">Vui lòng đăng nhập để xem danh sách lịch đặt chỗ của bạn.</p>';
  }
}

window.simulateCheckIn = async function(bookingId) {
  try {
    const res = await fetchJson(`/api/bookings/${bookingId}/checkin`, { method: 'POST' });
    alert(`${res.message} Bạn vừa được cấp Tem Di sản mới vào Hộ chiếu!`);
    window.location.reload();
  } catch (err) {
    alert(err.message || 'Check-in không thành công.');
  }
};

/* ==========================================================================
   6b. DIGITAL HERITAGE PASSPORT & STAMPS (/passport)
   ========================================================================== */
async function initPassportPage() {
  const container = document.getElementById('passport-stamps-grid');
  const homeRank = document.getElementById('home-passport-rank');

  if (!container && !homeRank) return;

  try {
    const data = await fetchJson('/api/passport');

    // Update header stats on /passport
    if (document.getElementById('passport-level-title')) {
      document.getElementById('passport-level-title').textContent = data.rank;
    }
    if (document.getElementById('passport-level-progress-bar')) {
      document.getElementById('passport-level-progress-bar').style.width = `${data.progress}%`;
    }
    if (document.getElementById('passport-stamp-counter')) {
      document.getElementById('passport-stamp-counter').textContent = `${data.stampCount} / 6 Tem`;
    }
    if (currentUser && document.getElementById('passport-holder-name')) {
      document.getElementById('passport-holder-name').textContent = currentUser.name;
    }

    // Catalog of 6 core stamps matching dossier
    const stampCatalog = [
      { id: 'STAMP-GOM-PHULANG', expId: 1, code: 'PHÙ LÃNG', title: 'Tem Gốm Phù Lãng', loc: 'Bắc Ninh • Men da lươn 700 năm', partner: 'Bác Phạm Văn Nam & ĐS Lê Minh Anh' },
      { id: 'STAMP-HAGIANG-LOLO', expId: 2, code: 'LÔ LÔ', title: 'Tem Nhà Trình Tường H\'Mông', loc: 'Lô Lô Chải, Lũng Cú, Hà Giang', partner: 'Trưởng bản Vàng A Sình & ĐS Lê Minh Anh' },
      { id: 'STAMP-THEU-KHOAICHAU', expId: 3, code: 'KHOÁI CHÂU', title: 'Tem Thêu Tay Cung Đình', loc: 'Khoái Châu, Hưng Yên', partner: 'Nghệ nhân Nguyễn Thị Lan & ĐS Quốc Bình' },
      { id: 'STAMP-AMTHUC-DANANG', expId: 4, code: 'HÒA VANG', title: 'Tem Mâm Cơm Xứ Quảng', loc: 'Hòa Vang, Đà Nẵng', partner: 'Mẹ Bảy Hòa Vang & ĐS Lan Anh' },
      { id: 'STAMP-HOALU-TRANGAN', expId: 5, code: 'HOA LƯ', title: 'Tem Huyền Sử Hoa Lư', loc: 'Hoa Lư & Tràng An, Ninh Bình', partner: 'Bác Nguyễn Văn Thắng & ĐS Lê Minh Anh' },
      { id: 'STAMP-DENLONG-HOIAN', expId: 6, code: 'HỘI AN', title: 'Tem Đèn Lồng Sông Hoài', loc: 'Minh An, Phố Cổ Hội An', partner: 'Nghệ nhân Huỳnh Văn Ba & ĐS Quốc Bình' }
    ];

    const earnedStampIds = (data.stamps || []).map(s => s.stampId);

    if (container) {
      container.innerHTML = stampCatalog.map(sc => {
        const isEarned = earnedStampIds.includes(sc.id);
        const earnedInfo = (data.stamps || []).find(s => s.stampId === sc.id);
        const dateStr = earnedInfo ? new Date(earnedInfo.earnedAt).toLocaleDateString('vi-VN') : 'Mới';

        if (isEarned) {
          return `
            <div class="col-md-6 col-lg-4 mb-4">
              <div class="p-3 rounded-15 border border-gold bg-warm-ivory h-100 shadow-sm text-center position-relative">
                <span class="badge badge-success small position-absolute" style="top: 10px; right: 10px;">Đã đóng dấu</span>
                <div class="heritage-stamp-mark active mb-2 mt-2"><span class="mark-code">${sc.code}</span></div>
                <h3 class="h6 font-weight-bold text-forest-green mb-1">${sc.title}</h3>
                <span class="small text-accent font-weight-bold d-block mb-2">${sc.loc}</span>
                <p class="small text-muted mb-2">Đồng hành cùng ${sc.partner}.</p>
                <div class="small text-muted font-italic border-top pt-2">
                  Đóng dấu: ${dateStr} • Check-in QR
                </div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="col-md-6 col-lg-4 mb-4">
              <div class="p-3 rounded-15 border bg-light h-100 text-center" style="opacity: 0.85;">
                <span class="badge badge-secondary small">Chưa mở khóa</span>
                <div class="heritage-stamp-mark locked mb-2 mt-2"><span class="mark-code">${sc.code}</span></div>
                <h3 class="h6 font-weight-bold text-muted mb-1">${sc.title}</h3>
                <span class="small text-muted d-block mb-2">${sc.loc}</span>
                <p class="small text-muted mb-3">Tham gia trải nghiệm thực địa để mở khóa tem.</p>
                <a href="detail.html?id=${sc.expId}" class="btn btn-sm btn-outline-primary font-weight-bold">Đặt trải nghiệm ngay</a>
              </div>
            </div>
          `;
        }
      }).join('');
    }

    // Update homepage passport widget if present
    if (homeRank) homeRank.textContent = data.rank;
    const homeProgress = document.getElementById('home-passport-progress');
    if (homeProgress) homeProgress.style.width = `${data.progress}%`;

  } catch (err) {
    console.error('Failed to load passport:', err);
  }
}


/* ==========================================================================
   7. FORM SUBMISSIONS: AMBASSADOR APPLY & COMMUNITY INQUIRY
   ========================================================================== */
function initFormSubmissions() {
  // Ambassador Full Application Form (/ambassadors/apply)
  const applyForm = document.getElementById('ambassador-full-application-form');
  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(applyForm);
      const payload = Object.fromEntries(fd.entries());
      const feedback = document.getElementById('apply-feedback-message');
      const submitBtn = document.getElementById('btn-submit-ambassador-app');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Đang gửi hồ sơ...';
      }

      try {
        const res = await fetchJson('/api/ambassador-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        feedback.innerHTML = `
          <div class="alert alert-success p-3 rounded-10 text-left font-weight-bold shadow-sm border border-success">
            <span class="d-block mb-1 text-success font-weight-bold" style="font-size: 1.1rem;">🎉 ${res.message}</span>
            <p class="mb-1 text-dark small font-weight-normal">
              Hồ sơ của bạn đã được chuyển tới <strong>Ban Quản Trị Super Admin</strong> để thẩm định 3 tiêu chí di sản.
            </p>
            <p class="mb-0 text-muted small font-weight-normal">
              📧 Sau khi được phê duyệt, <strong>thông tin tài khoản hệ thống (Email & Mật khẩu khởi tạo)</strong> kèm liên kết Cẩm nang đào tạo sẽ được gửi trực tiếp qua hòm thư điện tử của bạn!
            </p>
          </div>
        `;
        applyForm.reset();
      } catch (err) {
        feedback.innerHTML = `<div class="alert alert-danger p-2 text-center">${err.message || 'Lỗi khi gửi hồ sơ.'}</div>`;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Gửi hồ sơ đăng ký Đại sứ Di sản';
        }
      }
    });
  }

  // Community Inquiry Form (/community)
  const commForm = document.getElementById('community-inquiry-form');
  if (commForm) {
    commForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(commForm);
      const payload = Object.fromEntries(fd.entries());
      const feedback = document.getElementById('community-inquiry-feedback');
      const submitBtn = document.getElementById('btn-submit-community-inquiry');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Đang gửi thông tin...';
      }

      try {
        const res = await fetchJson('/api/community/inquire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        feedback.innerHTML = `
          <div class="alert alert-success p-3 rounded-10 font-weight-bold text-center">
            ${res.message}
          </div>
        `;
        commForm.reset();
      } catch (err) {
        feedback.innerHTML = `<div class="alert alert-danger p-2 text-center">${err.message || 'Lỗi khi gửi thông tin.'}</div>`;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Gửi thông tin kết nối';
        }
      }
    });
  }

  // Smart Search on Homepage
  const homeSearchForm = document.getElementById('home-smart-search-form');
  if (homeSearchForm) {
    homeSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loc = document.getElementById('search-location')?.value || 'all';
      const cat = document.getElementById('search-category')?.value || 'all';
      window.location.href = `explore.html?location=${encodeURIComponent(loc)}&category=${encodeURIComponent(cat)}`;
    });
  }

  // Quick Chips click
  document.querySelectorAll('.quick-search-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      window.location.href = `explore.html?search=${encodeURIComponent(q)}`;
    });
  });
}

/* ==========================================================================
   8. EXPLORE PAGE MULTI-FILTER (/explore)
   ========================================================================== */
function initExplorePage() {
  const gridContainer = document.getElementById('explore-grid-container');
  if (!gridContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  const initialLocation = urlParams.get('location') || 'all';
  const initialSearch = urlParams.get('search') || '';

  const catSelect = document.getElementById('filter-category-select');
  const locSelect = document.getElementById('filter-location-select');
  const searchInput = document.getElementById('filter-search-input');
  const priceRange = document.getElementById('filter-price-range');
  const priceLabel = document.getElementById('price-range-label');

  if (catSelect && initialCategory) catSelect.value = initialCategory;
  if (locSelect && initialLocation) locSelect.value = initialLocation;
  if (searchInput && initialSearch) searchInput.value = initialSearch;

  if (priceRange && priceLabel) {
    priceRange.addEventListener('input', () => {
      priceLabel.textContent = `${Number(priceRange.value).toLocaleString('vi-VN')}đ`;
    });
  }

  const applyFilters = () => {
    const cat = catSelect?.value || 'all';
    const loc = locSelect?.value || 'all';
    const query = searchInput?.value.toLowerCase().trim() || '';
    const maxP = Number(priceRange?.value || 2000000);
    const sort = document.getElementById('sort-select')?.value || 'featured';

    let filtered = allExperiences.filter(exp => {
      if (cat !== 'all' && exp.category !== cat) return false;
      if (loc !== 'all' && !exp.location.includes(loc)) return false;
      if (Number(exp.price) > maxP) return false;
      if (query && !exp.title.toLowerCase().includes(query) && !exp.location.toLowerCase().includes(query) && !exp.story.toLowerCase().includes(query)) return false;
      return true;
    });

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    document.getElementById('results-count').textContent = filtered.length;

    const wishlist = getWishlist();
    gridContainer.innerHTML = filtered.length ? filtered.map(exp => `
      <div class="col-md-6 mb-4">
        <article class="experience-card">
          <div class="card-thumb-wrap">
            <img src="${resolveImageUrl(exp.imageClass)}" alt="${exp.title}">
            <span class="badge-verified"><span style="color:var(--color-seal); font-weight:bold; margin-right:2px;">印</span> ${exp.badge || 'Di sản xác thực'}</span>
            <button class="favorite-btn ${wishlist.includes(exp.id) ? 'favorited' : ''}" onclick="onToggleWishlist(${exp.id}, this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
          </div>
          <div class="card-content">
            <span class="meta-location">${exp.location} • ${exp.segmentName}</span>
            <h3 class="card-title"><a href="detail.html?id=${exp.id}">${exp.title}</a></h3>
            <p class="small text-muted line-clamp-2 mb-2">${exp.story}</p>
            <div class="card-footer-action">
              <div class="price-tag">${Number(exp.price).toLocaleString('vi-VN')}đ <small>/khách</small></div>
              <a href="detail.html?id=${exp.id}" class="btn btn-primary btn-sm px-3">Đặt chỗ</a>
            </div>
          </div>
        </article>
      </div>
    `).join('') : '<div class="col-12 py-5 text-center text-muted">Không tìm thấy trải nghiệm phù hợp với bộ lọc.</div>';
  };

  document.getElementById('btn-apply-filters')?.addEventListener('click', applyFilters);
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);
  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    if (catSelect) catSelect.value = 'all';
    if (locSelect) locSelect.value = 'all';
    if (searchInput) searchInput.value = '';
    if (priceRange) priceRange.value = 2000000;
    if (priceLabel) priceLabel.textContent = '2.000.000đ';
    applyFilters();
  });

  // Toggle Grid vs Map
  const btnGrid = document.getElementById('view-mode-grid');
  const btnMap = document.getElementById('view-mode-map');
  const mapContainer = document.getElementById('explore-map-container');

  btnGrid?.addEventListener('click', () => {
    btnGrid.classList.add('active', 'btn-primary');
    btnGrid.classList.remove('btn-outline-primary');
    btnMap.classList.remove('active', 'btn-primary');
    btnMap.classList.add('btn-outline-primary');
    mapContainer?.classList.add('hidden');
    gridContainer?.classList.remove('hidden');
  });

  btnMap?.addEventListener('click', () => {
    btnMap.classList.add('active', 'btn-primary');
    btnMap.classList.remove('btn-outline-primary');
    btnGrid.classList.remove('active', 'btn-primary');
    btnGrid.classList.add('btn-outline-primary');
    mapContainer?.classList.remove('hidden');

    if (!exploreMap && typeof L !== 'undefined') {
      exploreMap = L.map('explore-leaflet-map').setView([18.5, 106.5], 6);
      
      const exploreGMap = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Bản đồ Việt Nam'
      }).addTo(exploreMap);

      const exploreSat = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=vi', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: '&copy; Vệ tinh Google'
      });

      L.control.layers({
        "🇻🇳 Bản đồ Tiếng Việt": exploreGMap,
        "🛰️ Vệ tinh thực tế": exploreSat
      }, null, { position: 'topright' }).addTo(exploreMap);

      allExperiences.forEach((exp, idx) => {
        const coords = HERITAGE_COORDINATES[exp.id];
        if (coords) {
          L.marker([coords.lat, coords.lng])
            .addTo(exploreMap)
            .bindPopup(`<strong>${exp.title}</strong><br>${exp.location}<br><a href="detail.html?id=${exp.id}">Xem chi tiết</a>`);
        }
      });
    }
  });

  applyFilters();
}

/* ==========================================================================
   9. SESSION & USER AUTH STATE
   ========================================================================== */
async function checkAuthSession() {
  try {
    const data = await fetchJson('/api/session');
    currentUser = data.user;

    const userBadge = document.getElementById('nav-user-badge');
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const adminLink = document.getElementById('nav-admin-link');
    const ambassadorLink = document.getElementById('nav-ambassador-link');
    const hostLink = document.getElementById('nav-host-link');

    if (currentUser) {
      if (userBadge) {
        userBadge.textContent = `${currentUser.name} (${currentUser.role})`;
        userBadge.classList.remove('hidden');
      }
      if (loginBtn) loginBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');

      if (currentUser.role === 'admin' && adminLink) adminLink.classList.remove('hidden');
      if ((currentUser.role === 'ambassador' || currentUser.role === 'admin') && ambassadorLink) ambassadorLink.classList.remove('hidden');
      if ((currentUser.role === 'host' || currentUser.role === 'admin') && hostLink) hostLink.classList.remove('hidden');
    } else {
      if (userBadge) userBadge.classList.add('hidden');
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (adminLink) adminLink.classList.add('hidden');
      if (ambassadorLink) ambassadorLink.classList.add('hidden');
      if (hostLink) hostLink.classList.add('hidden');
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetchJson('/api/logout', { method: 'POST' });
        window.location.reload();
      });
    }
  } catch (err) {
    console.error('Session check failed:', err);
  }
}

/* ==========================================================================
   INITIALIZATION ROUTER
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 0. Initialize AOS Animations
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 700, once: true });
    }

    // 1. Fetch core experiences
    allExperiences = await fetchJson('/api/experiences');

    // 2. Filter buttons on Homepage
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter || 'all';
        renderHomeExperiences();
      });
    });

    // 3. Render Homepage
    renderHomeExperiences();
    initHomeHeritageMap();
    initAiItineraryHandlers();
    initFormSubmissions();

    // 4. Subpage Initializers
    initDetailPage();
    initHeritageProfilesPage();
    initExplorePage();
    initBookingsPage();
    initPassportPage();

    // 5. Check Auth State
    await checkAuthSession();

  } catch (err) {
    console.error('HeritageLink initialization error:', err);
  }
});
