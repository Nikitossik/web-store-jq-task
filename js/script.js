$(document).ready(function(){

    //preloader

    $('body').addClass('noscroll');

    setTimeout(function(){$('#loader').addClass('hidden');  $('body').removeClass('noscroll');}, 1000);

    // prevent scrolling

    history.scrollRestoration = "manual";

    $(window).on('beforeunload', function(){
        $(this).scrollTop(0);
    });

    // navbar animation

    let navLinks = $('.main li a');

    navLinks.each(function(i){
        $(this).attr('style', '--i:' + (i * 0.3) + 's');
    });

    $('#nav_btn').click(function(e){
        $(this).toggleClass('btn-active');
        $('.navig-sliding').toggleClass('active');
        $('body').toggleClass('noscroll');
        $('.navbar-brand, .main li a, .text-box h2').toggleClass('animated');
        $('.main li a').click(function(){
            $('.navig-sliding').toggleClass('active');
            $('#nav_btn').toggleClass('btn-active');
            $('body').toggleClass('noscroll');
        });
        return false;
    });

    //logged user greeting

    if ($.cookie('user') != null){
        $('main.wrapper').prepend(`<div class='container-fluid user-logged-greeting'>
            <h2>You've logged as ${$.cookie('user')}</h2>
        </div>`);
    }
    else{
        $('.user-logged-greeting').remove();
    }

    // thanks if user bought smth

    if (localStorage.getItem('bought')){
        $('main.wrapper').prepend(`<div class='container-fluid user-bought'>
            <h4>Thank you for your purchase!</h4>
        </div>`);
    }
    else{
        $('.user-bought').remove();
    }

    //cart-toggler animation

    $('.cart-toggler').click(function(){
      if ($(this).find('i').hasClass('fas fa-plus')) $(this).find('i').removeClass('fas fa-plus').addClass('fas fa-minus');
      else if ($(this).find('i').hasClass('fas fa-minus')) $(this).find('i').removeClass('fas fa-minus').addClass('fas fa-plus');
      
    });

    //lazy img load
    if (!$('.envelope-box').length)$('section img').lazyLoadXT();

    //scrolling events and animations

    $(window).scroll(function(){
        let scrolled = $(this).scrollTop();
        $('.topBtn').toggleClass('active', scrolled > 250);
    });

    //products and field loading, drag and drop/products in localStorage saving

    let totalCount = 0, totalPrice = 0, LSInfo = {};

    if ($('#clothes').length) {

    let products = [], 
        prBox =  $('#clothes .prBox'), 
        draggingPr = $('#clothes .draggingPr'), 
        field = $('#clothes .cartField');
       

    $.getJSON( "products.json", function( data ) {
        $.each( data, function( key, val ) {
            products[key] = val;
            prBox.append(`<div class="col col-sm-6 col-md-4 col-12">
                <div class='card' id="product${products[key].id}">
                <img class="card-img-top mini" data-src="${products[key].imageCoverMini}">
                <img class="card-img-top model" data-src="${products[key].imageCoverModel}">
                <div class="card-body">
                    <h5 class="card-title">${products[key].name}</h5>
                    <p class="card-text">Sizes: ${products[key].sizes}</p>
                    <p class="card-text">Price: ${products[key].price} $</p>
              </div>
                </div>
            </div>`);
            $(`<div data-price='${products[key].price}' data-name='${products[key].name}' id='dr${products[key].id}'  data-id='${products[key].id}' data-class='card${products[key].id}' class='card card${products[key].id}'>
                <img data-id='img${products[key].id}' class="card-img-top img-fluid" src="${products[key].imageCoverMini}">
                <div class='card-body'>
                    <h6 class='card-text'>${products[key].name}</h6>
                    <p class='card-text'>${products[key].price} $</p>
                </div>
            </div>`).appendTo(draggingPr).draggable({
                revert: true, 
                containment: '.containment'
            });
          });
    });

    field.droppable({
        activeClass: 'cartActiveClass',
        hoverClass: 'cartHoverClass',
        drop: function (event, ui) {
            let item = ui.draggable.clone(),
            currentElemCount = 1;

            item.append(`<div class='card-footer'>
                <p class='card-text'>Count: <span id='elemCount'>${currentElemCount}</span></p>
            </div>`);

            let itemHTML = item.html();

            if (!$(this).find('.card' + item.attr('data-id')).length){
                let insertedCopy = $(`<div data-id='${item.attr('data-id')}' data-price='${item.attr('data-price')}' class="card inserted ${item.attr('data-class')}"></div>`);
                insertedCopy.append('<button class="delete"><i class="fas fa-times"></i></button>');
                insertedCopy.append(itemHTML);
                $(this).append(insertedCopy);

                LSInfo[item.attr('data-id')] = {
                    'imgSource': item.find('img').attr('src'),
                    'price': item.attr('data-price'),
                    'name': item.attr('data-name'),
                    'count': 1,
                    'id': item.attr('data-id')
                };
            }
            else{
                let elem = $(this).find('.card' + item.attr('data-id')),
                    count = +elem.find('#elemCount').text();

                currentElemCount = count + 1;

                elem.find('#elemCount').text(currentElemCount);

                LSInfo[item.attr('data-id')]['count'] = currentElemCount;
            }

            totalCount++;
            $("#prCount").text(totalCount);

            totalPrice += parseInt(item.attr('data-price'));
            $("#cost").text(totalPrice);

            updateLS(LSInfo, [totalCount, totalPrice]);

            updateNavbarCart();
        }
    });

    $('body').on('click', '.inserted .delete', function(){

       if (totalCount > 0) totalCount -= $(this).parent().find('#elemCount').text();
       if (totalPrice > 0) totalPrice -= $(this).parent().attr('data-price') * $(this).parent().find('#elemCount').text();

        $('#prCount').text(totalCount);
        $('#cost').text(totalPrice);

        delete LSInfo[$(this).parent().attr('data-id')];

        updateLS(LSInfo, [totalCount, totalPrice]);

        $(this).parent().remove();

        updateNavbarCart();
    });

}

    $('body').on('click', '#cartModal .delete', function(){

        if (totalCount > 0) totalCount -= $(this).parent().siblings('.count').text();
        if (totalPrice > 0) totalPrice -= $(this).parents('tr').attr('data-price') * $(this).parent().siblings('.count').text();

        $('#prCount').text(totalCount);
        $('#cost').text(totalPrice);

        delete LSInfo[$(this).parents('tr').attr('data-id')];

        updateLS(LSInfo, [totalCount, totalPrice]);

        $(this).parents('tr').remove();
        if ($('#clothes').length) 
        if ($('#clothes .inserted.card' + $(this).parents('tr').attr('data-id'))) $('#clothes .inserted.card' + $(this).parents('tr').attr('data-id')).remove();


        if (!$('.cartTr').length) {
            updateNavbarCart();
        }
    });

    updateNavbarCart();

    //user form validation

    if ($('#regUser').length){
        // $('#regUser').validationEngine();

        $('#regUser').validate({
            rules:{
               login:{
                 required: true,
                 minlength: 8,
                 maxlength: 12,
               },
               pass:{
                 required: true,
                 minlength: 6,
                 maxlength: 12,
               },
            },
            messages:{
              login:{
                required: "Login is required!",
                minlength: "At least 8 symbols!",
                maxlength: "16 symbols to the limit are allowed!",
            },
              pass:{
              required: "Password is required!",
              minlength: "At least 6 symbols!",
              maxlength: "12 symbols to the limit are allowed!",
              }
            }
         });

         $('#regUser').submit(function(){
            $.cookie('user', $(this).find('#login').val(), {expires: 7, path: '/'});
            return true;
         });

    };

    if ($('#buyProducts').length){

        $.validator.addMethod('validPhoneNumber', function (value, element) {
            let reg = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;
            return this.optional(element) || reg.test(value);
        }, "Please enter a valid phone number");

        
        $.validator.addMethod('validCardNumber', function (value, element) {
            let reg = /^4[0-9]{12}(?:[0-9]{3})?$/;
            return this.optional(element) || reg.test(value);
        }, "Please enter a valid card number");

        
        $.validator.addClassRules('validPhone', {
            validPhoneNumber: true
        });
        
        $.validator.addClassRules('validCardNumber', {
            validCardNumber: true
        });
        

        $('#buyProducts').validate({
            rules:{
                name:{
                 required: true,
               },
               surname:{
                required: true,
               },
               credit:{
                 required: true,
                 creditcard: true,
                },
               tel: {
                   required: true
               }
            },
            messages:{
              name:{
                required: "Name is required!",
            },
              surname:{
              required: "Surname is required!",
              },
            },
         });
    }

    $('#buyProducts .btn').click(function(){
        localStorage.removeItem('pr');
        localStorage.removeItem('totals');
        localStorage.setItem('bought', '+');
        updateNavbarCart();
        return true;
    });

    //chatbot

    const phrases = [
        "We'll call you later!",
        "Have some questions? Call this number: 044-202-75-89",
        "Stand by!",
      ];

      const hello = "Hello, how do you do?)";  
      const bye = "Bye!";

      $('#answers').append(`<div class='bot_answ'>${hello}</div>`);
     
      $('#chat-message, #send, .bot_answ').click(function () {
        return false;
    });;

    $("#send").click(function () {
        let q = $("#chat-message").val(), form = $("#chatbot form")[0];
    
        if (q.trim() != "") {
          $("#answers").append(`<div class="human_answ">${q.trim()}</div>`);
          let ql = q.toLowerCase();
          let bl = bye.substr(0, bye.length - 1).toLowerCase();
          setTimeout(function () {
            if (ql.search(bl) != -1) {
              $("#answers").append(`<div class="bot_answ">${bye}</div>`);
            } else {
              $("#answers").append(`<div class="bot_answ">${phrases[Math.floor(Math.random() * phrases.length)]}</div>`);
            }
            form.scrollTo({
                top: form.scrollHeight + form.clientHeight,
                behavior: 'smooth'
            });
          }, 1000);
        }
        return false;
      });
    
      $("#chat-message").keypress("keyup", function (event) {
        if (event.keyCode == 13) {
          console.log(event.keyCode);
          $("#send").click();
          return false;
        }
      });

      // special offer timer

      if ($('#timer').length){
        setInterval(() => {
            $('#timer').html(timer());
        }, 1000);
      }



});

// function for cart products showing

function updateNavbarCart(){
    let data = JSON.parse(localStorage.getItem('pr')),
    total = JSON.parse(localStorage.getItem('totals'));

    let choosen = $('#cartModal .modal-body');

    if (isEmpty(data)){
        if (!choosen.hasClass('empty')){
            choosen.addClass('empty');
        }   
        choosen.html(`<h2 class='message'>Your cart is empty!</h2>`);
    }
    else{
        choosen.removeClass('empty');
        let choosenHTML = '';

        choosenHTML += `<table>
        <tr>
          <th>Image</th>
          <th>Product name</th>
          <th>Amount</th>
          <th>Price, $</th>
          <th>Delete</th>
        </tr>`;

        for (key in data){
             choosenHTML += `<tr class='cartTr row${data[key]['id']}' data-price='${data[key]['price']}' data-id='${key}'>
             <td class='image'><img src='${data[key]['imgSource']}'></td>
             <td class='name'>${data[key]['name']}</td>
             <td class='count'>${data[key]['count']}</td>
             <td class='price'>${data[key]['price']}</td>
             <td class='deleteTd'><button class="delete"><i class="fas fa-times"></i></button></td>
         </tr>`;
         }

         choosenHTML += `<div class="infoBlock">
         <span class="fieldInfo"><span>Total items: </span><span id='modalCount'>${total[0]}</span></span>
         <span class="fieldInfo"><span>Total price: </span><span id='modalCost'>${total[1]}</span>$</span>
       </div></table>`;
         choosen.html(choosenHTML);
    }
}

//is object empty? 

function isEmpty(obj) {
    for (let key in obj) {
      return false;
    }
    return true;
}

//updataing local storage

function updateLS(LSInfo, totals){
    localStorage.setItem('totals', JSON.stringify(totals));
    localStorage.setItem('pr', JSON.stringify(LSInfo));
}

function timer(){
    let planned = new Date(2021, 1, 28, 0, 0, 0),
        current = new Date(),
        timer;

    function check(time){
        return time < 10 ? '0' + time : time;
    }
    
    let ms = planned - current,
        daysLeft = Math.floor(ms / (1000*60*60*24)),
        hoursLeft = Math.floor(ms % (1000*60*60*24) / (1000*60*60)),
        minLeft = Math.floor(ms % (1000*60*60) / (1000*60)),
        secLeft = Math.floor(ms % (1000*60) / 1000);

    let result = `${daysLeft} days, ${hoursLeft} hours, ${minLeft} minutes, ${secLeft} seconds`;

    return ms > 0 ? result : 'The time is left!';

}