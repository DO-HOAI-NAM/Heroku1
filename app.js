const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb"); //khai báo 2 cái hàm từ  mồngdb

const DATABASE_URL =
  "mongodb+srv://donams:Sktt1micheal1@cluster0.cazee.mongodb.net/test"; // dường đãn đén mongodb
const DATABASE_NAME = "GCH0901_DB";

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true })); // đọc dữ liệu từ người dùng

app.get("/", async (req, res) => {
  //lăng nghe trang chủ
  //1. lay du lieu tu Mongo
  const dbo = await getDatabase();
  const results = await dbo
    .collection("Products")
    .find({})
    .sort({ name: 1 })
    .limit(6)
    .toArray();
  //2. hien thi du lieu qua HBS
  res.render("index", { products: results }); //nó sẽ reder ra index
});

//tạo trang cho phép người dùng insert sp
app.get("/insert", (req, res) => {
  res.render("product");
});

//lấy dl thong tin người dùng gửi đến sau khi sumbt
app.post("/product", async (req, res) => {
  const nameInput = req.body.txtName;
  const priceInput = req.body.txtPrice;
  const picURLInput = req.body.txtPicURL;
  if (isNaN(priceInput) == true || priceInput <= 0) {
    //Khong phai la so, bao loi, ket thuc ham
    const errorMessage = "Gia ko dc trong, phai la so va lon hon 0";
    const oldValues = {
      name: nameInput,
      price: priceInput,
      picURL: picURLInput,
    };
    res.render("product", { errorP: errorMessage, oldValues: oldValues });
    return;
  } else if (nameInput.trim().length == 0) {
    const errorName = "ten ko dc trong ";

    const oldValues = {
      name: nameInput,
      price: priceInput,
      picURL: picURLInput,
    };
    res.render("product", {
      error: errorName,

      oldValues: oldValues,
    });
    return;
  } else if (picURLInput.trim().length == 0) {
    const errorUrl = "0 dc trong url ";
    const oldValues = {
      name: nameInput,
      price: priceInput,
      picURL: picURLInput,
    };
    res.render("product", { errorU: errorUrl, oldValues: oldValues });
    return;
  } else {
    const obj = { name: nameInput, price: priceInput, picURL: picURLInput };
    const dbo = await getDatabase(); //truy cập
    const result = await dbo.collection("Products").insertOne(obj); // thực thi song sẽ trả về biến réult
    res.redirect("/");
  }

  //   const newP = {
  //     name: nameInput,
  //     price: Number.parseFloat(priceInput),
  //     picURL: picURLInput,
  //   }; // tạo biến newp bàng giá trị nhập vào

  //   const dbo = await getDatabase(); //truy cập
  //   const result = await dbo.collection("Products").insertOne(newP); // thực thi song sẽ trả về biến réult
  //   console.log(
  //     "Gia tri id moi duoc insert la: ",
  //     result.insertedId.toHexString()
  //   ); // biến result sẽ insert ra id
  //   res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const nameInput = req.body.txtName;
  const priceInput = req.body.txtPrice;
  const picURLInput = req.body.txtPicURL;
  const id = req.body.txtId;
  const myquery = { _id: ObjectId(id) };
  const newvalues = {
    $set: { name: nameInput, price: priceInput, picURL: picURLInput },
  };
  const dbo = await getDatabase();
  await dbo.collection("Products").updateOne(myquery, newvalues);
  res.redirect("/view");
});

//async vs await là sd cơ chees đồng bộ
app.get("/edit", async (req, res) => {
  const id = req.query.id;
  //truy cap database lay product co id o tren
  const dbo = await getDatabase();
  const productToEdit = await dbo
    .collection("Products")
    .findOne({ _id: ObjectId(id) });
  res.render("edit", { product: productToEdit });
});

app.get("/delete", async (req, res) => {
  const id = req.query.id;
  console.log("id can xoa:" + id);
  const dbo = await getDatabase();
  await dbo.collection("Products").deleteOne({ _id: ObjectId(id) });
  res.redirect("/view");
});

app.get("/view", async (req, res) => {
  //1. lay du lieu tu Mongo
  const dbo = await getDatabase();
  const results = await dbo
    .collection("Products")
    .find({})
    .sort({ name: 1 })
    .toArray();
  //2. hien thi du lieu qua HBS
  res.render("view", { products: results });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT);
console.log("Server is running!");

async function getDatabase() {
  const client = await MongoClient.connect(DATABASE_URL); //mongo clinet là 1 hàm tham chiếu từ mongodb kêt nối đến đường đẫn database url<ssd await ở đây để đảm bảo rằng lệnh ở dòng await đó đã được thực thi
  //nếu mà dòng trên chưa thực hiện song mà dòng dưới đã thực hiện rồi thì có thể sẽ báo lỗi

  const dbo = client.db(DATABASE_NAME); //sau khi kết nối được với monggodb rồi  truy cập đến databse clinet database name
  return dbo;
}
