import { settings, select, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    
    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);

    thisCart.dom.totalCart = thisCart.dom.wrapper.querySelector(select.cart.totalCart);

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function() {
      thisCart.dom.wrapper.classList.toggle('active');
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
      thisCart.clearCart();
    });
  }

  add(menuProduct) {
    const thisCart = this;
    console.log('thisCart:', thisCart);
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    console.log('generatedHTML: ', generatedHTML);
    /* create element using utils.createElementFromHTML */
    thisCart.element = utils.createDOMFromHTML(generatedHTML);
    console.log('thisCart.element: ', thisCart.element);
    /* add element to cart */
    thisCart.dom.productList.appendChild(thisCart.element);

    console.log('adding product: ', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
    console.log('thisCart.products: ', thisCart.products);

    thisCart.update ();
  }

  update () {
    const thisCart = this;

    let deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    console.log(thisCart.subtotalPrice, thisCart.totalNumber, );

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      deliveryFee = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    thisCart.dom.totalCart.innerHTML = thisCart.totalPrice;
      
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

  }

  remove(thisCartProduct) {
    const thisCart = this;

    thisCartProduct.dom.wrapper.remove();

    const indexOfCartProduct = thisCart.products.indexOf('cartProduct');
    thisCart.products.splice(indexOfCartProduct, 1);


    thisCart.update();
  }

  clearCart() {
    const thisCart = this;
    thisCart.products = [];
    thisCart.dom.productList.innerHTML = '';
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: []
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options);

  }

}

export default Cart;