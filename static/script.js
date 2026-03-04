

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
                    <img style="height: 25px; width: 25px; border-radius: 50%;" src="https://www.svgrepo.com/show/532387/user-search.svg" alt="">
           </button>
           </td>
           <td>
           <button type="button" style="background: none; border: none; color: red;" onclick="delete_students(${index})">
                    <img style="height: 25px; width: 25px; border-radius: 50%; filter: brightness(0)  invert(20%);" src="https://cdn-icons-png.flaticon.com/512/7709/7709786.png" alt="">
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
    document.getElementById("totalFee").value = data.fee || "N/A";
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


// cancel button func-------

function cancelUpdate() {

    editingIndex = null;

    document.getElementById("studentName").value = "";
    document.getElementById("addstudentclass").value = "";
    document.getElementById("section").value = "";
    document.getElementById("rollNumber").value = "";
    document.getElementById("fatherName").value = "";
    document.getElementById("phone").value = "";

    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("updatelabel").style.display = "none";
    document.getElementById("addBtn").style.display = "inline-block";
    document.getElementById("addlabel").style.display = "inline-block";
    document.getElementById("studentForm").style.border = "none";
    document.getElementById("addstudentclass").style.display = "inline-block";
    document.getElementById("rollNumber").style.display = "inline-block";
    document.getElementById("classheading").style.display = "inline-block";
    document.getElementById("rollheading").style.display = "inline-block";

    showToast("Update cancelled", "notify");
}

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
        showToast("Fill the fields first", "notify")
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

        handle_response(responseData);



    } catch (err) {
        console.error("Error fetching fee details:", err);
        showToast("Unable to fetch fee details", "error");
    }
}

// handle response function 

function handle_response(responseData) {


    if (responseData[0].mode === "student_view") {

        renderStudentView(responseData);
        console.trace("render student was called")


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

    document.getElementById("monthname").textContent =
        student[0].month.toUpperCase() ;

    document.getElementById("totalFeeDisplay").textContent =
        student[0].fee + " PKR";


    const tbody = document.querySelector(".fee-table tbody");
    tbody.innerHTML = "";

    const hasTransactions = student.some(tx => tx.month !== null);

    if (!hasTransactions) {
        tbody.innerHTML =
            `<tr><td colspan="6" style="text-align:center;">No transactions found</td></tr>`;
    } else {

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
        totalPaid;

    document.getElementById("studentTotalDue").textContent =
        student[0].dues;


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


// Student render 




//     responseData.reverse().forEach((s) => {
//         const row = document.createElement("tr");

//         row.innerHTML = `<td>${s.roll_number}</td>
//         <td>${s.class_name}</td>
//         <td>${s.roll_number}</td>
//         <td>${s.month.toUpperCase()}</td>
//                 <td style="color:green; font-weight:600;">Rs. ${s.total_fee}</td>
//                 <td>${s.dues}</td>
//             <td style="color:#ff392bff; font-weight:300; border-radius:30px; ">Rs. ${s.dues}</td>
//             `;

//         tbody.appendChild(row);
//     });

//     const firstrow=tbody.querySelector("tr:first-child");
//     if (firstrow) {
//         const duescell=firstrow.querySelector("td:nth-child(7)");
//         const originalContent=duescell.textContent;
//       duescell.innerHTML=`
//       <span style='color:red; font-weight:600'>${originalContent}</span>
//       <span style='color: black;font-weight:100'>( Current )</span>
//       `;

// }
// }


// Dashboard functions
// function updateDashboard() {
//             document.getElementById('totalStudents').textContent = students.length;
//             document.getElementById('totalTeachers').textContent = teachers.length;
//             const totalFees = students.filter(s => s.feeStatus === 'Paid').reduce((acc, s) => acc + s.amount, 0);
//             document.getElementById('totalFees').textContent = '$' + totalFees;

//             updateFeeChart();
//         }

//         function updateFeeChart() {
//             const paid = students.filter(s => s.feeStatus === 'Paid').length;
//             const pending = students.filter(s => s.feeStatus === 'Pending').length;
//             const overdue = students.filter(s => s.feeStatus === 'Overdue').length;

//             if (feeChart) feeChart.destroy();

//             const ctx = document.getElementById('feeChart').getContext('2d');
//             feeChart = new Chart(ctx, {
//                 type: 'pie',
//                 data: {
//                     labels: ['Paid', 'Pending', 'Overdue'],
//                     datasets: [{
//                         data: [paid, pending, overdue],
//                         backgroundColor: ['#ff392bff', '#f59e0b', '#ef4444']
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false
//                 }
//             });
//         }

//         function updatePerformanceCharts() {
//             // Performance bar chart
//             if (performanceChart) performanceChart.destroy();
//             const ctx1 = document.getElementById('performanceChart').getContext('2d');
//             performanceChart = new Chart(ctx1, {
//                 type: 'bar',
//                 data: {
//                     labels: performanceData.map(p => p.class),
//                     datasets: [{
//                         label: 'Average Score',
//                         data: performanceData.map(p => p.avgScore),
//                         backgroundColor: '#3b82f6'
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     scales: {
//                         y: {
//                             beginAtZero: true,
//                             max: 100
//                         }
//                     }
//                 }
//             });

//             // Student count line chart
//             if (studentCountChart) studentCountChart.destroy();
//             const ctx2 = document.getElementById('studentCountChart').getContext('2d');
//             studentCountChart = new Chart(ctx2, {
//                 type: 'line',
//                 data: {
//                     labels: performanceData.map(p => p.class),
//                     datasets: [{
//                         label: 'Students',
//                         data: performanceData.map(p => p.students),
//                         borderColor: '#10b981',
//                         tension: 0.4
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false
//                 }
//             });

//             renderPerformanceTable();
//         }



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
}

function studentcard() {
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
    document.getElementById("studentenrollmentdate").textContent = data.enrollment_number || "N/A";
    document.getElementById("studentcontact").textContent = data.contact || "N/A";

    const deletebtn_incard = document.getElementById("incard_deletebtn");


    deletebtn_incard.addEventListener("click", () => {
        openConfirm(data)
        
    });
    document.getElementById("edit-btn").addEventListener("click", ()=> {
        startUpdate(data);
    
});

      


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
                    <img style="height: 25px; width: 25px; border-radius: 50%;" src="https://www.svgrepo.com/show/532387/user-search.svg" alt="">
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
    fetchstudentsfee(s)

}


// ===================

function switchStudentTab(id, el) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    el.classList.add('active');
}




//         // Initialize
//         // renderStudentTable();
//         // renderFeeTable();
//         // renderTeacherTable();
//         // renderPerformanceTable();
//         // renderEvents();
//         // renderSchedules();
//         // updateDashboard();