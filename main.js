let menuIcon = document.getElementById('hamburger-menu-icon');
let menu = document.getElementById('menu');

let nextbutton = document.getElementById('submit');
let password = document.getElementById('password');
let passwordlayer = document.getElementById('passwordlayer')

// click show hide function

const showInfo = (item) => {
    item.style.display = 'block';
  }

const hideInfo = (item) => {
  item.style.display = 'none';
}

//call
  
  menuIcon.addEventListener('click',function(){
    if(menuIcon.style.display !== 'none'){
      showInfo(menu);
    } 
  });

  nextbutton.addEventListener('click',function(){
    if(password.value == 'qinwang'){
      hideInfo(passwordlayer);
    } 
  });


