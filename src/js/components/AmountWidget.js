import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Cart from './Cart.js';
import Product from './Product.js';
import CartProduct from './CartProduct.js';
import Booking from './Booking.js';
import BaseWidget from './BaseWidget.js';


class AmountWidget extends BaseWidget{
  constructor(element, float){
    super(element, float, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions(float);
//    console.log('constructor element: ', thisWidget);
    //console.log('constructor params: ',  settings.amountWidget.defaultValue )

  }

  getElements(element){
    const thisWidget = this;

    //console.log(thisWidget.dom.wrapper);
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    return !isNaN(value)
    && settings.amountWidget.defaultMin <= value
    && settings.amountWidget.defaultMax >= value;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(float){
    const thisWidget = this;
    let count;
    if(float) count = 0.5;
    else if(!float) count = 1;

    thisWidget.dom.input.addEventListener('change', function(){
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-count, float);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value+count, float);
    });
  }



  setValue(value, float){
    const thisWidget = this;
    if(float){
      if(value <=0) value = 0;
      else if(value >=9) value = 9;
      thisWidget.correctValue = value;
      if(value <= settings.amountWidget.defaultMax && value >= 0 ){
        thisWidget.renderValue();
      }
    }
    else thisWidget.value = value;
  }
}

export default AmountWidget;
