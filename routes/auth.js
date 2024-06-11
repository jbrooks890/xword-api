const { Router } = require("express");
const router = Router();

const { login, refreshAuth, deAuth } = require("../controllers/auth")

router.post("/login", login);
router.get("/refresh", refreshAuth);
router.get("/logout", deAuth);

module.exports=router