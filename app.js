const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZX_IGFYY6JFsWRD6dib-Y60KINzKNZkpca7vRDWK1ZcqcH15S4FvKJQ7RVU9X0QwwduWq8aIeXOJBHC',
  'client_secret': 'EOSmjBy05_DPYYDDooSKQy-eM4CgasPqRxkJ33XzCHcFHq8lsdFEMArrXnwJURJQccRewzqukwC6tF0T'
});


const app = express();
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');

app.get('/', function(req, res){res.render('index')});

app.post('/pay', urlencodedParser, function(req,res){
	console.log(req.body.firstname);
    var recipient_name = req.body.firstname + " " + req.body.lastname;
	var street = req.body.street;
	var country_code = req.body.country;
	var postal_code = req.body.zip;
	var state = req.body.state;

	const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25",
                "currency": "USD",
                "quantity": 1
            }],
            "shipping_address": {
              "recipient_name": recipient_name,
              "line1": street,
              "line2": "Unit #34",
	          "city": "San Jose",
	          "country_code": country_code,
	          "postal_code": postal_code,
	          "phone": "011862212345678",
	          "state": state
        }
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
   };

	paypal.payment.create(create_payment_json, function (error, payment) {
			  if (error) {
			      throw error;
			  } else {
			      for(let i = 0;i < payment.links.length;i++){
			        if(payment.links[i].rel === 'approval_url'){
			          res.redirect(payment.links[i].href);
			        }
			      }
			  }
    });
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
        res.send(req.query.PayerID);
        res.send(req.query.paymentId);
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(3000, () => console.log('Server Started'));