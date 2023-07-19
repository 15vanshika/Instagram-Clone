const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const requireLogin=require('../middleware/requireLogin')
const Post=mongoose.model("Post")

//all the posts by authenticated user
router.get('/api/all_posts',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")
    .then(posts=>{
        res.json({posts}) //as key&value and both are equal so just one is enough
        return posts;
    })
    .catch(err=>{
        console.log(err)
    })
   
})

router.get('/getsubpost',requireLogin,(req,res)=>{

    // if postedBy in following
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err)
    })
})

//create posts
router.post('/api/posts/',requireLogin,(req,res)=>{
    const {title,body}=req.body
    if(!title || !body){
        res.status(422).json({error:"please add all the feilds"})
    }
    req.user.password=undefined
    const post=new Post({
        title,
        body,
        postedBy:req.user,
        time: Date.now()
    })
    post.save().then(result=>{
        res.json({post:result})
    })
    .catch(err=>{
        console.log(err)
    }) 
    return post;
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})
//like a post
router.put('/api/like/{id} ',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.params.id,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({erroe:err})
        }else{
            res.json(result)
        }
    })
})

//unlike a post
router.put('/api/unlike/{id}',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.params.id,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({erroe:err})
        }else{
            res.json(result)
        }
    })
})

//comment on a post
router.put('/api/comment/{id}',requireLogin,(req,res)=>{
    const comment={
        text:req.body.text,
        postedBy:req.user
    }
    Post.findByIdAndUpdate(req.params.id,{
        $push:{comments:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
    return comments.postedBy;
})

//delete a post
router.delete('/api/posts/{id}',(req,res)=>{
    Post.findOne({_id:req.params.id})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postBy._id.toString() === req.user._id.toString()){
           post.remove()
           .then(result=>{
            res.json(result)
           }).catch(err=>{
            console.log(err)
           })
        }
    })
})

module.exports= router