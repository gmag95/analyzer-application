let bar_button = document.getElementById("bar_button");
let line_button = document.getElementById("line_button");
let bar_chart = document.getElementById("bar_chart");
let line_chart = document.getElementById("line_chart");

bar_button.addEventListener("click", () => {
    bar_button.disabled=true;
    line_chart.classList.toggle("d-none");
    bar_chart.classList.toggle("d-none");
    line_button.disabled=false;
})

line_button.addEventListener("click", () => {
    line_button.disabled=true;
    line_chart.classList.toggle("d-none");
    bar_chart.classList.toggle("d-none");
    bar_button.disabled=false;
})