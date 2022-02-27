let menuIcon = document.getElementById('hamburger-menu-icon');
let menu = document.getElementById('menu');

const showInfo = (item) => {
    item.style.display = 'block';
  }

const hideInfo = (item) => {
  item.style.display = 'none';
}
  
  menuIcon.addEventListener('click',function(){
    if(menuIcon.style.display !== 'none'){
      showInfo(menu);
    } 
  });