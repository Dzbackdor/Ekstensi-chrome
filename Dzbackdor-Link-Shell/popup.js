const list = document.getElementById("list");
const search = document.getElementById("search");

document.getElementById("settings").onclick = () => {
  chrome.runtime.openOptionsPage();
};

// ================= THEME HANDLER =================
function applyThemeToPopup(themeColors) {
  const root = document.documentElement;
  
  // Apply CSS variables
  if (root.style) {
    root.style.setProperty('--bg-primary', themeColors.bgPrimary);
    root.style.setProperty('--bg-secondary', themeColors.bgSecondary);
    root.style.setProperty('--accent-color', themeColors.accentColor);
    root.style.setProperty('--text-color', themeColors.textColor);
    root.style.setProperty('--success-color', themeColors.successColor);
    root.style.setProperty('--danger-color', themeColors.dangerColor);
    
    // Calculate derived colors
    const borderColor = hexToRgba(themeColors.accentColor, 0.33);
    root.style.setProperty('--border-color', borderColor);
    root.style.setProperty('--hover-bg', hexToRgba(themeColors.accentColor, 0.15));
  }
  
  // Apply inline styles
  document.body.style.background = themeColors.bgPrimary;
  document.body.style.color = themeColors.textColor;
  
  // Update specific elements
  const h1 = document.querySelector('h1');
  const searchInput = document.getElementById('search');
  const settingsBtn = document.getElementById('settings');
  
  if (h1) {
    h1.style.color = themeColors.accentColor;
    h1.style.textShadow = `0 0 5px ${hexToRgba(themeColors.accentColor, 0.7)}`;
  }
  
  if (searchInput) {
    searchInput.style.background = themeColors.bgSecondary;
    searchInput.style.borderColor = themeColors.accentColor;
    searchInput.style.color = themeColors.textColor;
  }
  
  if (settingsBtn) {
    settingsBtn.style.background = themeColors.bgSecondary;
    settingsBtn.style.borderColor = themeColors.accentColor;
    settingsBtn.style.color = themeColors.accentColor;
  }
  
  // Update copied toast color
  updateToastStyle(themeColors.successColor);
}

// Helper: Convert hex to rgba
function hexToRgba(hex, opacity) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (e) {
    return `rgba(0, 246, 255, ${opacity})`;
  }
}

// Update toast style
function updateToastStyle(successColor) {
  // Remove existing style if any
  const existingStyle = document.getElementById('toast-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add new style
  const style = document.createElement('style');
  style.id = 'toast-style';
  style.textContent = `
    .item .inline-toast {
      color: ${successColor} !important;
    }
    
    .category-title {
      border-bottom-color: var(--border-color) !important;
    }
    
    .items {
      border-left-color: var(--border-color) !important;
    }
    
    .item:hover {
      background: var(--hover-bg) !important;
    }
    
    .category-title:hover {
      background: var(--hover-bg) !important;
    }
  `;
  document.head.appendChild(style);
}

// ================= TITLE EFFECT HANDLER =================
const titleEffects = {
  glitch: 'glitch-effect',
  typewriter: 'typewriter-effect',
  neon: 'neon-flicker-effect',
  pulse: 'pulse-effect',
  wave: 'wave-effect',
  simple: 'simple-glow-effect'
};

// Apply title effect
function applyTitleEffect(effectName) {
  const title = document.querySelector('h1');
  if (!title) return;
  
  // Remove all effect classes
  Object.values(titleEffects).forEach(effectClass => {
    title.classList.remove(effectClass);
  });
  
  // Add new effect class
  const effectClass = titleEffects[effectName];
  if (effectClass) {
    title.classList.add(effectClass);
    // Pastikan data-text ada untuk efek yang membutuhkannya
    // Perbaikan: hanya 'glitch' yang butuh data-text
    if (effectName === 'glitch') {
      title.setAttribute('data-text', 'Dzbackdor Link Shell');
    } else {
      title.removeAttribute('data-text');
    }
  }
}

// Load saved title effect
function loadTitleEffect() {
  chrome.storage.sync.get(['titleEffect'], (result) => {
    if (result.titleEffect && titleEffects[result.titleEffect]) {
      applyTitleEffect(result.titleEffect);
    } else {
      // Default effect
      applyTitleEffect('glitch');
    }
  });
}

// ================= FUNGSI RENDER DATA =================
function render(data, keyword = "") {
  list.innerHTML = "";
  keyword = keyword.toLowerCase();

  Object.entries(data).forEach(([category, items]) => {
    const filtered = items.filter(i =>
      i.text.toLowerCase().includes(keyword)
    );
    if (!filtered.length) return;

    const cat = document.createElement("div");
    cat.className = "category";

    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = category;
    title.onclick = () => cat.classList.toggle("open");

    const box = document.createElement("div");
    box.className = "items";

    filtered.forEach(i => {
      const el = document.createElement("div");
      el.className = "item";
      el.textContent = i.text;
      el.style.display = "flex";
      el.style.justifyContent = "space-between";
      el.style.alignItems = "center";
      
      el.onclick = (e) => {
        navigator.clipboard.writeText(i.url);
        
        // Buat toast inline
        const toast = document.createElement("span");
        toast.textContent = "✓ Copied";
        toast.style.color = "#00ff00";
        toast.style.fontSize = "10px";
        toast.style.marginLeft = "8px";
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.3s ease";
        
        // Hapus toast lama jika ada
        const oldToast = el.querySelector('.inline-toast');
        if (oldToast) oldToast.remove();
        
        toast.className = "inline-toast";
        el.appendChild(toast);
        
        // Fade in
        setTimeout(() => toast.style.opacity = "1", 10);
        
        // Fade out
        setTimeout(() => {
          toast.style.opacity = "0";
          setTimeout(() => {
            if (toast.parentNode) {
              toast.remove();
            }
          }, 300);
        }, 800);
      };
      box.appendChild(el);
    });

    cat.appendChild(title);
    cat.appendChild(box);
    list.appendChild(cat);
  });
}

// ================= STORAGE LISTENER (SATU UNTUK SEMUA) =================
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') {
    // If themeColors changed, apply theme
    if (changes.themeColors) {
      applyThemeToPopup(changes.themeColors.newValue);
    }
    
    // If titleEffect changed, apply effect
    if (changes.titleEffect) {
      applyTitleEffect(changes.titleEffect.newValue);
    }
    
    // If links changed, render data
    if (changes.links) {
      render(changes.links.newValue || {}, search.value);
    }
  }
});

// ================= INITIAL LOAD =================
// Load data on popup open
chrome.storage.sync.get("links", res => {
  const data = res.links || {};
  render(data);

  // Setup search event listener
  search.oninput = e => render(data, e.target.value);
});

// Load theme on popup open
chrome.storage.sync.get(['themeColors'], (result) => {
  if (result.themeColors) {
    applyThemeToPopup(result.themeColors);
  }
});

// Load title effect on popup open
loadTitleEffect();
