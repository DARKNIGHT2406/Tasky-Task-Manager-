let theme="light"
let completedItem=JSON.parse(localStorage.getItem("CompleteList"));

// For Storing The Deleted Content 
let DeletedTask = JSON.parse(localStorage.getItem("DeletedList")) || [];

// For Storing The Content Which is complete 
const deleteall=document.querySelector("#deleteallbuttonsfield")
const inputfields=document.querySelector("#inputfields")
const closewindow=document.querySelector("#closewindow")
const mainaddtaskbtn=document.querySelector("#addtask")
const taskitem=document.querySelector("#taskitem")
const inp=document.querySelectorAll(".inp")

function viewhandle(){
    let htmlcontent=completedItem.map((ele,i)=>{
        return `
    
        <div style="align-items:center;display:flex;font-size:2vw; font-weight:bolder;word-spacing: 10px; border:2px solid grey;text-align:justify; height:auto;border-radius:15px; color:white">

            <p style="width:88%;margin-left:1vw;padding:1vw; border:1px solid grey;border-radius:15px;font-size:1.5vw;font-weight:500">Task Name: ${ele.Title} <br> Content: ${ele.Content}</p>

            <button onclick="deleteItem(${i})" style="float:left;width:6%; height:50%; padding: 5px; background-color:red;font-weight:bolder;text-shadow:-2px -2px 0 black, 2px -2px 0 black,-2px  2px 0 black, 2px  2px 0 black; color: white; border: none; cursor: pointer">Delete</button>
        </div>
        `
        
        
    })
    taskitem.innerHTML=htmlcontent
} 


viewhandle();

deleteall.addEventListener("click",DeleteEntire);


// Delete the entire task list 
function DeleteEntire() {
    DeletedTask.push(...completedItem);
    localStorage.setItem("DeletedList", JSON.stringify(DeletedTask));
    completedItem.length = 0;
    localStorage.setItem("CompleteList", JSON.stringify(completedItem));
    viewhandle(); // Refresh UI
}

// Delete a single list item 
function deleteItem(index) {
    let deleteitem = completedItem[index];
    DeletedTask.push(deleteitem);
    localStorage.setItem("DeletedList", JSON.stringify(DeletedTask));
    completedItem.splice(index, 1);
    localStorage.setItem("CompleteList", JSON.stringify(completedItem));
    viewhandle();
}

