class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);

    if (!thisWidget.input.value)
      thisWidget.input.value = settings.amountWidget.defaultValue;
    
    thisWidget.setValue(thisWidget.input.value);

    thisWidget.initActions(thisWidget.input);
    console.log('AmountWidget: ', thisWidget);
    console.log('constructor arguments: ', element);
  }

  getElements(element) {
    const thisWidget = this;
  
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;
    console.log('thisWidget.value: ', thisWidget.input.value);
    const newValue = parseInt(value);
    if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      if (value !== newValue && !isNaN(newValue)) {
        thisWidget.value = newValue;
      }
      thisWidget.announce();
      thisWidget.input.value = thisWidget.value;
    } else 
      return thisWidget.value = thisWidget.input.value;
  }

  initActions(input) {
    const thisWidget = this;
    console.log('initActions this: ', input);

    thisWidget.input.addEventListener('change', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value -= 1) ;
    });

    thisWidget.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value += 1) ;
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
  
}