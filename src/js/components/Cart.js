import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Product from './Product.js';
import AmountWidget from './AmountWidget.js';
import CartProduct from './CartProduct.js';


class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }


  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.form = element.querySelector(select.cart.form);

    thisCart.phone = element.querySelector(select.cart.phone);
    thisCart.address = element.querySelector(select.cart.address);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];


    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      const showCart = thisCart.dom.wrapper;
      let cartStatus = thisCart.dom.wrapper.getAttribute('class');
      if(cartStatus == 'cart') showCart.classList.add(classNames.cart.wrapperActive);
      else if (cartStatus == 'cart active') showCart.classList.remove(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.address.value,
      phone: thisCart.phone.value,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
      totalPrice: thisCart.totalPrice,
      amount: thisCart.totalNumber,
    };

    let index = 0;
    for(let product of thisCart.products){
      payload.products[index] = thisCart.getData(JSON.parse(JSON.stringify(product)));
      index++;
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(respons){
        return respons.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

  }
  getData(product){
    const thisCart = this;
    //console.log('test metody getData:', product);
    delete product.dom;
    delete product.amountWidget;
    return product;
  }

  add(menuProduct){

    const thisCart = this;

    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createDOMFromHTML */
    const generatedDom = utils.createDOMFromHTML(generatedHTML);
    //console.log(generatedDom);
    /* find menu container */
    const cartDom = thisCart.dom.productList;
    /* add element to menu */
    cartDom.appendChild(generatedDom);


    thisCart.products.push(new CartProduct(menuProduct, generatedDom))
    //console.log('thisCart.products', thisCart.products)
    //console.log('add info  product', menuProduct);
    thisCart.update();

  }

  update() {
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    console.log(thisCart.products);

    for(let product of thisCart.products){
      thisCart.subtotalPrice  = thisCart.subtotalPrice + product.price;
      thisCart.totalNumber  = thisCart.totalNumber + product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    for(let key of thisCart.renderTotalsKeys){

      for(let elem of thisCart.dom[key]){
        console.log(elem, thisCart[key], thisCart, key);
        elem.innerHTML = thisCart[key];
      }
    }
  }


  remove(cartProduct){
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    //console.log('przed sunieciem',thisCart.products);
    thisCart.products.splice(index, 1);
    //console.log('po usuniecius',thisCart.products);
    //console.log(cartProduct);
    //console.log(index);
    //console.log('elementy dom', cartProduct.dom.wrapper)
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
}

export default Cart;
