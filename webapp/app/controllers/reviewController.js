const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const resApi = require('../../config/functions');

/** 상품평 작성 API
 POST /product/:productIdx/review
 1. 로그인 해야 이용 가능(JWT)
 **/
exports.postReview = async function (req,res) {
    const userIdx = req.verifiedToken.userIdx;
    const productIdx = req.params.productIdx;
    const contents = req.body.contents;
    const reviewScore = req.body.reviewScore;

    try {
        const connection = await pool.getConnection(async conn => conn());
        try {
            // 상품평 내용 입력
            if (!contents) {
                connection.release();
                return res.json(resApi(false, 300, "내용을 입력하세요."));
            }
            // 별점 0~10
            if (!reviewScore) {
                connection.release();
                return res.json(resApi(false,301,"별점을 주세요."));
            }
            if (reviewScore > 5) {
                connection.release();
                return res.json(resApi(false, 302, "별점은 0~5점 사이입니다."));
            }

            const insertReviewQuery = `insert into review(userIdx, productIdx, contents, reviewScore) values (?, ?, ?, ?);`;
            const insertReviewParams = [userIdx, productIdx, contents, reviewScore];
            const [insertReviewResult] = await connection.query(insertReviewQuery, insertReviewParams);

            let responseData = {};
            responseData = resApi(true, 100, "상품평 작성 완료");
            responseData.result = insertReviewResult;
            connection.release();
            return res.json(responseData)
        } catch (err) {
            logger.error(`post PlayList transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json(resApi(false, 200, "trx fail"));
        }
    } catch (err) {
        logger.error(`post PlayList transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return res.json(resApi(false, 201, "db connection fail"));
    }
};


/** 상품평 삭제 API
 DELETE /product/:productIdx/review
 **/
exports.deleteReview = async function (req,res) {
    const userIdx = req.verifiedToken.userIdx;
    const productIdx = req.params.productIdx;
    try {
        const connection = await pool.getConnection(async conn => conn());
        try {
            const existReviewQuery = `select exists(select productIdx from review where userIdx = ? and productIdx = ?) exist;`;
            const existReviewParams = [userIdx, productIdx];
            const [existReviewResult] = await connection.query(existReviewQuery, existReviewParams);
            if (!existReviewResult[0].exist) {
                connection.release();
                return res.json(resApi(false, 300, "상품평이 존재하지 않습니다."));
            }

            const deleteReviewQuery = `delete from review where userIdx = ? and productIdx = ?;`;
            const deleteReviewParams = [userIdx, productIdx];
            const [deleteReviewResult] = await connection.query(deleteReviewQuery, deleteReviewParams);

            let responseData = {};
            responseData = resApi(true, 100, "상품평 삭제 완료");
            responseData.result = deleteReviewResult;
            connection.release();
            return res.json(responseData)
        } catch (err) {
            logger.error(`post PlayList transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json(resApi(false, 200, "trx fail"));
        }
    } catch (err) {
        logger.error(`post PlayList transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return res.json(resApi(false, 201, "db connection fail"));
    }
};
