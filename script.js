document.addEventListener("DOMContentLoaded", async () => {
    const output = document.getElementById("output");
    const api_key = "gomorse123"; 
    const jwt_token = localStorage.getItem("jwt_token"); 
    if (!jwt_token) {
        output.innerHTML = "<p>Token tidak ditemukan, harap melakukan login kembali !</p>";
        return;
    }
  
    try {
        const response = await fetch("http://localhost:8000/api/v1/service-locations", {
            method: "GET",
            headers: {
                "x-api-key": api_key, 
                "Authorization": `Bearer ${jwt_token}`, 
            },
        });
  
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (data.length === 0) {
            output.innerHTML = "<p>Tidak ada service locations yang ditemukan !</p>";
            return;
        }
  
        data.forEach(location => {
            const infoSerloc = document.createElement("div");
            infoSerloc.classList.add("infoSerloc");
            infoSerloc.innerHTML = `
            <div class="kotak-serloc">
                <div class="kotak-serloc-left">
                <div class="namaTempat"><span class="highlight">${location["Nama Tempat"]}</span></div>
                <div class="alamat"><span class="highlight">Alamat:</span> ${location.Alamat}</div>
                <div class="kota"><span class="highlight">Kota:</span> ${location.Kota}</div>
                <div class="noTelp"><span class="highlight">Nomor Telepon:</span> ${location["Nomor Telepon"]}</div>
                <div class="waktuBuka"><span class="highlight">Waktu Buka:</span> ${location["Waktu Buka"]}</div>
                <div class="waktuTutup"><span class="highlight">Waktu Tutup:</span> ${location["Waktu Tutup"]}</div>
                </div>
            </div>
            `;
            output.appendChild(infoSerloc);
        });
    }
    catch(error){
        output.innerHTML = `<p>Error = ${error.message}</p>`;
    }

    document.getElementById("orderForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const output = document.getElementById("listOutput");
        output.innerHTML = "";
        const api_key = "gomorse123"; 
        const jwt_token = localStorage.getItem("jwt_token");
        
        if (!jwt_token) {
            output.innerHTML = "<p>Token tidak ditemukan, harap melakukan login kembali !</p>";
            return;
        }
    
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const vehicleType = document.getElementById("vehicleType").value;
    
        try {
            const nearStore_resp = await fetch(
                `http://localhost:8000/api/v1/nearest-store?user_latitude=${latitude}&user_longitude=${longitude}`,
                {
                    method: "GET",
                    headers: {
                        "x-api-key": api_key,
                        "Authorization": `Bearer ${jwt_token}`,
                    },
                }
            );
    
            if (!nearStore_resp.ok) {
                throw new Error(`Error: ${nearStore_resp.status} - ${nearStore_resp.statusText}`);
            }
    
            const nearStore_dataNeeded = await nearStore_resp.json();
            const tempatTerdekat = nearStore_dataNeeded.tempat_terdekat;
            const totalJarakKm = nearStore_dataNeeded.total_jarak_km;
            const ongkirFee_resp = await fetch(
                `http://localhost:8000/api/v1/ongkir-fee-calculation?distance=${totalJarakKm}&vehicle_type=${vehicleType}`,
                {
                    method: "GET",
                    headers: {
                        "x-api-key": api_key,
                        "Authorization": `Bearer ${jwt_token}`,
                    },
                }
            );
    
            if (!ongkirFee_resp.ok) {
                throw new Error(`Error: ${ongkirFee_resp.status} - ${ongkirFee_resp.statusText}`);
            }
    
            const ongkirFee_dataNeeded = await ongkirFee_resp.json();
    
            output.innerHTML = `
                <div class="tempatTerdekat"><span class="highlight">Tempat Servis Terdekat:</span> ${tempatTerdekat}</div>
                <div class="totalDistance"><span class="highlight">Jarak dari Tempat Servis ke Anda:</span> ${totalJarakKm} km</div>
                <div class="ongkirFee"><span class="highlight">Biaya Ongkos Kirim:</span> Rp ${ongkirFee_dataNeeded["Biaya Ongkir"]}</div>
            `;
        }
        catch(error) {
            output.innerHTML = `<p>Error = ${error.message}</p>`;
        }
    });

    document.getElementById("serviceFeeForm").addEventListener("submit", async function(event) {
        event.preventDefault(); 
        const selectedServices = [];
        document.querySelectorAll('input[name="services"]:checked').forEach((checkbox) => {
            selectedServices.push(checkbox.value);
        });
    
        const biaya_tambahan = document.getElementById("biaya_tambahan").value;
        const url = new URL("http://127.0.0.1:8000/api/v1/service-fee-calculation");
        const params = new URLSearchParams();
        params.append("biaya_tambahan", biaya_tambahan); 
        url.search = params.toString(); 
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "x-api-key": api_key,
                    "Authorization": `Bearer ${jwt_token}`,
                    "Content-Type": "application/json",  
                },
                body: JSON.stringify(selectedServices),
            });

            if (!resp.ok) {
                const errorz = await resp.json();
                throw new Error(errorz.detail || "Error terjadi !");
            }
    
            const dataNeeded = await resp.json();
            document.getElementById("result").innerHTML = `
                <div><strong>Services Used:</strong> ${dataNeeded.service_digunakan.join(", ")}</div>
                <div><strong>Biaya Servis:</strong> ${dataNeeded.biaya_servis}</div>
                <div><strong>Biaya Tambahan:</strong> ${dataNeeded.biaya_tambahan}</div>
                <div><strong>Total Biaya:</strong> ${dataNeeded.total_biaya} (tanpa ongkos kirim)</div>
            `;
        }
        catch (error) {
            document.getElementById("result").innerHTML = `<p> Error = ${error.message}</p>`;
        }
    });
});