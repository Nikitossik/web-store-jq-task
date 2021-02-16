$(document).ready(function(){
    let envelope = $('.envelope'),
        button = $('.open-env'),
        paper = $('.paper'),
        audio = $('#envelope-audio')[0];

        let randomMoney = 50 + Math.floor(Math.random() * 1000);

        button.click(function(){
            envelope.toggleClass('opened');
            if (!localStorage.getItem('hasMoney')) {
                localStorage.setItem('hasMoney', '+');
                paper.html(`<h2>${randomMoney}$ is your gift. Good luck!</h2>`);
            }
            else paper.html(`<h2>You have already received your gift!</h2>`);
            if (envelope.hasClass('opened')) audio.play();
            else audio.pause();
    });
});