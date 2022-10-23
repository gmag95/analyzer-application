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

const localeFormatter = d3.formatLocale({decimal: ',', thousands: '.', grouping: [3], currency: ["€,.2f"]});

const balanceFormatter = localeFormatter.format(",.2f");

let assets_pos = undefined, liabilities_pos = undefined;

let column_descriptions = ["Gl code/Node", "GL description", "Amount"];

d3.selectAll("table").append("thead");
d3.selectAll("table").append("tbody");

d3.selectAll("table thead").insert("tr")
        .selectAll("th")
        .data(Object.keys(ChartOfAccounts[0]))
        .join("th").text((d, i) => column_descriptions[i]);

populateTable();

d3.select("#updateButton").on("click", function() {

    date = document.querySelector("input").value;

    let request = new XMLHttpRequest();
        request.open('GET', `getStatementData?date=${date}`, true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function() {

            if (JSON.parse(this.response).name=="error") {
                return window.alert("Error retrieving chart data");
            }

            ChartOfAccounts = eval(this.response);

            populateTable();

            d3.select("#dateSpan").text(date.slice(-2)+'/'+date.slice(5,7)+'/'+date.slice(0,4));

        }

        request.send();
})

function populateTable() {

    for (let i=0; i<ChartOfAccounts.length; i++) {
        if (ChartOfAccounts[i].element == "Total assets") {
            assets_pos = i;
        } else if (ChartOfAccounts[i].element == "Total equity and liabilities") {
            liabilities_pos = i;
        }
    }
    
    d3.select("#assets tbody").selectAll("tr")
        .data(ChartOfAccounts.filter((d, i) => i<=assets_pos))
        .join(enter => enter.append("tr").each(function(d) {
            add_table_el(d3.select(this), d);
            }
        ))
        .each(function(d) {
            add_table_attr(d3.select(this), d);
        });
    
    d3.select("#liabilities tbody").selectAll("tr")
        .data(ChartOfAccounts.filter((d, i) => i>assets_pos && i <=liabilities_pos))
        .join(enter => enter.append("tr").each(function(d) {
            add_table_el(d3.select(this), d);
            }
        ))
        .each(function(d) {
            add_table_attr(d3.select(this), d);
        });
    
    d3.select("#pl tbody").selectAll("tr")
        .data(ChartOfAccounts.filter((d, i) => i>liabilities_pos))
        .join(enter => enter.append("tr").each(function(d) {
            add_table_el(d3.select(this), d);
            }
        ))
        .each(function(d) {
            add_table_attr(d3.select(this), d);
        });

}

function add_table_el(sel_element, d) {

    let td_n = undefined;

    d[Object.keys(d)[1]]!=null ? td_n = Object.keys(d).length : td_n = Object.keys(d).length-1;

    for (let i=0; i<td_n; i++) {
        sel_element.append("td");
    }

    d[Object.keys(d)[1]]!=null ? sel_element.select("td").append("a") : null;
}

function add_table_attr(sel_element, d) {

    if (d[Object.keys(d)[1]]==null) {

        sel_element.select("td").attr("colspan", 2);
        sel_element.selectAll("td").datum(d).text((d, i) => i == 1 ? balanceFormatter(d[Object.keys(d)[i+1]]) : d[Object.keys(d)[i]]);

    } else {
        sel_element.select("a").attr("href", `/postings?glcode=${d[Object.keys(d)[0]]}&description=&startregdate=&endregdate=&starteffdate=&endeffdate=${date}&costcenter=&docnum=&usercode=&acccenter=&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=`).datum(d).text((d, i) => i == 2 ? balanceFormatter(d[Object.keys(d)[i]]) : d[Object.keys(d)[i]]);
        sel_element.selectAll("td:not(:first-of-type)").datum(d).text((d, i) => i == 1 ? balanceFormatter(d[Object.keys(d)[i+1]]) : d[Object.keys(d)[i+1]]);
    }
}