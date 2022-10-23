let year_result = undefined;
let year_result_abs = undefined;

selYear = new Date().getFullYear();

let prevSelYear = undefined;

const localeFormatter = d3.formatLocale({decimal: ',', thousands: '.', grouping: [3], currency: ["€,.2f"]});

const balanceFormatter = localeFormatter.format(",.0f");

const pie_dep = d3.pie()
        .value(d => d.pieValue)
        .sort((a,b) => d3.ascending(a.center_balance, b.center_balance));

const arc_dep = d3.arc().innerRadius(120).outerRadius(220);

let ignore_dep = new Set();

formatData(queryResult);

drawChart();

updateData();

function formatData (queryResult) {

    for (let el of queryResult) {
        el.pieValue = Math.abs(el.center_balance);
        el.center_balance = parseFloat(el.center_balance);
    }

    year_result = d3.sum(queryResult, d => d.center_balance);
    year_result_abs = d3.sum(queryResult, d => d.pieValue);
}

function drawChart () {

    const colorScale_dep = d3.scaleDivergingPow().domain([d3.min(queryResult, d => d.center_balance), 0, d3.max(queryResult, d => d.center_balance)]).range(["green", "lightgrey", "#de0000"]).exponent(0.4);

    const g_departments = d3.select("#pie-chart")
        .selectAll("g.sliceG")
        .data( pie_dep(queryResult) ).join("g").attr("class", "sliceG")
        .attr("transform", "translate(250,250)");

    console.log(g_departments);

    g_departments.append("path").attr("class", "slice")
        .attr("d", d => arc_dep(d))
        .style("fill", d => colorScale_dep(d.data.center_balance))
        .on("mouseenter", function () {d3.select(this).style("filter", "saturate(2)").style("transition", "1s").style("transition-property", "filter")})
        .on("mouseleave", function () {d3.select(this).style("filter", "saturate(1)").style("transition", "1s").style("transition-property", "filter")});

    drawBoxes(pie_dep, arc_dep);
    drawCenter();
    drawLegend(colorScale_dep);

}

function drawBoxes(pie_dep, arc_dep) {

    const g_boxes = d3.select("#pie-chart").append("g")
                        .attr("class", "box").selectAll("g.boxes")
                        .data(pie_dep(queryResult)).join("g").attr("class", "boxes")
                        .attr("transform", "translate(250,250)");

    g_boxes.append("rect").attr("height", 60)
        .attr("x",(d,i) => arc_dep.centroid(d)[0]+5-d.data.acc_description.length*8.5/2)
        .attr("y",(d,i) => arc_dep.centroid(d)[1]-24)
        .attr("rx", 3).attr("ry", 3)
        .attr("width", (d, i) => d.data.pieValue / year_result_abs < 0.05 ? 0 : d.data.acc_description.length*8.5)
        .style("opacity", d => d.data.pieValue / year_result_abs < 0.05 ? 0 : 1);

    const departments_box = g_boxes.append("a").attr("href", d => `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${selYear}-01-01&endeffdate=${selYear}-12-31&costcenter=&docnum=&usercode=&acccenter=${d.data.acc_center}&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=PL`)
                                .append('text')
                                .attr("x",(d,i) => arc_dep.centroid(d)[0]+5)
                                .attr("y",(d,i) => arc_dep.centroid(d)[1])
                                .attr("text-anchor", "middle");

    departments_box.append("tspan")
        .text(d => d.data.pieValue / year_result_abs < 0.05 ? null : d.data.acc_description)
        .attr("dy", 0)
        .attr("x", (d, i, n) => parseFloat(n[i].parentNode.getAttribute("x")));

    departments_box.append("tspan")
        .text(d => d.data.pieValue / year_result_abs < 0.05 ? null : balanceFormatter(d.data.center_balance) + " €")
        .attr("dy", 25)
        .attr("x", (d, i, n) => parseFloat(n[i].parentNode.getAttribute("x")));

    d3.selectAll(".boxes")
        .on("mouseenter", (d, i) => d3.selectAll(".slice").filter((rect_d, rect_i) => rect_i == i.index).style("filter", "saturate(2)").style("transition", "1s").style("transition-property", "filter"))
        .on("mouseleave", (d, i) => d3.selectAll(".slice").filter((rect_d, rect_i) => rect_i == i.index).style("filter", "saturate(1)").style("transition", "1s").style("transition-property", "filter"));

}

function drawCenter() {

    const year_result_box = d3.select("#pie-chart").append("g")
                            .attr("class", "year-result").append("text")
                            .attr("transform", "translate(250,240)")
                            .style("text-anchor", "middle");

    year_result_box.append("tspan")
        .text("Period result:")
        .attr("x", 0)
        .attr("y", 0);

    year_result_box.append("tspan")
        .text(balanceFormatter(year_result) + " €")
        .attr("x", 0)
        .attr("y", 30);

}

function drawLegend(colorScale_dep) {

    const legendSpans = d3.select("#chart_legend").selectAll("span.legendBox")
                            .data(queryResult).join("span").attr("class", "legendBox");

    legendSpans.append("svg").attr("width", 30)
                .attr("height", 15).append("rect")
                .attr("width", 30).attr("height", 15)
                .style("fill", d => colorScale_dep(d.center_balance))
                .on("click", function (el, d) {
                    ignore_dep.has(d.acc_description) ? ignore_dep.delete(d.acc_description) : ignore_dep.add(d.acc_description);
                    d3.select(this).classed("greyedOut", !d3.select(this).classed("greyedOut"));
                    d3.select(this.parentElement.nextElementSibling).classed("striked", !d3.select(this.parentElement.nextElementSibling).classed("striked"));
                    updateChart(queryResult, "department");
                });

    legendSpans.append("span").attr("height", 15)
                .style("padding", "0px 10px").text(d => d.acc_description)
                .on("click", function (el, d) {
                    ignore_dep.has(d.acc_description) ? ignore_dep.delete(d.acc_description) : ignore_dep.add(d.acc_description);
                    d3.select(this).classed("striked", !d3.select(this).classed("striked"));
                    d3.select(this.previousElementSibling.children[0]).classed("greyedOut", !d3.select(this.previousElementSibling.children[0]).classed("greyedOut"));
                    updateChart(queryResult, "department");
                });
}

function updateData () {

    document.getElementById("updateButton").addEventListener("click", () => {

        prevSelYear = selYear;

        selYear = document.querySelector("select").value;

        ignore_dep.clear();

        d3.selectAll(".legendBox span").classed("striked", false);
        d3.selectAll(".legendBox rect").classed("greyedOut", false);

        let request = new XMLHttpRequest();
        request.open('GET', `getDepartmentData?year=${selYear}`, true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function() {

            if (JSON.parse(this.response).name=="error") {
                return window.alert("Error retrieving chart data");
            }

            queryResult = eval(this.response);

            formatData(queryResult);

            updateChart(queryResult, "year");

        }

        request.send();
    });
    
}

function updateChart(queryResult, change) {

    const colorScale_dep = d3.scaleDivergingPow().domain([d3.min(queryResult, d => d.center_balance), 0, d3.max(queryResult, d => d.center_balance)]).range(["green", "lightgrey", "#de0000"]).exponent(0.4);

    const legendSpans = d3.select("#chart_legend").selectAll("span.legendBox").data(queryResult).join("span").attr("class", "legendBox");

    legendSpans.select("svg rect").transition().duration(750).style("fill", d => colorScale_dep(d.center_balance));

    legendSpans.select("span").text(d => d.acc_description);

    queryResult = queryResult.filter(d => !ignore_dep.has(d.acc_description));

    let updated_year_result_abs = d3.sum(queryResult, d => d.pieValue);

    d3.select(".box").selectAll("g.boxes").data(pie_dep(queryResult)).join(enter => enter.append("g").each(function() {

        d3.select(this).append("rect");
        let a_el = d3.select(this).append("a");
        let text_el = a_el.append("text");
        text_el.append("tspan");
        text_el.append("tspan");

    })).attr("class", "boxes").attr("transform", "translate(250,250)").each(function() {

        d3.select(this).select("rect").transition().duration(750)
            .attr("height", 60)
            .attr("rx", 3).attr("ry", 3)
            .attr("x",(d,i) => arc_dep.centroid(d)[0]+5-d.data.acc_description.length*8.5/2)
            .attr("y",(d,i) => arc_dep.centroid(d)[1]-24)
            .attr("width", (d, i) => d.data.pieValue / updated_year_result_abs < 0.05 ? 0 : d.data.acc_description.length*8.5)
            .style("opacity", d => d.data.pieValue / updated_year_result_abs < 0.05 ? 0 : 1);

        d3.select(this).select("a")
            .attr("href", d => `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${selYear}-01-01&endeffdate=${selYear}-12-31&costcenter=&docnum=&usercode=&acccenter=${d.data.acc_center}&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=PL`);

        d3.select(this).select("text")
            .style("opacity", (d, i, n) => n[i].style.opacity == 0 ? 0 : 1)
            .transition().duration(prevSelYear == selYear && change == "year" ? 0 : 750)
            .style("text-anchor", "middle")
            .attr("x",(d,i) => arc_dep.centroid(d)[0]+5)
            .attr("y",(d,i) => arc_dep.centroid(d)[1])
            .style("opacity", d => d.data.pieValue / updated_year_result_abs < 0.05 ? 0 : 1);

        d3.select(this).select("tspan:first-of-type")
            .text(d => d.data.pieValue / updated_year_result_abs < 0.05 ? null : d.data.acc_description)
            .transition().duration(750)
            .attr("x", (d, i, n) => arc_dep.centroid(d)[0]+5);

        d3.select(this).select("tspan:nth-of-type(2)")
            .text(d => d.data.pieValue / updated_year_result_abs < 0.05 ? null : balanceFormatter(d.data.center_balance) + " €")
            .transition().duration(750)
            .attr("x", (d, i, n) => arc_dep.centroid(d)[0]+5)
            .attr("dy", 25);

    });
        
    d3.select(".year-result tspan:nth-of-type(2)").text(balanceFormatter(year_result) + " €");

    let new_data = pie_dep(queryResult);

    d3.selectAll("#pie-chart path").transition()
    .duration(750)
    .attrTween("d", (d, i) => {

                            var interpolate_start = d3.interpolate(d.startAngle, new_data[i] ? new_data[i].startAngle : Math.PI*2);
                            var interpolate_end = d3.interpolate(d.endAngle, new_data[i] ? new_data[i].endAngle : Math.PI*2);
                        
                            return function(t) {
                        
                                d.startAngle = interpolate_start(t);
                                d.endAngle = interpolate_end(t);
                    
                                return arc_dep(d);
                            };
                        }
        
    ).style('fill', (d, i) => new_data[i] ? colorScale_dep( new_data[i].data.center_balance) : "transparent");

    setTimeout(function () {
        d3.selectAll("#pie-chart path").data(new_data);
    }, 800);

}