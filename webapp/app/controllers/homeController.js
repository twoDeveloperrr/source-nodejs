const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const resApi = require('../../config/functions');

/** 홈화면 조회
 GET /
 1. 추천상품
**/
exports.getHome = async function (req,res) {
    try {
        const connection = await pool.getConnection(async conn => conn());
        try {
            await connection.beginTransaction();
            // 1. 추천상품
            const selectRecommendHomeQuery = `select P.productIdx, P.productName, P.productImgUrl, P.productPrice, avg(R.reviewScore) as avgReviewScore, P.productReviewCount
                                                from product P
                                                left join review R
                                                on P.productIdx = R.productIdx
                                                group by P.productIdx
                                                order by P.productClickCount desc
                                                limit 5;`;
            const [selectRecommendHomeResult] = await connection.query(selectRecommendHomeQuery);

            let responseData = {};
            responseData = resApi(true, 100, "홈화면조회수정");
            responseData.recommendResult = selectRecommendHomeResult;

            connection.release();
            return res.json(responseData)
        } catch (err) {
            logger.error(`post PlayList transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return res.json(resApi(false, 200, "trx fail"))
        }
    } catch (err) {
        logger.error(`post PlayList transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return res.json(resApi(false, 201, "db connection fail"));
    }
};
