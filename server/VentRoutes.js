const express = require("express");
const asyncHandler = require("express-async-handler");

const Vent = require("./VentModel.js");

const ventRouter = express.Router();

//==================ENTRY ROUTES==================

//Check if name is unique or not
ventRouter.post(
  "/checkName",
  asyncHandler(async (req, res) => {
    try {
      const { name } = req.body;
      const obj = await Vent.find({
        name: {
          $regex: name,
          $options: "i",
        },
      });
      if (obj.length > 0) {
        res.status(200).json({
          msg: "Name already exists",
          name: true,
        });
        return;
      }
      res.status(200).json({
        msg: "Name not exists",
        name: false,
      });
    } catch (err) {
      res.status(404).json({ msg: err });
    }
  })
);

// POST Entry on transaction model
ventRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    try {
      // get all data of name, amount, date, category, type, description from req.body
      const { uid, name, owner, chainName, token } = req.body;
      // create a new entry in transaction model
      const data = await Vent.create({
        uid,
        name: name.toLowerCase(),
        owner,
        chainName: chainName.toLowerCase(),
        token,
        balance: 0,
      });

      //send response
      res.status(200).json({
        msg: "inserted Success",
        data,
      });
    } catch (err) {
      res.status(404).json({ msg: err });
    }
  })
);

//Send all entries from transaction model by user id and type of income or expense
//and add pagination with limit of 10 entries per page
ventRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      //find all entries by user id and type of income or expense
      const obj = await Vent.find({}) //sort by date in descending order
        .sort({ createdAt: -1 });

      //send response
      res.status(200).json({
        msg: "inserted Success",
        vents: obj,
      });
    } catch (err) {
      res.status(404).json({ msg: err });
    }
  })
);

//by owner
ventRouter.get(
  "/owner/:owner",
  asyncHandler(async (req, res) => {
    try {
      const { owner } = req.params;
      //find all entries by user id and type of income or expense
      const arr = await Vent.find({
        owner: {
          $regex: owner,
          $options: "i",
        },
      }).sort({ createdAt: -1 }); //sort by date in descending order

      //send response
      res.status(200).json({
        msg: "owner fetch Success",
        vents: arr,
      });
    } catch (err) {
      res.status(404).json({ msg: err });
    }
  })
);

//by chainname, id
ventRouter.get(
  "/:chainName/:id",
  asyncHandler(async (req, res) => {
    try {
      const { chainName, id } = req.params;
      //find all entries by user id and type of income or expense
      const obj = await Vent.findOne({
        chainName: {
          $regex: chainName,
          $options: "i",
        },
        uid: id,
      }); //sort by date in descending order

      console.log(obj);
      //send response
      res.status(200).json({
        msg: "inserted Success",
        vent: obj,
      });
    } catch (err) {
      res.status(404).json({ msg: err });
    }
  })
);

// //Send all entries from transaction model by user id and type of income or expense
// //same pagination as above
// //get query of sortBy and sortOrder to sort entries by name, amount, date, category
//sort
ventRouter.get(
  "/sorted?",
  asyncHandler(async (req, res) => {
    try {
      //get page number and limit from query
      const { sortBy, sortValue } = req.query;

      const obj = await Vent.find({
        [sortBy]: {
          $regex: sortValue,
          $options: "i",
        },
      }).sort({ createdAt: -1 });

      res.status(200).json({
        msg: "sorted Success",
        vents: obj,
      });
    } catch (err) {
      console.log("err", err);
      res.status(404).json({ msg: err });
    }
  })
);

//Update entry's name, amount, date, category, type, description using id pass in params
ventRouter.put(
  "/name/:chainName/:uid",
  asyncHandler(async (req, res) => {
    try {
      const { chainName, uid } = req.params;

      const vent = await Vent.findOne({
        chainName: {
          $regex: chainName,
          $options: "i",
        },
        uid,
      });
      //Check if transaction exists to avoid error
      if (vent) {
        //update all entries with new data from req.body
        //if data is not present then use old data
        // name, amount, date, category, type, description
        vent.name = req.body.name || vent.name;
        // console.log(req.body);
        //Now save the updated entry in transaction model
        await vent.save(); //Save

        res.json({
          message: "success",
        });
      } else {
        res.status(404);
        throw new Error("Transaction not found");
      }
    } catch (err) {
      console.log(err);
      res.status(404);
      throw new Error("Transaction not found");
    }
  })
);

ventRouter.put(
  "/balance/:chainName/:uid",
  asyncHandler(async (req, res) => {
    try {
      const { chainName, uid } = req.params;

      const vent = await Vent.findOne({
        chainName: {
          $regex: chainName,
          $options: "i",
        },
        uid,
      });
      //Check if transaction exists to avoid error
      if (vent) {
        //if data is not present then use old data
        vent.name = req.body.balance || vent.balance;
        // console.log(req.body);
        await vent.save(); //Save

        res.json({
          message: "success",
        });
      } else {
        res.status(404);
        throw new Error("Transaction not found");
      }
    } catch (err) {
      console.log(err);
      res.status(404);
      throw new Error("Transaction not found");
    }
  })
);

// // DELETE Entry
ventRouter.delete(
  "/:chainName/:uid",
  asyncHandler(async (req, res) => {
    const { chainName, uid } = req.params;

    Vent.deleteOne({
      chainName: {
        $regex: chainName,
        $options: "i",
      },
      uid,
    })
      .then((obj) => {
        //Checks Deleted by Count
        return res.status(200).json({
          msg: "Deleted Success",
          pages: totalPages,
          total: totalTransactions,
        }); //Deleted
      })
      .catch((err) => {
        res.status(401).json({ msg: err }); //Not Found
      });
  })
);

module.exports = ventRouter;
