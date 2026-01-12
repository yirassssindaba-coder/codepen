// Tunggu DOM selesai dimuat agar tidak error 'null'
document.addEventListener('DOMContentLoaded', () => {
  
  // Elemen UI
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const recentBtn = document.getElementById('recentBtn');
  const resultsDiv = document.getElementById('results');
  const statusArea = document.getElementById('statusArea');

  // Konfigurasi API (Ganti dengan Key Anda)
  const API_KEY = 'YOUR_GOOGLE_API_KEY'; 
  const CX_ID = 'YOUR_CUSTOM_SEARCH_ID';

  // Handler Pencarian
  const handleSearch = async () => {
    const query = searchInput.value;
    if (!query) return alert("Masukkan kata kunci pencarian!");

    resultsDiv.innerHTML = "Memuat gambar...";
    statusArea.innerHTML = "";

    // Simpan ke riwayat (Simulasi database via LocalStorage)
    saveToHistory(query);

    try {
      const response = await fetch(
        `www.googleapis.com{API_KEY}&cx=${CX_ID}&searchType=image&q=${encodeURIComponent(query)}&num=10`
      );
      const data = await response.json();

      if (!data.items) {
        resultsDiv.innerHTML = "Tidak ada hasil ditemukan.";
        return;
      }

      // Format data sesuai User Story (URL, Snippet, Context)
      const formattedResults = data.items.map(item => ({
        image_url: item.link,
        alt_text: item.title,
        page_url: item.image.contextLink
      }));

      renderImages(formattedResults);
    } catch (err) {
      console.error("Error fetching search data:", err);
      resultsDiv.innerHTML = "Terjadi kesalahan API. Pastikan API Key valid.";
    }
  };

  // Handler Riwayat Terbaru
  const handleRecent = () => {
    const history = JSON.parse(localStorage.getItem('imgSearchHistory')) || [];
    resultsDiv.innerHTML = "";
    statusArea.innerHTML = `<h3>Recent Searches</h3><pre>${JSON.stringify(history, null, 2)}</pre>`;
  };

  // Fungsi Pembantu
  function saveToHistory(term) {
    let history = JSON.parse(localStorage.getItem('imgSearchHistory')) || [];
    history.unshift({ term, when: new Date().toISOString() });
    history = history.slice(0, 10); // Ambil 10 terakhir
    localStorage.setItem('imgSearchHistory', JSON.stringify(history));
  }

  function renderImages(images) {
    resultsDiv.innerHTML = images.map(img => `
      <div class="card">
        <img src="${img.image_url}" alt="${img.alt_text}">
        <p><small>${img.alt_text.substring(0, 50)}...</small></p>
        <a href="${img.page_url}" target="_blank">View Page</a>
      </div>
    `).join('');
  }

  // Pasang Event Listener (Aman dari 'null' karena di dalam DOMContentLoaded)
  searchBtn.addEventListener('click', handleSearch);
  recentBtn.addEventListener('click', handleRecent);
  
  // Fitur tekan Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

});
