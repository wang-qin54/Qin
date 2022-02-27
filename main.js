let menuIcon = document.getElementById('hamburger-menu-icon');
let menu = document.getElementById('menu');

const showInfo = (item) => {
    item.style.display = 'block';
  }
  
  menuIcon.addEventListener('click',showInfo(menu));