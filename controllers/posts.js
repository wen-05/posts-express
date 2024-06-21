const Post = require('../models/posts');
const User = require('../models/user');
const handleSuccess = require('../service/handleSuccess');
const handleError = require('../service/handleError');

const posts = {
    async getPosts(req, res) {
        const timeSort = req.query.timeSort == "asc" ? "createdAt" : "-createdAt"
        const search = req.query.q !== undefined ? { "content": new RegExp(req.query.q) } : {};
        const getData = await Post.find(search).populate({
            path: 'user',
            select: 'name photo '
        }).sort(timeSort);
        handleSuccess(res, "取得貼文資料", getData);
    },
    async createPosts(req, res) {
        try {
            const getData = req.body;

            // 判斷必填欄位是否填寫
            if (!getData.user || !getData.content) {
                return handleError(res, "請確實填寫必填欄位");
            }

            await Post.create(getData);
            handleSuccess(res, "新增資料成功", getData);
        } catch (err) {
            handleError(res, err);
        }
    },
    async patchPosts(req, res) {
        const id = req.params.id;
        try {
            const oldData = await Post.findById(id);
            const getData = req.body;

            // 判斷必填欄位是否填寫
            if (!getData.user || !getData.content) {
                return handleError(res, "請確實填寫必填欄位");
            }

            if (oldData) {
                // 判斷是否有修改欄位
                const isDifferent = Object.keys(getData).some(key => oldData[key] !== getData[key]);

                if (isDifferent) {
                    newData = await Post.findByIdAndUpdate(id, getData, { new: true });   // 取得最新資料
                    handleSuccess(res, "單筆資料更新成功", newData);
                } else {
                    handleError(res, "欄位資料與原資料相同");
                }
            }
        } catch (err) {
            handleError(res, "找不到此id");
        }
    },
    async deleteAllPosts(req, res) {
        await Post.deleteMany({});
        handleSuccess(res, "刪除所有資料成功", []);
    },
    async deletePosts(req, res) {
        const id = req.params.id;
        try {
            const oldData = await Post.findById(id);
            if (oldData) {
                const id = oldData._id.toString();
                await Post.findByIdAndDelete(id);
                handleSuccess(res, `此資料刪除成功`, null);
            } else {
                handleError(res, "找不到此id資料");
            }
        } catch (error) {
            handleError(res, "找不到此id資料");
        }
    }

}

module.exports = posts;