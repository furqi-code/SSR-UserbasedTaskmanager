const addModal = new bootstrap.Modal(document.getElementById("information")) ;
const editModal = new bootstrap.Modal(document.getElementById('updatedInfo'));
const addToast = new bootstrap.Toast(document.getElementById('addToast'));
const editToast = new bootstrap.Toast(document.getElementById('editToast'));
const deleteToast = new bootstrap.Toast(document.getElementById('deleteToast'));
const clearToast = new bootstrap.Toast(document.getElementById('clearToast'));
    
// addToast.show() ;   // working here

function createTask(event)
{
    const title = event.target.title.value ;
    const discription = event.target.message.value ;
    const created_at = event.target.time.value ;
    axios({
        method : "POST",
        url : "http://localhost:10000/tasks",
        data : {
            task_title : title,
            task_discription : discription,
            taskCreated_at : created_at,
        }
    })
    .then(function(response){
        $("#createTaskMessage").html("Task created, redirecting you to homepage") ;
        $("#createTaskMessage").addClass("text-success") ;
        addToast.show() ;
        addModal.hide() ;
            setTimeout(() => {
                location.reload() ;
            }, 1000);
    })
    .catch(function(error){
        console.log(`Error occured while making task ${error}`) ;
        $("#createTaskMessage").html("sorry Task making failed") ;
        $("#createTaskMessage").addClass("text-danger") ;
    })
}

function clearTasks(token)
{
    axios({
        method : "DELETE",
        url : "http://localhost:10000/tasks",
    })
    .then(function(response){
        clearToast.show() ;
        setTimeout(() => {
            location.reload() ;
        }, 1000);
    })
    .catch(function(error){
        console.log(error) ;
    })
}

function removeTask(id)
{
    axios({
        method : "DELETE",
        url : "http://localhost:10000/tasks",
        params : {
            id : id
        }
    })
    .then(function(response){
        deleteToast.show() ;
        setTimeout(() => {
            location.reload() ;
        }, 1000);
    })
    .catch(function(error){
        console.log(error) ;
    })
}

let selected_taskid = 0 ;
function editTask(id){
    selected_taskid = id ;   
    axios({
        method : "GET",
        url : "http://localhost:10000/prefilltasks",
        params : {
            id
        }
    }).then(function(res){
         if(res.data.length > 0) 
        {
            const task = res.data[0] ;
            $("#update-title").val(task.Title) ;
            $("#update-message").val(task.Discription) ;
            $("#update-time").val(new Date(task.Created_at).toISOString().split("T")[0]); // To format date correctly, isostring ata h mySql se no matter the datatype
        }
    })
    .catch(function(err) {
        console.error("Prefill error:", err);
    });
}
function updateTask(event)
{
    const title = event.target.updateTitle.value ;
    const discription = event.target.updateMessage.value ;
    const created_at = event.target.updateTime.value ;
    axios({
        method : "PUT",
        url : "http://localhost:10000/tasks",
        data : {
            task_title : title,
            task_discription : discription,
            taskCreated_at : created_at,
            selected_taskid : selected_taskid
        }
    })
    .then(function(response){
        $("#editTaskMessage").html("Task updated, redirecting you to homepage") ;
        $("#editTaskMessage").addClass("text-success") ;
        editModal.hide() ;
        editToast.show() ;
            setTimeout(() => {
                location.reload() ;
            }, 2000);
    })
    .catch(function(error){
         console.log(`Error occured while updating task ${error}`) ;
        $("#editTaskMessage").html("sorry Task making failed") ;
        $("#editTaskMessage").addClass("text-danger") ;
    })
}

function logout() 
{
    axios({
        method:'POST',
        url: 'http://localhost:10000/logout'
    }).then(function(){
        location.reload();
    })
}