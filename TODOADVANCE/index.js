// For Storing The Present Section 
let maincontent = JSON.parse(localStorage.getItem("MainList")) || [];

// For Storing The Completed Content 
let CompleteTask = JSON.parse(localStorage.getItem("CompleteList")) || [];

// For Storing The Deleted Content 
let DeletedTask = JSON.parse(localStorage.getItem("DeletedList")) || [];

const addtaskbtn = document.querySelector("#addbuttonsfield");
const inputfields = document.querySelector("#inputfields");
const closewindow = document.querySelector("#closewindow");
const mainaddtaskbtn = document.querySelector("#addtask");
const taskitem = document.querySelector("#taskitem");
const inp = document.querySelectorAll(".inp");
const textarea = document.getElementById("autoTextarea");
const deleteall = document.querySelector("#deleteallbuttonsfield");

// Adjust the content box height in the add task window
textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
});

// Open the add task window 
addtaskbtn.addEventListener("click", () => {
    inputfields.style.display = "block";
});

// Close the add task window 
closewindow.addEventListener("click", () => {
    inputfields.style.display = "none";
});

// Add the item in the content section
mainaddtaskbtn.addEventListener("click", () => {
    let obj = {};
    inp.forEach(input => {
        obj[input.name] = input.value;
        input.value = "";
    });
    maincontent.push(obj);
    localStorage.setItem("MainList", JSON.stringify(maincontent));
    viewhandle();
});
viewhandle();

deleteall.addEventListener("click", DeleteEntire);

// Updating the UI section 
function viewhandle() {
    let htmlcontent = maincontent.map((ele, i) => {
        return `
        <div style="align-items:center;display:flex;font-size:2vw; font-weight:bolder;word-spacing: 10px; border:2px solid grey;text-align:justify; height:auto;border-radius:15px; color:white">
            <button class="donebtn" onclick="completeitem(${i})" style="float:right;width:6%;text-shadow:-2px -2px 0 black, 2px -2px 0 black,-2px  2px 0 black, 2px  2px 0 black;height:50%; padding: 5px;font-weight:bolder; background-color: green ; color: white;margin-left:0.25vw; border: none; cursor: pointer">Done</button>
            <p style="width:84%;padding:1vw; border:1px solid grey;border-radius:15px;font-size:1.5vw;font-weight:500">Task Name: ${ele.Title} <br> Content: ${ele.Content}</p>
            
            <button class="deletebtn" onclick="deleteItem(${i})" style="float:left;width:6%; height:50%; padding: 5px; background-color:red;font-weight:bolder;text-shadow:-2px -2px 0 black, 2px -2px 0 black,-2px  2px 0 black, 2px  2px 0 black; color: white; border: none; cursor: pointer">Delete</button>
        </div>
        `;
    }).join(""); // Ensures no commas in the output
    taskitem.innerHTML = htmlcontent;
}

// Marking the task complete 
function completeitem(index) {
    let completedItem = maincontent[index];
    CompleteTask.push(completedItem);
    localStorage.setItem("CompleteList", JSON.stringify(CompleteTask));

    maincontent.splice(index, 1);
    localStorage.setItem("MainList", JSON.stringify(maincontent));
    viewhandle();
}

// Delete the entire task list 
function DeleteEntire() {
    DeletedTask.push(...maincontent);
    localStorage.setItem("DeletedList", JSON.stringify(DeletedTask));

    maincontent.length = 0;
    localStorage.setItem("MainList", JSON.stringify(maincontent));
    viewhandle(); // Refresh UI
}

// Delete a single list item 
function deleteItem(index) {
    let deleteitem = maincontent[index];
    DeletedTask.push(deleteitem);
    localStorage.setItem("DeletedList", JSON.stringify(DeletedTask));
    maincontent.splice(index, 1);
    localStorage.setItem("MainList", JSON.stringify(maincontent));
    viewhandle();
}
