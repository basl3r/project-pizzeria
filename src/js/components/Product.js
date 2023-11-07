class Product {
    
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAmountWidget();
    thisProduct.initOrderForm();
    console.log('new Product: ', thisProduct);
    thisProduct.initAccordion();
  }
  
  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
  
    thisProduct.dom = {};
  
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);

    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);

    thisProduct.dom.cardButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    console.log('thisProduct in initAccordion: ', thisProduct);
    /* find the clickable trigger (the element that should react to clicking) */
    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      const clickedElement = this;
      console.log('clickedElement: ', clickedElement);
      /* prevent default action for event */
      event.defaultPrevented;
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active');
      console.log('activeProduct', activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct)
        activeProduct.classList.remove('active');
      /* toggle active class on thisProduct.element */
      if (thisProduct.element !== activeProduct)
        thisProduct.element.classList.toggle('active');
    });

  }

  initOrderForm() {
    const thisProduct = this;
    console.log('this in initOrderForm: ', thisProduct);

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.dom.cardButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
    
  }

  processOrder() {
    const thisProduct = this;
  
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    console.log('formData', formData);
    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log(paramId, param);
  
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);
        console.log('option.default: ', option.default);
        
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          if (option.default === undefined)
            price += option.price;
        } else if (option.default === true)
          price -= option.price;

        const image = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
        console.log(image);

        if (image) {
          if (optionSelected) {
            image.classList.add(classNames.menuProduct.imageVisible);
          } else
            image.classList.remove(classNames.menuProduct.imageVisible);
        } 
      }
    }
  
    thisProduct.priceSingle = price;
    // multiply price by amount
    price *= thisProduct.amountWidget.value;
    
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  initAmountWidget() {
    const thisProduct = this; 

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', () => {
      thisProduct.processOrder();
    });
  }

  resetToDefaultState() {
    const thisProduct = this;
    console.log('resetToDefault: ', thisProduct);

    thisProduct.amountWidget.value = 1;
    
    thisProduct.amountWidget.input.value = 1;

    thisProduct.dom.priceElem.innerHTML = thisProduct.priceSingle;

  }

  addToCart() {
    const thisProduct = this;   
    
    app.cart.add(thisProduct.prepareCartProduct());

    thisProduct.resetToDefaultState();
  
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams()
    };

    console.log('prduct Summary: ', productSummary);
    return productSummary;

  }

  prepareCartProductParams() {
    const thisProduct = this;
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    console.log('formData', formData);

    thisProduct.params = {};
    let newParams = thisProduct.params;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log('paramId, param: ', paramId, param);

      newParams[paramId] = {};

      newParams[paramId].label = param.label;

      newParams[paramId].options = {};

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if (optionSelected) {
          newParams[paramId].options[optionId] = option.label;
        }
      }
    }
    console.log('newParams: ', newParams);
    return newParams;
  }
}