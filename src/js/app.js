import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {

  initMenu: function() {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    console.log('** initData started **');
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();

      });

  },

  initCart: function() {
    const thisApp = this;
      
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener ('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  init: function() {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },

  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');

        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;

      });
    }

    const orderLink = document.querySelector('#home-page a[href="#order"]');
    console.log('orderLink: ', orderLink);

    if (orderLink) {
      orderLink.addEventListener('click', function(event) {
        event.preventDefault();

        const id = 'order'; // or any other id you want
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
        console.log('Order link clicked');
      });
    }

    const bookingLink = document.querySelector('#home-page a[href="#booking"]');
    console.log('bookingLink: ', bookingLink);

    if (bookingLink) {
      bookingLink.addEventListener('click', function(event) {
        event.preventDefault();

        const id = 'booking'; // or any other id you want
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
        console.log('Booking link clicked');
      });
    }
  },

  activatePage: function(pageId) {
    const thisApp = this;

    /* add class 'active' to matching pages, remove from non-matching */
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    
    /* add class 'active' to matching links, remove from non-matching */
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initBooking: function() {

    const bookingContainer = document.querySelector(select.containerOf.booking);

    new Booking(bookingContainer);

  }
};



app.init();
