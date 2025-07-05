create database todo_listSSR ;
use todo_listSSR ;

create table users(
	user_id int primary key auto_increment,
    Username varchar(100),
    Password varchar(100),
    Email varchar(100),
    Gender enum('Male', 'Female', ''),
    Unique_id varchar(100) unique
);

create table tasks(
	task_id int primary key auto_increment,
    Title varchar(100),
    Discription varchar(100),
    Created_at varchar(100),
    Unique_id varchar(100),
    foreign key (Unique_id) references users(Unique_id)	
);

select * from Users ;
delete from Users where id = 3 ;
select * from tasks ;
delete from tasks where id = 3 ;