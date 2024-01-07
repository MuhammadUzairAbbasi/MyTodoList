const express = require("express");
const mongoose=require('mongoose');
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// DataBase Connection
const password=process.env.PASSWORD;

const con=mongoose.connect("mongodb+srv://UzairAbbasi:"+password+"@todolist.kbw8cvp.mongodb.net/?retryWrites=true&w=majority");
if(con){console.log("Connected to Database Successfully");}

// Schema for Items
const itemSchema={
  name:String
};


// Model 
const item=mongoose.model("Item",itemSchema);

const items1=new item({
  name:"Welocme to My To Do List"
});

const items2=new item({
  name:"Hit + button to Add new item"
});

const items3=new item({
  name:"<--- Hit This Delete an item"
});

const defaultitems=[items1,items2,items3];

app.get("/", function(req,res){
  item.find({}).then(
    result=>{
      if(result.length==0)
      {
        const def_noerror=item.insertMany(defaultitems);
        if(def_noerror){console.log("Success fully inserted default items");}
      }
      else{
       
        res.render("list", {listTitle: "Today", newListItems: result });
      }
      }
)});

const listschema={
  name:String,
  items:[itemSchema]
}

const List=mongoose.model("List",listschema);

app.get("/:newlistname",function(req,res){

  const newitemname=req.params.newlistname;
  List.findOne({name:newitemname}).then(
    result=>{
          if(result){ 
              res.render("list", {listTitle: result.name, newListItems: result.items });
            
            }
          else{
            const list=new List({
              name:newitemname,
              items:defaultitems
            })
            list.save();
          }
  })

  

})



app.post("/", function(req, res){
  
  const itemname=req.body.newItem;
  const listname=req.body.list;

  const it=new item({
    name:itemname
  });

  if(listname=== "Today"){
    it.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname}).then(
      result=>{
        result.items.push(it);
        result.save();
      }
    )
    res.redirect("/"+listname);
  }

 

});

app.post("/delete", function(req, res){
  const itemname=req.body.deleteitem;
  const listname=req.body.list;

  if(listname== "Today"){
    item.findByIdAndDelete(itemname).then(
      result=>{
       console.log("SuccessFully deleted");
       res.redirect("/");  
      }
    )
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemname}}}).then(
      listresult=>{
        console.log("successfully deleted");
        res.redirect("/"+listname);
      }
    )
  }
  
}
 
//  console.log(itemname);
);

const port=process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Server started on port 3000");
});
