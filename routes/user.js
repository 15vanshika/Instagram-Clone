const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const requireLogin=require('../middleware/requireLogin')
const Post=mongoose.model("Post")
const User=mongoose.model("User")

router.get('/user/:id',(req,res)=>{
       User.findOne({_id:req.params.id})
       .select("-password")
       .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .exec((err,posts)=>{
            if(err){
                return res.status(422).json({error:err})
            }
            res.json({user,posts})
            return posts;
        })
       }).catch(err=>{
        return res.status(404).json({error:"User not found"})
       })
})
//follow
router.put('/api/follow/{id}',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.params.id,{
        $push:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
       if(err){
    return res.status(422).json({error:err})
       } 
       User.findByIdAndUpdate(req.user._id,{
        $push:{following:req.body.followId}
       },{new:true}).select("-password").then(result=>{
        res.json(result)
       }).catch(err=>{
        return res.status(422).json({error:err})
       })
    })
    
})

//unfollow
router.put('/api/unfollow/{id}',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.params.id,{
        $pull:{followers:req.user._id}
    },{
        new:true
    },(err,result)=>{
       if(err){
    return res.status(422).json({error:err})
       } 
       User.findByIdAndUpdate(req.user._id,{
        $pull:{following:req.body.unfollowId}
       },{new:true}).select("-password").then(result=>{
        res.json(result)
       }).catch(err=>{
        return res.status(422).json({error:err})
       })
    })
    
})

module.exports = router