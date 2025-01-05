document.getElementById("login").addEventListener("submit", async (event) => {
    event.preventDefault();
    const user_name = event.target.Username.value;
    const pass_word = event.target.Password.value;

    try {
        const resp = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: user_name, password: pass_word }),
        });
        if (!resp.ok) {
            const error = await resp.json();
            throw new Error(error.detail || "Login gagal");
        }

        const data_needed = await resp.json();
        localStorage.setItem("jwt_token", data_needed.jwt_token);
        window.location.href = "/index.html"; 
    }
    catch (error) {
        alert(error.message);
    }
});