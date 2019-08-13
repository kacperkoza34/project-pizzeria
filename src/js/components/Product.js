import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Cart from './Cart.js';
import AmountWidget from './AmountWidget.js';
import CartProduct from './CartProduct.js';



class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.initAccordion();
    thisProduct.getElements();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //console.log('tworzony produkt:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createDOMFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
    //console.log(menuContainer);
  }

  initAccordion(){
    const thisProduct = this;
    const clickableElement = thisProduct.element.querySelector(select.menuProduct.clickable);
    clickableElement.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.element.classList.add('active');
      const activeProducts = document.querySelectorAll('.product.active');
      for(let activeProduct of activeProducts){
        if(activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
      }
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
      thisProduct.addToCart();
    });

  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    thisProduct.params = {};
    let price = thisProduct.data.price;
    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      for(let optionId in param.options){
        const option =  param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

        if(optionSelected && !option.default){
          price = price + option.price;
          //console.log(price);
        }
        else if (!optionSelected && option.default){
          price = price - option.price;
        }

        const selector = '.' + paramId + '-' + optionId;
        const selectedImg = thisProduct.imageWrapper.querySelector(selector);
        //console.log(selector, selectedImg);

        if(optionSelected){
          if(selectedImg) selectedImg.classList.add('active');
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
        }
        else{
          if(selectedImg) selectedImg.classList.remove('active');
        }
      }
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log(thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper  = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

  //  app.cart.add(thisProduct);

  const event = new CustomEvent('add-to-cart', {
    bubbles: true,
    detail: {
      product: thisProduct,
    }
  });

  thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
