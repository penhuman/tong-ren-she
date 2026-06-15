/**
 * 同仁社禮儀公司 官方網站 互動邏輯
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initEstimator();
  initBlessingWall();
  initFaq();
});

/**
 * 1. 導覽列縮放與行動版選單切換
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const navItems = document.querySelectorAll('.nav-item');

  // 滾動時縮放導覽列與更新當前區塊 Active 狀態
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // 行動版選單切換
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // 點擊導覽連結後自動關閉行動版選單
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // 根據視窗滾動位置，點亮對應的導覽列項目
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 120; // 偏移量，貼合視覺

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < top + height) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/**
 * 2. 滾動漸顯系統 (Scroll Reveal)
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // 一旦顯現後，可取消觀察以節省效能
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // 元素露出 10% 即觸行動畫
    rootMargin: '0px 0px -50px 0px' // 微調底部觸發時機
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * 3. 費用透明試算器 (Estimator)
 */
function initEstimator() {
  const triggers = document.querySelectorAll('.calc-trigger');
  const selectedListContainer = document.getElementById('selected-items');
  const totalPriceEl = document.getElementById('total-price');

  // 固定基礎項目 (不會變動的底價)
  const baseItems = [
    { name: '基礎接運與壽衣組', price: 38000 },
    { name: '靈堂與蓮位設立', price: 12000 }
  ];

  // 監聽選項點擊，切換 selected 樣式與觸加計算
  triggers.forEach(checkbox => {
    // 當前 checkbox 外層 label
    const optionCard = checkbox.closest('.option-item');
    
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        optionCard.classList.add('selected');
      } else {
        optionCard.classList.remove('selected');
      }
      calculateTotal();
    });
  });

  // 點擊 label 本體 (除了 checkbox 本身) 的輔助處理
  const optionItems = document.querySelectorAll('.option-item');
  optionItems.forEach(card => {
    card.addEventListener('click', (e) => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.disabled) return; // 基礎固定項目不可點選
      
      // 避免與 checkbox 本身的 change 事件衝突
      if (e.target !== checkbox && !checkbox.contains(e.target)) {
        checkbox.checked = !checkbox.checked;
        // 手動觸發 change 事件
        checkbox.dispatchEvent(new Event('change'));
      }
    });
  });

  // 加總與更新右側 UI 渲染
  function calculateTotal() {
    let total = 50000; // 基礎項目 $38,000 + $12,000
    
    // 清空並重新加入基礎項目
    selectedListContainer.innerHTML = '';
    baseItems.forEach(item => {
      addSummaryRow(item.name, item.price);
    });

    // 巡檢所有被勾選的自選項目
    triggers.forEach(checkbox => {
      if (checkbox.checked) {
        const name = checkbox.getAttribute('data-name');
        const price = parseInt(checkbox.value, 10);
        total += price;
        addSummaryRow(name, price);
      }
    });

    // 格式化輸出金錢 (加上千分位)
    totalPriceEl.textContent = `NT$ ${total.toLocaleString()}`;
  }

  // 輔助函式：新增明細列
  function addSummaryRow(name, price) {
    const row = document.createElement('div');
    row.className = 'selected-item';
    row.innerHTML = `
      <span>${name}</span>
      <span>$${price.toLocaleString()}</span>
    `;
    selectedListContainer.appendChild(row);
  }
}

/**
 * 4. 祝福留言牆與 LocalStorage (Blessing Wall)
 */
function initBlessingWall() {
  const blessingForm = document.getElementById('blessing-form');
  const blessingWall = document.getElementById('blessing-wall');
  const flowerOptions = document.querySelectorAll('.flower-option');
  let selectedFlower = '🌸'; // 預設選擇香水百合

  // 預設溫馨留言（當 localstorage 為空時載入，讓網頁看起來有溫度）
  const defaultBlessings = [
    {
      name: '長子 陳先生',
      flower: '🪷',
      message: '感謝同仁社在我們全家最慌亂無助的時刻，給予我們最溫馨、誠懇的協助。整個告別式佈置得很精緻，法事也很莊嚴，讓家父能圓滿走完最後一程，萬分感激！',
      date: '2026-06-12 10:15'
    },
    {
      name: '摯友 李小姐',
      flower: '🌸',
      message: '美玉，感謝妳這輩子帶給我們的溫暖。今天同仁社的追思儀式很溫馨，播放的投影片和音樂都讓我們感到滿滿的欣慰，願妳在另一個世界安息，無病無痛。',
      date: '2026-06-10 14:30'
    },
    {
      name: '家屬 洪小姐',
      flower: '🌼',
      message: '同仁社的費用明細非常公開，沒有任何強迫推銷或不明費用，這在我們治喪期間給了很大的安心感。特別謝謝黃禮儀師細心的叮嚀與二十四小時隨時的解惑。',
      date: '2026-06-08 17:45'
    },
    {
      name: '晚輩 王先生',
      flower: '🪷',
      message: '叔叔，願您乘蓮花往生極樂。謝謝同仁社把一切細節都打理得有條不紊，讓後輩們可以專心致意追思，真的是一間很有溫度、非常踏實誠懇的禮儀公司。',
      date: '2026-06-05 09:20'
    }
  ];

  // 取得現有留言 (從 LocalStorage 讀取)
  let blessings = JSON.parse(localStorage.getItem('tong_ren_she_blessings'));
  
  if (!blessings || blessings.length === 0) {
    blessings = defaultBlessings;
    localStorage.setItem('tong_ren_she_blessings', JSON.stringify(blessings));
  }

  // 渲染留言牆
  renderWall();

  // 鮮花選擇器互動
  flowerOptions.forEach(option => {
    option.addEventListener('click', () => {
      flowerOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      selectedFlower = option.getAttribute('data-flower');
    });
  });

  // 表單送出處理
  blessingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('blessing-name');
    const msgInput = document.getElementById('blessing-msg');
    
    // 獲取當前時間格式 YYYY-MM-DD HH:MM
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newBlessing = {
      name: nameInput.value.trim(),
      flower: selectedFlower,
      message: msgInput.value.trim(),
      date: formattedDate
    };

    // 加入陣列最前端
    blessings.unshift(newBlessing);
    localStorage.setItem('tong_ren_she_blessings', JSON.stringify(blessings));

    // 重新渲染並重設表單
    renderWall();
    blessingForm.reset();
    
    // 重設鮮花選擇至預設
    flowerOptions.forEach(opt => opt.classList.remove('selected'));
    flowerOptions[0].classList.add('selected');
    selectedFlower = '🌸';
    
    // 平滑捲動至留言牆頂端查看新留言
    blessingWall.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 渲染留言卡片的函式
  function renderWall() {
    blessingWall.innerHTML = '';
    
    if (blessings.length === 0) {
      blessingWall.innerHTML = `
        <div class="empty-wall-message">
          <span class="empty-wall-emoji">🕯️</span>
          <span>目前還沒有思念留言，歡迎您寫下第一筆溫馨祝福。</span>
        </div>
      `;
      return;
    }

    blessings.forEach(item => {
      const card = document.createElement('div');
      card.className = 'blessing-card';
      
      // 過濾文字中的 HTML 標記，防範 XSS 安全漏洞
      const safeName = escapeHtml(item.name);
      const safeMessage = escapeHtml(item.message);
      
      card.innerHTML = `
        <div class="blessing-card-header">
          <span class="blessing-author">${safeName}</span>
          <span class="blessing-flower" title="奉上的致意鮮花">${item.flower}</span>
        </div>
        <p class="blessing-message">${safeMessage}</p>
        <span class="blessing-date">${item.date}</span>
      `;
      blessingWall.appendChild(card);
    });
  }

  // 轉義 HTML 特殊字元的防禦型函式
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
}

/**
 * 5. 常見問題摺疊面板 (FAQ Accordion)
 */
function initFaq() {
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const currentItem = header.parentElement;
      const isActive = currentItem.classList.contains('active');

      // 收合所有其他問題，形成手風琴排他效果 (獨占式)
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // 切換當前點擊項目的狀態
      if (!isActive) {
        currentItem.classList.add('active');
      }
    });
  });
}
