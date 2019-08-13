import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Product from './Product.js';
import AmountWidget from './AmountWidget.js';
import CartProduct from './CartProduct.js';


class Booking{
  constructor(bookingPage){
    const thisBooking = this;
    thisBooking.render(bookingPage);
    thisBooking.initWidgets();
  }

  render(bookingPage){
    const thisBooking = this;

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingPage;

    const generatedHTML = templates.bookingWidget(thisBooking.dom.wrapper);

    const generatedDom = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom.wrapper.appendChild(generatedDom);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    //console.log(thisBooking.dom.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;
    //console.log(thisBooking.dom);
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}


export default Booking;
