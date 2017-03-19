$(function () {
	var products = [];
	var filters = {};
$.getJSON( "products.json", function( data ) {
	products = data;
      console.log(data);
			generateAllProductsHTML(products);
					$(window).trigger('hashchange');
});

var checkboxes =$(' input[type=checkbox]');
checkboxes.change(function() {
	var value = $(this);
var	specName = value.attr('name');
    if (value.is(':checked')) {
			if(!(filters[specName] && filters[specName].length)){
				filters[specName] = [];
			}
         filters[specName].push(value.val());
				 createQueryHash(filters);
    } else if(filters[specName] && filters[specName].length && (filters[specName].indexOf(value.val()) != -1)){
// Find the checkbox value in the corresponding array inside the filters object.
				var index = filters[specName].indexOf(value.val());
				console.log(index);
				// Remove it.
				filters[specName].splice(index, 1);
				// If it was the last remaining value for this specification,
				// delete the whole array.
				if(!filters[specName].length){
					delete filters[specName];
				}
			}
			// Change the url hash;
			createQueryHash(filters);
    });

		$(window).on('hashchange', function(){
			render(decodeURI(window.location.hash));
		});

		function render(url) {
			// Get the keyword from the url.
			var temp = url.split('/')[0];
			var	map = {
				// The "Homepage".
				'': function() {

					// Clear the filters object, uncheck all checkboxes, show all the products
					filters = {};
					checkboxes.prop('checked',false);
					renderProductsPage(products);
				},
				// Single Products page.
				'#product': function() {

					// Get the index of which product we want to show and call the appropriate function.
					var index = url.split('#product/')[1];
			console.log(index);
					renderSingleProductPage(index, products);
				},

				// Page with filtered products
				'#filter': function() {

					// Grab the string after the '#filter/' keyword. Call the filtering function.
					url = url.split('#filter/')[1].trim();

					// Try and parse the filters object from the query string.
					try {
						filters = JSON.parse(url);
						//take json string and convert into javascript value
					}
						// If it isn't a valid json, go back to homepage ( the rest of the code won't be executed ).
					catch(err) {
						window.location.hash = '#';
						return;
					}
					renderFilterResults(filters, products);
				}
			};
			// Execute the needed function depending on the url keyword (stored in temp).
			if(map[temp]){
				map[temp]();
			}
			// If the keyword isn't listed in the above - render the error page.
			else {
				renderErrorPage();
			}

		}

		$('#refreshButton').click(function (e) {
			e.preventDefault();
			window.location.hash = '';
		});


		function renderSingleProductPage(index, data){

			var page = $('.single-product'),
				container = $('.modal-body');
			// Find the wanted product by iterating the data object and searching for the chosen index.
			if(data.length){
				data.forEach(function (item) {
					// console.log(item);
					if(item.id == index){
						// Populate '.preview-large' with the chosen product's data.
						container.find('h3').text(item.name);
						container.find('img').attr('src', item.image.large);
						container.find('p').text(item.description);
					}
				});
			}

		}
		$('.close').click(function (e) {
			e.preventDefault();
			window.location.hash = '';
		});
		// This function receives an object containing all the product we want to show.

		function renderFilterResults(filters, products){

				// This array contains all the possible filter criteria.
			var criteria = ['manufacturer','storage','os','camera'],
				results = [],
				isFiltered = false;

			// Uncheck all the checkboxes.
			// We will be checking them again one by one.
			checkboxes.prop('checked', false);
			criteria.forEach(function (c) {
				console.log(c);
				// Check if each of the possible filter criteria is actually in the filters object.
				if(filters[c] && filters[c].length){

					// After we've filtered the products once, we want to keep filtering them.
					// That's why we make the object we search in (products) to equal the one with the results.
					// Then the results array is cleared, so it can be filled with the newly filtered data.
					if(isFiltered){
						products = results;
						results = [];
					}

					// In these nested 'for loops' we will iterate over the filters and the products
					// and check if they contain the same values (the ones we are filtering by).

					// Iterate over the entries inside filters.criteria (remember each criteria contains an array).
					filters[c].forEach(function (filter) {
						// Iterate over the products.
						products.forEach(function (item){
							// If the product has the same specification value as the one in the filter
							// push it inside the results array and mark the isFiltered flag true.

							if(typeof item.specs[c] == 'number'){
								if(item.specs[c] == filter){
									results.push(item);
									isFiltered = true;
								}
							}

							if(typeof item.specs[c] == 'string'){
								if(item.specs[c].toLowerCase().indexOf(filter) != -1){
									results.push(item);
									isFiltered = true;
								}
							}

						});

						// Here we can make the checkboxes representing the filters true,
						// keeping the app up to date.
						if(c && filter){
							$('input[name='+c+'][value='+filter+']').prop('checked',true);
						}
					});
				}

			});

			// Call the renderProductsPage.
			// As it's argument give the object with filtered products.
			renderProductsPage(results);
		}

		function renderProductsPage(data){

			var page = $('.all-products'),
				allProducts = $('.products-list >span');

			// Hide all the products in the products list.
			allProducts.addClass('hidden');

			// Iterate over all of the products.
			// If their ID is somewhere in the data object remove the hidden class to reveal them.
			allProducts.each(function () {

				var that = $(this);

				data.forEach(function (item) {
					if(that.data('index') == item.id){
						that.removeClass('hidden');
					}
				});
			});
		}

function createQueryHash(filters){
	// Here we check if filters isn't empty.
	if(!$.isEmptyObject(filters)){
		// Stringify the object via JSON.stringify and write it after the '#filter' keyword.
		window.location.hash = '#filter/' + JSON.stringify(filters);
	}
	else{
		// If it's empty change the hash to '#' (the homepage).
		window.location.hash = '#';
	}

}

function generateAllProductsHTML(data){

	var list = $('.all-products .products-list');

	var theTemplateScript = $("#products-template").html();
	//Compile the template​
	var theTemplate = Handlebars.compile (theTemplateScript);
	list.append (theTemplate(data));

	list.find('span').on('click', function (e) {
		e.preventDefault();

		var productIndex = $(this).data('index');

		window.location.hash = 'product/' + productIndex;
	})
}
});
