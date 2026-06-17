/**
 * 同仁社禮儀公司 官方網站 互動邏輯
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initEstimator();
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
  const baseRadios = document.querySelectorAll('input[name="base-package"]');

  // 監聽基礎單選方案的變動
  baseRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      // 移除所有基礎方案卡片的高亮選取狀態
      document.querySelectorAll('.base-pkg-item').forEach(item => {
        item.classList.remove('selected');
      });
      // 幫目前被選中的基礎方案卡片加上高亮
      radio.closest('.base-pkg-item').classList.add('selected');
      calculateTotal();
    });
  });

  // 監聽加值複選選項點擊，切換 selected 樣式與觸發計算
  triggers.forEach(checkbox => {
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

  // 點擊卡片本體 (除了 input 本身) 的輔助點選處理
  const optionItems = document.querySelectorAll('.option-item');
  optionItems.forEach(card => {
    card.addEventListener('click', (e) => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      const radio = card.querySelector('input[type="radio"]');
      
      if (checkbox) {
        if (checkbox.disabled) return;
        if (e.target !== checkbox && !checkbox.contains(e.target)) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      } else if (radio) {
        if (e.target !== radio && !radio.contains(e.target)) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      }
    });
  });

  // 點擊主打方案區的「選擇此方案並自訂項目」按鈕
  const selectPkgBtns = document.querySelectorAll('.select-pkg-btn');
  selectPkgBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pkgId = btn.getAttribute('data-pkg-id');
      const radioEl = document.getElementById(pkgId);
      if (radioEl) {
        radioEl.checked = true;
        // 觸發變動事件以更新 UI 與價格
        radioEl.dispatchEvent(new Event('change'));
        
        // 平滑滾動到試算器區塊
        const estimatorSection = document.getElementById('estimator');
        if (estimatorSection) {
          estimatorSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 加總與更新右側 UI 渲染
  function calculateTotal() {
    // 獲取被選中的基礎方案
    const selectedBasePkg = document.querySelector('input[name="base-package"]:checked');
    const basePrice = parseInt(selectedBasePkg.value, 10);
    const baseName = selectedBasePkg.getAttribute('data-name');
    
    let total = basePrice;
    
    // 清空並重新加入方案底價
    selectedListContainer.innerHTML = '';
    addSummaryRow(baseName, basePrice);

    // 巡檢所有被勾選的自選加值項目
    triggers.forEach(checkbox => {
      if (checkbox.checked) {
        const name = checkbox.getAttribute('data-name');
        const price = parseInt(checkbox.value, 10);
        total += price;
        addSummaryRow(name, price);
      }
    });

    // 格式化輸出金錢
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
