require("dotenv").config();
 
const express = require("express");
 
const bodyParser = require("body-parser");
 
const mongoose = require("mongoose");
 
const _= require("lodash");
 
const app = express();
 
const PORT = process.env.PORT || 3000;
 

app.use(bodyParser.urlencoded({extended:true}));
 
app.use(express.static("public"));
 
app.set("view engine", "ejs");
 
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
       const conn = await mongoose.connect(process.env.MONGO_URI);
        
       console.log(`MongoDB Connected: ${conn.connection.host}`);
 
    } catch(error) {
       
       console.log(error);
       process.exit(1);
    }
}
 


 
// async function connectDB() {
//     try {
//        const conn = await mongoose.connect(process.env.MONGO_URI);
        
//        console.log("MongoDB Connected: " + conn.connection.host);
 
//     } catch(err) {
       
//        console.log(err);
//        process.exit(1);
//     }
// }
 
const itemSchema = new mongoose.Schema({
    name: String
});
 
const Item = mongoose.model('Item', itemSchema);
        
const item1 = new Item ({name: 'Welcome to your todolist!'});
        
const item2 = new Item ({name: 'Hit the + button to add a new item'});
        
const item3 = new Item ({name: '<-- Hit this to delete an item'});
        
const defaultItems = [item1, item2, item3];
 
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
 
const List = mongoose.model('List', listSchema);
 
app.get("/", function(req, res) {
 
    Item.find({}, function(err, foundItems) {
 
        if(foundItems.length === 0) {
 
            Item.insertMany(defaultItems, function(err) {
                if(err) {
                    console.log(err);
                    } else {
                    console.log('Data inserted successfully');
                    res.render("index", {listTitle: "Today", newListItems: defaultItems});
                } 
            });
        } else {
            res.render("index", {listTitle: "Today", newListItems: foundItems}); 
        }
        
    });
});
 
app.get("/:customListName", function(req, res) {
 
    let customListName = req.params.customListName;
 
    customListName = customListName.slice(0,1).toUpperCase() + customListName.slice(1,customListName.length).toLowerCase();
 
    List.findOne({name: customListName}, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save(); 
                
                res.redirect("/" + customListName);
 
            } else  {
                //Show an existing list
                res.render("index", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});
 
app.post("/", function(req, res) {
    
    const itemName = req.body.newItem;
 
    const listName = req.body.list;
 
    const item = new Item({name:itemName});
 
    if(listName === "Today") {
 
        item.save();
 
        res.redirect("/");
 
    } else  {
        
        List.findOne({name: listName}, function(err, foundList) {
        
        foundList.items.push(item);
        
        foundList.save();
 
        res.redirect("/" + listName); });
    }
});
 
app.post("/delete", function(req, res) {
 
    const checkedItemId = req.body.checkbox;
    
    const listName = req.body.listName;
 
    if (listName === "Today") {
 
        Item.findByIdAndRemove(checkedItemId, function(err, deletedItem) {
            if(!err) {
                
                console.log("This item was deleted:");
                
                console.log(deletedItem);
                
                res.redirect("/");
            }
        });
        } else {
 
            List.findOneAndUpdate({name: listName},
                
                {$pull:{items:{_id:checkedItemId}}}, 
                
                function(err, foundList) {
                    if(!err) {
                        res.redirect("/" + listName);
                    }
                });
        }
});
 
app.get("/about", function(req, res) {
    
    res.render("about");
 
});


connectDB().then( () => {
 
    app.listen(PORT, () => {
   
        console.log(`Listening on port ${PORT}`)
    });
});
 
 
// connectDB().then( () => {
 
//     app.listen(PORT, function() {
   
//         console.log("Server started. Listening on port " + PORT);
//     });
// });
 
