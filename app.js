const test = document.querySelector(".create-user");
test?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const creds = Object.fromEntries(new FormData(test));

    try {
        const res = await fetch("http://localhost:8080/api/v1/customer", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(creds)
        });

        if(!res.ok) {
            alert("post virker ikke" + res.status);
        }
    } catch (err) {
        console.error(err);
    }
});