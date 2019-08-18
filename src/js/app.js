import {settings, select, classNames} from './settings.js';
import utils from './utils.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import AmountWidget from './components/AmountWidget.js';
import CartProduct from './components/CartProduct.js';
import Booking from './components/Booking.js';
import BaseWidget from './components/BaseWidget.js';


const app = {
  initPages: function(){
  const thisApp = this;

  thisApp.pages = document.querySelector(select.containerOf.pages).children;

  thisApp.navLinks = document.querySelectorAll(select.nav.links);


  const idFromHash = window.location.hash.replace('#/','');
  //console.log('idFromHash:', idFromHash);

  let pageMatchingHash = thisApp.pages[0].id;

  for(let page of thisApp.pages){
    if(page.id == idFromHash){
      pageMatchingHash = page.id;
      break;
    }
  }

  thisApp.activatePage(pageMatchingHash);

  for(let link of thisApp.navLinks){
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
    for(let page of thisApp.pages){
    page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
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

      thisApp.initData();
      thisApp.initCart();
      thisApp.initPages();
      thisApp.initBooking();
    },

  initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });

    }
};
app.init();
