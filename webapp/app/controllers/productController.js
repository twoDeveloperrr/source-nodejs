const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const resApi = require('../../config/functions');

/** 상품 클릭했을 때 조회 API
 GET /product/:productIdx
 필요 정보
 1. 상품이름, 상품이미지, 상품평별점, 상품평 수, 상품가격, 상품내용이미지 -> 현재 존재
 **/
exports.getProduct = async function (req,res) {
    const productIdx = req.params.productIdx;
    try {
        const connection = await pool.getConnection(async conn => conn());
        try {
            const getExistProductQuery =`select exists(select productIdx from product where productIdx = ?) as exist;`;
            const [isExist] = await connection.query(getExistProductQuery, productIdx);
            if(!isExist[0].exist){
                connection.release();
                return res.json(resApi(false,200,'존재하지 않는 상품입니다.'));
            }

            const selectGetProductQuery = `select P.productIdx, P.productName, avg(R.reviewScore) avgReviewScore, P.productImgUrl, P.productReviewCount, P.productPrice, P.productUrl
                                            from product P
                                            left join review R
                                            on P.productIdx = R.productIdx
                                            where P.productIdx = ?
                                            group by P.productIdx;`;
            const [selectGetProductResult] = await connection.query(selectGetProductQuery, productIdx);
            if (selectGetProductResult[0].avgReviewScore === null) {
                connection.release();
                selectGetProductResult[0].avgReviewScore = 0;
            }

			const avgReviewScoreQuery = `select P.productIdx, avg(R.reviewScore) avgReviewScore, P.productReviewCount
                                            from product P
                                            left join review R
                                            on R.productIdx = P.productIdx
                                            where P.productIdx = ?;`;
            const [avgReviewScoreResult] = await connection.query(avgReviewScoreQuery, productIdx);
            if (avgReviewScoreResult[0].avgReviewScore === null) {
                connection.release();
                avgReviewScoreResult[0].avgReviewScore = 0;
            }

			const selectGetProductReviewContentQuery = `select P.productIdx, U.userName, R.reviewScore, R.createdAt, R.contents
                                        from review R
                                        left join user U
                                        on U.userIdx = R.userIdx
                                        left join product P
                                        on R.productIdx = P.productIdx
                                        where P.productIdx = ?
                                        limit 3;`;
            const [selectGetProductReviewContentResult] = await connection.query(selectGetProductReviewContentQuery, productIdx);

            let responseData = {};
            responseData = resApi(true, 100, "상품상세조회");
            responseData.productResult = selectGetProductResult;
			responseData.productReviewScoreResult = avgReviewScoreResult;
			responseData.productReviewContentResult = selectGetProductReviewContentResult;
            connection.release();
            return res.json(responseData);
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
