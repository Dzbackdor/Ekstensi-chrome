const log = document.getElementById("log");
const dataBox = document.getElementById("data");

const categoryInput = document.getElementById("category");
const textInput = document.getElementById("text");
const urlInput = document.getElementById("url");
const addBtn = document.getElementById("add");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// ================= THEME MANAGEMENT =================
const themeButtons = document.querySelectorAll('.theme-btn');
const themes = {
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      bgPrimary: '#060914',
      bgSecondary: '#0e1430',
      accentColor: '#00f6ff',
      textColor: '#00f6ff',
      successColor: '#00ff00',
      dangerColor: '#ff5555'
    }
  },
  matrix: {
    name: 'Matrix',
    colors: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#1a1a1a',
      accentColor: '#00ff00',
      textColor: '#00ff00',
      successColor: '#00ff00',
      dangerColor: '#ff3333'
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      bgPrimary: '#110022',
      bgSecondary: '#220044',
      accentColor: '#9d00ff',
      textColor: '#9d00ff',
      successColor: '#00ff00',
      dangerColor: '#ff3366'
    }
  },
  red: {
    name: 'Red Terminal',
    colors: {
      bgPrimary: '#000000',
      bgSecondary: '#1a0000',
      accentColor: '#ff0000',
      textColor: '#ff0000',
      successColor: '#00ff00',
      dangerColor: '#ff8888'
    }
  }
};

// Helper function untuk warna dengan opacity
function colorWithOpacity(hexColor, opacity) {
  try {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } catch (e) {
    return `rgba(0, 246, 255, ${opacity})`;
  }
}

// Update log message dengan warna yang sesuai
function updateLogMessage(message) {
  log.textContent = message;
  
  // Set warna log berdasarkan konten
  if (message.includes('✅') || message.includes('success') || message.includes('berhasil')) {
    log.style.color = 'var(--success-color)';
  } else if (message.includes('❌') || message.includes('error') || message.includes('gagal')) {
    log.style.color = 'var(--danger-color)';
  } else {
    log.style.color = 'var(--text-color)';
  }
}

// Apply theme to options page
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  
  const root = document.documentElement;
  const colors = theme.colors;
  
  // Apply CSS variables
  root.style.setProperty('--bg-primary', colors.bgPrimary);
  root.style.setProperty('--bg-secondary', colors.bgSecondary);
  root.style.setProperty('--accent-color', colors.accentColor);
  root.style.setProperty('--text-color', colors.textColor);
  root.style.setProperty('--success-color', colors.successColor);
  root.style.setProperty('--danger-color', colors.dangerColor);
  root.style.setProperty('--border-color', colorWithOpacity(colors.accentColor, 0.33));
  root.style.setProperty('--hover-bg', colorWithOpacity(colors.accentColor, 0.15));
  
  // Update button active state
  themeButtons.forEach(btn => {
    if (btn.dataset.theme === themeName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // SIMPAN KE STORAGE SAJA - TIDAK ADA MESSAGING
  chrome.storage.sync.set({ 
    theme: themeName,
    themeColors: colors
  }, () => {
    updateLogMessage(`✅ Theme changed to ${theme.name}`);
  });
}

// Save theme to storage
function saveTheme(themeName) {
  chrome.storage.sync.set({ 
    theme: themeName,
    themeColors: themes[themeName].colors 
  });
}

// Load saved theme
function loadTheme() {
  chrome.storage.sync.get(['theme'], (result) => {
    if (result.theme && themes[result.theme]) {
      applyTheme(result.theme);
    } else {
      // Default theme
      applyTheme('cyberpunk');
    }
  });
}

// Theme button click handlers
themeButtons.forEach(button => {
  button.onclick = () => {
    const themeName = button.dataset.theme;
    applyTheme(themeName);
    saveTheme(themeName);
  };
});

// ================= TITLE EFFECT MANAGEMENT =================
const effectButtons = document.querySelectorAll('.effect-btn');
const titleEffects = {
  glitch: { name: 'Glitch', icon: '🎮' },
  typewriter: { name: 'Typewriter', icon: '⌨' },
  neon: { name: 'Neon Flicker', icon: '✨' },
  pulse: { name: 'Pulse', icon: '⚡' },
  wave: { name: 'Wave', icon: '🌊' },
  simple: { name: 'Simple Glow', icon: '⭐' }
};

// Apply title effect
function applyTitleEffect(effectName) {
  const effect = titleEffects[effectName];
  if (!effect) return;
  
  // Update button active state
  effectButtons.forEach(btn => {
    if (btn.dataset.effect === effectName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // SIMPAN KE STORAGE SAJA - TIDAK ADA MESSAGING
  chrome.storage.sync.set({ 
    titleEffect: effectName
  }, () => {
    updateLogMessage(`✅ Title effect changed to ${effect.name}`);
  });
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

// Title effect button click handlers
effectButtons.forEach(button => {
  button.onclick = () => {
    const effectName = button.dataset.effect;
    applyTitleEffect(effectName);
  };
});

// ================= EXPORT FUNCTION =================
exportBtn.onclick = () => {
  chrome.storage.sync.get("links", (res) => {
    const data = res.links || {};
    
    if (Object.keys(data).length === 0) {
      updateLogMessage("❌ Tidak ada data untuk di-export");
      return;
    }
    
    // Format data dengan metadata
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      source: "Dzbackdor Link Shell",
      data: data
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Buat link download
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    a.href = url;
    a.download = `link-shell-backup-${timestamp}.json`;
    a.click();
    
    // Bersihkan URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    updateLogMessage("✅ Data berhasil di-export!");
  });
};

// ================= IMPORT FUNCTION =================
importBtn.onclick = () => {
  importFile.click();
};

importFile.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      
      // Validasi format data
      if (!importedData.data) {
        updateLogMessage("❌ Format file tidak valid. File harus mengandung 'data' property.");
        return;
      }
      
      // Validasi struktur data
      const isValid = Object.values(importedData.data).every(category => 
        Array.isArray(category) && 
        category.every(item => item.text && item.url)
      );
      
      if (!isValid) {
        updateLogMessage("❌ Struktur data tidak valid. Pastikan file dari export ekstensi ini.");
        return;
      }
      
      // Konfirmasi import
      if (!confirm(`Import ${Object.keys(importedData.data).length} kategori dan ${Object.values(importedData.data).flat().length} item?`)) {
        updateLogMessage("❌ Import dibatalkan");
        importFile.value = "";
        return;
      }
      
      // Simpan data
      chrome.storage.sync.set({ links: importedData.data }, () => {
        updateLogMessage(`✅ Berhasil mengimpor ${Object.keys(importedData.data).length} kategori!`);
        importFile.value = "";
        load();
      });
      
    } catch (error) {
      updateLogMessage(`❌ Error membaca file: ${error.message}`);
      importFile.value = "";
    }
  };
  
  reader.readAsText(file);
};

// ================= LOAD DATA =================
function load() {
  chrome.storage.sync.get("links", res => {
    render(res.links || {});
  });
}

// ================= RENDER DATA =================
function render(data) {
  dataBox.innerHTML = "";

  Object.entries(data).forEach(([category, items]) => {
    const cat = document.createElement("div");
    cat.className = "category";

    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = category;

    const box = document.createElement("div");
    box.className = "items";

    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "row";

      const text = document.createElement("span");
      text.textContent = item.text;

      const edit = document.createElement("span");
      edit.textContent = "✏ Edit";
      edit.className = "action";
      edit.onclick = () => editItem(category, index, data);

      const del = document.createElement("span");
      del.textContent = "🗑 Delete";
      del.className = "action delete";
      del.onclick = () => deleteItem(category, index, data);

      row.append(text, edit, del);
      box.appendChild(row);
    });

    cat.append(title, box);
    dataBox.appendChild(cat);
  });
}

// ================= ADD ITEM =================
addBtn.onclick = () => {
  const category = categoryInput.value.trim();
  const text = textInput.value.trim();
  const url = urlInput.value.trim();

  if (!category || !text || !url) {
    updateLogMessage("❌ Semua field wajib diisi");
    return;
  }

  chrome.storage.sync.get("links", res => {
    const data = res.links || {};

    for (const items of Object.values(data)) {
      if (items.some(i => i.text === text)) {
        updateLogMessage("❌ Anchor text sudah ada");
        return;
      }
    }

    data[category] = data[category] || [];
    data[category].push({ text, url });

    chrome.storage.sync.set({ links: data }, () => {
      updateLogMessage("✅ Data berhasil ditambahkan & sync");
      categoryInput.value = "";
      textInput.value = "";
      urlInput.value = "";
      load();
    });
  });
};

// ================= EDIT ITEM =================
function editItem(category, index, data) {
  const item = data[category][index];

  const newText = prompt("Edit anchor text", item.text);
  if (!newText) return;

  const newUrl = prompt("Edit URL", item.url);
  if (!newUrl) return;

  for (const items of Object.values(data)) {
    if (items.some((i, idx) => i.text === newText && i !== item)) {
      updateLogMessage("❌ Anchor text sudah ada");
      return;
    }
  }

  data[category][index] = { text: newText, url: newUrl };

  chrome.storage.sync.set({ links: data }, () => {
    updateLogMessage("✅ Data berhasil diupdate & sync");
    load();
  });
}

// ================= DELETE ITEM =================
function deleteItem(category, index, data) {
  if (!confirm("Yakin ingin menghapus anchor ini?")) return;

  data[category].splice(index, 1);
  if (data[category].length === 0) delete data[category];

  chrome.storage.sync.set({ links: data }, () => {
    updateLogMessage("✅ Data berhasil dihapus & sync");
    load();
  });
}

// ================= INITIAL LOAD =================
loadTheme(); // Load theme first
loadTitleEffect(); // Load title effect
load(); // Then load data
