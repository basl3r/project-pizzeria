import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.selectedTable = null;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =  settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    //console.log('getData thisBooking', thisBooking);
    const params = {
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

    //console.log('getData params', params);

    const urls = {
      booking:        settings.db.url + '/' + settings.db.bookings + '?' +  params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table); 
        }
      }
    }

    //console.log('thisBooking.booked: ',  thisBooking.booked);
    
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    console.log(date, hour, duration, table);
    const thisBooking = this;
    
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    
    if (typeof thisBooking.booked[date][startHour] == 'undefined') {
      thisBooking.booked[date][startHour] = [];
    }
    
    thisBooking.booked[date][startHour].push(table);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.selectedTable = null;

    const selectedTables = thisBooking.dom.floorPlan.querySelectorAll('.booking-selected');
        
    for (let table of selectedTables) {
      table.classList.remove('booking-selected');
    }

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

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

    console.log(thisBooking);
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element; 

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.dataPicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.inputPhone);

    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.inputAddress);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.inputStarters);

    console.log(' thisBooking.dom.starters',  thisBooking.dom.starters);
  }

  initTables(event) {
    const thisBooking = this;

    const clickedTable = event.target.closest('div');
  
    if (clickedTable.classList.contains('booked')) {
      console.log('Table booked');
        
    }
    else if (clickedTable.hasAttribute(settings.booking.tableIdAttribute)) {
      const tableId = clickedTable.getAttribute(settings.booking.tableIdAttribute);
  
      const isTableSelected = clickedTable.classList.contains('booking-selected');
  
      const selectedTables = thisBooking.dom.floorPlan.querySelectorAll('.booking-selected');
        
      for (let table of selectedTables) {
        table.classList.remove('booking-selected');
      }
  
      if (!isTableSelected) {
        clickedTable.classList.add('booking-selected');
        thisBooking.selectedTable = +tableId;
      } else {
        thisBooking.selectedTable = null;
      }
    }
  }

  initWidgets() {
    const thisBooking = this;


    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dataPicker);    
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
      thisBooking.resetTables();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  resetTables() {
    const thisBooking = this;
  
    const selectedTables = thisBooking.dom.floorPlan.querySelectorAll('.booking-selected');
    for (let table of selectedTables) {
      table.classList.remove('booking-selected');
    }

    thisBooking.selectedTable = [];
  }

  sendBooking() {
    const thisBooking = this;

    const selectedStarters = [];
    
    for (let starter of thisBooking.dom.starters){
      if (starter.checked) {
        selectedStarters.push(starter.value);
      }
    }

    console.log('sendBooking thisBooking: ', thisBooking);
    const url = settings.db.url + '/' + settings.db.bookings;

    console.log(url);

    const payload = {
      'date': thisBooking.datePicker.correctValue,
      'hour': thisBooking.hourPicker.correctValue,
      'table': thisBooking.selectedTable,
      'duration': thisBooking.hoursAmount.correctValue,
      'ppl': thisBooking.peopleAmount.correctValue,
      'starters': selectedStarters,
      'phone': thisBooking.dom.phone.value,
      'address': thisBooking.dom.address.value,
    };

    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function (response) {
        return response.json(); //convert from json to JS
      })
      .then(function () {
        thisBooking.makeBooked(
          payload.date,
          payload.hour,
          payload.duration,
          payload.table
        );
        thisBooking.updateDOM();
        console.log('thisbooking.booked', thisBooking.booked);
      });
  }
}

export default Booking;