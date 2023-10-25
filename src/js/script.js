/* eslint-disable no-debugger */
/* global utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
  }

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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
    
  }

  class Cart {
    constructor(element) {
      const thisCart = this;
      
      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart, element);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle('active');
      });
    }
  }

  const app = {

    initMenu: function() {
      console.log('** initMenu started **');
      const thisApp = this;
      console.log('thisApp in initMenu: ', thisApp);
      console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      console.log('** initData started **');
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCard: function() {
      const thisApp = this;
      
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function() {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCard();
    }
  };
  
  app.init();
}
