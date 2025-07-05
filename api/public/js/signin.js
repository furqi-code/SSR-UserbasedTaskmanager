const toast = new bootstrap.Toast(document.getElementById("resetToast")) ;

function login(event)
{
    event.preventDefault() ;
    const email = event.target.floatingEmail.value ;
    const password = event.target.floatingPassword.value ;
    axios({
        method : "POST",
        url : "http://localhost:10000/signin",
        data : {
            gmail : email ,
            pass : password
        }
    })
    .then(function(response){
        window.open("http://localhost:10000", '_parent') ;
    })
    .catch(function(error){
      console.log("Error while sign in", error) ; 
        alert("Error while sign in") ;
    })
}

function forgotPass(event) 
{
    event.preventDefault() ; 
    $("#resetPassMessage").html("") ;
    let email = event.target.email.value ;
    let newPassword = event.target.newPassword.value;
    let confirmPassword = event.target.confirmPassword.value;

    if(newPassword !== confirmPassword){
        $("#resetPassMessage").html("Passwords don't match").addClass("text-danger") ;
        return ;
    }
    
    axios({
        method : "PATCH",
        url : "http://localhost:10000/resetPassword",
        data : {
            email,
            newPassword
        }
    })
    .then(function(res){
        $("#resetPassMessage").html("Your password changed successfully").addClass("text-success") ;
        // alert("Your password has been changed successfully") ;
        toast.show() ;
        setTimeout(function(){
            location.reload() ;
        }, 1000)
    })
    .catch(function(err){
        console.log(`Error occured while Reset password ${err}`) ;
        $("#resetPassMessage").html("Try Again!!").addClass("text-danger") ; 
    })
}