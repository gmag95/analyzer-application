let baseWidth = document.querySelector("form").clientWidth;

let toggle_button = document.getElementById("toggler");

toggle_button.addEventListener("click", toggleFunction)

function toggleFunction () {
    document.getElementById("acccenter_lab").classList.toggle("d-none");
    document.getElementById("acccenter").classList.toggle("d-none");
    document.getElementById("ordernum_lab").classList.toggle("d-none");
    document.getElementById("ordernum").classList.toggle("d-none");
    document.getElementById("paymode_lab").classList.toggle("d-none");
    document.getElementById("paymode").classList.toggle("d-none");
    document.getElementById("supplcode_lab").classList.toggle("d-none");
    document.getElementById("supplcode").classList.toggle("d-none");
    document.getElementById("fs_pos_lab").classList.toggle("d-none");
    document.getElementById("fs_pos").classList.toggle("d-none");
    document.getElementById("countrycode_lab").classList.toggle("d-none");
    document.getElementById("countrycode").classList.toggle("d-none");
    if (toggle_button.innerText=="Show options") {
        toggle_button.innerText="Hide options";
        document.querySelector("#input-form div").style.width = "24.77%";
    } else {
        toggle_button.innerText="Show options";
        document.querySelector("#input-form div").style.width = "74.75%";
    }
}

if(document.getElementById("acccenter").value!="" || document.getElementById("ordernum").value!="" || document.getElementById("paymode").value!="" || document.getElementById("supplcode").value!="" || document.getElementById("countrycode").value!="" || document.getElementById("fs_pos").value!="" ) {
    toggleFunction();
}

if (page!=undefined) {
    if (Number(page)==0) {
        document.getElementById("prevbutton").disabled=true;
    }
    let nextButton = document.getElementById("nextbutton");
    nextButton.addEventListener("click", () => {
    getData(1);
    })
    let prevButton = document.getElementById("prevbutton");
    prevButton.addEventListener("click", () => {
    getData(0);
    })
    let tr_elements = document.querySelectorAll("tr");
    for (let tr of tr_elements) {
        for (let i=0; i<6; i++) {
            tr.children[8+i].classList.toggle("d-none");
        }
    }
    let th_elements = document.querySelectorAll("th");
    th_elements[0].style.minWidth = String(baseWidth*0.08)+"px";
    th_elements[1].style.minWidth = String(baseWidth*0.24)+"px";
    th_elements[2].style.minWidth = String(baseWidth*0.04)+"px";
    th_elements[3].style.minWidth = String(baseWidth*0.11)+"px";
    th_elements[4].style.minWidth = String(baseWidth*0.12)+"px";
    th_elements[5].style.minWidth = String(baseWidth*0.12)+"px";
    th_elements[6].style.minWidth = String(baseWidth*0.09)+"px";
    th_elements[7].style.minWidth = String(baseWidth*0.13)+"px";
    th_elements[8].style.minWidth = String(baseWidth*0.07)+"px";
    th_elements[9].style.minWidth = String(baseWidth*0.12)+"px";
    th_elements[10].style.minWidth = String(baseWidth*0.12)+"px";
    th_elements[11].style.minWidth = String(baseWidth*0.12)+"px";
    th_elements[12].style.minWidth = String(baseWidth*0.12)+"px";
    th_elements[13].style.minWidth = String(baseWidth*0.12)+"px";
    document.getElementById("togglecol").addEventListener("click", toggleColumns);
    if(document.getElementById("acccenter").value!="" || document.getElementById("ordernum").value!="" || document.getElementById("paymode").value!="" || document.getElementById("supplcode").value!="" || document.getElementById("countrycode").value!="") {
        document.getElementById("togglecol").click();
    }
}

if (page!= undefined && page==0) {
    let prevButton = document.getElementById("prevbutton");
    prevButton.disabled=true;
}

function getData(move) {

    if (move==1) {
        page++;
    } else {
        page--;
    }

    let request = new XMLHttpRequest();
    request.open('POST', 'http://127.0.0.1:3000/getPostingData', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function() {
        if (JSON.parse(this.response).name=="error") {
            document.getElementById("prevbutton").disabled=true;
            document.getElementById("nextbutton").disabled=true;
            return window.alert("Error retrieving the document data");
        }
        let data = eval(this.response);
        let res_n = data.length;
        let curr_rows = document.querySelectorAll("tr");
        for (let i=1; i<17; i++) {
            if (i<=res_n) {
                for (let j=0; j<14; j++) {
                    if (j==1) {
                        curr_rows[i].children[j].innerText=data[i-1][j].slice(0,42);
                    } else if (j==4 || j==5) {
                        let cell_date = new Date(data[i-1][j]);
                        curr_rows[i].children[j].innerText=cell_date.toLocaleString("it-IT", {dateStyle:"short"});
                    } else if (j==3) {
                        curr_rows[i].children[j].innerText=Number(data[i-1][j]).toLocaleString("it-IT", {minimumFractionDigits: 2, maximumFractionDigits:2})
                    } else {
                        curr_rows[i].children[j].innerText=data[i-1][j];
                    }
                }
            } else {
                for (let j=0; j<14; j++) {
                    curr_rows[i].children[j].innerText="";
                }
            }
        }
        let pageLabel = document.getElementById("page-label");
        pageLabel.innerText=`Page ${page+1} of ${Math.ceil(result_n/16)}`;
        var nextButton = document.getElementById("nextbutton");
        if (16+page*16>=result_n) {
            nextButton.disabled=true;
        } else {
            nextButton.disabled=false;
        }
        var prevButton = document.getElementById("prevbutton");
        if (page==0) {
            prevButton.disabled=true;
        } else {
            prevButton.disabled=false;
        }
    };

    request.send(JSON.stringify({page, glcode: document.querySelectorAll("input")[0].value, description: document.querySelectorAll("input")[1].value, startregdate: document.querySelectorAll("input")[2].value, endregdate: document.querySelectorAll("input")[3].value, starteffdate: document.querySelectorAll("input")[4].value, endeffdate: document.querySelectorAll("input")[5].value, costcenter: document.querySelectorAll("input")[6].value, docnum: document.querySelectorAll("input")[7].value, usercode: document.querySelectorAll("input")[8].value, acccenter: document.querySelectorAll("input")[9].value, ordernum: document.querySelectorAll("input")[10].value, paymode: document.querySelectorAll("input")[11].value, supplcode: document.querySelectorAll("input")[12].value, countrycode: document.querySelectorAll("input")[13].value, fs_pos: document.querySelectorAll("input")[14].value}));

}

function toggleColumns () {
    let tr_elements = document.querySelectorAll("tr");
    for (let tr of tr_elements) {
        for (let i=0; i<6; i++) {
            tr.children[8+i].classList.toggle("d-none");
        }
    }
    if (document.documentElement.clientWidth>1400) {
        document.getElementById("tablebox").classList.toggle("overflow");
    }
    if (document.getElementById("togglecol").innerText=="+") {
        document.getElementById("togglecol").innerText="-";
    } else {
        document.getElementById("togglecol").innerText="+";
        document.querySelector("table").style.width = String(baseWidth)+"px";
    }
    if (document.querySelector("table").style.width) {
        document.querySelector("table").style.width="";
    } else {
        document.querySelector("table").style.width = String(baseWidth*1.72)+"px";
    }
}