const list = document.getElementById("list");
const search = document.getElementById("search");

document.getElementById("settings").onclick = () => {
  chrome.runtime.openOptionsPage();
};

// ================= Fungsi render =================
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

// ================= Ambil data awal =================
chrome.storage.sync.get("links", res => {
  const data = res.links || {};
  render(data);

  search.oninput = e => render(data, e.target.value);
});

// ================= Listener untuk sync realtime =================
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.links) {
    render(changes.links.newValue || {}, search.value);
  }
});