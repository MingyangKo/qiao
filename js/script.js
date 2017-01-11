$(function(){
		var h = $(window).height();
		var navh = $("#nav_affix").height();
		var firstparth = $(".firstpart_position").height();


    $("#triangle").click(function(){
        jQuery("html,body").animate({
            scrollTop:h
        },1000);
    });
		$("#nav_logo").click(function(){
				jQuery("html,body").animate({
						scrollTop:0
				},1000);
		});
    $(window).scroll(function() {
        if ( $(this).scrollTop() >= h){
						$(".firstpart_position").css("top",navh+10);
						$(".firstpart_position").css("height",firstparth+navh+10);
						$("#nav_logo").css("display","inline");
            $('#nav_affix').addClass("navs");
        } else {
						$(".firstpart_position").css("top",0);
						// $(".firstpart_position").css("height",fistparth+navh+10);
						$("#nav_logo").css("display","none");
            $('#nav_affix').removeClass("navs");
        }
    });
});
