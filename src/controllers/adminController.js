const Admin = require("../model/Admin");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.getAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.getById(req.params.id);
    if (!admin) return res.status(404).json({ message: "admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const adminId = await Admin.create(name, email, password);
    res.status(201).json({ id: adminId, message: "admin created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { name, email,password } = req.body;
    const updatedRows = await Admin.update(req.params.id, name, email,password);
    if (!updatedRows) return res.status(404).json({ message: "admin not found" });
    res.json({ message: "admin updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const deletedRows = await Admin.delete(req.params.id);
    if (!deletedRows) return res.status(404).json({ message: "admin not found" });
    res.json({ message: "admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//dang ky
const register=async(req, res)=>{
  try {
    const {name, email, password}=req.body;
    // kiểm tra tồn tại email
    const exitingadmin=await Admin.getByEmail(email);
    if(exitingadmin){
      return res.status(400).json({message:"Email already exits"});
    }

    //Mã hóa mật khẩu
    const salt=await bcrypt.genSalt(10);
     const hashedPassword=await bcrypt.hash(password,salt);
     //
     const adminID=await Admin.create(name, email, hashedPassword);
     res.status(201).json({id: adminID, message:"admin registered successfully"});
     
  } catch (error) {
    res.status(500).json({error:error.message});
  }
};

//dang nhap
const login=async(req, res)=>{
  try {
    const {email, password}=req.body;
    //kiem tra ton tai admin
    const admin=await Admin.getByEmail(email);
    if(!admin){
      return res.status(400).json({message:"Invalid email or password"});
    }
    //kiem tra password
    const isMatch=await bcrypt.compare(password, admin.password);
    if(!isMatch){
      return res.status(400).json({message:"Invalid email or password"})
    }

    //Tao JWT Token
    const token=jwt.sign({admin_id: admin.admin_id, email: admin.email}, process.env.JWT_SECRET, {expiresIn:"1h"});
    res.json({token, admin:{id: admin.admin_id, adminname: admin.adminname, email:admin.email}});
  } catch (error) {
    res.status(500).json({error:error.message});
  }
}


module.exports = { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, register, login };
