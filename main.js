let menuIcon = document.getElementById('hamburger-menu-icon');
let menu = document.getElementById('menu');

const showInfo = () => {
    menu.style.display = 'block';
  }
  
  menuIcon.addEventListener('click',showInfo);