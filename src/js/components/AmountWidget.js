/* eslint-disable no-unused-vars */
import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element) {
    super(element, settings.amountWidget.defaultValue); //calling constructor of BaseWidget class
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions(thisWidget.dom.input);
    // console.log('AmountWidget: ', thisWidget);
    // console.log('constructor arguments: ', element);
  }

  getElements() {
    const thisWidget = this;
  
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){
    console.log('isValid start ');
    return !isNaN(value) && value >= settings.amountWidget.defaultMin && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(input) {
    const thisWidget = this;
    //console.log('initActions this: ', input);

    thisWidget.dom.input.addEventListener('change', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value -= 1) ;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value += 1) ;
    });
  }
  
}

export default AmountWidget;