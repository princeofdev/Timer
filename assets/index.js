// ---- EventHandlers ----

document.addEventListener("DOMContentLoaded", function() {
    console.log("Starting Script...Resolving URL.")
    const urlParams = new URLSearchParams(window.location.search);
    const searchText = urlParams.get("searchText");
    const projectId = urlParams.get("projectId");
    if (searchText || projectId) {
        console.log("Starting page on the Tab: Search Projects...")
        document.getElementById("searchProjects-tab").click();
        document.getElementById("searchProject_search").value = searchText;
        document.getElementById("project_search").focus(); // Focus on the select element
        document.getElementById("project_search").click();
        searchProjects_search(searchText, projectId);
    } else {
        console.log("Starting page on the Tab: My Tasks...")
        searchProjects(document.getElementById("projectManager").value);
        //   const projectManager = "Bruno Ajmer"; // Set the desired project manager name here
        //   document.getElementById("projectManager").value = projectManager;
        //   searchProjects(projectManager);
    }
});

document.addEventListener("DOMContentLoaded", function() {
    console.log("Starting Script...Ready to get projects list when user selects an option in Search Projects Tab.")
    // searchProjects_search(""); // Initial population
    const projectSelect_search = document.getElementById("project_search");
    projectSelect_search.addEventListener("change", function() {
        console.log("EventListener for Project Search Selecting. Value: ", this.value);
        fetchTasks_search(this.value);
        // initializeMultiselect();
        // fetchUserList(this.value);
    });
});

// ---- Main Functions ----

function searchProjects() {
    console.log("Function searchProjects invoked but not defined yet.");
}

// Invoked when user inputs something in the Search Bar of Search Projects Tab
function searchProjects_search(searchText, projectId) {
    const changedURL = "?searchText=" + encodeURIComponent(searchText) + "&projectId=" + projectId;

    if(searchText == "" || searchText == undefined) {
        const currentURL = window.location.href; 
        const url = new URL(currentURL);
        const baseURL = url.origin + url.pathname;
        console.log(baseURL);
        history.pushState(null, null, baseURL);
    } else {
        history.pushState(null, null, changedURL);
    }

    const url = "https://hook.us1.make.com/0xllmacanbr8nzj6jfpwler92no74cm5?search=" + encodeURIComponent(searchText) + "&projectId=" + projectId;

    console.log("searchProjects_search invoked for fetching data. URL: ", url);
    
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
        document.getElementById("active-project").innerHTML = "Search Active Project:";
        document.getElementById("active-project").style.color = "black";
        const projectSelect_search = document.getElementById("project_search");
        projectSelect_search.innerHTML = "";
        data.forEach((project, index) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;
            projectSelect_search.appendChild(option);
            // Select the first option
            if (index === 0) {
                option.selected = true;
            }
        });
        
        // Trigger the change event manually, resulting in invoking EventListener that calls fetchTasks_search(data) and fetchUserList(data)
        projectSelect_search.dispatchEvent(new Event("change"));
        // fetchTasks_search(projectSelect_search.value);
    })
    .catch(e => {
        console.error("FETCHING PROJECT ERROR:", e);
        console.log(document.getElementById("active-project").innerHTML);
        document.getElementById("active-project").innerHTML = "Fetching data failed.";
        document.getElementById("active-project").style.color = "red";
    });
}
  
// Fetch tasks list for the project
function fetchTasks_search(projectId) {
    console.log("fetchTasks_search invoked. projectId: ", projectId);

    const tasksDiv_search = document.getElementById("tasks_search");
    fetch(`https://hook.us1.make.com/co30ww4huxaypuove4ee1q2cyw3bc2l3`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({projectId: projectId}),
    })
    .then((response) => response.json()).then((data) => {
        tasksDiv_search.innerHTML = "";
        data.forEach((task) => {
            console.log("In fetchTasks_search, task: ", task);
            const formattedDate = formatDate(task["due date"].value);
            const progress = Math.min((task["actual hours"].value / task["est. time"].value) * 100, 100);
            const taskHtml = `
            <div class="form-group task" data-task-id="${task.id}">
                <label>${task.stage.displayValue} - Due Date: ${formattedDate} - Est. Time: ${task["est. time"].displayValue}hrs</label>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${task["actual hours"].value}" aria-valuemin="0" aria-valuemax="${task["est. time"].value}">${task["actual hours"].value} of ${task["est. time"].value} hours</div>
                </div>
                <input type="text" class="form-control mt-2 comment" placeholder="Comments" />
                <input type="number" class="form-control mt-2 time" placeholder="Time (hrs)" />
                <select id='statusForm' class="form-control mt-2 status" onchange="validateTask(this)" />
                    <option value="In Queue">In Queue</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                    <option value="Hold">Hold</option>
                </select>
                <input type="file" class="form-control mt-2 image" style="display:none" accept="image/*" multiple />
                <button class="btn btn-primary mt-2 start-timer" id='startTime${task.id}' onclick="startTimer(this, ${task.id})">Start Timer</button>
                <button class="btn btn-danger mt-2 stop-timer" onclick="stopTimer(this)" style="display:none">Stop Timer</button>
                <span class="timer" style="display:none">00:00</span>
            </div>`;
            tasksDiv_search.innerHTML += taskHtml;

            // if(localStorage.key(0)) {
            //     console.log("localStorage Status: ", localStorage.key(0));
            //     const nthId = localStorage.key(0);
            //     document.getElementById(nthId).click();
            // }

            // Iterate through all keys and check for "startTime"
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes("startTime")) {
                    console.log("A key containing 'startTime' was found in localStorage.");
                    const nthId = localStorage.key(i);
                    document.getElementById(nthId).click();
                    break; // Exit the loop once a key is found
                }
            }
        });
    })
    .catch((error) => {
      console.error("FETCHING TASKS ERROR:", error);
    });
}

// ---- Widget Functions ----

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function validateTask(selectElement) {
    const taskElement = selectElement.closest(".task");
    const statusValue = selectElement.value;
    const imageInput = taskElement.querySelector(".image");
    const timeInput = taskElement.querySelector(".time");
    if (statusValue === "Complete") {
      imageInput.style.display = "block";
      imageInput.required = true;
      timeInput.required = true;
    } else {
      imageInput.style.display = "none";
      imageInput.required = false;
      timeInput.required = false;
    }
}

function submitForm(event) {
    event.preventDefault();
    const projectId = document.getElementById("project").value;
    const tasks = document.querySelectorAll(".task");
    const formData = new FormData();
    tasks.forEach((taskElement) => {
        const taskId = taskElement.dataset.taskId;
        const comment = taskElement.querySelector(".comment").value;
        const time = taskElement.querySelector(".time").value;
        const status = taskElement.querySelector(".status").value;
        const imageFiles = taskElement.querySelector(".image").files;
        formData.append("projectId", projectId);
        formData.append("tasks[]", JSON.stringify({
            taskId: taskId,
            comment: comment,
            time: time,
            status: status,
        }));
        if (status === "Complete") {
            for (let i = 0; i < imageFiles.length; i++) {
            formData.append("images[]", imageFiles[i]);
            }
        }
    });
    fetch("https://hook.us1.make.com/llawbyg22hh4jxxqh6nfdpatmh1c6n5l", {
        method: "POST",
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}

// ---- Timer ----

let interval;
let startTime = null;
let storageName = "";

function startTimer(startBtn, id) {
    event.preventDefault();
    const dataTaskId = id;
    const taskElement = startBtn.closest(".task");
    const stopBtn = taskElement.querySelector(".stop-timer");
    const timerSpan = taskElement.querySelector(".timer");

    storageName = "startTime" + dataTaskId;
    stopAllTimers(storageName); // Stop all other running timers

    startTime = localStorage.getItem(storageName);
    console.log("startTime: ", startTime);
    
    // Set the start time if it's not already set
    if (startTime == null) {
        startTime = Date.now();
        localStorage.setItem(storageName, startTime.toString());
    }

    let count = 0;
    interval = setInterval(() => {
        let minutes = 0;
        let seconds = 0;
        if (count == 0) {
            const elapsedTime = Date.now() - Number(localStorage.getItem(storageName));
            const elapsedSeconds = Math.floor(elapsedTime / 1000);
            minutes = Math.floor(elapsedSeconds / 60);
            seconds = elapsedSeconds % 60;
            count++;
        } else {
            const time = timerSpan.textContent.split(":");
            minutes = parseInt(time[0]);
            seconds = parseInt(time[1]);
            seconds++;
        }
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }

        const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        timerSpan.textContent = formattedTime;
    }, 1000);

    startBtn.style.display = "none";
    stopBtn.style.display = "inline";
    timerSpan.style.display = "inline";
}

function stopTimer(stopBtn, storageKey) {
    event.preventDefault();
    clearInterval(interval);
    const taskElement = stopBtn.closest(".task");
    const startBtn = taskElement.querySelector(".start-timer");
    const timerSpan = taskElement.querySelector(".timer");
    const timeInput = taskElement.querySelector(".time");

    // Calculate the elapsed time in seconds
    const currentTime = Date.now();
    const elapsedTimeInSeconds = Math.floor(
        (currentTime - startTime) / 1000
    );

    // Set the time input value with the total seconds elapsed
    timeInput.value = elapsedTimeInSeconds;

    // Reset the start time
    startTime = null;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if(storageKey != key) {
            localStorage.removeItem(key);
        }
    }

    startBtn.style.display = "inline";
    stopBtn.style.display = "none";
    timerSpan.style.display = "none";
}

function stopAllTimers(storageKey) {
    event.preventDefault();
    const stopBtns = document.querySelectorAll(".stop-timer");
    stopBtns.forEach((btn) => stopTimer(btn, storageKey));
}

// ---- Unused EventHandler and Functions ----

// document.addEventListener("DOMContentLoaded", function() {
//     searchProjects_search(""); // Initial population
// });

// Fetch users list for the project
// function fetchUserList(projectId) {
//     const sheetId = "1P4_ydze-gO4HZJTUKRNji0IjZ9qBf2CHDIEqGPGcGAA";
//     const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
//     const sheetName = "user-data";
//     const query = encodeURIComponent("Select *");
//     const url = `${base}&sheet=${sheetName}&tq=${query}`;
//     // Fetch user data from the Google Sheet based on the projectId
//     fetch(`${url}`)
//       .then((response) => {
//         return response.text();
//       })
//       .then((data) => {
//         const userListSelect = document.getElementById("user_select");
//         userListSelect.innerHTML = "";
//         const jsonData = JSON.parse(data.substring(47).slice(0, -2));
//         jsonData.table.rows.forEach((rowData, index) => {
//           if (index === 0) {
//             return;
//           }
//           rowData.c.forEach((userData, index) => {
//             if (index === 0) {
//               const option = document.createElement("option");
//               option.value = userData.v;
//               option.textContent = userData.v;
//               userListSelect.appendChild(option);
//             }
//             return;
//           });
//         });
//         if (jsonData.feed.entry.length > 0) {
//           userListSelect.selectedIndex = 0;
//         }
//         // Fetch tasks for the selected user (optional, if needed)
//         const selectedUserId = userListSelect.value;
//         // fetchTasks(selectedUserId);
//       })
//       .catch((error) => {
//         console.error("Error fetching users:", error);
//       });
// }


// function fetchTasks(projectId) {
//     const tasksDiv = document.getElementById("tasks");
//     fetch(`https://hook.us1.make.com/co30ww4huxaypuove4ee1q2cyw3bc2l3`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             projectId: projectId
//         }),
//     })
//     .then((response) => response.json()).then((data) => {
//         tasksDiv.innerHTML = "";
//         data.forEach((task) => {
//             const formattedDate = formatDate(task["due date"].value);
//             const progress = Math.min((task["actual hours"].value / task["est. time"].value) * 100, 100);
//             const taskHtml = `     
//             <div class="form-group task" data-task-id="${task.id}">
//                 <label>${task.stage.displayValue} - Due Date: ${formattedDate} - Est. Time: ${task["est. time"].displayValue}hrs</label>
//                 <div class="progress">
//                     <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${task["actual hours"].value}" aria-valuemin="0" aria-valuemax="${task["est. time"].value}">${task["actual hours"].value} of ${task["est. time"].value} hours</div>
//                 </div>
//                 <input type="text" class="form-control mt-2 comment" placeholder="Comments" />
//                 <input type="number" class="form-control mt-2 time" placeholder="Time (hrs)" />
//                 <select class="form-control mt-2 status" onchange="validateTask(this)">
//                     <option value="In Queue">In Queue</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Complete">Complete</option>
//                     <option value="Hold">Hold</option>
//                 </select>
//                 <input type="file" class="form-control mt-2 image" style="display:none" accept="image/*" multiple />
//             </div>`;
//             tasksDiv.innerHTML += taskHtml;
//         });
//     })
//     .catch((error) => {
//       console.error("Error fetching tasks:", error);
//     });
// }