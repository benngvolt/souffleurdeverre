const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
        
        const SECRET_TOKEN = process.env.SECRET_TOKEN;
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, SECRET_TOKEN);
        const userId = decodedToken.userId;
        req.auth = {
           userId: userId
        };
	next();
   } catch(error) {
       res.status(401).json({ error }); // status 401 'Unauthorized'
   }
};