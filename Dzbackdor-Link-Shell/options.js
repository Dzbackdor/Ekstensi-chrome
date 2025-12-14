const log = document.getElementById("log");
const dataBox = document.getElementById("data");

const categoryInput = document.getElementById("category");
const textInput = document.getElementById("text");
const urlInput = document.getElementById("url");
const addBtn = document.getElementById("add");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// ================= EXPORT FUNCTION =================
exportBtn.onclick = () => {
  chrome.storage.sync.get("links", (res) => {
    const data = res.links || {};
    
    if (Object.keys(data).length === 0) {
      log.textContent = "❌ Tidak ada data untuk di-export";
      return;
    }
    
    // Format data dengan metadata
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      source: "Anchor Link Cyberpunk Extension",
      data: data
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Buat link download
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    a.href = url;
    a.download = `anchor-links-backup-${timestamp}.json`;
    a.click();
    
    // Bersihkan URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    log.textContent = "✅ Data berhasil di-export!";
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
        log.textContent = "❌ Format file tidak valid. File harus mengandung 'data' property.";
        return;
      }
      
      // Validasi struktur data
      const isValid = Object.values(importedData.data).every(category => 
        Array.isArray(category) && 
        category.every(item => item.text && item.url)
      );
      
      if (!isValid) {
        log.textContent = "❌ Struktur data tidak valid. Pastikan file dari export ekstensi ini.";
        return;
      }
      
      // Konfirmasi import
      if (!confirm(`Import ${Object.keys(importedData.data).length} kategori dan ${Object.values(importedData.data).flat().length} item?`)) {
        log.textContent = "❌ Import dibatalkan";
        importFile.value = "";
        return;
      }
      
      // Simpan data
      chrome.storage.sync.set({ links: importedData.data }, () => {
        log.textContent = `✅ Berhasil mengimpor ${Object.keys(importedData.data).length} kategori!`;
        importFile.value = "";
        load();
      });
      
    } catch (error) {
      log.textContent = `❌ Error membaca file: ${error.message}`;
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
    log.textContent = "❌ Semua field wajib diisi";
    return;
  }

  chrome.storage.sync.get("links", res => {
    const data = res.links || {};

    for (const items of Object.values(data)) {
      if (items.some(i => i.text === text)) {
        log.textContent = "❌ Anchor text sudah ada";
        return;
      }
    }

    data[category] = data[category] || [];
    data[category].push({ text, url });

    chrome.storage.sync.set({ links: data }, () => {
      log.textContent = "✅ Data berhasil ditambahkan & sync";
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
      log.textContent = "❌ Anchor text sudah ada";
      return;
    }
  }

  data[category][index] = { text: newText, url: newUrl };

  chrome.storage.sync.set({ links: data }, () => {
    log.textContent = "✅ Data berhasil diupdate & sync";
    load();
  });
}

// ================= DELETE ITEM =================
function deleteItem(category, index, data) {
  if (!confirm("Yakin ingin menghapus anchor ini?")) return;

  data[category].splice(index, 1);
  if (data[category].length === 0) delete data[category];

  chrome.storage.sync.set({ links: data }, () => {
    log.textContent = "✅ Data berhasil dihapus & sync";
    load();
  });
}

// ================= INITIAL LOAD =================
load();