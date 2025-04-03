import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "Not authorized. Login again" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Debugging log

        if (decoded.id) {
            req.body.userid = decoded.id;  // Fix: attach `userid` properly
            console.log("Attached userid:", decoded.id);
        } else {
            return res.json({ success: false, message: "Not authorized. Login again" });
        }

        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.json({ success: false, message: "Not authorized. Login again" });
    }
};

export default userAuth;
