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
            setTimeout(() => {
                location.reload() ;
            }, 400);
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
        location.reload() ;
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
        location.reload() ;
    })
    .catch(function(error){
        console.log(error) ;
    })
}

let selected_taskid = 0 ;
function editTask(id){
    selected_taskid = id ;   
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
            setTimeout(() => {
                location.reload() ;
            }, 400);
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