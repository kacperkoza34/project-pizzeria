import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Cart from './Cart.js';
import Product from './Product.js';
import CartProduct from './CartProduct.js';
import Booking from './Booking.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.datePicker.input);
    thisWidget.initPlugin();
  }


  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, 14);
    settings.picker.maxDate = utils.dateToStr(thisWidget.maxDate);
    settings.picker.defaultDate = thisWidget.minDate;
    settings.picker.minDate = utils.dateToStr(thisWidget.minDate);
    flatpickr(thisWidget.dom.input, settings.picker);

  }
  parseValue(value){
    return value;
  }
  isValid(value){
    return true;
  }
}

export default DatePicker;
