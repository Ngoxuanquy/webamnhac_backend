const express = require('express')
// const postModel = require('../models/post.model.js')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUntil')
const { getInfoData } = require('../utils')
const { findByEmail } = require('./shop.service')
const { findAllPost, getAllByIds } = require('../models/repositories/post.repo.js')
const mongoose = require('mongoose');
const shopModels = require('../models/shop.models.js')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITTOR: 'EDITTOR',
    ADMIN: 'ADMIN',
}

class PostService {


    static getUserNames = async ({ keySearch }) => {
        try {
            const regexSearch = new RegExp(keySearch, 'i')
            const result = await shopModels.find({ name: { $regex: regexSearch } }).lean();

            return result

        } catch (error) {
            throw error
        }
    }

    static getNameById = async ({ keyId }) => {
        try {
            const result = shopModels.findById(keyId)
            return result

        } catch (error) {
            throw error
        }
    }

    static addGroup = async (payload) => {

        try {
            const ids = payload.map(user => user._id);
            const newPost = shopModels.create({
                messGroup: ids
            })
            return newPost;

        } catch (error) {
            throw error;
        }
    }

    static getFullUser = async () => {
        try {
            const result = await shopModels.find({});

            if (!result || result.length === 0) {
                // Respond with a 404 Not Found status if no data found
                return res.status(404).json({ error: 'No data found' });
            }

            console.log(result);
            // Respond with the retrieved data
            return result
        } catch (error) {
            console.error('Error:', error);
            // Respond with a 500 Internal Server Error status if an error occurs
        }
    };


    static addImg = async (payload) => {

        try {

            const filter = { _id: payload.user_id };
            const update = {
                img: payload.img,
            };


            const options = { upsert: true, new: true };

            const newPost = await shopModels.findOneAndUpdate(filter, update, options)


            return newPost;

        } catch (error) {
            throw error;
        }
    }

    static addFriend = async (payload) => {
        try {
            const checkPost = await shopModels.findById(payload.userId);

            if (!checkPost) {
                throw new AuthFailureError('Authentication error');
            }
            // Phần tử không tồn tại, thêm mới vào mảng
            checkPost.friends.push({
                youId: payload.youId,
                status: false

            });


            const result = await checkPost.save();
            return result;

        } catch (error) {
            throw error
        }
    }

    static deleteFriend = async (payload) => {
        try {
            const checkPost = await shopModels.findById(payload.userId);

            if (!checkPost) {
                throw new AuthFailureError('Authentication error');
            }

            const newFriend = checkPost.friends.filter((element) => element.youId !== payload.youId);

            checkPost.friends = newFriend
            // console.log(removeFromArray)

            const result = await checkPost.save();
            return result;

        } catch (error) {
            throw error
        }
    }


};



module.exports = PostService