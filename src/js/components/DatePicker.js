import {settings, select, templates} from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.datePicker.input);
    //console.log(thisWidget.dom.input);
    thisWidget.initPlugin();
  }


  initPlugin(){
    const thisWidget = this;
    //console.log(thisWidget.value);
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, 14);
    settings.picker.maxDate = utils.dateToStr(thisWidget.maxDate);
    settings.picker.defaultDate = thisWidget.minDate;
    settings.picker.minDate = utils.dateToStr(thisWidget.minDate);
    flatpickr(thisWidget.dom.input, settings.picker);
    console.log(!thisWidget.dom.input.value);
    if(!thisWidget.dom.input.value){
      console.log('test warunku')
      settings.picker.defaultDate = utils.dateToStr(utils.addDays(thisWidget.minDate, 1));
      console.log(settings.picker.minDate);
      flatpickr(thisWidget.dom.input, settings.picker);
    }
  }
  parseValue(value){
    return value;
  }
  isValid(value){
    return true;
  }
}

export default DatePicker;
