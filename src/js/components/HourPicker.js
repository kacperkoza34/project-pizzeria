import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';

class HourPicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.hourPicker.output);
    thisWidget.initPlugin(thisWidget.dom.input.value);
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.renderValue(utils.numberToHour(thisWidget.dom.input.value));
    })
  }
  initPlugin(hour){
    const thisWidget = this;
    const correctHour = utils.numberToHour(hour);
    //console.log('data:', hour);
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.renderValue(correctHour);
  }
  parseValue(value){
    return value;
  }
  isValid(value){
    return true;
  }
  renderValue(display){
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = display;
  }
}

export default HourPicker;
