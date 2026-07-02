/* =========================================================
   Portal Layanan Mahasiswa — app.js
   Mengelola penyimpanan data (localStorage) dan interaksi
   pada halaman form (index.html) & halaman tabel (data.html)
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

/* ---------------------------------------------------------
   Halaman Form (index.html)
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

  const toast = document.getElementById("ticketToast");
  const toastId = document.getElementById("ticketToastId");

  function setInvalid(fieldEl, isInvalid) {
    const wrapper = fieldEl.closest(".field");
    if (!wrapper) return;
    wrapper.classList.toggle("invalid", isInvalid);
  }

  function validate() {
    let valid = true;

    if (!fields.nama.value.trim()) {
      setInvalid(fields.nama, true);
      valid = false;
    } else {
      setInvalid(fields.nama, false);
    }

    if (!fields.nim.value.trim()) {
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      toast.classList.remove("show");
      return;
    }

    const data = getData();
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

    // Tampilkan feedback nomor tiket
    toastId.textContent = ticketId;
    toast.classList.add("show");

    form.reset();
    fields.nama.focus();
  });
}

/* ---------------------------------------------------------
   Halaman Tabel (data.html)
--------------------------------------------------------- */
function initDataPage() {
  const tbody = document.getElementById("dataTableBody");
  if (!tbody) return;

  const countPill = document.getElementById("countPill");
  const emptyState = document.getElementById("emptyState");
  const tableCard = document.getElementById("tableCard");

  const data = getData();

  if (countPill) {
    countPill.textContent = data.length + " entri";
  }

  if (data.length === 0) {
    if (emptyState) emptyState.style.display = "block";
    if (tableCard) tableCard.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (tableCard) tableCard.style.display = "block";

  tbody.innerHTML = "";

  data.forEach(function (entry) {
    const tr = document.createElement("tr");

    tr.innerHTML =
      '<td class="ticket-id">' + escapeHtml(entry.id) + "</td>" +
      "<td>" + escapeHtml(entry.nama) + "</td>" +
      "<td>" + escapeHtml(entry.nim) + "</td>" +
      '<td><span class="service-tag">' + escapeHtml(entry.jenisLayanan) + "</span></td>" +
      "<td>" + (entry.keterangan ? escapeHtml(entry.keterangan) : "&mdash;") + "</td>" +
      "<td>" + formatDate(entry.tanggal) + "</td>";

    tbody.appendChild(tr);
  });
}

/** Cegah HTML injection sederhana saat menampilkan data pengguna */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", function () {
  initFormPage();
  initDataPage();
});
