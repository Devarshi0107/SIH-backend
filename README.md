Total api
Login and signup ( without sing in with google ) - Pending - Vasu - user
Login ( without sing in with google ) - Pending - Vasu - Postal circle
Login and signup ( without sing in with google ) - Pending - Vasu - Admin
Login and signup ( with sing in with google ) - Pending - Kirtan - user
Get , Put , Delete  , Post  api when user add phone number and address - Pending - Harsh - user
Contact (chat with support) - Pending - Kirtan - user (user to admin) - Future work 
Contact (chat with support) - Pending - Kirtan - Post circle (Post circle to admin) - Future work
Search (stamp name) - Pending - Harsh - user
Community - Post (admin and user) , Put (admin and user) , get , delete - Pending - Devarshi 
like - Pending - Devarshi 
share - Pending - Devarshi 
comment (post circle also ) - Pending - Devarshi 
subscribe news - Pending  - Devarshi
Upcoming Event - Pending - Kirtan - user
Pda account open - Pending - Kirtan -user 
get all post circle id with state and city - Pending - Kirtan - user
news - post , get , put , delete - Pending - Kirtan 
total PDA account (total number ) - Pending - Harsh - Admin
total number of user - Pending - Harsh - Admin
total sales ( from order sucess ) - Vasu - Admin
generate sales report - vasu - admin
postal circle listing item own using id get , post , put , delete  - Pending - Devarshi - postal circle
user order api - Pending - Kirtan
show order by user in post circle  - Pending - Kirtan
add money in wallet - Pending - Kirtan - Usera
add to cart api - Pending - Kirtan - User
Translate api - Pending - Devarshi - Future work
wallet balance add when order by user in postal circle side - Pending - Kirtan





API endpoint 
1.GET)localhost:5000/api/postal-circles
 get all postal circle details without admin verify
2.(GET)localhost:5000/api/philatelic-items
get  all philatalic item 
3. (POST)localhost:5000/api/philatelic-items
{
  "title": "New Postal Circle Announcement",
  "description": "Join us for the upcoming event at the ABC postal circle. Learn about the latest services and updates.",
  "image": "https://example.com/news-image.jpg",
  "postalCircle": "ABC Postal Circle",
  "postedTime": "2024-11-10T14:00:00Z"
}
philatelic-items upload by post circle
4.(POST)localhost:5000/api/postal-circles
{
  "unique_id": "PC456",
  "name": "Mumbai Postal Circle",
  "email": "mumbai@postal.com",
  "user": "615c2d6e8f123456789abcd1",
  "region": "Western",
  "state": "Maharashtra",
  "address": {
    "street": "123 Postal Lane",
    "city": "Mumbai",
    "pincode": "400001"
  },
  "coin_rules": [
    {
      "minimum_order_amount": 500,
      "coins_to_give": 10
    }
  ]
}

postal circle details upload by admin without admin login (remaining)
5.(GET)localhost:5000/api/pda
get all pda account
6.(POST)localhost:5000/api/news
{
  "title": "New Postal Circle Announcement",
  "description": "Join us for the upcoming event at the ABC postal circle. Learn about the latest services and updates.",
  "image": "https://example.com/news-image.jpg",
  "postalCircle": "ABC Postal Circle",
  "postedTime": "2024-11-10T14:00:00Z"
}
Create a News Item
7.(GET) localhost:5000/api/news
Retrieve All News Items
8. (GET) http://localhost:5000/api/news/6730ef9dfcea040fe11cb5ba
Retrieve a News Item by ID
9. (PUT) http://localhost:5000/api/news/6730ef9dfcea040fe11cb5ba
{
  "title": "Updated Postal Circle Announcement",
  "description": "Updated description for the postal circle announcement."
}
Update a News Item by ID
10. (DEL) http://localhost:5000/api/news/6730ef9dfcea040fe11cb5ba
Delete a News Item by ID
11. (POST) http://localhost:5000/api/events
{
  "title": "Music Festival",
  "description": "Join us for a great music festival.",
  "postalCircle": "12345",
  "image": "https://example.com/event-image.jpg",
  "startDate": "2024-12-01",
  "endDate": "2024-12-05",
  "startTime": "6:00 pm",
  "endTime": "10:00 pm",
  "location": "Los Angeles, CA",
  "registrationLink": "https://example.com/register",
  "postedDate": "2024-10-01",
  "lat": 34.0522,
  "lng": -118.2437
}
Create an Event
12.(GET) http://localhost:5000/api/events
Retrieve All Events
13.(GET)http://localhost:5000/api/events/6730f0a9fcea040fe11cb5c1
Retrieve an Event by ID
14.(PUT) http://localhost:5000/api/events/6730f0a9fcea040fe11cb5c1
updat event
15. (DEL)http://localhost:5000/api/events/6730f0a9fcea040fe11cb5c1
delete event
16. (POST) localhost:5000/api/pda
{
  "account_number": "PDA123456789",
  "user": "6730c113e7b9622fed06eee9", 
  "postal_circle": "6730b1b6b21c8b91449c9f62", 
  "balance": 5000,
  "preferences": {
    "item_types": ["stamps", "souvenir sheets", "first day covers"],
    "notification_preferences": {
      "email": true,
      "sms": false
    }
  },
  "status": "active",
  "philatelicInventory": {
    "MintCommemorativeStamps": 20,
    "MintDefinitiveStamps": 15,
    "TopMarginalBlock": 5,
    "BottomMarginalBlock": 7,
    "FullSheet": 3,
    "FirstDayCoversAffixed": 10,
    "FirstDayCoversBlank": 8,
    "InformationBrochureAffixed": 5,
    "InformationBrochureBlank": 6,
    "AnnualStampPack": 2,
    "ChildrenSpecialAnnualStampPack": 1,
    "SpecialCollectorsStampPack": 3,
    "FirstDayCoverPack": 4,
    "MiniSheetSouvenirSheet": 12,
    "PostalStationery": 6,
    "OtherItems": "Custom commemorative stamps"
  }
}

pda account post by postal circle





