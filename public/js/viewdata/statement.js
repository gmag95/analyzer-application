let toggle_button = document.getElementById("toggler");
let form = document.querySelector("form");

toggle_button.addEventListener("click", () => {
    form.classList.toggle("d-none");
    if (toggle_button.innerText=="Show options") {
        toggle_button.innerText="Hide options";
    } else {
        toggle_button.innerText="Show options";
    }
})

if (String(window.location).includes("?")) {
    toggle_button.innerText="Hide options";
}