var deleteSet = new Set();

if (page!=undefined) {
    document.querySelector
    if (Number(page)==0) {
        document.getElementById("prevbutton").disabled=true;
    }
    document.getElementById("submit-button").addEventListener("click", () => {
        document.getElementById("delete-form").submit();
    });
    document.getElementById("usercode_del").value = document.getElementById("usercode").value;
    document.getElementById("name_del").value = document.getElementById("name").value;
    document.getElementById("surname_del").value = document.getElementById("surname").value;
    document.getElementById("docnum_del").value = document.getElementById("docnum").value;
    document.getElementById("doctype_del").value = document.getElementById("doctype").value;
    document.getElementById("startdate_del").value = document.getElementById("startdate").value;
    document.getElementById("enddate_del").value = document.getElementById("enddate").value;
    document.getElementById("page_del").value = 0;
    document.getElementById("result_n_del").value = result_n;
    document.getElementById("deletebutton").disabled=true
    let nextButton = document.getElementById("nextbutton");
    nextButton.addEventListener("click", () => {
    getData(1);
    })
}

if (page!=undefined) {
    let prevButton = document.getElementById("prevbutton");
    prevButton.addEventListener("click", () => {
    getData(0);
    })
}

if (page!= undefined && page==0) {
    let prevButton = document.getElementById("prevbutton");
    prevButton.disabled=true;
}

for (let el of document.querySelectorAll("td > input")) {
    el.checked=false;
    el.addEventListener("change", checkEvent)
}

function getData(move) {

    if (move==1) {
        page++;
    } else {
        page--;
    }

    let request = new XMLHttpRequest();
    request.open('POST', 'http://127.0.0.1:3000/getDocumentData', true);
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
                for (let j=0; j<6; j++) {
                    if (j!=5) {
                        curr_rows[i].children[j].innerText=data[i-1][j];
                    } else {
                        let cell_date = new Date(data[i-1][j]);
                        curr_rows[i].children[j].innerText=cell_date.toLocaleString("it-IT", {dateStyle:"short"});
                    }
                    let old_check = curr_rows[i].children[6].children[0];
                    if (old_check) {old_check.remove();}
                    if (new Date(data[i-1][j]).toLocaleString("it-IT", {dateStyle:"short"}).slice(6,8) == new Date().toLocaleString("it-IT", {dateStyle:"short"}).slice(6,8)) {
                        let new_el = document.createElement("input");
                        new_el.setAttribute("type", "checkbox");
                        new_el.addEventListener("change", checkEvent);
                        curr_rows[i].children[6].appendChild(new_el);
                    }
                }
            } else {
                for (let j=0; j<6; j++) {
                    curr_rows[i].children[j].innerText="";
                }
                curr_rows[i].children[6].innerText="";
                let old_check = curr_rows[i].children[6].children[0];
                if (old_check) {old_check.remove();} 
            }
        }
        document.getElementById("page_del").value = page;
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
        updateCheckbox();
    };

    request.send(JSON.stringify({page, usercode: document.querySelectorAll("input")[0].value, name: document.querySelectorAll("input")[1].value, surname: document.querySelectorAll("input")[2].value, doctype: document.querySelectorAll("input")[3].value, docnum: document.querySelectorAll("input")[4].value, startdate: document.querySelectorAll("input")[5].value, enddate: document.querySelectorAll("input")[6].value}));

}

function checkEvent (evt) {
    if (evt.currentTarget.checked==true) {
        deleteSet.add(evt.currentTarget.parentElement.parentElement.children[3].innerText);
        document.getElementById("deleteset").value = Array.from(deleteSet).join(',');
        document.querySelector(".modal-body").innerText=`You selected the following documents for deletion: ${Array.from(deleteSet).join(", ")}. Please confirm you choice`;
    } else {
        deleteSet.delete(evt.currentTarget.parentElement.parentElement.children[3].innerText);
        document.getElementById("deleteset").value = Array.from(deleteSet).join(',');
        document.querySelector(".modal-body").innerText=`You selected the following documents for deletion: ${Array.from(deleteSet).join(", ")}. Please confirm you choice`;
    }
    let button = document.getElementById("deletebutton");
    if (deleteSet.size>0) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

function updateCheckbox() {
    for (let el of document.querySelectorAll("tr")) {
        if (deleteSet.has(el.children[3].innerText)) {
            el.children[6].children[0].checked=true;
        }
    }
}

function deleteConfirm() {
    return window.confirm('Would you like to continue?');
}