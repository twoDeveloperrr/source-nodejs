module.exports = function(app){
    const review = require('../controllers/reviewController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    //리뷰작성
    app.route('/product/:productIdx/review').post(jwtMiddleware, review.postReview);
    //리뷰 삭제
    app.route('/product/:productIdx/review').delete(jwtMiddleware, review.deleteReview);
};
