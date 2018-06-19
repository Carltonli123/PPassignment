const express = require('express');
const ejs = require('ejs');
//import paypal node sdk
const paypal = require('paypal-rest-sdk');

//configure a sandbos environment
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZX_IGFYY6JFsWRD6dib-Y60KINzKNZkpca7vRDWK1ZcqcH15S4FvKJQ7RVU9X0QwwduWq8aIeXOJBHC',
  'client_secret': 'EOSmjBy05_DPYYDDooSKQy-eM4CgasPqRxkJ33XzCHcFHq8lsdFEMArrXnwJURJQccRewzqukwC6tF0T'
});


const app = express();
// use bodyparser to parse the information filled in by user/buy in the html form in "index.ejs"
const bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.set('view engine', 'ejs');

app.get('/', function(req, res){res.render('index')});

// accept payment information
app.post('/pay', urlencodedParser, function(req,res){

  // get buyer information from html form in "index.ejs"
	console.log(req.body.firstname);
  var recipient_name = req.body.firstname + " " + req.body.lastname;
  console.log(recipient_name);
	var street = req.body.street;
	var country_code = req.body.country;
	var postal_code = req.body.zip;
	var state = req.body.state;
  
  // create payment after "buy" button is clicked
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
                "price": "5",
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
            "total": "5.00"
        },
        "description": "Hat for the best team ever"
    }]
   };

  // create payment after "buy" button is clicked, use the json variable declared above
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

// execute the payment and redirect to "Thank you" page after user authorized the payment. 
app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "5.00"
        }
    }]
  };

  //excute the payment using the payment json declared above
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Thank you!'+'</br>'+'Your transaction ID is:'+payment.transactions[0].related_resources[0].sale.id);
        
    }
});
});

// display "Cancelled" if the user cancel
app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(3000, () => console.log('Server Started'));