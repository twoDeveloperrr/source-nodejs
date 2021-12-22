module.exports = function(app){
    const product = require('../controllers/productController');

    //상품 상세 조회
    app.get('/product/:productIdx', product.getProduct);
};
