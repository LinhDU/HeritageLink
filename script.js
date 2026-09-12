let allExperiences = [];
let activeFilter = 'all';
let currentUser = null;

const filterButtons = document.querySelectorAll('.filter-btn');
const experienceGrid = document.querySelector('.experience-grid');
const impactGrid = document.querySelector('.impact-grid');
const ambassadorForm = document.getElementById('ambassador-form');
const formMessage = document.getElementById('form-message');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const userBadge = document.getElementById('user-badge');
const bookingForm = document.getElementById('booking-form');
const bookingExperience = document.getElementById('booking-experience');
const bookingList = document.getElementById('booking-list');
const adminSection = document.getElementById('admin-section');
const adminStats = document.getElementById('admin-stats');
const recentBookings = document.getElementById('recent-bookings');
const applicationsList = document.getElementById('applications-list');
const detailSection = document.getElementById('detail-section');
const detailGalleryMain = document.getElementById('detail-gallery-main');
const detailTitle = document.getElementById('detail-title');
const detailSummary = document.getElementById('detail-summary');
const detailDescription = document.getElementById('detail-description');
const detailStory = document.getElementById('detail-story');
const detailMetaGrid = document.getElementById('detail-meta-grid');
const detailBookButton = document.getElementById('detail-book-button');
const detailItineraryButton = document.getElementById('detail-itinerary-button');
const experienceForm = document.getElementById('experience-form');
const experienceFormMessage = document.getElementById('experience-form-message');
const experienceList = document.getElementById('experience-list');
const resetExperienceFormButton = document.getElementById('reset-experience-form');
const cancelEditExperienceButton = document.getElementById('cancel-edit-experience');
const experienceIdInput = document.getElementById('experience-id');
const loginModal = document.getElementById('login-modal');
const closeLogin = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

const mapItems = document.querySelectorAll('.map-item');
mapItems.forEach((item) => {
  item.addEventListener('click', () => {
    mapItems.forEach((entry) => entry.classList.toggle('active', entry === item));
  });
});

const itineraryButton = document.querySelector('.itinerary-copy .primary-btn');
const itineraryResult = document.querySelector('.itinerary-result');

if (itineraryButton) {
  itineraryButton.addEventListener('click', () => {
    const resultCards = itineraryResult.querySelectorAll('.day-card');
    resultCards.forEach((card, index) => {
      card.style.transform = 'translateY(-4px)';
      card.style.transition = 'transform 0.25s ease';
      setTimeout(() => {
        card.style.transform = 'translateY(0)';
      }, 250 + index * 100);
    });
  });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Request failed');
  }
  return response.json();
}

function renderExperiences() {
  if (!experienceGrid) return;

  const filteredExperiences = activeFilter === 'all'
    ? allExperiences
    : allExperiences.filter((experience) => experience.category === activeFilter);

  experienceGrid.innerHTML = filteredExperiences
    .map((experience) => {
      const isRemoteImage = typeof experience.imageClass === 'string' && /^https?:\/\//i.test(experience.imageClass);
      const thumbClass = isRemoteImage ? 'thumb' : `thumb ${experience.imageClass || 'thumb-one'}`;
      const imageStyle = isRemoteImage
        ? ` style="background-image: url('${experience.imageClass}');"`
        : '';

      return `
        <article class="experience-card" data-category="${experience.category}" data-id="${experience.id}">
          <div class="${thumbClass}"${imageStyle}>
            <span class="badge">${experience.badge}</span>
          </div>
          <div class="card-content">
            <div class="card-topline">
              <span>Đại sứ: ${experience.ambassador}</span>
              <span class="rating">${experience.rating} ★</span>
            </div>
            <h3>${experience.title}</h3>
            <p>Khám phá nghề gốm, làm sản phẩm cá nhân và nghe câu chuyện gia đình truyền lại.</p>
            <div class="meta-row">
              <span>⏱ ${experience.duration}</span>
              <span>📍 ${experience.location}</span>
              <span>💰 ${Number(experience.price).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function getMainImageUrl(experience) {
  return experience.imageClass || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';
}

function getExperienceDescription(experience) {
  const descriptions = {
    workshop: 'Gốm truyền thống Bắc Ninh không chỉ là trải nghiệm làm sản phẩm mà còn là hành trình nghe câu chuyện về gia đình, làng nghề và sự khéo léo được gìn giữ qua nhiều thế hệ.',
    homestay: 'Ở cùng gia đình vùng cao không chỉ là nghỉ ngơi, mà còn là cách bạn được sống gần thiên nhiên, nghe câu chuyện bản địa và hòa mình vào nhịp sống của cộng đồng.',
    craft: 'Trải nghiệm làng nghề mang đến cho bạn cơ hội nhìn tận mắt quy trình thủ công, tương tác với nghệ nhân và mang theo những giá trị văn hóa thật sự.',
    food: 'Ẩm thực cộng đồng là nơi bạn được thưởng thức món ăn truyền thống, hiểu văn hóa ẩm thực địa phương và cảm nhận sự hiếu khách của người dân.'
  };

  return descriptions[experience.category] || 'Trải nghiệm văn hóa độc đáo được thiết kế để kết nối du khách với cộng đồng địa phương.';
}

function getExperienceStory(experience) {
  return `“${experience.ambassador} muốn bạn cảm nhận ${experience.location} như một không gian sống động, nơi mỗi chi tiết nhỏ đều mang theo ký ức, kỹ năng và tình cảm của cộng đồng.”`;
}

function renderExperienceDetail(experience) {
  if (!detailSection || !detailTitle || !detailSummary || !detailDescription || !detailStory || !detailMetaGrid) return;

  const imageUrl = getMainImageUrl(experience);

  detailGalleryMain.style.backgroundImage = `url('${imageUrl}')`;
  detailTitle.textContent = experience.title;
  detailSummary.innerHTML = `
    <span>Đại sứ: ${experience.ambassador}</span>
    <span>★ ${experience.rating} (${experience.priceDisplay || Number(experience.price).toLocaleString('vi-VN') + 'đ'})</span>
  `;
  detailDescription.textContent = getExperienceDescription(experience);
  detailStory.textContent = getExperienceStory(experience);
  detailMetaGrid.innerHTML = `
    <div>
      <span class="meta-label">Thời lượng</span>
      <strong>${experience.duration}</strong>
    </div>
    <div>
      <span class="meta-label">Đối tượng</span>
      <strong>2 - 8 người</strong>
    </div>
    <div>
      <span class="meta-label">Giá</span>
      <strong>${Number(experience.price).toLocaleString('vi-VN')}đ</strong>
    </div>
    <div>
      <span class="meta-label">Lịch trống</span>
      <strong>Hôm nay, ${experience.duration.includes('đêm') ? '18:00' : '15:00'}</strong>
    </div>
  `;

  detailBookButton.dataset.experienceId = experience.id;
  detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function openExperienceDetail(id) {
  const existing = allExperiences.find((item) => item.id === Number(id));

  if (existing) {
    renderExperienceDetail(existing);
    return;
  }

  try {
    const data = await fetchJson(`/api/experiences/${id}`);
    renderExperienceDetail(data);
  } catch (error) {
    console.error('Failed to load experience detail:', error);
  }
}

function renderImpact(data) {
  if (!impactGrid) return;

  impactGrid.innerHTML = `
    <div class="impact-card">
      <strong>${data.heritagePoints}+</strong>
      <span>điểm di sản được số hóa</span>
    </div>
    <div class="impact-card">
      <strong>${data.communityRevenue}</strong>
      <span>doanh thu chia sẻ cộng đồng</span>
    </div>
    <div class="impact-card">
      <strong>${data.satisfactionRate}</strong>
      <span>khách hài lòng với trải nghiệm bản địa</span>
    </div>
    <div class="impact-card">
      <strong>${data.ambassadors}</strong>
      <span>đại sứ đang hoạt động</span>
    </div>
  `;
}

function renderBookingList(bookings) {
  if (!bookingList) return;

  if (!bookings || bookings.length === 0) {
    bookingList.innerHTML = '<p>Chưa có booking nào.</p>';
    return;
  }

  bookingList.innerHTML = bookings
    .map(
      (booking) => `
        <div class="booking-list-item">
          <strong>${booking.experienceTitle}</strong>
          <small>Ngày: ${booking.bookingDate} • ${booking.guests} khách</small>
          <div><span>Trạng thái: ${booking.status}</span></div>
          <div><span>Tổng: ${Number(booking.totalPrice).toLocaleString('vi-VN')}đ</span></div>
        </div>
      `
    )
    .join('');
}

function renderAdminOverview(data) {
  if (!adminStats || !recentBookings || !applicationsList) return;

  adminStats.innerHTML = `
    <div class="dashboard-stat">
      <span class="stat-label">Tổng booking</span>
      <strong>${data.stats.totalBookings}</strong>
      <small>Tổng số lịch đã lưu</small>
    </div>
    <div class="dashboard-stat">
      <span class="stat-label">Doanh thu</span>
      <strong>${Number(data.stats.totalRevenue).toLocaleString('vi-VN')}đ</strong>
      <small>Doanh thu tích lũy</small>
    </div>
    <div class="dashboard-stat">
      <span class="stat-label">Đơn chờ duyệt</span>
      <strong>${data.stats.pendingApplications}</strong>
      <small>Đơn Đại sứ mới</small>
    </div>
    <div class="dashboard-stat">
      <span class="stat-label">Tổng người dùng</span>
      <strong>${data.stats.totalUsers}</strong>
      <small>Người dùng hệ thống</small>
    </div>
  `;

  recentBookings.innerHTML = data.recentBookings.length
    ? data.recentBookings
        .map(
          (booking) => `
            <div class="list-item">
              <div>
                <strong>${booking.experienceTitle}</strong>
                <small>${booking.userName} • ${booking.bookingDate}</small>
              </div>
              <span class="status approved">${booking.status}</span>
            </div>
          `
        )
        .join('')
    : '<p>Chưa có booking nào.</p>';

  applicationsList.innerHTML = data.applications.length
    ? data.applications
        .map(
          (application) => `
            <div class="list-item">
              <div>
                <strong>${application.name}</strong>
                <small>${application.school} • ${application.region}</small>
              </div>
              <span class="status ${application.status === 'pending' ? 'pending' : 'approved'}">${application.status}</span>
            </div>
          `
        )
        .join('')
    : '<p>Chưa có đơn đăng ký nào.</p>';
}

function renderExperienceList(experiences) {
  if (!experienceList) return;

  experienceList.innerHTML = experiences.length
    ? experiences
        .map(
          (experience) => `
            <div class="admin-experience-item">
              <div>
                <h4>${experience.title}</h4>
                <div class="admin-experience-meta">${experience.category} • ${experience.ambassador} • ${experience.location}</div>
                <div class="admin-experience-meta">${Number(experience.price).toLocaleString('vi-VN')}đ • ${experience.duration}</div>
              </div>
              <div class="admin-experience-actions">
                <button type="button" class="small-btn" data-action="edit" data-id="${experience.id}">Sửa</button>
                <button type="button" class="small-btn" data-action="delete" data-id="${experience.id}">Xóa</button>
              </div>
            </div>
          `
        )
        .join('')
    : '<p>Chưa có trải nghiệm nào.</p>';
}

function populateExperienceForm(experience) {
  if (!experienceForm || !experienceIdInput) return;

  experienceIdInput.value = experience.id;
  experienceForm.elements.category.value = experience.category;
  experienceForm.elements.title.value = experience.title;
  experienceForm.elements.ambassador.value = experience.ambassador;
  experienceForm.elements.rating.value = experience.rating;
  experienceForm.elements.duration.value = experience.duration;
  experienceForm.elements.location.value = experience.location;
  experienceForm.elements.price.value = experience.price;
  experienceForm.elements.badge.value = experience.badge;
  experienceForm.elements.imageUrl.value = experience.imageClass || '';

  experienceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetExperienceForm() {
  if (!experienceForm || !experienceIdInput) return;

  experienceForm.reset();
  experienceIdInput.value = '';
  experienceForm.elements.category.value = 'workshop';
  experienceForm.elements.rating.value = '4.8';
  experienceForm.elements.imageUrl.value = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';
}

async function refreshAdminDashboard() {
  const [overview, experiences] = await Promise.all([
    fetchJson('/api/admin/overview'),
    fetchJson('/api/experiences')
  ]);

  allExperiences = experiences;
  renderExperiences();
  renderAdminOverview(overview);
  renderExperienceList(experiences);

  if (bookingExperience) {
    bookingExperience.innerHTML = experiences
      .map((experience) => `<option value="${experience.id}">${experience.title}</option>`)
      .join('');
  }
}

async function loadCurrentUser() {
  try {
    const data = await fetchJson('/api/session');
    currentUser = data.user;

    if (currentUser) {
      userBadge.textContent = `${currentUser.name} (${currentUser.role})`;
      logoutButton.classList.remove('hidden');
      loginButton.classList.add('hidden');
      signupButton.classList.add('hidden');
      if (currentUser.role === 'admin') {
        adminSection.hidden = false;
        await refreshAdminDashboard();
      }
    } else {
      userBadge.textContent = '';
      logoutButton.classList.add('hidden');
      loginButton.classList.remove('hidden');
      signupButton.classList.remove('hidden');
      adminSection.hidden = true;
    }

    await loadBookings();
  } catch (error) {
    console.error('Failed to load session:', error);
  }
}

async function loadBookings() {
  if (!bookingList) return;

  if (!currentUser) {
    bookingList.innerHTML = '<p>Vui lòng đăng nhập để xem lịch đặt chỗ.</p>';
    return;
  }

  try {
    const bookings = await fetchJson('/api/bookings');
    renderBookingList(bookings);
  } catch (error) {
    bookingList.innerHTML = '<p>Không thể tải lịch booking.</p>';
  }
}

async function loadData() {
  try {
    const [experiences, impact] = await Promise.all([
      fetchJson('/api/experiences'),
      fetchJson('/api/impact')
    ]);

    allExperiences = experiences;
    renderExperiences();
    renderImpact(impact);

    if (bookingExperience) {
      bookingExperience.innerHTML = experiences
        .map((experience) => `<option value="${experience.id}">${experience.title}</option>`)
        .join('');
    }

    await loadCurrentUser();
  } catch (error) {
    console.error('Failed to load data:', error);
    if (experienceGrid) {
      experienceGrid.innerHTML = '<p>Không thể tải trải nghiệm. Vui lòng thử lại sau.</p>';
    }
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    renderExperiences();
  });
});

if (experienceGrid) {
  experienceGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.experience-card');

    if (!card) return;

    const experienceId = Number(card.dataset.id);
    if (experienceId) {
      window.history.pushState({}, '', `/experience/${experienceId}`);
      openExperienceDetail(experienceId);
    }
  });
}

if (detailBookButton) {
  detailBookButton.addEventListener('click', () => {
    const experienceId = Number(detailBookButton.dataset.experienceId);

    if (!experienceId || !bookingExperience) return;

    bookingExperience.value = String(experienceId);
    bookingExperience.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (detailItineraryButton) {
  detailItineraryButton.addEventListener('click', () => {
    const itinerarySection = document.getElementById('itinerary');
    if (itinerarySection) {
      itinerarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

if (ambassadorForm) {
  ambassadorForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(ambassadorForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      formMessage.textContent = 'Đang gửi đơn đăng ký...';
      formMessage.style.color = '#3d7a52';

      const result = await fetchJson('/api/ambassador-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      formMessage.textContent = result.message;
      ambassadorForm.reset();
    } catch (error) {
      formMessage.textContent = error.message || 'Có lỗi xảy ra.';
      formMessage.style.color = '#b42318';
    }
  });
}

if (loginButton) {
  loginButton.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    loginModal.setAttribute('aria-hidden', 'false');
  });
}

if (experienceList) {
  experienceList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const experience = allExperiences.find((entry) => entry.id === id);

    if (!experience) return;

    if (button.dataset.action === 'edit') {
      populateExperienceForm(experience);
      return;
    }

    if (button.dataset.action === 'delete') {
      const isConfirmed = window.confirm(`Bạn có chắc muốn xóa trải nghiệm "${experience.title}"?`);
      if (!isConfirmed) return;

      try {
        await fetchJson(`/api/admin/experiences/${id}`, { method: 'DELETE' });
        experienceFormMessage.textContent = 'Đã xóa trải nghiệm.';
        experienceFormMessage.style.color = '#3d7a52';
        resetExperienceForm();
        await refreshAdminDashboard();
      } catch (error) {
        experienceFormMessage.textContent = error.message || 'Không thể xóa trải nghiệm.';
        experienceFormMessage.style.color = '#b42318';
      }
    }
  });
}

if (experienceForm) {
  experienceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(experienceForm);
    const payload = Object.fromEntries(formData.entries());
    const experienceId = payload.id;
    delete payload.id;

    payload.rating = Number(payload.rating || 4.8);
    payload.price = Number(payload.price || 0);

    try {
      experienceFormMessage.textContent = 'Đang lưu trải nghiệm...';
      experienceFormMessage.style.color = '#3d7a52';

      const endpoint = experienceId ? `/api/admin/experiences/${experienceId}` : '/api/admin/experiences';
      const method = experienceId ? 'PUT' : 'POST';

      const result = await fetchJson(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      experienceFormMessage.textContent = result.message;
      resetExperienceForm();
      await refreshAdminDashboard();
    } catch (error) {
      experienceFormMessage.textContent = error.message || 'Không thể lưu trải nghiệm.';
      experienceFormMessage.style.color = '#b42318';
    }
  });
}

if (resetExperienceFormButton) {
  resetExperienceFormButton.addEventListener('click', () => {
    resetExperienceForm();
    experienceFormMessage.textContent = '';
  });
}

if (cancelEditExperienceButton) {
  cancelEditExperienceButton.addEventListener('click', () => {
    resetExperienceForm();
    experienceFormMessage.textContent = '';
  });
}

if (closeLogin) {
  closeLogin.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    loginModal.setAttribute('aria-hidden', 'true');
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      loginMessage.textContent = 'Đang đăng nhập...';
      const result = await fetchJson('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      loginMessage.textContent = result.message;
      loginModal.classList.add('hidden');
      loginForm.reset();
      await loadCurrentUser();
    } catch (error) {
      loginMessage.textContent = error.message || 'Đăng nhập thất bại.';
      loginMessage.style.color = '#b42318';
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await fetchJson('/api/logout', { method: 'POST' });
      currentUser = null;
      await loadCurrentUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentUser) {
      loginModal.classList.remove('hidden');
      loginModal.setAttribute('aria-hidden', 'false');
      return;
    }

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const result = await fetchJson('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      bookingForm.reset();
      await loadBookings();
      alert(result.message);
    } catch (error) {
      alert(error.message || 'Không thể lưu booking.');
    }
  });
}

if (signupButton) {
  signupButton.addEventListener('click', () => {
    const ambassadorSection = document.getElementById('onboarding');
    if (ambassadorSection) {
      ambassadorSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

loadData();
