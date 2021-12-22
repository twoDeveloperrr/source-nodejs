module.exports = function(app){
    const home = require('../controllers/homeController');

    app.get('/', home.getHome);
};
