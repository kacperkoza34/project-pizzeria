import {settings, select, templates, classNames} from '../settings.js';
import utils from '../utils.js';
import Product from './Product.js';
import AmountWidget from './AmountWidget.js';
import CartProduct from './CartProduct.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';



class Booking{
  constructor(bookingPage){
    const thisBooking = this;
    thisBooking.render(bookingPage);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableListner();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =   settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params ={
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params', params)

    const urls = {
      booking:          settings.db.url + '/' + settings.db.booking
                                      + '?' + params.booking.join('&'),

      eventsCurrent:    settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsCurrent.join('&'),

      eventsRepeat:     settings.db.url + '/' + settings.db.event
                                      + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('urls: ', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
        .then(function(allResponses){
          const bookingsResponse = allResponses[0];
          const eventsCurrentResponse = allResponses[1];
          const eventsRepeatResponse = allResponses[2];
          return Promise.all([
            bookingsResponse.json(),
            eventsCurrentResponse.json(),
            eventsRepeatResponse.json(),
          ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
          //console.log(bookings);
          //console.log(eventsCurrent);
          //console.log(eventsRepeat);
          thisBooking.praseData(bookings, eventsCurrent, eventsRepeat);
        });
    }

  praseData(bookings, eventsCurrent, eventsRepeat){
      const thisBooking = this;

      thisBooking.booked ={};
      //console.log(eventsCurrent);
      for(let item of bookings){
        //console.log(item.date, item.hour, item.duration, item.table);
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }
      for(let item of eventsCurrent){
        thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
      }

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      //console.log(eventsRepeat);
      for(let item of eventsRepeat){
        if(item.repeat == 'daily'){
          for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
            thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
          }
        }
      }
      thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

  //  console.log('test: ',date, hour, duration, table);

    //console.log(thisBooking.booked);
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    //console.log(hour);
    const startHour = utils.hourToNumber(hour);
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
      //console.log(thisBooking.booked);

    }
  }

  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.dom.input.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.dom.output.innerHTML);

    //console.log('first key: ',thisBooking.date);
    //console.log('second key: ',thisBooking.hour);
    //console.log(thisBooking.datePicker);

    let allAvailable = false;
    //console.log(thisBooking.booked);
    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    //console.log('warunek: ',
    //thisBooking.booked[thisBooking.date][thisBooking.hour]);
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      //console.log('lolz:',tableId)
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
        //console.log(tableId);
      }
      //console.log(thisBooking.booked);
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  /*===========================================*/
  tableListner(){
    const thisBooking = this;
    let correctTable;

    const allTables = document.querySelectorAll(select.booking.tables);
    for(let i = 0; i<3; i++){
      allTables[i].addEventListener('click', function(){
        thisBooking.displayTable(allTables[i], allTables);
        correctTable = thisBooking.checkTable(allTables[i]);
      });
    }

    thisBooking.hourPicker.dom.input.addEventListener('change', function(){
      correctTable = false;
    });
    thisBooking.datePicker.dom.input.addEventListener('change', function(){
      correctTable = false;

    });


    const confirm = document.querySelector('.order-confirmation button');
    confirm.addEventListener('click', function(){
      event.preventDefault();
      if(correctTable){
        thisBooking.sendBooking(correctTable);
          thisBooking.updateDOM();
          correctTable = false;
      }
      else window.alert('Choose table!');
    });
  }

  checkTable(table){
    const thisBooking = this;
    let numberOfTable = parseInt(table.getAttribute('data-table'));
    //console.log(thisBooking.booked[thisBooking.date][thisBooking.hour]);
    if(typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){ return numberOfTable; }
    else if(thisBooking.booked[thisBooking.date][thisBooking.hour].includes(numberOfTable)){ return false;}
    else { return numberOfTable; }
  }

  displayTable(table, allTables){
    const thisBooking = this;
    for(let i = 0; i<3; i++){
      let tableNumber = allTables[i].getAttribute('data-table');
      if(typeof thisBooking.booked[thisBooking.date][thisBooking.hour] != 'undefined'){
        if(!thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(tableNumber))){
          allTables[i].classList.remove(classNames.booking.tableBooked);
        }
      }
      else if(typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
        allTables[i].classList.remove(classNames.booking.tableBooked);
      }
    }
    table.classList.add(classNames.booking.tableBooked);
  }


  sendBooking(correctTable){
    const thisBooking = this;

    const bookingWrapper = document.querySelector(select.containerOf.booking);
    const adress = bookingWrapper.querySelector(select.cart.address).value;
    const phone = bookingWrapper.querySelector(select.cart.phone).value;
    const people = thisBooking.peopleAmount.dom.input.value;
    const hours = thisBooking.hoursAmount.dom.input.value;



    const bookingData = {
      date: thisBooking.datePicker.dom.input.value,
      hour: thisBooking.hourPicker.dom.output.innerHTML,
      table: correctTable,
      repeat: false,
      duration: hours,
      ppl: people,
      starters: [],
      adress: adress,
      phone: phone,
    }

    const url = settings.db.url + '/' + settings.db.booking;
    //console.log(bookingData);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    };

    fetch(url, options)
      .then(function(respons){
        return respons.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

      setTimeout(function(){
        thisBooking.getData();
        window.alert('Order accepted!');
      }, 500);
  }

 /*===========================================*/



  render(bookingPage){
    const thisBooking = this;

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingPage;

    const generatedHTML = templates.bookingWidget(thisBooking.dom.wrapper);

    const generatedDom = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom.wrapper.appendChild(generatedDom);

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);

    //console.log(thisBooking.dom.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;
    //console.log(thisBooking.dom);
    const float = true;
    const notFloat = false;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount, notFloat);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, float);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);


//    thisBooking.dom.wrapper.addEventListener('updated', function(){
//      thisBooking.updateDOM();
//    });
//    console.log(thisBooking.dom.wrapper);
    thisBooking.changeListner();
  }

  changeListner(){
    const thisBooking = this;

    thisBooking.hourPicker.dom.input.addEventListener('change', function(){
      thisBooking.updateDOM();
    });
    thisBooking.datePicker.dom.input.addEventListener('change', function(){
      thisBooking.updateDOM();
    });
  }
}


export default Booking;
