insert into products (id, title, description, price)
values
	(default, 'ProductOne',		'Short Product Description1', 24),
	(default, 'ProductNew',		'Short Product Description3', 10),
	(default, 'ProductTop',		'Short Product Description2', 23),
	(default, 'ProductTitle',	'Short Product Description7', 15),
	(default, 'Product',		'Short Product Description2', 23),
	(default, 'ProductTest',	'Short Product Description4', 15),
	(default, 'Product2',		'Short Product Description1', 23),
	(default, 'ProductName',	'Short Product Description7', 15)
;

insert into stocks(product_id, "count")
select id, floor(random() * 10 + 1)::int from products
;