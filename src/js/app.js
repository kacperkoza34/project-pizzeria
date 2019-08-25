import {settings, select, classNames} from './settings.js';
import utils from './utils.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import AmountWidget from './components/AmountWidget.js';
import CartProduct from './components/CartProduct.js';
import Booking from './components/Booking.js';
import BaseWidget from './components/BaseWidget.js';


const app = {

  initHomePage: function(){
    const thisApp = this;

    setTimeout(function(){
      const slider = new Slider('#demo', '.z-slide-item', {
        'current': 2,
        'duration': 0.8,
        'minPercentToSlide': null,
        'autoplay': true,
        'direction': 'left',
        'interval': 3
      });
  },1000);
},

  initPages: function(){
  const thisApp = this;

  thisApp.pages = document.querySelector(select.containerOf.pages).children;
  //console.log('pages: ', thisApp.pages );

  thisApp.navLinks = document.querySelectorAll(select.nav.links);
  //console.log('navLinks: ', thisApp.navLinks );

  thisApp.linksArray = Array.from(thisApp.navLinks);

  /* NEW BUTTONS */
  thisApp.home = document.querySelector('.header__wrapper a');
  thisApp.home.option = document.querySelectorAll('.home-page a');
  /*ADD NEW BUTTONS TO ACTIVE ELEMENTS*/
  for(let option of thisApp.home.option){
    thisApp.linksArray.unshift(option);
  }
  thisApp.linksArray.unshift(thisApp.home);


  const idFromHash = window.location.hash.replace('#/','');

  let pageMatchingHash = thisApp.pages[2].id;

  for(let page of thisApp.pages){
    if(page.id == idFromHash){
      pageMatchingHash = page.id;
      break;
    }
  }

  thisApp.activatePage(pageMatchingHash);

  for(let link of thisApp.linksArray){
    //console.log('link z node list:',link);
    link.addEventListener('click', function(event){
      const clickedElement = this;
      event.preventDefault();
      /* get pade id from href attribute */
      const id = clickedElement.getAttribute('href').replace('#','');
      /* run thisApp.activatePage with that id */
      thisApp.activatePage(id);
      /* change URL hash */
      window.location.hash = '#/' + id;

      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    const navElem = document.querySelector(select.containerOf.nav);
    let check;
    for(let page of thisApp.pages){
    page.classList.toggle(classNames.pages.active, page.id == pageId);
    }


    for(let link of thisApp.linksArray){
      //console.log('link z node list:',link);
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
      if(link.getAttribute('href') == '#' + pageId & '#' + pageId == '#home') check = true;
      console.log(link.getAttribute('href'));
    }

    if(check){
      cartElem.classList.add('none');
      navElem.classList.add('none');
    }
    else{
      cartElem.classList.remove('none');
      navElem.classList.remove('none');
    }

  },


  initBooking: function(){
    const book = document.querySelector(select.containerOf.booking);
    new Booking(book);
  },

  initMenu: function(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

  initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResposne){
          return rawResposne.json();
        })
        .then(function(parsedResponse){
          //console.log('parsedResponse', parsedResponse);
          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();

        });
        //console.log('thisApp.data', JSON.stringify(thisApp.data));

    },

  init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initHomePage();

      thisApp.initData();
      thisApp.initCart();
      thisApp.initPages();
      thisApp.initBooking();
    },

  initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);

      /* Active cart after click in booking or order
      ===============================================
      */

      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });

    }
};
app.init();
