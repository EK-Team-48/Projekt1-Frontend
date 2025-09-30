const createUser = document.querySelector(".create-user");
const test = document.querySelector(".checkout-box")
const checkoutButton = document.querySelector(".btn");

createUser?.addEventListener("submit", async (event) => {
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

checkoutButton?.addEventListener("click", (e) => {
  e.preventDefault();
  openPopUP();
});

function openPopUP() {
  if (!test) return;
  test.classList.add("active");
  checkoutButton.style.display = "none";
}

