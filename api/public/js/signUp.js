function signUp(event)
{
    event.preventDefault() ;
    const username = event.target.floatingName.value ;
    const password = event.target.floatingPassword.value ;
    const email = event.target.floatingEmail.value ;
    const gender = event.target.gender.value ;
    axios({
        method : "POST",
        url : "http://localhost:10000/signUp",
        data : {
            name : username,
            pass : password,
            gmail : email,
            sex : gender
        }
    })
    .then(function(response){
        window.open('http://localhost:10000/signin','_parent') ;
    })
    .catch(function(err){
       console.log("Error while sign Up", err) ;
       alert("Error while sign Up") ;
    })
}