
$(document).ready(function()
{


	var header = $('.header');

	initMenu();
	initSvg();
	initQty();
	updateCosts();
	setHeader();

	$(window).on('resize', function()
	{
		setHeader();
	});

	$(document).on('scroll', function()
	{
		setHeader();
	});

	/* 

	2. Set Header

	*/

	function setHeader()
	{
		if($(window).scrollTop() > 91)
		{
			header.addClass('scrolled');
		}
		else
		{
			header.removeClass('scrolled');
		}
	}

	/* 

	3. Init Menu

	*/

	function initMenu()
	{
		if($('.menu').length)
		{
			var hamburger = $('.hamburger');
			var header = $('.header');
			var superContainerInner = $('.super_container_inner');
			var superOverlay = $('.super_overlay');
			var headerOverlay = $('.header_overlay');
			var menu = $('.menu');
			var isActive = false;

			hamburger.on('click', function()
			{
				superContainerInner.toggleClass('active');
				menu.toggleClass('active');
				header.toggleClass('active');
				isActive = true;
			});

			superOverlay.on('click', function()
			{
				if(isActive)
				{
					superContainerInner.toggleClass('active');
					menu.toggleClass('active');
					header.toggleClass('active');
					isActive = false;
				}
			});

			headerOverlay.on('click', function()
			{
				if(isActive)
				{
					superContainerInner.toggleClass('active');
					menu.toggleClass('active');
					header.toggleClass('active');
					isActive = false;
				}
			});
		}
	}

	/* 

	4. Init SVG

	*/

	function initSvg()
	{
		if($('img.svg').length)
		{
			jQuery('img.svg').each(function()
			{
				var $img = jQuery(this);
				var imgID = $img.attr('id');
				var imgClass = $img.attr('class');
				var imgURL = $img.attr('src');

				jQuery.get(imgURL, function(data)
				{
					// Get the SVG tag, ignore the rest
					var $svg = jQuery(data).find('svg');

					// Add replaced image's ID to the new SVG
					if(typeof imgID !== 'undefined') {
					$svg = $svg.attr('id', imgID);
					}
					// Add replaced image's classes to the new SVG
					if(typeof imgClass !== 'undefined') {
					$svg = $svg.attr('class', imgClass+' replaced-svg');
					}

					// Remove any invalid XML tags as per http://validator.w3.org
					$svg = $svg.removeAttr('xmlns:a');

					// Replace image with new SVG
					$img.replaceWith($svg);
				}, 'xml');
			});
		}	
	}

	/* 

	5. Init Qty

	*/

	function initQty()
	{
		if($('.product_quantity').length)
		{
			var qtys = $('.product_quantity');

			qtys.each(function()
			{
				var qty = $(this);
				var sub = qty.find('.qty_sub');
				var add = qty.find('.qty_add');
				var num = qty.find('.product_num');
				var original;
				var newValue;

				sub.on('click', function()
				{
					original = parseFloat(qty.find('.product_num').text());
					if(original > 0)
						{
							newValue = original - 1;
						}
					num.text(newValue);
					updateCosts()
				});

				add.on('click', function()
				{
					original = parseFloat(qty.find('.product_num').text());
					newValue = original + 1;
					num.text(newValue);
					updateCosts()
				});
			});
		}
	}
	function updateCosts()
	{
		if($('ul.cart_items_list>li').length){
			var total=0;
			var prods = $('ul.cart_items_list>li');
			prods.each(function(){
				var prod = $(this);
				var cost = prod.find("div:nth-child(2)").text();
				cost=cost.slice(8,cost.length-1);
				var quantity = prod.find("div:nth-child(3)>div>span").text();
				var costBooks = $("div:nth-child(4)").text();
				costBooks = costBooks.slice(1,costBooks.length);
				prod.find("div:nth-child(4)").text("₹"+cost*1);
				total += cost*10;
			});
		}
		if(total==undefined)
			total=0;
		$("div.shipping>ul>li:nth-child(1)>div").text("₹"+total);
		$("ul.cart_extra_total_list>li:nth-child(1)>div:nth-child(2)").text("₹"+total);
		$("ul.cart_extra_total_list>li:nth-child(3)>div:nth-child(2)").text("₹"+total);
	}

});