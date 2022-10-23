let bar_button = document.getElementById("bar_button");
let line_button = document.getElementById("line_button");
let bar_chart = document.getElementById("bar_chart");
let line_chart = document.getElementById("line_chart");
let line_chart_legend = document.getElementById("line_chart");

bar_button.addEventListener("click", () => {
    bar_button.disabled=true;
    line_chart.classList.toggle("d-none");
    bar_chart.classList.toggle("d-none");
    bar_chart_legend.classList.toggle("d-none");
    line_button.disabled=false;
})

line_button.addEventListener("click", () => {
    line_button.disabled=true;
    line_chart.classList.toggle("d-none");
    bar_chart.classList.toggle("d-none");
    bar_chart_legend.classList.toggle("d-none");
    bar_button.disabled=false;
})

let input_data = d3.rollups(queryResult, v => d3.sum(v, d => parseFloat(d.balance)), d => d.year_sel);

const max_input_data = d3.max(input_data, d => Math.abs(d[1]))+10000000;

const width = 500;
const height = 180;
const marginX = 30;
const marginY = 15;

let tooltipWidth = 80;
let tooltipHeigth = 40;

const localeFormatter = d3.formatLocale({decimal: ',', thousands: '.', grouping: [3], currency: ["€,.2f"]});

const xAxisFormatter = localeFormatter.format(".0f");

const textLabelFormatter = localeFormatter.format(",.2f");

const scaleX = d3.scaleLinear().domain(d3.extent(input_data, d => d[0])).range([marginX, width-marginX]);

const scaleY = d3.scaleLinear().domain([-max_input_data, max_input_data]).range([marginY, height-marginY]).nice();

drawAxes(input_data);

draw(input_data);

drawTooltip("#line_chart", "balanceTooltip");

function drawTooltip(chartSelect, tooltipSelect) {

    const tooltip = d3.select(chartSelect)
        .append("g")
        .attr("class", tooltipSelect)
        .attr("opacity", 0);

    tooltip.append("rect")
        .attr("width", 80)
        .attr("height", 40)
        .attr("rx", 3).attr("ry", 3);

    tooltip.append("text").attr("class", "year").attr("y", 10).style("text-anchor", "middle");
    tooltip.append("text").attr("class", "title").attr("y", 22).style("text-anchor", "middle");
    tooltip.append("text").attr("class", "balance").attr("y", 34).style("text-anchor", "middle");

}

function drawAxes(input_data) {

    const axisX = d3.axisBottom(scaleX).tickSize(height-marginY*2+4).tickSizeOuter(0).ticks(input_data.length).tickFormat(xAxisFormatter);

    const axisY = d3.axisLeft(scaleY).tickSize(width-marginX*2+5).tickSizeOuter(0).tickFormat(d => xAxisFormatter(d/1000000)+" M").tickPadding(5);

    const axes = d3.select("#line_chart").append("g").attr("class", "axes");

    axes.append("g").attr("transform", `translate(0, ${marginY})`).attr("class", "x-axis").call(axisX);

    axes.append("g").attr("transform", `translate(${width-marginX}, 0)`).attr("class", "y-axis").call(axisY);

    d3.selectAll(".domain").remove();

}

function draw() {

    const line = d3.line().x(d => scaleX(d[0])).y(d => scaleY(d[1]));

    const star = d3.symbol().type(d3.symbolTriangle).size(15);

    d3.select("#line_chart").append("g").attr("class", "line").append("path")
        .datum(input_data)
        .attr("d", line)
        .style("fill", "none");

    d3.select(".y-axis .domain")
        .attr("transform", `translate(${-width+marginX*2}, 0)`)

    const g_elements = d3.select("#line_chart").append("g").attr("class", "elements");

    g_elements.selectAll("path.symbol")
        .data(input_data)
        .join("path").attr("class", "symbol")
        .attr("d", star)
        .style("fill", d => d[1] > 0 ? "#de0000" : "green")
        .attr("transform", d => d[1] > 0 ? `translate(${scaleX(d[0])}, ${scaleY(d[1])}) rotate(180)` : `translate(${scaleX(d[0])}, ${scaleY(d[1])}) rotate(0)`)
        .on("mouseenter", (d, i) => showTooltip(d, i))
        .on("mouseleave", (d, i) => clearTooltip(d, i));

    g_elements.selectAll("a.balanceLink")
        .data(input_data)
        .join("a").attr("class", "balanceLink").attr("href", d => `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${d[0]}-01-01&endeffdate=${d[0]}-12-31&costcenter=&docnum=&usercode=&acccenter=&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=PL`)
        .each(function(d, i) {
            
            d3.select(this)
                .append("text")
                .attr("class", "balance")
                .text(textLabelFormatter(d[1]/1000000))
                .style("fill", d[1] > 0 ? "#de0000" : "green")
                .attr("transform",`translate(${scaleX(d[0])}, ${scaleY(d[1])+11})`)
                .style("text-anchor", "middle");
        })
        .on("mouseenter", (d, i) => showTooltip(d, i))
        .on("mouseleave", (d, i) => clearTooltip(d, i));

}

function showTooltip (d, i) {

    d3.selectAll("#line_chart .symbol").filter((data) => data[0] == i[0]).style("fill", "blue");

    const text1 = d3.select(".balanceTooltip .year").text(i[0]).style("font-weight", "bold");
    const text2 = d3.select(".balanceTooltip .title").text(i[1] < 0 ? "Net profit" : "Net loss");
    const text3 = d3.select(".balanceTooltip .balance").text(textLabelFormatter(i[1]/1000)+ " K").style("fill", i[1] > 0 ? "#de0000" : "green");

    const boxWidth = 10 + d3.max([text1.node().getComputedTextLength(), text2.node().getComputedTextLength(), text3.node().getComputedTextLength()]);

    d3.select(".balanceTooltip rect").attr("width", boxWidth);
    
    d3.select(".balanceTooltip").attr("transform", `translate(${scaleX(i[0])-boxWidth/2}, ${scaleY(i[1])-45})`).transition().duration(500).attr("opacity", 1);

    text1.attr("x", boxWidth/2);
    text2.attr("x", boxWidth/2);
    text3.attr("x", boxWidth/2);

}

function clearTooltip (d, i) {

    d3.selectAll("#line_chart .symbol").filter((data) => data[0] == i[0]).style("fill", (data, pos) => data[1] > 0 ? "#de0000" : "green");

    d3.select(".balanceTooltip").transition().duration(500).attr("opacity", 0);

}

//bar chart

let bar_data = new Array();

let bar_width = 30;

let rect_width = 23;

let rect_height = 7;

const pos_colors = ["#de0000", "#ff4040", "#ff6961"];

const neg_colors = ["#008000", "#3aab3a", "#74c365"];

const barLabelFormatter = localeFormatter.format(",.1f");

let scaleX_bar = undefined, scaleY_bar = undefined, legendData = undefined, neg_data_length = undefined, max_value = undefined;

let ignore_dep = new Set();

d3.select("#bar_chart").insert("g").attr("class", "elementsGroup")

drawBarChart(transformBarData(queryResult, "init"), "init");

drawTooltip("#bar_chart", "barTooltip");

function drawBarChart(modQueryResult, step) {

    let all_zero = true;

    modQueryResult.forEach((d => d.balance != 0 ? all_zero = false : null));

    if (!all_zero) {

        scaleX_bar = d3.scaleLinear().domain([d3.min(modQueryResult, d => d.year_sel)-0.5, d3.max(modQueryResult, d => d.year_sel)+0.5]).range([marginX, width-marginX]);

        scaleY_bar = d3.scaleLinear().domain([d3.max(modQueryResult, el => el.histogramValue+el.offset), 0]).range([marginY, height-marginY]).nice();

        const axisX = d3.axisBottom(scaleX_bar).tickSize(height-marginY*2+2).tickSizeOuter(0).ticks(10).tickFormat(xAxisFormatter);

        const axisY = d3.axisLeft(scaleY_bar).tickSize(width-marginX*2+5).tickSizeOuter(0).ticks(8).tickFormat(d => max_value < 10000000 ? textLabelFormatter(d/1000000)+" M" : xAxisFormatter(d/1000000)+" M").tickPadding(5);

        d3.selectAll("#bar_chart .axes").remove();

        const axes = d3.select("#bar_chart").append("g").attr("class", "axes");

        axes.append("g").attr("transform", `translate(0, ${marginY})`).attr("class", "x-axis").call(axisX);

        axes.append("g").attr("transform", `translate(${width-marginX}, 0)`).attr("class", "y-axis").call(axisY);

        d3.select(".y-axis .domain").attr("transform", `translate(${-width+marginX*2}, 0)`)

        d3.select(".x-axis .domain").remove();

        drawPeriodResults();

    } 

    d3.select(".elementsGroup").selectAll("g.barGroup")
        .data(modQueryResult).join(
            enter => enter.append("g").each(function() {
            d3.select(this).append("rect");
            d3.select(this).append("a").append("text");
            })
            )
        .attr("class", "barGroup")
        .each(function(d, i, n) {

            d3.select(this).select("rect")
                .attr("x", d => scaleX_bar(d.year_sel)+(d.sign == "plus" ? -33 : 3))
                .attr("width", bar_width)
                .style("stroke", "ghostwhite")
                .style("stroke-width", 0.75);

            if (step=="init") {
                d3.select(this).select("rect")
                    .attr("y", d => scaleY_bar(d.histogramValue+d.offset))
                    .attr("height", d => height - marginY - scaleY_bar(d.histogramValue))
                    .style("fill", (d, i) => d3.filter(legendData, el => el[2] == d.cost_description+`${d.sign == "plus" ? "pos" : "neg"}`)[0][3]);
            }

            if (d.histogramValue/max_value > 0.045) {

                d3.select(this).select("a")
                .attr("href", d => `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${d.year_sel}-01-01&endeffdate=${d.year_sel}-12-31&costcenter=${d.cost_center}&docnum=&usercode=&acccenter=&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=PL`)
                .on("mouseenter", (d, i) => showBarTooltip(d, i))
                .on("mouseleave", (d, i) => clearBarTooltip(d, i));

            }

            d3.select(this).select("text")
                .text(d => d.balance == 0 && !all_zero ? d3.select(this).select("text").node().textContent : textLabelFormatter(d.balance/1000000))
                .style("font-size", "0.35rem")
                .style("text-anchor", "middle")
                .style("user-select", d.histogramValue/max_value < 0.045 ? "none" : null)
                .attr("x", d => scaleX_bar(d.year_sel)+(d.sign == "plus" ? -33 + bar_width/2 : 3 + bar_width/2))
                .transition().duration(step == "init" ? 0 : 750)
                .attr("y", d => scaleY_bar(d.histogramValue/2+d.offset)+2)
                .style("opacity", d => d.histogramValue/max_value < 0.045 || all_zero ? 0 : 1)
                .style("fill", d => Array.from([pos_colors[0], neg_colors[0]]).includes(d3.filter(legendData, el => el[2] == d.cost_description+`${d.sign == "plus" ? "pos" : "neg"}`)[0][3]) ? "white" : "black");
        })

    d3.select(".axes").lower();

    if (step == "subseq") {

        d3.selectAll(".elementsGroup rect")
            .transition().duration(750)
            .attrTween("height", (d, i, n) => {

                let new_data = d3.filter(modQueryResult, el => el.flag == d.cost_description+`${d.sign == "plus" ? "pos" : "neg"}` && el.year_sel == d.year_sel)[0];

                var height_interpolate = d3.interpolate(n[i].height.baseVal.value ? n[i].height.baseVal.value : 0, height - marginY - scaleY_bar(new_data.histogramValue));

                return function(t) {
                            
                    d.height = height_interpolate(t);
        
                    return d.height;
                };
            })
            .attrTween("y", (d, i, n) => {

                let new_data = d3.filter(modQueryResult, el => el.flag == d.cost_description+`${d.sign == "plus" ? "pos" : "neg"}` && el.year_sel == d.year_sel)[0];

                var y_interpolate = d3.interpolate(n[i].y.baseVal.value ? n[i].y.baseVal.value : height - marginY, scaleY_bar(new_data.histogramValue+new_data.offset));

                return function(t) {
                            
                    d.y = y_interpolate(t);
        
                    return d.y;
                };
            })
            .style("fill", (d, i) => d3.filter(legendData, el => el[2] == d.cost_description+`${d.sign == "plus" ? "pos":"neg"}`)[0][3]);

    }
        
    bar_data = [];

}

function showBarTooltip (d, i) {

    const text1 = d3.select(".barTooltip .year").text(i.year_sel).style("font-weight", "bold");
    const text2 = d3.select(".barTooltip .title").text(i.cost_description + `${i.balance > 0 ? " costs" : " revenues"}`);
    const text3 = d3.select(".barTooltip .balance").text(textLabelFormatter(i.balance/1000)+ " K").style("fill", i.balance > 0 ? "#de0000" : "green");

    const boxWidth = 10 + d3.max([text1.node().getComputedTextLength(), text2.node().getComputedTextLength(), text3.node().getComputedTextLength()]);

    d3.select(".barTooltip rect").attr("width", boxWidth);
    
    d3.select(".barTooltip").attr("transform", `translate(${scaleX_bar(i.year_sel)+(i.balance > 0 ? 0 : 35)}, ${scaleY_bar(i.histogramValue/2+i.offset)-tooltipHeigth/2})`).transition().duration(500).attr("opacity", 1);

    text1.attr("x", boxWidth/2);
    text2.attr("x", boxWidth/2);
    text3.attr("x", boxWidth/2);

}

function clearBarTooltip () {

    d3.select(".barTooltip").transition().duration(500).attr("opacity", 0);

}

function drawBarLegend(legendData) {

    const legendSpans = d3.select("#bar_chart_legend").selectAll("span.legendBox")
        .data(legendData).join("span").attr("class", "legendBox");

    legendSpans.append("svg").attr("width", 30)
        .attr("height", 15).append("rect")
        .attr("width", 30).attr("height", 15)
        .style("fill", (d, i) => d[1] > 0 ? pos_colors[i] : neg_colors[i-neg_data_length])
        .on("click", function (el, d) {
            let flag = d[0]+`${d[1]>=0?"pos":"neg"}`;
            ignore_dep.has(flag) ? ignore_dep.delete(flag) : ignore_dep.add(flag);
            d3.select(this).classed("greyedOut", !d3.select(this).classed("greyedOut"));
            d3.select(this.parentElement.nextElementSibling).classed("striked", !d3.select(this.parentElement.nextElementSibling).classed("striked"));
            drawBarChart(transformBarData(queryResult, "subseq"), "subseq");
        });

    legendSpans.append("span").attr("height", 15)
        .style("padding", "0px 10px").text(d => d[1] > 0 ? d[0] + " costs" : d[0] + " revenues")
        .on("click", function (el, d) {
            let flag = d[0]+`${d[1]>=0?"pos":"neg"}`;
            ignore_dep.has(flag) ? ignore_dep.delete(flag) : ignore_dep.add(flag);
            d3.select(this).classed("striked", !d3.select(this).classed("striked"));
            d3.select(this.previousElementSibling.children[0]).classed("greyedOut", !d3.select(this.previousElementSibling.children[0]).classed("greyedOut"));
            drawBarChart(transformBarData(queryResult, "subseq"), "subseq");
        });
}

function transformBarData(queryResult, step) {

    let filteredQueryResult = JSON.parse(JSON.stringify(queryResult));

    for (let el of filteredQueryResult) {
        el.histogramValue = (ignore_dep.has(el.cost_description+`${el.balance>=0 ? "pos" : "neg"}`) ? 0 : Math.abs(el.balance));
        el.sign = el.balance >= 0 ? "plus" : "minus";
        el.balance = (ignore_dep.has(el.cost_description+`${el.balance>=0?"pos":"neg"}`) ? 0 : parseFloat(el.balance));
    }
    
    for (let year of d3.range(d3.min(filteredQueryResult, d => d.year_sel), d3.max(filteredQueryResult, d => d.year_sel)+1)) {
        let positive_results = filteredQueryResult.filter(d => d.year_sel == year && d.sign == "plus").sort((a, b) => d3.descending(a.balance, b.balance));
        let offset = 0;
        let i = 0;
        for (let el of positive_results) {
            el.offset = offset;
            offset += el.balance;
            el.i=i;
            i+=1;
        }
        bar_data = bar_data.concat(positive_results)
        let negative_results = filteredQueryResult.filter(d => d.year_sel == year && d.sign == "minus").sort((a, b) => d3.ascending(a.balance, b.balance));
        offset = 0;
        i = 0;
        for (let el of negative_results) {
            el.offset = offset;
            offset += Math.abs(el.balance);
            el.i=i;
            i+=1;
        }
        bar_data = bar_data.concat(negative_results)
    }

    bar_data.forEach((el, i) => el.flag = el.cost_description+`${el.sign == "plus" ? "pos" : "neg"}`);

    max_value = d3.max(bar_data, d => d.histogramValue + d.offset);

    if (step=="init") {

        let pos_data = d3.rollups(bar_data.filter(d => d.sign == "plus"), v => d3.sum(v, d => d.balance), d => d.cost_description).sort((a, b) => d3.descending(a[1], b[1]));

        let neg_data = d3.rollups(bar_data.filter(d => d.sign == "minus"), v => d3.sum(v, d => d.balance), d => d.cost_description).sort((a, b) => d3.ascending(a[1], b[1]));

        pos_data.forEach((el, i) => {el.push(el[0]+"pos"); el.push(pos_colors[i])});

        neg_data.forEach((el, i) => {el.push(el[0]+"neg"); el.push(neg_colors[i])});
    
        legendData = pos_data.concat(neg_data);
    
        neg_data_length = neg_data.length;

        drawBarLegend(legendData);

    }

    return bar_data;
}

function drawPeriodResults () {

    let periodResultY = height - 10;

    d3.selectAll("#bar_chart .x-axis .tick:nth-child(even)").append("a")
        .attr("href", (d, i) => `/postings?glcode=&description=&startregdate=&endregdate=&starteffdate=${input_data[i][0]}-01-01&endeffdate=${input_data[i][0]}-12-31&costcenter=&docnum=&usercode=&acccenter=&ordernum=&paymode=&supplcode=&countrycode=&fs_pos=PL`)
        .append("text").attr("class", "yearResultBalance")
        .text((d, i) => textLabelFormatter(input_data[i][1]) + " €")
        .attr("y", periodResultY)
        .style("fill", (d, i) => input_data[i][1] > 0 ? "#de0000" : "green");

    d3.select("#bar_chart .x-axis").append("text")
        .text("Year result").attr("x", 15)
        .attr("y", periodResultY)
        .style("fill", "black");
}