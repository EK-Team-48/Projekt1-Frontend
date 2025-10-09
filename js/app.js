import { postObjectAsJson } from './modulejson.js';
const API_BASE = 'http://localhost:8080/api/v1/customer';
const API_RES = 'http://localhost:8080/api/v1/reservations'


const createUser = document.querySelector(".checkout-form");
const test = document.querySelector(".checkout-box")
const checkoutButton = document.querySelector(".btn");
const confirmOrder = document.querySelector(".confirm-order");

checkoutButton?.addEventListener("click", (e) => {
  e.preventDefault();
  openPopUP();
});

function openPopUP() {
  if (!test) return;
  test.classList.add("active");
  checkoutButton.style.display = "none";
}

confirmOrder?.addEventListener("click", async (e) => {
  e.preventDefault();

  const creds = Object.fromEntries(new FormData(createUser));
  const userObj = {
    firstName: creds.firstName,
    lastName: creds.lastName,
    age: creds.age,
    number: creds.number
  };

  try {
    const res = await postObjectAsJson(API_CUSTOMER, userObj, "POST");
    if (!res.ok) {
      alert("post virker ikke" + res.status);
    } else {
      const response = await res.json();
      const reservationObj = {
        customerID: response.customerId,
        screeningID: 1 //afventer at modtage, så tester med 1
      }
      console.log(reservationObj);
      const reservation = await postObjectAsJson(API_RESERVATION, reservationObj, "POST")
      if(!reservation.ok) {
        alert("Fejl i at sende info" + res.status);
      }
      
      const status = await reservation.text();
      console.log(status);
      test.classList.remove("active");

      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email").value;
      const number = document.getElementById("number").value;

      const confirmation = `
      <div class="confirmed-section">
    <div class="confirmed-box">
      <h1>Order confirmation</h1>
      <div class="confirmed-text"><i class="fa-solid fa-check"></i></div>
      <div class="confirmed-text"><p>Your order has been confirmed</p></div>
      <div class="confirmed-text"><p class="customer-name">Name: ${firstName} ${lastName}</p></div>
      <div class="confirmed-text"><p class="customer-email">Email: ${email}</p></div>
      <div class="confirmed-text"><p class="customer-number">Number: ${number}</p></div>
      <div class="confirmed-text"><p class="customer-theater">Theater: Kino XP Nørrebro</p></div>
      <div class="confirmed-text"><p class="customer-movie">Movie: Dune</p></div>
      <div class="confirmed-text"><time datetime="2025-01-01">Date and time: 01/01/2025 11.00</time></div>
      <div class="confirmed-text"><p class="customer-seats">Seat: 1A, 2A</p></div>
    </div>
    </div>
  `;

      document.body.insertAdjacentHTML("beforeend", confirmation);

      const orderConfirmed = document.querySelector(".confirmed-section");
      orderConfirmed.classList.add("active");

    }
  } catch (err) {
    console.error(err);
  }
})



