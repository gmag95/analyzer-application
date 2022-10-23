const localeFormatter = d3.formatLocale({decimal: ',', thousands: '.', grouping: [3], currency: ["€,.2f"]});

const numberFormatter = localeFormatter.format(",.0f");

input_data = d3.nest()
                .key(d => d.fullname)
                .key(d => d.year)
                .rollup(d => [d[0].postings_num, d[0].user_code])
                .entries(secondResults);

const table = d3.select("#pivot-table");

const tr = table.selectAll("tr")
            .data(input_data)
            .join("tr");

const td = tr.selectAll("td").attr("class", "value-cell")
            .data(d => d.values)
            .join("td").attr("class", "value-cell")
    
td.append("a").attr("href", (d, i) => `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${d.key}-01-01&endeffdate=${d.key}-12-31&costcenter=&docnum=&usercode=${d.value[1]}&acccenter=&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=`)
    .text(d => numberFormatter(d.value[0]));

tr.insert("td", "td:first-of-type").text(d => d.key);

const header = table.insert("tr", "tr:first-of-type").attr("class", "header-row");

header.selectAll("th").data(input_data[0].values).join("th").text(d => d.key);

header.insert("th", "th:first-of-type").text("User name");

const color_scale = d3.scaleLinear().domain(d3.extent(secondResults, d => d.postings_num)).range(["#deebf7", "#3182bd"]);

d3.selectAll(".value-cell").style("background-color", (d, i, n) => color_scale(n[i].textContent.replace(".", ""))).select("a").style("color", (d, i, n) => color_scale(n[i].textContent.replace(".", "")) > 0.6 ? "white" : "black");