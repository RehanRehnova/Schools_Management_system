

// universal hosting 
const backendHost = window.location.hostname;
const backendport = 5000;
const BASE_URL = `http://${backendHost}:${backendport}`;


// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    event.target.classList.add('active');

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'performance') updatePerformanceCharts();
}



// -----------------------------------
// Add students
// -----------------------------------
function addStudent() {
    event.preventDefault();

    const imageFile = document.getElementById("imageInput").files[0];

    const formData = new FormData();

    formData.append("name", document.getElementById("studentName").value.trim());
    formData.append("dob", document.getElementById("studentDOB").value);
    formData.append("gender", document.getElementById("studentGender").value);
    formData.append("class_name", document.getElementById("addstudentclass").value);
    formData.append("section", document.getElementById("section").value.trim());
    formData.append("roll_number", document.getElementById("rollNumber").value.trim());
    formData.append("father", document.getElementById("fatherName").value.trim());
    formData.append("phone", document.getElementById("phone").value.trim());
    formData.append("total_fee", document.getElementById("totalFee").value.trim());
    formData.append("session", document.getElementById("session").value.trim());
    formData.append("address", document.getElementById("address").value.trim());
    formData.append("bform", document.getElementById("bform").value.trim());

    if (imageFile) {
        formData.append("image", imageFile);
    }

    if (!formData.get("name") || !formData.get("class_name") || !formData.get("section") || !formData.get("roll_number")) {
        showToast("Please fill in the fields", "error");
        return;
    }
    const loader = document.getElementById("loaderOverlay");
    loader.style.display = "flex";

    fetch(`${BASE_URL}/students`, {
        method: "POST",
        body: formData
    })
        .then(response => {
            loader.style.display = "none";
            if (response.ok) {
                showToast("Student added successfully!");

                document.getElementById("studentName").value = "";
                document.getElementById("studentDOB").value = "";
                document.getElementById("addstudentclass").value = "Select class";
                document.getElementById("section").value = "";
                document.getElementById("rollNumber").value = "";
                document.getElementById("fatherName").value = "";
                document.getElementById("phone").value = "";
                document.getElementById("totalFee").value = "";
                document.getElementById("session").value = "";
                document.getElementById("bform").value = "";
                document.getElementById("address").value = "";
                document.getElementById("studentGender").value = "male";
                document.getElementById("imageInput").value = "";
                document.getElementById("previewImage").src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-HmAlYRaMiTx6PqSGcL9ifkAFxWHVPvhiHQ&s";

            } else {
                showToast("Student already exists", "error");
            }
        })
        .catch(() => {
            loader.style.display = "none";
            showToast("Server error", "error");
        });
}




// -----------------------------------
// Delete student 
// -----------------------------------

var pendingDeleteData = null;

function openConfirm(data = null) {

    let class_name;
    let roll_number;
    let section;

    if (data) {
        class_name = data.class_name;
        roll_number = data.roll_number;
        section = data.section;
    }

    else {
        class_name = document.getElementById("deletestudentclass").value;
        section = document.getElementById("Section").value.trim();
        roll_number = document.getElementById("Rollnumber").value.trim();

        if (!class_name || !roll_number || !section) {
            showToast("Fill all fields first", "error");
            return;
        }
    }


    pendingDeleteData = { "class": class_name, "rollnumber": roll_number };
    document.getElementById("overlay0").style.display = "flex"
    document.getElementById("overlay2").style.display = "none"
    document.getElementById("confirmModal").style.zIndex = "9999";
    document.getElementById("confirmModal").classList.add("show");
}

function closeConfirm() {
    document.getElementById("overlay0").style.display = "none";
    document.getElementById("confirmModal").classList.remove("show");
    pendingDeleteData = null;
}

function confirmDelete() {
    if (!pendingDeleteData) return;


    const webhookUrl = `${BASE_URL}/students/${pendingDeleteData.class}/${pendingDeleteData.rollnumber}`;
    ;

    fetch(webhookUrl, {
        method: "DELETE",
    })
        .then(res => {
            if (res.ok) {
                showToast("Student deleted successfully");
                document.getElementById("deletestudentclass").value = "";
                document.getElementById("Section").value = "";
                document.getElementById("Rollnumber").value = "";
            } else {
                showToast("Student not found", "error");
            }
        })
        .catch(() => showToast("Server error", "error"))
        .finally(closeConfirm);

    document.getElementById("canceldeleteBtn").style.display = "none";
    document.getElementById("deletestudentscard").style.border = "none";


}

// -----------------------------------
// Render students 
// -----------------------------------

let editingStudentId = null;


async function fetchStudents() {
    const class_name = document.getElementById("classfetchfilter").value.trim();
    const roll_number = document.getElementById("rollfetchfilter").value.trim();

    if (roll_number === "") {
        url = `${BASE_URL}/students/${class_name}`
    }
    else {
        url = `${BASE_URL}/student/${class_name}/${roll_number}`
    }

    try {
        const res = await fetch(url, { method: "GET" });


        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
            throw new Error("Expected an array but received something else");
        }

        window.students = data;
        renderStudents();

    } catch (err) {
        console.error("Fetch/render error:", err);
        showToast("Unable to retrieve data", "error");
    }

}




function renderStudents() {

    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No students found</td></tr>`;
        return;
    }
    students.forEach((s, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${s.full_name}</td>
    <td>${s.class_name}</td>
    <td>${s.section}</td>
    <td>${s.roll_number}</td>
    <td>${s.gender.toUpperCase()}</td>
    <td>${s.father_name}</td>
   
         <td>
           <button type="button" class="card-btn" style="background: none; border: none;" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#020000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg>
           </button>
           </td>
           <td>
           <button type="button" style="background: none; border: none; color: red;" onclick="delete_students(${index})">
                  
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a50000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
           </button>
           </td>
    `;


        // btn function 
        const displaycardbtn = row.querySelector(".card-btn");
        displaycardbtn.addEventListener("click", () => { displaystudentcard(s) })
        //

        tbody.appendChild(row);
    });

}


// ------------------------------
// delete student from list
// ------------------------------ 


function delete_students(index) {

    deletingIndex = index;
    const s = students[index];

    document.getElementById("deletestudentscard").style.display = 'block';
    document.getElementById("overlay2").style.display = 'flex';
    document.getElementById("deletestudentclass").value = s.class_name;
    document.getElementById("Section").value = s.section;
    document.getElementById("Rollnumber").value = s.roll_number;


    document.getElementById("deletestudentscard").scrollIntoView({
        behavior: "smooth"
    });
}


// -----------------------------------
// Update students 
// -----------------------------------

let update_data= null

// updating start button ---------
function startUpdate(data) {

    update_data=data
    console.log(data)

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("studentForm").style.display = "block";

    document.getElementById("previewImage").src = data.photo;
    document.getElementById("studentName").value = data.full_name;
    document.getElementById("studentDOB").value = data.dob;
    document.getElementById("bform").value = data.b_form;
    document.getElementById("studentGender").value = data.gender;
    document.getElementById("classheading").style.display="none";
    document.getElementById("addstudentclass").value = data.class_name;
    document.getElementById("section").value= data.section;
    document.getElementById("rollheading").style.display="none";
    document.getElementById("rollNumber").value = data.roll_number;
    document.getElementById("fatherName").value = data.father_name;
    document.getElementById("session").value = data.session || "N/A";
    document.getElementById("totalFee").value = data.total_fee || "N/A";
    document.getElementById("phone").value = data.contact;
    document.getElementById("address").value = data.address;

    document.getElementById("addBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";


}

// main Update func ---------

function updateStudent() {
   

    const updated = {
        name: document.getElementById("studentName").value.trim(),
        photo: document.getElementById("previewImage").src,
        class_name: document.getElementById("addstudentclass").value,
        section: document.getElementById("section").value.trim(),
        b_form: document.getElementById("bform").value.trim(),
        gender: document.getElementById("studentGender").value.trim(),
        roll_number: document.getElementById("rollNumber").value.trim(),
        class_name: document.getElementById("addstudentclass").value.trim(),
        father: document.getElementById("fatherName").value.trim(),
        address: document.getElementById("address").value.trim(),
        dob: document.getElementById("studentDOB").value.trim(),
        contact: document.getElementById("phone").value.trim()
    };

    const loader = document.getElementById("loaderOverlay");
    loader.style.display = "flex";

    const url = `${BASE_URL}/students/${updated.class_name}/${updated.roll_number}`;

    fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
    })
        .then(res => {
            loader.style.display = "none";

            if (res.status === 404) {
                showToast("Student not found", "error");
                return null;
            }
            if (!res.ok) {;
                showToast("Invalid update", "error");
                return null;
            }
            return res.text(); // ← safe even if empty
        })
        .then(data => {
            if (data === null) return ;
            showToast("Student updated");
            resetFormState();
        })
        .catch(err => {
            loader.style.display = "none";

            console.error(err);
            showToast("Server error", "error");
        });
}

function resetFormState() {
    editingIndex = null;

    document.getElementById("studentName").value = "";
    document.getElementById("addstudentclass").value = "";
    document.getElementById("section").value = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("fatherName").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("studentDOB").value = "";


    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("updatelabel").style.display = "none";
    document.getElementById("addBtn").style.display = "inline-block";
    document.getElementById("addlabel").style.display = "inline-block";
    document.getElementById("addstudentclass").style.display = "inline-block";
    document.getElementById("rollNumber").style.display = "inline-block";
    document.getElementById("classheading").style.display = "inline-block";
    document.getElementById("rollheading").style.display = "inline-block";

    closeCard("update_reset");
}

// add fee btn

function addfee_fromcard(s){
	
	showToast("Feature coming soon", "notify")
	
	
	}


// cancel button func-------

function canceldelete() {

    editingIndex = null;

    document.getElementById("deletestudentclass").value = "";
    document.getElementById("Section").value = "";
    document.getElementById("Rollnumber").value = "";

    document.getElementById("canceldeleteBtn").style.display = "none";
    document.getElementById("deletestudentscard").style.border = "none";

    showToast("Delete cancelled", "notify");
}


// ----------------------------------------
// Fee submission
// ----------------------------------------


function addfee() {
    const feedata = {
        class_name: document.getElementById("classforfee").value,
        section: document.getElementById("Sectionforfee").value,
        roll_number: document.getElementById("Rollnumberforfee").value,
        paid_on: document.getElementById("feedate").value,
        month: document.getElementById('feemonth').value,
        amount: document.getElementById('amount').value,
        method: document.getElementById('paymentmethod').value,
        dues: document.getElementById('Dues').value,
    };

    if (!feedata.roll_number || !feedata.class_name || !feedata.section || !feedata.paid_on || !feedata.month || !feedata.amount || !feedata.dues) {
        showToast("Fill the fields first", "error")
        return;
    }

    fetch(`${BASE_URL}/add-fee-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(feedata)
    })

        .then(res => {
            if (res.status === 404) {
                showToast("Student not found", "error");
                return null;
            }
            if (!res.ok) {
                showToast("database error", "error");
                return null;
            }
            return res.text();
        })
        .then(data => {
            if (data === null) return;
            showToast("Record Added successfully");
            reset_fee_form();
            fetchfeedetails(feedata)
        })
        .catch(err => {
            console.error(err);
            showToast("Server error", "error");
        });
}

function reset_fee_form() {
    document.getElementById("classforfee").value = "";
    document.getElementById("Sectionforfee").value = "";
    document.getElementById("Rollnumberforfee").value = "";
    document.getElementById("feedate").value = "";
    document.getElementById("feemonth").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("Dues").value = "";
    document.getElementById("paymentmethod").value = "";
}


let feedetails = [];

async function fetchfeedetails(feedata) {

    const data = feedata

    try {
        const url = `${BASE_URL}/feedetails`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log("HTTP status:", res.status);

        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const responseData = await res.json();

        renderStudentsforfee(responseData);

    } catch (err) {
        console.error("Error fetching fee details:", err);
        showToast("Unable to fetch fee details", "error");
    }
}

function renderStudentsforfee(responseData) {
    document.getElementById("showfeetable").style.display = "block";
    const tbody = document.querySelector("#showfeetable tbody");
    tbody.innerHTML = "";

    if (!responseData || responseData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No records found</td></tr>`;
        return;
    }

    responseData.reverse().forEach((s) => {
        const row = document.createElement("tr");

        row.innerHTML = `<td>${s.full_name}</td>
        <td>${s.class_name}</td>
        <td>${s.roll_number}</td>
        <td>${s.month.toUpperCase()}</td>
                <td style="color:green; font-weight:600;">Rs. ${s.amount}</td>
                <td>${s.paid_on}</td>
            <td style="color:#ff392bff; font-weight:300; border-radius:30px; ">Rs. ${s.dues}</td>
            `;

        tbody.appendChild(row);
    });

    const firstrow = tbody.querySelector("tr:first-child");
    if (firstrow) {
        const duescell = firstrow.querySelector("td:nth-child(7)");
        const originalContent = duescell.textContent;
        duescell.innerHTML = `
      <span style='color:red; font-weight:600'>${originalContent}</span>
      <span style='color: black;font-weight:300'>( Current )</span>
      `;

    }
}



// General rendering 


async function fetchstudentsfee(data = null) {
    let class_name;
    let roll_number;
    let month;
    if (data) {
         class_name = data.class_name;
         roll_number = data.roll_number;
         month = data.month
    }
    else {
         class_name = document.getElementById("feeclassfilter").value.trim()
         roll_number = document.getElementById("feerollfilter").value
         month = document.getElementById("feemonthfilter").value.trim()
    }
    let payload = {};

    if (class_name) payload.class_name = class_name;
    if (roll_number) payload.roll_number = roll_number;
    if (month) payload.month = month;

    try {
        const url = `${BASE_URL}/allfeedetails`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });


        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const responseData = await res.json();

        if (responseData === null || responseData.length === 0) {
            showToast("No records found", "notify");
        } else {
            handle_response(responseData);
        }

    } catch (err) {
        console.error("Error fetching fee details:", err);
        showToast("Unable to fetch fee details", "error");
    }
}

// handle response function 

function handle_response(responseData) {


    if (responseData[0].mode === "student_view") {

        renderStudentView(responseData);
        document.getElementById("printbtn").onclick = (event) => {
            printReceipt(responseData);
        };

    } else {

        generalrenderforfee(responseData);
        console.trace("general render was called")
        const section = document.getElementById("feecard");
        section.style.display = "none";

    }
}




function renderStudentView(responseData) {

    const section = document.getElementById("feecard");
    section.style.display = "grid";

    document.getElementById("feepagetable").style.display = "none";
    backbtninfee.style.display = "inline-block";
    printbtn.style.display = "inline-block";
    reminderbtn.style.display = "inline-block";



    const student = responseData || [];


    document.getElementById("nameofstudent").innerHTML =
        student[0].name || student[0].full_name + ' <span class="tag">STUDENT</span>';

    document.getElementById("rollofstudent").textContent =
        "ROLL No: " + student[0].roll_no || student[0].roll_number;

    document.getElementById("classofstudent").textContent =
        "CLASS: " + student[0].class || student[0].class_name;

    document.querySelector(".phone").textContent =
        student[0].phone || student[0].contact || "N/A";

    const avatarImg = document.querySelector(".avatar img");
    if (student[0].picture) {
        avatarImg.src = student[0].picture || "";
    }

    document.getElementById("totalFeeDisplay").textContent =
        student[0].fee + " PKR";


    const tbody = document.querySelector(".fee-table tbody");
    tbody.innerHTML = "";

    const hasTransactions = Array.isArray(student) && student.some(tx => tx.month !== null);

    if (!hasTransactions) {
        tbody.innerHTML =
            `<tr><td colspan="6" style="text-align:center;">No transactions found</td></tr>`;
    } else {


    document.getElementById("monthname").textContent = student[0].month.toUpperCase();


        student.forEach(tx => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${tx.month.toUpperCase()}</td>
                <td>${tx.type || "-"}</td>
                <td>${tx.reason || "-"}</td>
                <td class="discount-col">${tx.discount || 0}</td>
                <td style="color:green; font-weight:bold;">${tx.amount}</td>
                <td>${tx.date}</td>
            `;

            tbody.appendChild(tr);
        });
    }



    let totalPaid = 0;
    student.forEach(tx => {
        totalPaid += Number(tx.amount) || 0;
    });
    document.getElementById("studentTotalPaid").textContent =
        "Rs. "+totalPaid;

    document.getElementById("studentTotalDue").textContent =
        "Rs. "+student[0].dues;


    let status;
    document.getElementById("studentStatus").textContent = status;
    const badge = document.createElement("span");
    if (totalPaid == 0) {
        status = "Due";
    }

    else if (student[0].dues == 0) {
        status = "Paid";
    }
    else {
        status = "Partial";
    }


    badge.classList.add("status-badge");

    if (status === "Paid") {
        badge.classList.add("status-paid2")
    }
    else if (status === "Due") {
        badge.classList.add("status-due2")
    }
    else {
        badge.classList.add("status-partial2")
    }

    badge.textContent = status;
    document.getElementById("studentStatus").appendChild(badge)
}



// General render  

function generalrenderforfee(responseData) {

    const table = document.getElementById("generalfeeTable");
    table.innerHTML = ""; // reset

    if (!responseData || responseData.length === 0) {
        table.innerHTML = "<tr><td>No data found</td></tr>";
        return;
    }

    // Extract dynamic columns
    const allowedColumns = ["name", "roll", "fee", "amount", "dues", "paid_on"];

    const columns = Object.keys(responseData[0])
        .filter(key => allowedColumns.includes(key));


    // Create header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column.replace(/_/g, "").toUpperCase();
        headerRow.appendChild(th);
    });

    const statusHeader = document.createElement("th");
    statusHeader.textContent = "Status";
    headerRow.appendChild(statusHeader)

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement("tbody");


    responseData.forEach(row => {
        const tr = document.createElement("tr");
        tr.addEventListener("click", () => {
            renderStudentBadge(row); // Send the row's info to the badge renderer
        });



        const statusCell = document.createElement("td");

        const badge = document.createElement("span");
        let status;
        if (row.amount == 0) {
            status = "Due";
        }

        else if (row.dues == 0) {
            status = "Paid";
        }
        else {
            status = "Partial";
        }


        badge.classList.add("badge");

        if (status === "Paid") {
            badge.classList.add("badge-green")
        }
        else if (status === "Due") {
            badge.classList.add("badge-red")
        }
        else {
            badge.classList.add("badge-orange")
        }

        badge.textContent = status;
        statusCell.appendChild(badge)


        columns.forEach(column => {

            const td = document.createElement("td");
            responseData.forEach(row => {
                const tr = document.createElement("tr");
                let cellValue = row[column] ?? "";
                if (column == "month") {
                    cellValue = cellValue.toUpperCase();
                }
                if (column === "dues" && parseFloat(cellValue) > 0) {
                    td.style.color = "red";
                    td.style.fontWeight = "bold";
                }
                if (column === "amount") {
                    td.style.textAlign = "left";
                    td.style.color = "green";
                    td.style.fontWeight = "bold";
                }

            })

            td.textContent = row[column] ?? "";

            tr.appendChild(td);
            tr.appendChild(statusCell);

        });

        tbody.appendChild(tr);
    });


    table.appendChild(tbody);
}




// ------------------------------
//    Toast message
// ------------------------------
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;

    toast.className = "toast show";
    if (type === "error") toast.classList.add("error");
    if (type === "notify") toast.classList.add("notify");

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

function backbtn_in_feepage() {

    const section = document.getElementById("feecard");
    section.style.display = "none";

    document.getElementById("feepagetable").style.display = "block";
    document.getElementById("backbtninfee").style.display = "none";
    printbtn.style.display = "none";
    reminderbtn.style.display = "none";
}

function studentcard() {
    resetFormState();
    document.getElementById("overlay").style.display = "flex";
    document.getElementById("studentForm").style.display = "block";
    document.getElementById("studentForm").scrollIntoView({
        behavior: "smooth"
    });

}

function delete_student_card() {
    document.getElementById("overlay2").style.display = "flex";
    document.getElementById("deletestudentscard").style.display = "block";
    document.getElementById("deletestudentscard").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("studentName").value = "";
    document.getElementById("addstudentclass").value = "";
    document.getElementById("section").value = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("fatherName").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("studentDOB").value = "";
}

function closeCard(id) {
    
    if (id==="update_reset"){
        document.getElementById("studentName").value = "";
                document.getElementById("studentDOB").value = "";
                document.getElementById("section").value = "";
                document.getElementById("rollNumber").value = "";
                document.getElementById("fatherName").value = "";
                document.getElementById("phone").value = "";
                document.getElementById("totalFee").value = "";
                document.getElementById("session").value = "";
                document.getElementById("bform").value = "";
                document.getElementById("address").value = "";
                document.getElementById("studentGender").value = "male";
                document.getElementById("imageInput").value = "";
                document.getElementById("previewImage").src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-HmAlYRaMiTx6PqSGcL9ifkAFxWHVPvhiHQ&s";
    }
    
    else{document.getElementById(id).style.display = "none";
    document.getElementById("deletestudentclass").value = "";
    document.getElementById("Section").value = "";
    document.getElementById("Rollnumber").value = "";
    document.getElementById("addBtn").style.display = "inline-block";
    document.getElementById("updateBtn").style.display = "none";}
}


// display student crad---- 
let data=null
function displaystudentcard(s) {

    data = s || {};

    document.getElementById("studentcard").style.display = "block";
    const tab=document.getElementById("tab-transactions")
    tab.classList.remove("active")

     const tbody = document.querySelector("#tab-fee-table tbody");
    tbody.innerHTML = "";


    document.getElementById("studentcard").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("studentavatar").src = data.photo || "N/A";
    document.getElementById("feeincard").textContent = "Rs."+data.total_fee || "N/A";
    document.getElementById("studentname").textContent = data.full_name || "N/A";
    document.getElementById("studentclass").textContent = "Class:" + data.class_name || "N/A";
    document.getElementById("studentcontact").textContent = data.contact || "N/A";
    document.getElementById("studentaddress").textContent = data.address || "N/A";
    document.getElementById("studentroll").textContent = data.roll_number || "N/A";
    document.getElementById("studentsection").textContent = data.section || "N/A";
    document.getElementById("studentfather").textContent = data.father_name || "N/A";
    document.getElementById("studentdob").textContent = data.dob || "N/A";
    document.getElementById("studentgender").textContent = data.gender.toUpperCase() || "N/A";
    document.getElementById("studentbform").textContent = data.b_form || "N/A";
    document.getElementById("studentenrollmentdate").textContent = data.enroll_date || "N/A";
    document.getElementById("studentcontactincard").textContent = data.contact || "N/A";

    const deletebtn_incard = document.getElementById("incard_deletebtn");


    deletebtn_incard.addEventListener("click", () => {
        openConfirm(data)
        
    });
    
    document.getElementById("edit-btn").addEventListener("click", ()=> {
        startUpdate(data);

    });
    
    document.getElementById("add-fee-btn").addEventListener("click", ()=> {
        addfee_fromcard(data);

    });
    
    document.getElementById("printStudentcard").onclick = (event) => {
            printStudentcard(data);
        };

    

    const tabs = document.querySelectorAll(".tab-panel");

    const tabFunctions = {
        "tab-transactions": function () {
            const feedata = { roll_number: data.roll_number, class_name: data.class_name };
            fetchstudentsfeefortab(feedata)

        },
        "tab-attendance": function () {
            
        },
        "tab-results": function () {
        },
    };

    tabs.forEach(tab => {
        const observer = new MutationObserver(() => {
            if (tab.classList.contains("active")) {
                const func = tabFunctions[tab.id];
                if (func) func();
            }
        });

        observer.observe(tab, { attributes: true });
    });


}

// transaction tab function 

async function fetchstudentsfeefortab(feedata) {

    let payload = {};

    if (feedata.class_name) payload.class_name = feedata.class_name;
    if (feedata.roll_number) payload.roll_number = feedata.roll_number;
    if (feedata.month) payload.month = feedata.month;

    try {
        const url = `${BASE_URL}/allfeedetails`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });


        if (!res.ok) {
            throw new Error(`Request failed with status ${res.status}`);
        }

        const responseData = await res.json();

        tab_table(responseData);



    } catch (err) {
        console.error("Error fetching fee details:", err);
        showToast("Unable to fetch fee details", "error");
    }
}

function tab_table(responseData) {
    const tbody = document.querySelector("#tab-fee-table tbody");
    tbody.innerHTML = "";

    if (!responseData || responseData.length === 0) {
        tbody.innerHTML = `<tr style="display: flex; justify-content: center;"><td colspan="6">No records found</td></tr>`;
        return;
    }
    responseData.forEach((s) => {
        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${s.full_name || "N/A"}</td>
    <td>${s.roll_number || "N/A"}</td>
    <td>${s.month ? s.month.toUpperCase() : "N/A"}</td>
    <td>${s.discount || "N/A"}</td>
    <td style="color: green; font-weight: bold;">${s.total_paid || "N/A"}</td>
    <td style="color: red; font-weight: bold;">${s.dues || "N/A"}</td>
   
         <td>
           <button type="button" class="details-btn" style="background: none; border: none;" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-info-square-rounded"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9h.01" /><path d="M11 12h1v4h1" /><path d="M12 3c7.2 0 9 1.8 9 9c0 7.2 -1.8 9 -9 9c-7.2 0 -9 -1.8 -9 -9c0 -7.2 1.8 -9 9 -9" /></svg>
           </button>
           </td>
    `;


        // btn function 
        const displaycardbtn = row.querySelector(".details-btn");
        displaycardbtn.addEventListener("click", () => { feecardappend(s) })
        //

        tbody.appendChild(row);
    });
}

function feecardappend(s) {

    showPage('feestablepage')
    document.getElementById("feecard").style.display = "grid";
    document.getElementById("feecard").scrollIntoView({
        behavior: "smooth"
    });
    document.getElementById("feepagetable").style.display = "none";
    backbtninfee.style.display = "inline-block";
    printbtn.style.display = "inline-block";
    reminderbtn.style.display = "inline-block";
    fetchstudentsfee(s)

}


// ===================

function switchStudentTab(id, el) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    el.classList.add('active');
}

function printStudentcard(input) {
    showToast("Feature coming soon", "notify")
};




function printReceipt(input) {
    let data = null;
    data = input;
    const totalfee = data[0].fee;
    console.log(totalfee);
    const totalPaid = data.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

const dues = totalfee - totalPaid;

const time = new Date().toLocaleString('en-US', {day: '2-digit', month: 'long', year : 'numeric', hour : '2-digit', minute: '2-digit'});

const rows = data.map((t, index)=>`
<tr>
<td>${index+1}</td>
<td>${t.month.charAt(0).toUpperCase() + t.month.slice(1)}</td>
<td>${t.amount}</td>
<td>${t.date}</td>
</tr>
`).join('')


    let statusText;
    let statusClass;
    if (totalPaid == 0) {
        statusText  = '✗ Not Paid';
    statusClass = 'due';
    }

    else if (totalPaid == totalfee) {
        statusText  = '✓ Paid in Full';
    statusClass = 'paid';
    }
    else {
       statusText  = '⚠️ Partially Paid';
    statusClass = 'partial';
    }


    const recieptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Fee Receipt – Model School</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #1c1c1c;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Source Sans 3', sans-serif;
      padding: 2.5rem;
    }

    .receipt {
      width: 460px;
      background: #ffffff;
      position: relative;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    }

    /* ── HEADER ── */
    .header {
      background: #0f2a4a;
      padding: 32px 36px 28px;
      position: relative;
      overflow: hidden;
    }

    /* subtle grid texture */
    .header::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .header-inner {
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .school-emblem {
      width: 42px;
      height: 42px;
      border: 2px solid rgba(255,255,255,0.25);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .school-text { flex: 1; padding: 0 16px; }

    .school-name {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.01em;
      line-height: 1.2;
    }

    .school-address {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      margin-top: 5px;
      letter-spacing: 0.03em;
      font-weight: 300;
    }

    .header-right {
      text-align: right;
      flex-shrink: 0;
    }

    .doc-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }

    .doc-title {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      margin-top: 3px;
    }

    /* gold rule */
    .rule {
      height: 1px;
      background: linear-gradient(90deg, transparent, #c9a84c 30%, #c9a84c 70%, transparent);
      position: relative;
    }

    /* ── META STRIP ── */
    .meta {
      background: #f7f6f3;
      padding: 14px 36px;
      display: flex;
      gap: 32px;
      border-bottom: 1px solid #e8e4dc;
    }

    .meta-item { display: flex; flex-direction: column; gap: 2px; }

    .meta-label {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #a09880;
    }

    .meta-value {
      font-size: 12.5px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: 0.02em;
    }

    /* ── BODY ── */
    .body { padding: 28px 36px; }

    /* section heading */
    .section-label {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #0f2a4a;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1.5px solid #0f2a4a;
    }

    /* student info grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
      margin-bottom: 28px;
    }

    .info-item { display: flex; flex-direction: column; gap: 3px; }
    .info-item.span2 { grid-column: 1 / -1; }

    .info-label {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #a09880;
    }

    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 1.3;
    }

    /* ── TABLE ── */
    .table-section { margin-bottom: 24px; }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #ffffff;
      background: #0f2a4a;
      padding: 9px 12px;
      text-align: left;
    }

    thead th:first-child { padding-left: 10px; width: 36px; }
    thead th:last-child { text-align: right; padding-right: 10px; }

    tbody tr:nth-child(even) { background: #f7f6f3; }

    tbody td {
      font-size: 12.5px;
      color: #2a2a2a;
      padding: 10px 12px;
      border-bottom: 1px solid #ede9e1;
      font-weight: 400;
    }

    tbody td:first-child {
      color: #a09880;
      font-size: 11px;
      font-weight: 600;
      padding-left: 10px;
    }

    tbody td:last-child {
      text-align: right;
      font-weight: 600;
      color: #1a1a1a;
      padding-right: 10px;
    }

    /* ── STATUS + TOTAL ── */
    .footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 36px;
      background: #f7f6f3;
      border-top: 1px solid #e8e4dc;
      border-bottom: 1px solid #e8e4dc;
    }

    .status-badge {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 2px;
    }

    .paid   { background: #e6f4ee; color: #1a6b3c; border: 1px solid #a8d8bc; }
    .due { background: #fdecea; color: #b52a1a; border: 1px solid #f0b4ae; }
    .partial{ background: #fef7e6; color: #8a5c0a; border: 1px solid #e8d080; }

    .total-block { text-align: right; }

    .total-label {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #a09880;
    }

    .total-amount {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: #0f2a4a;
      letter-spacing: 0.01em;
      margin-top: 1px;
    }

    /* ── SIGNATURE ── */
    .sig-row {
      padding: 24px 36px 20px;
      display: flex;
      justify-content: flex-end;
    }

    .sig {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      min-width: 130px;
    }

    .sig-space { height: 28px; }

    .sig-line {
      width: 100%;
      height: 1px;
      background: #1a1a1a;
    }

    .sig-label {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #a09880;
    }

    /* ── FOOTER ── */
    .note {
      background: #0f2a4a;
      padding: 11px 36px;
      font-size: 9.5px;
      color: rgba(255,255,255,0.35);
      text-align: center;
      letter-spacing: 0.05em;
      font-weight: 300;
    }
  </style>
</head>
<body>

<div class="receipt">

  <div class="header">
    <div class="header-inner">
      <div class="school-emblem">M</div>
      <div class="school-text">
        <div class="school-name">Model School</div>
        <div class="school-address">123 Education Road, Lahore &nbsp;&nbsp;·&nbsp;&nbsp; 042-12345678</div>
      </div>
      <div class="header-right">
        <div class="doc-label">Official</div>
        <div class="doc-title">Fee Receipt</div>
      </div>
    </div>
  </div>

  <div class="rule"></div>

  <div class="meta">
    <div class="meta-item">
      <span class="meta-label">Receipt No.</span>
      <span class="meta-value">N/A</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Issued on</span>
      <span class="meta-value">${time}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">For Month</span>
      <span class="meta-value">${data[0].month.charAt(0).toUpperCase() + data[0].month.slice(1)}</span>
    </div>
  </div>

  <div class="body">

    <div class="section-label">Student Information</div>

    <div class="info-grid">
      <div class="info-item span2">
        <span class="info-label">Full Name</span>
        <span class="info-value">${data[0].name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Roll Number</span>
        <span class="info-value">${data[0].roll_no}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Class / Section</span>
        <span class="info-value">${data[0].class}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Contact</span>
        <span class="info-value">${data[0].phone || 'N/A'}</span>
      </div>
    </div>

    <div class="table-section">
      <div class="section-label">Payment Details</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Month</th>
            <th>Paid On</th>
            <th>Amount</th>
          </tr>
        </thead>
         <tbody>
        ${rows}
        </tbody>
      </table>
    </div>

  </div>

  <div class="footer-row">
    <span class="status-badge ${statusClass}">${statusText}</span>
    <div class="total-block">
      <div class="total-label">Total Paid</div>
      <div class="total-amount" style='color: green'>${totalPaid}</div>
    </div>
    <div class="total-block">
      <div class="total-label">Total Dues</div>
      <div class="total-amount" style='color: red'>${dues}</div>
    </div>
  </div>

  <div class="sig-row">
    <div class="sig">
      <div class="sig-space"></div>
      <div class="sig-line"></div>
      <div class="sig-label">Cashier Signature</div>
    </div>
  </div>

  <div class="note">
    Computer generated receipt &nbsp;·&nbsp; No stamp required &nbsp;·&nbsp; Keep for your records
  </div>

</div>

</body>
</html>  `;

  let printWindow = null;

  if (printWindow && !printWindow.closed) {
      printWindow.close();
    }
    
 printWindow = window.open('', '_blank', 'width=600,height=800');
printWindow.document.open();
printWindow.document.write(recieptHtml);
printWindow.document.close();


};

function msg_func(){
	showToast("Feature coming soon", "notify")
	}

window.onload = function(){
    load_charts();
}

function load_charts(){
    
                    var options = {
                        series:
                         [{name: 'payment', data: [44, 55, 13, 43, 22]}],
                        // [44, 55, 13, 43, 22],
                        chart: {
                            width: 450,
                            type:'area',

                        },
                        xaxis:{
                            categories: ['Paid', 'Pending', 'Overdue', 'Waived', 'Other']
                        },
                        labels: ['Paid', 'Pending', 'Overdue', 'Waived', 'Other'],
                        responsive: [{
                            breakpoint: 480,
                            options: {
                                chart: {
                                    width: '100%'
                                },
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }]
                    };

                    var chart1 = new ApexCharts(document.getElementById("myChart1"), options);
                    chart1.render();


                    var options = {
                        series:
                        //  [{name: 'payment', data: [44, 55, 13, 43, 22]}],
                        [44, 55, 13, 43, 22],
                        chart: {
                            width: 450,
                            type:'donut',
                        },
                        xaxis:{
                            categories: ['Paid', 'Pending', 'Overdue', 'Waived', 'Other']
                        },
                        labels: ['Paid', 'Pending', 'Overdue', 'Waived', 'Other'],
                        responsive: [{
                            breakpoint: 480,
                            options: {
                                chart: {
                                    width: '100%'
                                },
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }]
                    };
                    var chart2 = new ApexCharts(document.getElementById("myChart2"), options);
                    chart2.render();
                   
                   
                    var options = {
                        series:
                         [{name: 'payment', data: [44, 55, 13, 43, 22]}],
                        // [44, 55, 13, 43, 22],
                        chart: {
                            width: 450,
                            type:'bar',
                        
                        },
                        xaxis:{
                            categories: ['Paid', 'Pending', 'Overdue', 'Waived', 'Other']
                        },
                        labels: ['Paid', 'Pending', 'Overdue', 'Waived', 'Other'],
                        responsive: [{
                            breakpoint: 480,
                            options: {
                                chart: {
                                    width: '100%'
                                },
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }]
                    };
                    var chart3 = new ApexCharts(document.getElementById("myChart3"), options);
                    chart3.render();

}


// Checks for update when page loads
window.addEventListener('load', function() {
    fetch('/check-update')
    .then(r => r.json())
    .then(data => {
        if(data.update_available) {
            document.getElementById('updateBar').style.display = 'block';
        }
    })
    .catch(() => {}); // No internet? Skip silently
});

function doUpdate() {
    // Change bar to show downloading message
    document.getElementById('updateBar').innerHTML = `
        ⏳ Downloading update... 
        Please wait, app will restart automatically.
    `;
    
    // Tell Flask to start downloading
    fetch('/do-update')
    .then(r => r.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(() => {});
}
