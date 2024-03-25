const Wallet = require("../../models/walletSchema");
const razorPay = require("razorpay");
const moment = require("moment-timezone");
const crypto = require("crypto");
const { log } = require("console");
const { YOUR_KEY_ID, YOUR_KEY_SECRET } = process.env;
const orderIdGenerate = require("../../helper/idgenerate");

const razorpayInstance = new razorPay({
  key_id: YOUR_KEY_ID,
  key_secret: YOUR_KEY_SECRET,
});

const addToWallet = async (req, res) => {
  try {
    const amount = req.body.amount;
    console.log("amount : ", amount);
    const userid = req.session.user_id;
    console.log("user", userid);
    data = {
      amount: Number(amount),
      createdOn: moment().tz("Asia/Kolkata").format("DD/MM/YYYY hh:mm:ss A"),
      source: "online",
    };

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: req.session.user_id,
    };
    console.log("hiii", options);

    const amountt = options.amount;
    req.session.amount = amountt;

    razorpayInstance.orders.create(options, async function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create Razorpay order" });
        return;
      } else {
        console.log("order : ", order);
        res.json({
          payment: false,
          method: "online",
          order: order,
          data: data,
        });
      }
    });
  } catch (error) {
    console.log(error, "addMoneyToWallet page error ");
  }
};

const verifyPaymentWallet = async (req, res) => {
  try {
    const data = req.body.data
    const tid = orderIdGenerate.orderIdGenerate();
    const { order, response } = req.body;
    const userid = req.session.user_id;
    let hmac = crypto.createHmac("sha256", YOUR_KEY_SECRET);
    hmac.update(`${response.razorpay_order_id}|${response.razorpay_payment_id}`);
    hmac = hmac.digest("hex");
    if (hmac === response.razorpay_signature) {
      // const walletget = await Wallet.create(order)
      // console.log(order)
      const amount = parseInt(data.amount);

      const walletData = await Wallet.findOne({ user: userid });
      if (walletData) {
        const newTransaction = {
            tid : tid,
            tamount : amount
        };
        walletData.walletAmount += amount
        walletData.transactions.push(newTransaction);
        walletData.save()
        console.log(data);
        // walletData.transactions.push(data);
      } else {
        const wallet = {
          user: userid,
          walletAmount: amount,
          transactions : {
            tid : tid,
            tamount : amount
          }
        };

        const createProcess = await Wallet.create(wallet);;
        console.log(createProcess);
      }
      res.json({ status: "success" });

      res.status(200).json({ status: true });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addToWallet,
  verifyPaymentWallet,
};
