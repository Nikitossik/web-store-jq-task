$(document).ready(function(){
    let video = $('#how-to-v')[0],
        box = $('.video-box');

    box.click(function(){
        box.toggleClass('active');
        if (box.hasClass('active')) video.play();
        else video.pause();
    });

    
});