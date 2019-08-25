import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Cart from './Cart.js';
import Product from './Product.js';
import CartProduct from './CartProduct.js';
import Booking from './Booking.js';
import BaseWidget from './BaseWidget.js';


class AmountWidget extends BaseWidget{
  constructor(element, float = false, maxValueOfWidget = 0){
    super(element, float, maxValueOfWidget);
    const thisWidget = this;
    //console.log(float);
    thisWidget.getElements(element);
    thisWidget.initActions(float, maxValueOfWidget);
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

  initActions(float, maxValueOfWidget = 0){
    const thisWidget = this;
    let count = 1;
    if(float) count = 0.5;
    //console.log('maksa valju of:', maxValueOfWidget);
      //console.log('maxValueOfWidget:',maxValueOfWidget);
      //console.log('thisWidget.value:',thisWidget.value);
      //if(thisWidget.value == true) thisWidget.value = 1;
      const allTables = document.querySelectorAll(select.booking.tables);
      //console.log('test float',float);
      for(let i = 0; i<3; i++){
        allTables[i].addEventListener('click', function(){
            thisWidget.setValue(1, true, maxValueOfWidget);
        });
      }
    //  window.onload = function() {
    //    for(let i = 0; i<2; i++){
    //      thisWidget.setValue(1, float, maxValueOfWidget);
    //    }
    //  };

      //thisWidget.setValue(numberByChange, float, maxValueOfWidget);


      thisWidget.dom.input.addEventListener('change', function(){
        //thisWidget.setValue(thisWidget.dom.input.value);
        //console.log(thisWidget.dom.input.value <= 0);
        if(maxValueOfWidget == 0) thisWidget.setValue(thisWidget.dom.input.value);
        else{
           thisWidget.setValue(0,float, maxValueOfWidget);
        }
      });
      thisWidget.dom.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        //console.log('maxValueOfWidget:', maxValueOfWidget);
        if(maxValueOfWidget == 0){
          thisWidget.setValue(thisWidget.value-count, float);
          //console.log('działa')
        }
        else thisWidget.setValue(thisWidget.value-count, float, maxValueOfWidget);
      });
      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        //console.log('maxValueOfWidget:', maxValueOfWidget);
        if(maxValueOfWidget == 0){
          thisWidget.setValue(thisWidget.value+count, float);
          //console.log('działa')
        }
        else thisWidget.setValue(thisWidget.value+count, float, maxValueOfWidget);
      });

    }




  setValue(value = 1, float, maxValueOfWidget = 0){
    const thisWidget = this;
    let maxValue = 9;
    //console.log('value:', value);
    //console.log('float:', float);
    thisWidget.correctValue = value;
    //console.log('maxValueOfWidget:', maxValueOfWidget);
    //console.log('test====================================');
    if(maxValueOfWidget != 0){
      maxValue = maxValueOfWidget;
      if(maxValue > 9) maxValue = 9;
      if(float){
        console.log('test float');

        if(value <= 0.5){
          //console.log('test pierwszy if');
           value = 0.5;
         }
        else if(value >=maxValue){
          //console.log('test drugi if');
          value = maxValue;
        }
        //console.log('jak true??',thisWidget.correctValue);
        //console.log('jak value??',value);
        thisWidget.correctValue = value;
        if(value <= maxValue && value >= 0.5 ){
          //thisWidget.correctValue = value;
          thisWidget.renderValue();
        }
        //thisWidget.correctValue = value;
      }
    }
    else thisWidget.value = value;
  }
}

export default AmountWidget;
