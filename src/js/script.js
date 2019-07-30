/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };


  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.initAccordion();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

//      console.log('new Product:', thisProduct);
    }
    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createDOMFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
//      console.log('co to jest::::',thisProduct.element);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
      }

      initAccordion(){
        const thisProduct = this;
        /* find the clickable trigger (the element that should react to clicking) */
        const clickableElement = thisProduct.element.querySelector(select.menuProduct.clickable);
        /* START: click event listner to trigger */
        clickableElement.addEventListener('click', function(event){
          /* prevent default action for event */
          event.preventDefault();
            /* toggle active class on element of thisProduct */
            thisProduct.element.classList.add('active');
            /* find all active products */
            const activeProducts = document.querySelectorAll('.active');
            /* START LOOP: for each active product */
            for(let activeProduct of activeProducts){
              /* START: if the active product isn't the element of thisProduct */
              if(activeProduct != thisProduct.element){
                /* remove class active for the active product */
                activeProduct.classList.remove('active');
              }
              /* END: if the active product isn't the element of thisProduct */

              /* END LOOP: for each active product */
            }
            /* END: click event listener to trigger */
        });
      }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

  }

  processOrder(){
    const thisProduct = this;

    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('kkk', formData);
   /* set variable price to equal thisProduct.data.price */
   let price = thisProduct.data.price;
   /* START LOOP: for each paramId in thisProduct.data.params */
   for(let param in thisProduct.data.params){
     /* save the element in thisProduct.data.params with key paramId as const param */
     const params = thisProduct.data.params[param];
     /* START LOOP: for each optionId in param.options */
     console.log('wywolanie');
     for(let paramsValue in params.options){
       /* save the element in param.options with key optionId as const option */
       const option =  params.options[paramsValue];
       /* START IF: if option is selected and option is not default */
       if(!option.default){
         /* add price of option to variable price */
         price = price + option.price;
         console.log(price);
       }
       /* END IF: if option is selected and option is not default */
       /* START ELSE IF: if option is not selected and option is default */
//       else if(option.default){
         /* add price of option to variable price */
//         price += option.price;
//         console.log(option.price);
//       }
         /* deduct price of option from price */
//         price = price - option.price;
//       }
       /* END ELSE IF: if option is not selected and option is default */
//     }
     /* END LOOP: for each optionId in param.options */
   /* END LOOP: for each paramId in thisProduct.data.params */

   /* set the contents of thisProduct.priceElem to be the value of variable price */
   thisProduct.priceElem = price;
 }
}
}

/* MÓJ NIESKUTECZNY POMYSŁ
    for(let formInput of formInputs){
      const allInput = formInput.getAttribute('value');
      console.log(allInput);
      for(let data in formData){
//        console.log('test', formData[data]);
        for(let dataAddition of formData[data]){
          if(allInput == dataAddition){
  //          console.log(data ,'dodatek: ', dataAddition, ' jest w zamowieniu');
          }
        }
      }
    }
*/


  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  }
};

  const app = {
    initMenu(){
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.init();
}
