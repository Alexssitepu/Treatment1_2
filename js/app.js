/* =========================================================
   Portal Layanan Mahasiswa — app.js
   Treatment 2: interaksi dinamis form <-> tabel riwayat
   - Event handling submit
   - Manipulasi DOM (tambah / ubah / hapus baris)
   - Data tetap disimpan ke localStorage
   ========================================================= */

const STORAGE_KEY = "portalLayananData";

/** Ambil seluruh data dari localStorage */
function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Data tersimpan rusak, mengembalikan array kosong.", e);
    return [];
  }
}

/** Simpan seluruh array data ke localStorage */
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Buat nomor tiket berurutan, format TIKET-001 */
function buildTicketId(sequenceNumber) {
  return "TIKET-" + String(sequenceNumber).padStart(3, "0");
}

/** Format tanggal ke format Indonesia singkat */
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Ubah setiap huruf depan kata menjadi kapital, contoh: "alex sander" -> "Alex Sander" */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/** Cegah HTML injection sederhana saat menampilkan data pengguna */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   Halaman gabungan Form + Tabel Riwayat (index.html)
--------------------------------------------------------- */
function initFormPage() {
  const form = document.getElementById("formLayanan");
  if (!form) return;

  const fields = {
    nama: document.getElementById("nama"),
    nim: document.getElementById("nim"),
    jenisLayanan: document.getElementById("jenisLayanan"),
    keterangan: document.getElementById("keterangan"),
  };
  const editIdInput = document.getElementById("editId");
  const submitBtn = document.getElementById("submitBtn");
  const cancelEditLink = document.getElementById("cancelEditLink");
  const formModeTitle = document.getElementById("formModeTitle");

  const toast = document.getElementById("ticketToast");
  const toastMsg = document.getElementById("ticketToastMsg");
  const toastId = document.getElementById("ticketToastId");

  const tbody = document.getElementById("dataTableBody");
  const countPill = document.getElementById("countPill");
  const emptyState = document.getElementById("emptyState");
  const tableCard = document.getElementById("tableCard");

  /* ---------- Validasi ---------- */
  function setInvalid(fieldEl, isInvalid) {
    const wrapper = fieldEl.closest(".field");
    if (!wrapper) return;
    wrapper.classList.toggle("invalid", isInvalid);
  }

  // NIM: buang otomatis karakter selain angka saat mengetik
  fields.nim.addEventListener("input", function () {
    fields.nim.value = fields.nim.value.replace(/[^0-9]/g, "");
  });

  function validate() {
    let valid = true;

    if (!fields.nama.value.trim()) {
      setInvalid(fields.nama, true);
      valid = false;
    } else {
      setInvalid(fields.nama, false);
    }

    const nimVal = fields.nim.value.trim();
    if (!nimVal || !/^\d+$/.test(nimVal)) {
      setInvalid(fields.nim, true);
      valid = false;
    } else {
      setInvalid(fields.nim, false);
    }

    if (!fields.jenisLayanan.value.trim()) {
      setInvalid(fields.jenisLayanan, true);
      valid = false;
    } else {
      setInvalid(fields.jenisLayanan, false);
    }

    return valid;
  }

  /* ---------- Update tampilan jumlah entri & empty state ---------- */
  function refreshCountAndEmptyState() {
    const total = tbody.querySelectorAll("tr").length;
    countPill.textContent = total + " entri";
    if (total === 0) {
      emptyState.style.display = "block";
      tableCard.style.display = "none";
    } else {
      emptyState.style.display = "none";
      tableCard.style.display = "block";
    }
  }

  /* ---------- Bangun elemen <tr> dari satu entry data ---------- */
  function buildRowElement(entry) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", entry.id);

    tr.innerHTML =
      '<td class="ticket-id">' + escapeHtml(entry.id) + "</td>" +
      "<td>" + escapeHtml(toTitleCase(entry.nama)) + "</td>" +
      "<td>" + escapeHtml(entry.nim) + "</td>" +
      '<td><span class="service-tag">' + escapeHtml(entry.jenisLayanan) + "</span></td>" +
      "<td>" + (entry.keterangan ? escapeHtml(entry.keterangan) : "&mdash;") + "</td>" +
      "<td>" + formatDate(entry.tanggal) + "</td>" +
      '<td class="row-actions">' +
      '<button type="button" class="btn-edit" data-id="' + escapeHtml(entry.id) + '">Edit</button> ' +
      '<button type="button" class="btn-delete" data-id="' + escapeHtml(entry.id) + '">Hapus</button>' +
      "</td>";

    return tr;
  }

  /* ---------- Render awal seluruh data saat halaman dibuka ---------- */
  function renderAll() {
    const data = getData();
    tbody.innerHTML = "";
    data.forEach(function (entry) {
      tbody.appendChild(buildRowElement(entry));
    });
    refreshCountAndEmptyState();
  }

  /* ---------- Reset form ke mode "tambah data" ---------- */
  function resetToAddMode() {
    form.reset();
    editIdInput.value = "";
    submitBtn.textContent = "Ajukan Layanan";
    formModeTitle.textContent = "Ajukan Layanan";
    cancelEditLink.style.display = "none";
    fields.nama.focus();
  }

  /* ---------- Event handling: submit form (tambah / simpan perubahan) ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      toast.classList.remove("show");
      return;
    }

    const data = getData();
    const editingId = editIdInput.value;

    if (editingId) {
      // Mode edit: perbarui entry yang sudah ada
      const idx = data.findIndex(function (item) {
        return item.id === editingId;
      });

      if (idx !== -1) {
        data[idx].nama = fields.nama.value.trim();
        data[idx].nim = fields.nim.value.trim();
        data[idx].jenisLayanan = fields.jenisLayanan.value.trim();
        data[idx].keterangan = fields.keterangan.value.trim();
        saveData(data);

        // Manipulasi DOM: ganti baris lama dengan baris baru hasil update
        const oldRow = tbody.querySelector('tr[data-id="' + CSS.escape(editingId) + '"]');
        const newRow = buildRowElement(data[idx]);
        if (oldRow) {
          tbody.replaceChild(newRow, oldRow);
        } else {
          tbody.appendChild(newRow);
        }

        toastMsg.textContent = "Perubahan tersimpan untuk tiket:";
        toastId.textContent = editingId;
        toast.classList.add("show");
      }

      resetToAddMode();
      refreshCountAndEmptyState();
      return;
    }

    // Mode tambah data baru
    const nextSequence = data.length + 1;
    const ticketId = buildTicketId(nextSequence);

    const entry = {
      id: ticketId,
      nama: fields.nama.value.trim(),
      nim: fields.nim.value.trim(),
      jenisLayanan: fields.jenisLayanan.value.trim(),
      keterangan: fields.keterangan.value.trim(),
      tanggal: new Date().toISOString(),
    };

    data.push(entry);
    saveData(data);

    // Manipulasi DOM: tambahkan baris baru langsung ke tabel tanpa reload
    tbody.appendChild(buildRowElement(entry));
    refreshCountAndEmptyState();

    toastMsg.textContent = "Pengajuan berhasil! Nomor tiket Anda:";
    toastId.textContent = ticketId;
    toast.classList.add("show");

    resetToAddMode();
  });

  /* ---------- Batalkan mode edit ---------- */
  cancelEditLink.addEventListener("click", function (event) {
    event.preventDefault();
    resetToAddMode();
  });

  /* ---------- Event handling: klik tombol Edit / Hapus (event delegation) ---------- */
  tbody.addEventListener("click", function (event) {
    const target = event.target;

    if (target.classList.contains("btn-edit")) {
      const id = target.getAttribute("data-id");
      const data = getData();
      const entry = data.find(function (item) {
        return item.id === id;
      });
      if (!entry) return;

      fields.nama.value = entry.nama;
      fields.nim.value = entry.nim;
      fields.jenisLayanan.value = entry.jenisLayanan;
      fields.keterangan.value = entry.keterangan;
      editIdInput.value = entry.id;

      submitBtn.textContent = "Simpan Perubahan";
      formModeTitle.textContent = "Edit Pengajuan " + entry.id;
      cancelEditLink.style.display = "inline";
      toast.classList.remove("show");

      form.scrollIntoView({ behavior: "smooth", block: "start" });
      fields.nama.focus();
    }

    if (target.classList.contains("btn-delete")) {
      const id = target.getAttribute("data-id");
      const confirmDelete = window.confirm(
        "Hapus pengajuan " + id + "? Tindakan ini tidak bisa dibatalkan."
      );
      if (!confirmDelete) return;

      let data = getData();
      data = data.filter(function (item) {
        return item.id !== id;
      });
      saveData(data);

      // Manipulasi DOM: hapus baris dari tabel secara langsung
      const row = tbody.querySelector('tr[data-id="' + CSS.escape(id) + '"]');
      if (row) row.remove();

      refreshCountAndEmptyState();

      // Jika sedang mengedit entry yang baru dihapus, batalkan mode edit
      if (editIdInput.value === id) {
        resetToAddMode();
      }
    }
  });

  renderAll();
}

document.addEventListener("DOMContentLoaded", function () {
  initFormPage();
});