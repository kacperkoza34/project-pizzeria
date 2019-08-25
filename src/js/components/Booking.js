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
      table.classList.remove(classNames.booking.clicked);
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
        if(thisBooking.hourPicker.dom.output.innerHTML != '0:00') thisBooking.initNewWidget(thisBooking.hoursAmount.dom.input.value,correctTable);
        else{
          window.alert('Choose other hour!');
        }
      });
    }

    thisBooking.hourPicker.dom.input.addEventListener('change', function(){
      correctTable = false;
      thisBooking.initNewWidget(thisBooking.hoursAmount.dom.input.value,correctTable);

    });
    thisBooking.datePicker.dom.input.addEventListener('change', function(){
      correctTable = false;
      thisBooking.initNewWidget(thisBooking.hoursAmount.dom.input.value,correctTable);
    });


    const confirm = document.querySelector('.order-confirmation button');
    confirm.addEventListener('click', function(){
      event.preventDefault();
      if(correctTable){
        console.log(thisBooking.hourPicker.dom.output.innerHTML != '0:00');
        if(correctTable != false && thisBooking.hourPicker.dom.output.innerHTML != '0:00'){
          thisBooking.sendBooking(correctTable);
          thisBooking.updateDOM();
          correctTable = false;
        }
        else window.alert('Your reservation is to long!');
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
          allTables[i].classList.remove(classNames.booking.clicked);
        }
      }
      else if(typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
        allTables[i].classList.remove(classNames.booking.clicked);
      }
    }

    let newAtribute = table.getAttribute('data-table');
    if(typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'){
      table.classList.add(classNames.booking.clicked);
    }
    else if(!thisBooking.booked[thisBooking.date][thisBooking.hour].includes(parseInt(newAtribute))){
      table.classList.add(classNames.booking.clicked);
    }
  }


  sendBooking(correctTable){
    const thisBooking = this;

    const bookingWrapper = document.querySelector(select.containerOf.booking);
    const adress = bookingWrapper.querySelector(select.cart.address).value;
    const phone = bookingWrapper.querySelector(select.cart.phone).value;
    const people = thisBooking.peopleAmount.dom.input.value;
    const hours = parseFloat(thisBooking.hoursAmount.dom.input.value);



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
        window.alert('Order accepted!');
        thisBooking.getData();
        //console.log('parsedResponse', parsedResponse);
      });

  }

 /*===========================================*/


 checkDuration(duration, correctTable){
   const thisBooking = this;
   //console.log(duration);
   //console.log(thisBooking.booked);
   //console.log(thisBooking.booked[thisBooking.date][thisBooking.hour]);
   let endOfOrder = parseFloat(thisBooking.hour)+parseFloat(duration);
   let maxValueOfWidget;
   for(let i = parseFloat(thisBooking.hour); i<=endOfOrder; i += 0.5){
     maxValueOfWidget = i - parseFloat(thisBooking.hour);
     //console.log('================================================');
     //console.log('maxValueOfWidget: ',maxValueOfWidget);
     //console.log('godzina wybrana przez uzutkownika: ', parseFloat(thisBooking.hour));
     //console.log('godzina dla ktorej sprawdzamy: ', i);
     //console.log('koniec rezerwacji: ', endOfOrder);

     //console.log(i,thisBooking.booked[thisBooking.date][i], correctTable);
     if(typeof thisBooking.booked[thisBooking.date][i] == 'undefined'){
       //thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, maxValueOfWidget);
       if(i<settings.hours.open || i>=settings.hours.close){
       window.alert('Open to 00:00 ');
       //return false;
       }
     }
     else{
       if((thisBooking.booked[thisBooking.date][i].includes(correctTable))){
        //console.log(i,thisBooking.booked[thisBooking.date][i], correctTable);
        //console.log('maksymalna wartośc widgetu: ',maxValueOfWidget);
        //console.log('Next reservation starts at ' + i);
        //console.log('godzina wybranej rezerwacji: ' + parseFloat(thisBooking.hour));
        //console.log('rezerwacja sie nie wykona bo jest za długa nastepna o ', i, 'maksymalna wartoc widgetu to: ',maxValueOfWidget );
        //thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, maxValueOfWidget);
        //return false;
       }
       //else thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, maxValueOfWidget);
     }
   }
   //console.log('rezerwacja jest ok, maksymalna wartoc widgetu to: ',maxValueOfWidget );
   //return true;
 }
  initNewWidget(duration, correctTable){
    const thisBooking = this;
    let endOfOrder = parseFloat(thisBooking.hour)+parseFloat(duration);
    let maxValueOfWidget;
    let i = parseFloat(thisBooking.hour) - 0.5;
    let doOrNot;
    if(correctTable){
      do{
        i += 0.5;
        maxValueOfWidget = i - parseFloat(thisBooking.hour);
        //console.log('======================================');
        //console.log('sprawdzana godzina: ', i);
        if(typeof thisBooking.booked[thisBooking.date][i] == 'undefined'){
          doOrNot = false;
          if(i == 24){
            doOrNot = true;
          }
        }
        else if(i == 0){
          console.log('opcja numer3');
          thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, 0);
        }

        else doOrNot = thisBooking.booked[thisBooking.date][i].includes(correctTable);
        //console.log('tablica zajętych stolików w danej godzine: ',thisBooking.booked[thisBooking.date][i]);
        //console.log('wybrany stolik: ', correctTable);
        //console.log('warunek: ',doOrNot);
      }while(!doOrNot);

      //console.log('finalana maxValueOfWidget: ',maxValueOfWidget);
      console.log('opcja numer2');
      thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, maxValueOfWidget);
    }
    else{
      console.log('opcja numer1');
      thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, 9);
    }
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
    thisBooking.dom.datePicker = document.querySelector(select.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.hourPicker.wrapper);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);

    //console.log(thisBooking.dom.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;
    //console.log(thisBooking.dom);
    //const test = 3.5;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, true, 0);
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
