// --- CONFIGURATION ---
const API_BASE = "http://localhost:8001/api";
let packageModal; // Bootstrap Modal Instance

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Security Check
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user.isAdmin) {
        alert("ACCESS DENIED: Admins only.");
        window.location.href = "../pages/index.html";
        return;
    }

    // Initialize Modal
    const modalEl = document.getElementById('packageModal');
    packageModal = new bootstrap.Modal(modalEl);

    // 2. Navigation
    const links = {
        stats: document.getElementById("menu-stats"),
        manage: document.getElementById("menu-manage"),
        users: document.getElementById("menu-users")
    };
    const views = {
        stats: document.getElementById("view-stats"),
        manage: document.getElementById("view-manage"),
        users: document.getElementById("view-users")
    };

    function switchView(viewName) {
        Object.values(links).forEach(el => el.classList.remove("active"));
        Object.values(views).forEach(el => el.classList.add("d-none"));
        
        links[viewName].classList.add("active");
        views[viewName].classList.remove("d-none");
    }

    links.stats.addEventListener("click", () => switchView('stats'));
    links.manage.addEventListener("click", () => {
        switchView('manage');
        loadManageGrid();
    });
    links.users.addEventListener("click", () => {
        switchView('users');
        loadUsers();
    });

    // Sidebar Toggle
    document.getElementById("menu-toggle").onclick = () => {
        document.getElementById("wrapper").classList.toggle("toggled");
    };

    // Open Modal Button
    document.getElementById("btn-open-modal").addEventListener("click", () => {
        resetForm();
        loadRegionsForDropdown();
        packageModal.show();
    });
    
    // Create Region Button
    document.getElementById("btn-create-region").addEventListener("click", async () => {
        const name = prompt("Enter new Region Name (e.g. 'South America'):");
        if(name) {
            try {
                await fetch(`${API_BASE}/admin/region`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ name })
                });
                alert("Region Created!");
                loadManageGrid();
            } catch(e) { alert("Error creating region"); }
        }
    });

    // Clear Button
    document.getElementById("btn-clear-form").addEventListener("click", resetForm);

    // Load Initial Data
    await loadStats();
    await loadManageGrid();

    // ==========================================
    //            CORE LOGIC
    // ==========================================

    async function loadStats() {
        try {
            const res = await fetch(`${API_BASE}/admin/stats`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            document.getElementById("stat-users").innerText = data.users || 0;
            document.getElementById("stat-bookings").innerText = data.bookings || 0;
            document.getElementById("stat-packages").innerText = data.packages || 0;
            document.getElementById("stat-regions").innerText = data.regions || 0;
        } catch (err) {
            console.error(err);
        }
    }

    async function loadManageGrid() {
        const grid = document.getElementById("manage-grid");
        grid.innerHTML = '<div class="text-center w-100 mt-5"><div class="spinner-border text-primary"></div></div>';

        try {
            const res = await fetch(`${API_BASE}/destinations`);
            const regions = await res.json();
            grid.innerHTML = "";

            if (regions.length === 0) {
                grid.innerHTML = "<p class='text-muted'>No tours found.</p>";
                return;
            }

            regions.forEach(region => {
                region.countries.forEach(pkg => {
                    const card = document.createElement('div');
                    card.className = 'dest-card';
                    
                    // Encode data safely for the Edit button
                    const safePkg = encodeURIComponent(JSON.stringify(pkg));

                    card.innerHTML = `
                        <div class="dest-card-img-wrapper">
                            <img src="${pkg.image}" class="dest-card-img" alt="${pkg.city}" onerror="this.src='../public/images/placeholder.jpg'">
                            <span class="badge bg-dark position-absolute top-0 start-0 m-2 shadow">${region.name}</span>
                        </div>
                        <div class="dest-card-body">
                            <h5 class="dest-card-title">${pkg.city}, ${pkg.name}</h5>
                            <p class="dest-card-desc text-truncate">${pkg.desc}</p>
                            
                            <div class="dest-card-footer mt-auto">
                                <div class="dest-price text-success fw-bold">
                                    ${pkg.price}
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-danger btn-delete" 
                                        data-region="${region._id}" 
                                        data-pkg="${pkg._id}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                    <button class="btn btn-sm btn-primary btn-edit" 
                                        data-region="${region._id}" 
                                        data-pkg="${safePkg}">
                                        <i class="bi bi-pencil-square"></i> Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            });

            attachActionListeners();

        } catch (err) {
            console.error(err);
            grid.innerHTML = "<p class='text-danger'>Failed to load tours.</p>";
        }
    }

    function attachActionListeners() {
        // DELETE
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(!confirm("Delete this package permanently?")) return;
                const { region, pkg } = btn.dataset;
                
                try {
                    const res = await fetch(`${API_BASE}/admin/package/${region}/${pkg}`, {
                        method: 'DELETE',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if(res.ok) {
                        btn.closest('.dest-card').remove();
                        loadStats();
                    }
                } catch(err) { alert("Server Error"); }
            });
        });

        // EDIT
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const pkg = JSON.parse(decodeURIComponent(btn.dataset.pkg));
                const regionId = btn.dataset.region;
                
                await loadRegionsForDropdown(); // Ensure dropdown is populated
                populateForm(regionId, pkg);
                packageModal.show();
            });
        });
    }

    // ==========================================
    //            FORM HANDLERS
    // ==========================================

    async function loadRegionsForDropdown() {
        const select = document.getElementById("packageRegionSelect");
        select.innerHTML = '<option value="">Select Region...</option>';
        
        const res = await fetch(`${API_BASE}/destinations`);
        const data = await res.json();
        data.forEach(d => {
            const opt = document.createElement("option");
            opt.value = d._id;
            opt.innerText = d.name;
            select.appendChild(opt);
        });
    }

    function populateForm(regionId, pkg) {
        document.getElementById("modalTitle").innerText = "Edit Tour";
        
        // Hidden IDs
        document.getElementById("edit-region-id").value = regionId;
        document.getElementById("edit-pkg-id").value = pkg._id;

        // Fields
        document.getElementById("packageRegionSelect").value = regionId;
        document.getElementById("pkgName").value = pkg.name;
        document.getElementById("pkgCity").value = pkg.city;
        document.getElementById("pkgPrice").value = pkg.price;
        document.getElementById("pkgImage").value = pkg.image;
        document.getElementById("pkgDuration").value = pkg.duration || "";
        document.getElementById("pkgGroup").value = pkg.groupSize || "";
        document.getElementById("pkgRating").value = pkg.rating || 4.5;
        document.getElementById("pkgReviews").value = pkg.reviews || 0;
        document.getElementById("pkgDesc").value = pkg.desc || "";
        document.getElementById("pkgLongDesc").value = pkg.longDesc || "";

        // Array Conversion (Array -> String)
        if(pkg.placesToVisit && Array.isArray(pkg.placesToVisit)) {
            document.getElementById("pkgPlaces").value = pkg.placesToVisit.join(", ");
        } else {
            document.getElementById("pkgPlaces").value = "";
        }
    }

    function resetForm() {
        document.getElementById("form-package").reset();
        document.getElementById("modalTitle").innerText = "Add New Tour";
        document.getElementById("edit-region-id").value = "";
        document.getElementById("edit-pkg-id").value = "";
    }

    // SAVE (Submit)
    document.getElementById("form-package").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById("btn-save-pkg");
        btn.disabled = true;
        btn.innerText = "Saving...";

        // 1. Collect Data
        const placesInput = document.getElementById("pkgPlaces").value;
        // Convert string "Paris, Lyon" -> Array ["Paris", "Lyon"]
        const placesArray = placesInput.split(",").map(s => s.trim()).filter(s => s.length > 0);

        const payload = {
            name: document.getElementById("pkgName").value,
            city: document.getElementById("pkgCity").value,
            price: document.getElementById("pkgPrice").value,
            image: document.getElementById("pkgImage").value,
            desc: document.getElementById("pkgDesc").value,
            longDesc: document.getElementById("pkgLongDesc").value,
            duration: document.getElementById("pkgDuration").value,
            groupSize: document.getElementById("pkgGroup").value,
            rating: document.getElementById("pkgRating").value,
            reviews: document.getElementById("pkgReviews").value,
            placesToVisit: placesArray
        };

        // 2. Determine Mode (Add vs Edit)
        const regionId = document.getElementById("packageRegionSelect").value;
        const pkgId = document.getElementById("edit-pkg-id").value;
        const isEdit = !!pkgId;

        let url = isEdit 
            ? `${API_BASE}/admin/package/${document.getElementById("edit-region-id").value}/${pkgId}`
            : `${API_BASE}/admin/package`;

        let method = isEdit ? 'PUT' : 'POST';
        let bodyData = isEdit ? payload : { regionId, packageData: payload };

        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(bodyData)
            });

            if(!res.ok) throw new Error("Failed to save");

            alert(isEdit ? "Tour Updated!" : "Tour Added!");
            packageModal.hide();
            loadManageGrid();
            loadStats();

        } catch (err) {
            alert("Error saving: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "Save Package";
        }
    });

    async function loadUsers() {
        /* ... Same as before ... */
        const tbody = document.getElementById("users-table-body");
        tbody.innerHTML = "<tr><td colspan='5' class='text-center'>Loading...</td></tr>";
        try {
            const res = await fetch(`${API_BASE}/admin/users`, { headers: { "Authorization": `Bearer ${token}` } });
            const users = await res.json();
            tbody.innerHTML = users.map(u => `
                <tr>
                    <td>#${u.memberId || 'N/A'}</td>
                    <td><div class="d-flex align-items-center"><img src="${u.avatar}" class="rounded-circle me-2" width="30"><strong>${u.username}</strong></div></td>
                    <td>${u.email}</td>
                    <td>${u.isAdmin ? '<span class="badge bg-danger">Admin</span>' : '<span class="badge bg-success">User</span>'}</td>
                    <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>`).join('');
        } catch(e) { tbody.innerHTML = "<tr><td colspan='5'>Error loading users</td></tr>"; }
    }
});